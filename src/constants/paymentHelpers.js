/**
 * Payment Helper Functions
 * Status and payment method mapping utilities
 */

/**
 * Map Midtrans transaction status to generic status.
 *
 * Per Midtrans docs, a transaction is only safely "paid" when:
 *   transaction_status ∈ {settlement, capture} AND
 *   (fraud_status === 'accept' OR fraud_status is absent)
 *
 * Treat `capture` + `fraud_status='challenge'` as `pending` (waiting for
 * admin manual approval), and `fraud_status='deny'` as `failed`.
 *
 * @param {string} midtransStatus - Midtrans transaction_status
 * @param {string|null} [fraudStatus=null] - Midtrans fraud_status if present
 * @returns {string} - Generic status (pending, paid, failed, expired, refunded)
 */
export function mapMidtransStatus(midtransStatus, fraudStatus = null) {
  // Normalize: Midtrans returns "PENDING" (uppercase) for DANA/ShopeePay
  // but "pending" (lowercase) for OVO and others — see Get Status docs.
  const tx = typeof midtransStatus === 'string' ? midtransStatus.toLowerCase() : '';
  const fraud = typeof fraudStatus === 'string' ? fraudStatus.toLowerCase() : null;

  // Fraud-aware mapping for settlement/capture per docs best practice:
  //   "Transaction can be considered success if transaction_status is
  //    settlement or capture AND if fraud_status exists ensure value is accept"
  if (tx === 'settlement' || tx === 'capture') {
    if (fraud === 'deny') return 'failed';
    if (fraud === 'challenge') return 'pending';
    return 'paid';
  }

  const statusMap = {
    pending: 'pending',
    challenge: 'pending',
    authorize: 'pending',
    deny: 'failed',
    cancel: 'failed',
    failure: 'failed',
    expire: 'expired',
    refund: 'refunded',
    partial_refund: 'refunded',
  };

  return statusMap[tx] || 'pending';
}

/**
 * Generic status rank — used to prevent webhook-driven downgrades when
 * Midtrans notifications arrive out of order (per docs: "settlement status
 * comes before pending status"). Higher rank wins.
 *
 *   refunded > paid > {failed, expired, cancelled} > pending
 */
export const STATUS_RANK = {
  pending: 0,
  failed: 1,
  expired: 1,
  cancelled: 1,
  paid: 2,
  refunded: 3,
};

/**
 * True if transitioning from `current` to `next` is monotonic-or-equal in rank.
 * Used to skip out-of-order downgrades in webhook.
 */
export function isAllowedTransition(current, next) {
  const cur = STATUS_RANK[current] ?? 0;
  const nxt = STATUS_RANK[next] ?? 0;
  return nxt >= cur;
}

/**
 * Reverse-map generic status to a representative Midtrans transaction_status.
 * Used when admin overrides status manually and we need to keep
 * MidtransTransaction.transaction_status in sync.
 * @param {string} genericStatus
 * @returns {string}
 */
export function reverseMapToMidtransStatus(genericStatus) {
  const reverseMap = {
    paid: 'settlement',
    pending: 'pending',
    failed: 'deny',
    expired: 'expire',
    cancelled: 'cancel',
    refunded: 'refund',
  };

  return reverseMap[genericStatus] || genericStatus;
}

/**
 * Parse Midtrans timestamp string ("YYYY-MM-DD HH:MM:SS") as GMT+7.
 *
 * Per docs, Midtrans timestamps (`transaction_time`, `settlement_time`,
 * `expiry_time`) are in Jakarta time without an explicit offset. Using
 * `new Date(rawString)` lets V8 interpret the value as local server time,
 * which silently shifts data by 7h when the server runs in UTC (common
 * default on Cloud Run, Vercel, Cloudflare Workers).
 *
 * @param {string|null|undefined} raw
 * @returns {Date|null}
 */
export function parseMidtransTimestamp(raw) {
  if (!raw || typeof raw !== 'string') return null;
  // "2021-06-23 11:27:50" → "2021-06-23T11:27:50+07:00"
  const isoLike = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const withOffset = /[+-]\d{2}:?\d{2}|Z$/i.test(isoLike) ? isoLike : `${isoLike}+07:00`;
  const date = new Date(withOffset);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Map Midtrans payment details to detailed payment method
 * @param {Object} notification - Webhook notification data
 * @param {string} notification.payment_type - Midtrans payment_type
 * @param {string} notification.bank - Bank code (for bank_transfer)
 * @param {string} notification.store - Store code (for cstore)
 * @returns {string} - Detailed payment method (bca_va, gopay, qris, etc.)
 */
export function mapPaymentMethod(notification) {
  const { payment_type, store } = notification;

  // Extract bank: va_numbers array (BCA/BNI/BRI/CIMB) → permata_va_number (Permata) → top-level bank (legacy)
  const bank =
    notification.va_numbers?.[0]?.bank ??
    (notification.permata_va_number ? 'permata' : undefined) ??
    notification.bank;

  if (payment_type === 'bank_transfer') {
    if (bank === 'bca')     return 'BCA Virtual Account';
    if (bank === 'bni')     return 'BNI Virtual Account';
    if (bank === 'bri')     return 'BRI Virtual Account';
    if (bank === 'permata') return 'Permata Virtual Account';
    if (bank === 'cimb')    return 'CIMB Virtual Account';
    return 'Bank Transfer';
  }

  if (payment_type === 'echannel') return 'Mandiri Bill';

  if (payment_type === 'gopay')     return 'GoPay';
  if (payment_type === 'shopeepay') return 'ShopeePay';
  if (payment_type === 'qris')      return 'QRIS';

  if (payment_type === 'cstore') {
    if (store === 'indomaret') return 'Indomaret';
    if (store === 'alfamart')  return 'Alfamart';
    return 'Convenient Store';
  }

  if (payment_type === 'credit_card') return 'Credit Card';
  if (payment_type === 'akulaku')     return 'Akulaku';
  if (payment_type === 'kredivo')     return 'Kredivo';

  return payment_type;
}

/**
 * Generate transaction code with fixed 14 character format:
 *   <PREFIX 4><MOD 2><HEX 3><SEQ 5 zero-padded>
 *
 * - MOD  = sequence % 100, decimal — quick "batch" scan indicator
 * - HEX  = 3 random hex chars — filler & guessability barrier
 * - SEQ  = full counter from a Postgres sequence (per prefix), atomic
 *
 * The Postgres sequence guarantees uniqueness; HEX is decorative.
 *
 * @param {string} prefix - Product-type prefix (e.g. "RYLS", "ACAD")
 * @param {number} sequence - Atomic counter value from the matching sequence
 * @returns {string} Transaction code (e.g. "RYLS01A1B00001", "ACAD423F800042")
 */
export function generateTransactionCode(prefix, sequence) {
  const mod = (sequence % 100).toString().padStart(TRANSACTION_CODE_CONFIG.MOD_LENGTH, '0');
  const counter = sequence.toString().padStart(TRANSACTION_CODE_CONFIG.COUNTER_LENGTH, '0');

  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(2)))
    .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
    .join('')
    .slice(0, TRANSACTION_CODE_CONFIG.HEX_LENGTH);

  return `${prefix.toUpperCase()}${mod}${randomHex}${counter}`;
}

/**
 * Transaction code configuration
 */
export const TRANSACTION_CODE_CONFIG = {
  RYLS_PREFIX: 'RYLS',
  ACADEMY_PREFIX: 'ACAD',
  MOD_LENGTH: 2,
  HEX_LENGTH: 3,
  COUNTER_LENGTH: 5,
  LENGTH: 14, // PREFIX(4) + MOD(2) + HEX(3) + COUNTER(5)
};

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
};

/**
 * Provider constants
 */
export const PAYMENT_PROVIDER = {
  MIDTRANS: 'midtrans',
  XENDIT: 'xendit',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
};

/**
 * Product type constants
 */
export const PRODUCT_TYPE = {
  RYLS_SCHOLARSHIP: 'Rise Young Leaders Scholarship',
  ACADEMY_COURSE: 'Academy Course',
  EVENT_REGISTRATION: 'Event Registration',
};
