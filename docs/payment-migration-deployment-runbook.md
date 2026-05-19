# Deployment Runbook: Blue-Green DB Swap (`risesocial` → `risesocial_db`)

**Strategi:** Buat database baru `risesocial_db` di VPS sebagai pengganti `risesocial`. Old DB & old backend dibiarkan tetap (instant rollback). Setelah stable beberapa hari, baru cleanup old DB.

**Pembagian tugas:**
- 🤖 **AI agent**: handle semua step database (create DB, dump, restore, migrate, verify).
- 👤 **Manusia**: handle backend (deploy code, switch `.env`, maintenance mode, restart service, smoke test, cleanup).

Bagian dengan badge 🤖 bisa dijalankan agent. Bagian 👤 perlu manusia.

**Estimated downtime:** ~2–5 menit saat cutover (Phase 2).

---

## Konvensi Path

- **VPS dump folder:** `/www/wwwroot/db-backups/`
- **Naming:** `risesocial_predeploy_YYYYMMDD_HHMMSS.sql`
- **Old DB:** `risesocial`
- **New DB:** `risesocial_db`
- **Backend code lama:** path existing di VPS (manusia tahu)
- **Backend code baru (branch `dev`):** path baru yang manusia tentukan

Sebelum mulai, pastikan folder dump exist:

```bash
sudo mkdir -p /www/wwwroot/db-backups
sudo chown postgres:postgres /www/wwwroot/db-backups
sudo chmod 750 /www/wwwroot/db-backups
```

---

## Phase 1 — Persiapan (low risk, app lama tetap jalan)

### 👤 1.1 Manusia: Deploy backend baru (branch `dev`)

- Clone/checkout branch `dev` ke path baru di VPS (mis. `/www/wwwroot/risesocial-backend-dev/`).
- `pnpm install --frozen-lockfile`
- `pnpm prisma generate`
- Setup `.env` baru dengan `DATABASE_URL` pointing ke `risesocial_db` (DB belum dibuat, tidak masalah — backend belum start).
- **Jangan start service-nya dulu.**

### 🤖 1.2 Agent: Buat database baru

```bash
sudo -u postgres psql -c "CREATE DATABASE risesocial_db OWNER risesocial;"
sudo -u postgres psql -c "\l" | grep risesocial
```

Expected: `risesocial_db` muncul di list dengan owner `risesocial`.

### 🤖 1.3 Agent: Smoke-test koneksi backend baru ke DB baru

```bash
# Dari path backend baru
cd /www/wwwroot/risesocial-backend-dev/
env DATABASE_URL="<new_database_url>" ./node_modules/.bin/prisma db pull --print 2>&1 | head -20
```

DB masih kosong → expect "P1003: The database <X> does not exist" atau schema kosong. Yang penting **koneksi sampai** (bukan auth error).

---

## Phase 2 — Cutover (downtime ~2–5 menit, di maintenance window)

> Komunikasikan downtime ke user/team sebelum mulai phase ini.

### 👤 2.1 Manusia: Aktifkan maintenance mode

- Aktifkan maintenance page di frontend, ATAU
- Block traffic via reverse proxy (nginx return 503), ATAU
- Sementara halt write endpoints

### 👤 2.2 Manusia: Stop old backend service

Pastikan old backend tidak terima request & tidak write ke DB selama dump.

```bash
sudo systemctl stop <old_backend_service_name>
# Atau pm2 stop, atau cara apapun yang sesuai setup VPS
```

Verifikasi stop:
```bash
ps aux | grep node | grep -v grep
```

### 🤖 2.3 Agent: Dump old DB

```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="/www/wwwroot/db-backups/risesocial_predeploy_${TIMESTAMP}.sql"

sudo -u postgres pg_dump \
  --no-owner --no-privileges \
  -d risesocial \
  > "$DUMP_FILE" 2>&1

# Verifikasi dump utuh
ls -lh "$DUMP_FILE"
tail -3 "$DUMP_FILE"  # harus berakhir di '-- PostgreSQL database dump complete'

# Simpan path untuk step berikutnya
echo "$DUMP_FILE"
```

Expected: dump berakhir dengan `-- PostgreSQL database dump complete`. Size ~2–10 MB.

### 🤖 2.4 Agent: Restore ke `risesocial_db`

```bash
# Pakai $DUMP_FILE dari step sebelumnya
sudo -u postgres psql -d risesocial_db -f "$DUMP_FILE" > /tmp/restore.log 2>&1
echo "Exit: $?"
grep -iE "fatal|^ERROR" /tmp/restore.log | head -10
```

> **Note:** Akan ada banyak `ERROR: ... does not exist` di awal log (DROP CONSTRAINT statements di backup yang target relasi belum ada di DB fresh). **Itu harmless** — diabaikan saja. Yang penting tidak ada `FATAL` dan dump selesai.

Sanity check row counts:

```bash
sudo -u postgres psql -d risesocial_db <<SQL
SELECT
  (SELECT count(*) FROM ryls_payments) AS ryls_payments,
  (SELECT count(*) FROM midtrans_payments) AS midtrans_payments,
  (SELECT count(*) FROM ryls_registrations) AS regs,
  (SELECT count(*) FROM users) AS users;
SQL
```

Bandingkan dengan production sebelumnya (manusia harus tahu baseline). Yang penting **angkanya match**.

### 🤖 2.5 Agent: Resolve schema drift

Production backup punya `ryls_draft_registrations` tanpa migration record. Tanpa step ini, `migrate deploy` akan gagal.

```bash
cd /www/wwwroot/risesocial-backend-dev/

env DATABASE_URL="<new_database_url>" \
  ./node_modules/.bin/prisma migrate resolve \
  --applied 20260428132019_add_ryls_draft_registration \
  --schema=./prisma/schema.prisma 2>&1 | tail -3
```

Expected: `Migration 20260428132019_add_ryls_draft_registration marked as applied.`

> Jika output `Error: P3008 ... already recorded as applied`, artinya prod-source-DB sudah tidak drift untuk migration ini. Lanjut ke step berikutnya.

### 🤖 2.6 Agent: Run migrate deploy

```bash
env DATABASE_URL="<new_database_url>" \
  ./node_modules/.bin/prisma migrate deploy \
  --schema=./prisma/schema.prisma 2>&1 | tee /tmp/migrate_deploy.log
```

Expected akhir log: `All migrations have been successfully applied.`

> Jika gagal di migration lain (`relation X already exists` atau `column Y already exists`), kemungkinan drift baru. Lakukan `migrate resolve --applied <migration_name>` lalu re-run `migrate deploy`. Catat semua drift baru yang ditemukan.

### 🤖 2.7 Agent: Verifikasi invariants

```bash
sudo -u postgres psql -d risesocial_db <<SQL
-- Layer 1 / 2 / 3 counts
SELECT
  (SELECT count(*) FROM transactions) AS tx_total,
  (SELECT count(*) FROM midtrans_transactions) AS mt_total,
  (SELECT count(*) FROM ryls_payments WHERE transaction_id IS NOT NULL) AS rp_linked,
  (SELECT count(*) FROM ryls_payments WHERE transaction_id IS NULL) AS rp_unlinked;

-- Distribution
SELECT provider, status, count(*) FROM transactions GROUP BY provider, status;

-- Critical invariants (semua harus = 0)
SELECT 'missing_customer' AS check, count(*) AS bad
FROM transactions WHERE customer_name IS NULL OR customer_email IS NULL
UNION ALL SELECT 'duplicate_tx_code', count(*) - count(DISTINCT transaction_code)
FROM transactions
UNION ALL SELECT 'broken_rp_fk', count(*)
FROM ryls_payments rp LEFT JOIN transactions t ON t.id=rp.transaction_id
WHERE rp.transaction_id IS NOT NULL AND t.id IS NULL
UNION ALL SELECT 'broken_mt_fk', count(*)
FROM midtrans_transactions mt LEFT JOIN transactions t ON t.id=mt.transaction_id
WHERE t.id IS NULL
UNION ALL SELECT 'snap_token_null', count(*)
FROM midtrans_transactions WHERE snap_token IS NULL
UNION ALL SELECT 'uppercase_status_rp', count(*)
FROM ryls_payments WHERE status NOT IN ('paid','pending');

-- Sequence health
SELECT 'tx_seq' AS seq, last_value FROM transactions_id_seq
UNION ALL SELECT 'mt_seq', last_value FROM midtrans_transactions_id_seq;
SQL
```

**STOP cutover kalau ada invariant yang non-zero**. Investigasi sebelum lanjut.

### 👤 2.8 Manusia: Switch backend ke service baru

- Confirm `.env` di backend baru pointing ke `risesocial_db`.
- Start new backend service:
  ```bash
  sudo systemctl start <new_backend_service_name>
  ```
- Verifikasi running:
  ```bash
  sudo systemctl status <new_backend_service_name>
  curl http://localhost:8000/health  # atau endpoint health-check yang ada
  ```

### 👤 2.9 Manusia: Smoke test app

Critical paths:
- Admin login → dashboard load
- List RYLS registrations → muncul 324 records
- List transactions → muncul 320 records
- Buat 1 test transaction baru → dapat ID baru (≥ 321), tidak error
- Cek log backend: tidak ada error fatal

### 👤 2.10 Manusia: Disable maintenance mode

Open traffic. Watch:
- Error rate (Sentry/log) 30 menit pertama
- Payment success rate
- Tidak ada koneksi ke DB lama (`risesocial`) dari new backend

---

## Phase 3 — Stabilization & Cleanup

### 👤 3.1 Manusia: Monitor 24 jam pertama

- Error rate normal?
- Ada user complain?
- Transaksi baru jalan?

### 👤 3.2 Manusia: Decision setelah 7 hari stable

- Confirm semua transaksi baru sukses, tidak ada anomali yang butuh akses old DB.
- Archive old DB dump untuk disaster recovery:

### 🤖 3.3 Agent: Archive old DB sebelum drop

```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_FILE="/www/wwwroot/db-backups/risesocial_archive_${TIMESTAMP}.sql.gz"

sudo -u postgres pg_dump --no-owner --no-privileges -d risesocial | gzip > "$ARCHIVE_FILE"
ls -lh "$ARCHIVE_FILE"
```

Upload ke offsite storage (S3, NAS, atau external backup) — biar disk VPS tidak terus terisi.

### 🤖 3.4 Agent: Drop old DB

> ⚠️ **DESTRUCTIVE & IRREVERSIBLE**. Pastikan archive di Phase 3.3 verified dulu. Pastikan tidak ada service yang masih konek ke `risesocial`.

```bash
# Cek koneksi aktif ke risesocial
sudo -u postgres psql -d postgres -c "SELECT pid, usename, application_name, state FROM pg_stat_activity WHERE datname='risesocial';"
# Harus kosong. Kalau ada, investigate dulu sebelum drop.

sudo -u postgres psql -d postgres -c "DROP DATABASE risesocial;"
sudo -u postgres psql -d postgres -c "\l" | grep risesocial
# Hanya risesocial_db yang tersisa.
```

### 👤 3.5 Manusia: Cleanup old backend folder & service

- Stop & disable old backend service file
- Optionally hapus folder code lama (atau biarkan untuk reference 1 bulan lagi)

---

## Rollback

> Kapan saja **sebelum Phase 3.4** (DROP risesocial), rollback masih mungkin.

### 👤 Rollback steps (manusia):

1. Stop new backend service:
   ```bash
   sudo systemctl stop <new_backend_service_name>
   ```
2. Start old backend service:
   ```bash
   sudo systemctl start <old_backend_service_name>
   ```
3. Konfirmasi old app jalan (pointing ke `risesocial` yang masih utuh).
4. **Data yang ditulis ke `risesocial_db` selama new backend running akan lost** — kecuali manual dump + replay delta ke `risesocial`. Untuk Rise Social skala kecil, biasanya acceptable (jumlah transaksi baru per jam minim).

### Post-rollback:

- Investigasi root cause kenapa rollback diperlukan.
- Drop `risesocial_db` (atau biarkan untuk forensik):
  ```bash
  sudo -u postgres psql -d postgres -c "DROP DATABASE risesocial_db;"
  ```
- Plan ulang & retry setelah fix.

---

## Quick Reference: Agent Commands

| Step | Command |
|---|---|
| Buat DB | `sudo -u postgres psql -c "CREATE DATABASE risesocial_db OWNER risesocial;"` |
| Dump old | `sudo -u postgres pg_dump --no-owner --no-privileges -d risesocial > /www/wwwroot/db-backups/risesocial_predeploy_$(date +%Y%m%d_%H%M%S).sql` |
| Restore new | `sudo -u postgres psql -d risesocial_db -f <dump_file>` |
| Resolve drift | `prisma migrate resolve --applied 20260428132019_add_ryls_draft_registration` |
| Migrate | `prisma migrate deploy` |
| Verify | (lihat 2.7) |
| Archive old | `sudo -u postgres pg_dump -d risesocial \| gzip > /www/wwwroot/db-backups/risesocial_archive_*.sql.gz` |
| Drop old | `sudo -u postgres psql -c "DROP DATABASE risesocial;"` |

---

## Migrasi Yang Akan Diaplikasikan

Migrations baru dari branch `dev` yang akan jalan saat `migrate deploy` di `risesocial_db`:

```
20260306054348_add_3_layer_payment_architecture       (additive)
20260306060000_migrate_ryls_payment_data              ← migrasi 320 rows payment
20260307022117_cleanup_old_payment_tables             (destruktif, setelah migrasi)
20260307031102_academy_schema_refactor                (rename tables, data preserved)
20260308035806_remove_sessions_and_enrollments        (tabel kosong di prod)
20260308052514_add_cohort_feature                     (additive)
20260308132438_add_file_upload_entity_fks             (additive)
20260319190159_add_cascade_delete_academy             (FK only)
20260414213503_rename_session_timestamp_add_end_time
20260416152757_add_assignment_deadline_to_cohort_modules
20260417030713_add_assignment_title_and_completion_and_grades
20260422224121_add_admin_permission_management
20260427212017_refactor_cohort_placement              (tabel kosong di prod)
20260428132019_add_ryls_draft_registration            ← DRIFT, wajib resolve dulu
20260503140000_remove_enrollment_status
20260514064000_make_ryls_drafts_persistent
```

---

## Catatan Penting Sebelum Mulai

1. **Backend service name** di VPS — manusia harus tahu nama service old & new (untuk systemctl start/stop).
2. **DATABASE_URL untuk risesocial_db** — manusia siapkan di `.env` backend baru. Format: `postgresql://risesocial:<password>@localhost:5432/risesocial_db?schema=public`.
3. **External services** — apakah ada service lain (analytics, backup tool, monitoring) yang konek ke DB `risesocial`? Mereka perlu di-update juga.
4. **Webhook URL** — Midtrans/PayPal callback URL biasanya per-domain (bukan per-port). Kalau new backend listening di port yang sama setelah switch, otomatis route ke new. Kalau beda → update URL di dashboard provider.
5. **File uploads** — `file_uploads` table reference path/key external (filesystem/R2/S3). Storage shared antara old & new → tidak masalah.

---

## Yang Sudah Diverifikasi Local

- ✅ Migration `20260306060000_migrate_ryls_payment_data` ter-test 2× di staging lokal dari clean restore
- ✅ Hasil idempotent: 320 transactions (209 midtrans pending + 111 paypal paid), 209 midtrans_transactions, 320 linked ryls_payments + 1,871 unlinked orphan
- ✅ Semua invariants lulus: FK integrity 0, missing customer 0, duplicate code 0, status lowercase
- ✅ Schema drift `ryls_draft_registrations` terdokumentasi, perlu `migrate resolve` manual

Production deploy via blue-green pakai runbook ini = reuse fix yang sudah terbukti di local.
