-- =========================================================
-- Migration: Migrate RYLS payment data ke 3-Layer Architecture
-- =========================================================
-- Mengisi gap antara `add_3_layer_payment_architecture` (additive — tabel & kolom
-- baru) dan `cleanup_old_payment_tables` (destruktif — DROP midtrans_payments,
-- DROP kolom amount/midtrans_id/paid_at/type dari ryls_payments).
--
-- Konteks: webhook Midtrans tidak berjalan di production, sehingga seluruh
-- midtrans_payments tertahan di status pending. 174 PayPal payment yang real
-- PAID. Migration ini memindahkan data legacy yang masih punya customer info
-- ke skema 3-layer baru.
--
-- Scope port:
--   - 209 MIDTRANS reachable (linked via ryls_registrations.ryls_payment_id)
--   - 174 PAYPAL (linked via ryls_payments.registration_id)
--   - Total: 383 transactions baru + 209 midtrans_transactions baru
--
-- Scope skip:
--   - 1,808 MIDTRANS orphan tanpa customer info — tidak mungkin diport ke
--     `transactions` karena customer_name/email NOT NULL. Pasca-cleanup mereka
--     retain di ryls_payments dengan transaction_id=NULL.
-- =========================================================

-- ---------------------------------------------------------
-- Step 1: Normalize ryls_payments.status casing ke lowercase
-- ---------------------------------------------------------
-- ALTER kolom dari enum ke VARCHAR di migration sebelumnya mempertahankan
-- value uppercase ('PENDING'/'PAID'). Dev code & default kolom pakai lowercase.
UPDATE ryls_payments
SET status = LOWER(status)
WHERE status IN ('PENDING', 'PAID');

-- ---------------------------------------------------------
-- Step 2: Tandai PAYPAL rows dengan scholarship_type & payment_method akurat
-- ---------------------------------------------------------
-- Default migration sebelumnya 'SELF_FUNDED'/'midtrans' — tidak benar untuk
-- PayPal yang selalu fully-funded.
UPDATE ryls_payments
SET payment_method = 'paypal',
    scholarship_type = 'FULLY_FUNDED'
WHERE type = 'PAYPAL';

-- ---------------------------------------------------------
-- Step 3: Port 209 MIDTRANS reachable → transactions (Layer 1)
-- ---------------------------------------------------------
-- transaction_code = midtrans_payments.order_id agar preserve audit trail
-- (kode di transactions = kode di Midtrans dashboard).
-- Customer info diambil dari ryls_registrations via reverse FK ryls_payment_id.
--
-- Catatan: di production ditemukan beberapa kasus 1 ryls_payment dipoint oleh
-- multiple registrations (id 899, 1362, 2091) — artefak retry user saat webhook
-- broken. DISTINCT ON memilih registration ber-id terkecil sebagai source
-- customer info; transactions punya UNIQUE(transaction_code) sehingga insert
-- harus 1 per ryls_payment.id.
INSERT INTO transactions (
  transaction_code,
  amount,
  currency,
  status,
  provider,
  payment_method,
  customer_name,
  customer_email,
  customer_phone,
  product_type,
  product_type_id,
  paid_at,
  created_at,
  updated_at
)
SELECT DISTINCT ON (rp.id)
  mp.order_id,
  mp.gross_amount_idr,
  COALESCE(mp.currency, 'IDR'),
  'pending',
  'midtrans',
  'midtrans',
  reg.full_name,
  reg.email,
  reg.whatsapp,
  'ryls_registration',
  reg.id,
  NULL,
  mp.created_at,
  mp.updated_at
FROM ryls_payments rp
JOIN midtrans_payments mp ON mp.id = rp.midtrans_id
JOIN ryls_registrations reg ON reg.ryls_payment_id = rp.id
WHERE rp.type = 'MIDTRANS'
ORDER BY rp.id, reg.id;

-- ---------------------------------------------------------
-- Step 4: Port 174 PAYPAL → transactions (Layer 1)
-- ---------------------------------------------------------
-- PayPal tidak punya order_id Midtrans, sehingga transaction_code di-generate
-- mengikuti format generateTransactionCode(): RYLS + 2-digit seq + 8-char hex.
INSERT INTO transactions (
  transaction_code,
  amount,
  currency,
  status,
  provider,
  payment_method,
  customer_name,
  customer_email,
  customer_phone,
  product_type,
  product_type_id,
  paid_at,
  created_at,
  updated_at
)
SELECT
  'RYLS'
    || lpad(((row_number() OVER (ORDER BY rp.id)) % 100)::text, 2, '0')
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  rp.amount,
  'IDR',
  'paid',
  'paypal',
  'paypal',
  reg.full_name,
  reg.email,
  reg.whatsapp,
  'ryls_registration',
  reg.id,
  rp.paid_at,
  rp.created_at,
  rp.updated_at
FROM ryls_payments rp
JOIN ryls_registrations reg ON reg.id = rp.registration_id
WHERE rp.type = 'PAYPAL';

-- ---------------------------------------------------------
-- Step 5: Port 209 MIDTRANS → midtrans_transactions (Layer 2)
-- ---------------------------------------------------------
-- Link via transaction_code = order_id (yang baru di-INSERT di Step 3).
INSERT INTO midtrans_transactions (
  transaction_id,
  snap_token,
  redirect_url,
  midtrans_order_id,
  midtrans_transaction_id,
  transaction_status,
  fraud_status,
  payment_type,
  last_notification,
  notified_at,
  created_at,
  updated_at
)
SELECT
  t.id,
  mp.snap_token,
  mp.redirect_url,
  mp.order_id,
  mp.transaction_id,
  mp.transaction_status,
  mp.fraud_status,
  mp.payment_type,
  mp.last_notification,
  mp.notified_at,
  mp.created_at,
  mp.updated_at
FROM midtrans_payments mp
JOIN ryls_payments rp ON rp.midtrans_id = mp.id
JOIN transactions t ON t.transaction_code = mp.order_id
WHERE rp.type = 'MIDTRANS'
  AND EXISTS (
    SELECT 1 FROM ryls_registrations reg WHERE reg.ryls_payment_id = rp.id
  );

-- ---------------------------------------------------------
-- Step 6: Link ryls_payments.transaction_id ke transactions baru
-- ---------------------------------------------------------
-- 6a: MIDTRANS reachable — match via order_id
UPDATE ryls_payments rp
SET transaction_id = t.id
FROM midtrans_payments mp,
     transactions t
WHERE rp.type = 'MIDTRANS'
  AND mp.id = rp.midtrans_id
  AND t.transaction_code = mp.order_id;

-- 6b: PAYPAL — match via (product_type_id = registration_id) + provider + customer_email
UPDATE ryls_payments rp
SET transaction_id = t.id
FROM ryls_registrations reg,
     transactions t
WHERE rp.type = 'PAYPAL'
  AND rp.registration_id = reg.id
  AND t.product_type = 'ryls_registration'
  AND t.product_type_id = reg.id
  AND t.provider = 'paypal'
  AND t.customer_email = reg.email;

-- ---------------------------------------------------------
-- Step 7: Reset sequence transactions_id_seq
-- ---------------------------------------------------------
-- INSERT manual tidak meng-advance sequence. Tanpa reset, transaksi baru
-- selepas deploy akan collision pada UNIQUE PK.
SELECT setval(
  pg_get_serial_sequence('transactions', 'id'),
  COALESCE((SELECT MAX(id) FROM transactions), 1),
  true
);

-- ---------------------------------------------------------
-- Step 8: Reset sequence midtrans_transactions_id_seq
-- ---------------------------------------------------------
SELECT setval(
  pg_get_serial_sequence('midtrans_transactions', 'id'),
  COALESCE((SELECT MAX(id) FROM midtrans_transactions), 1),
  true
);
