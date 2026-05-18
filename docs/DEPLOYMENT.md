# Deployment Guide

Panduan ini ditulis berdasarkan kondisi repo saat ini: backend `Fastify 5` + `Prisma 6` + `PostgreSQL`, dijalankan sebagai proses Node biasa, dengan upload file lokal ke folder `uploads/`.

## 1. Ringkasan Arsitektur Deploy

- App entrypoint: `src/server.js`
- Production start command: `npm start`
- Health check: `GET /health`
- Swagger UI: `GET /documentation`
- Database: PostgreSQL via Prisma
- Upload storage: local filesystem di folder `uploads/`
- Reverse proxy yang direkomendasikan: Nginx
- Process manager yang direkomendasikan: `systemd`

Catatan penting:

- Backend ini menyimpan file upload di disk lokal. Kalau server di-redeploy ke instance baru atau storage ephemeral, isi `uploads/` bisa hilang kalau tidak dipersist.
- Integrasi Midtrans di-load saat startup. Artinya env Midtrans perlu diisi agar server bisa boot normal.

## 2. Requirement Server

Contoh target yang aman:

- Ubuntu 22.04/24.04
- Node.js 20 LTS
- PostgreSQL 15+
- Nginx
- Akses untuk `systemctl`

Package sistem yang umum dibutuhkan:

```bash
sudo apt update
sudo apt install -y nginx postgresql-client
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 3. Struktur Direktori di Server

Contoh penempatan:

```bash
/var/www/rise-social/backend
```

Direktori penting setelah deploy:

- source code: `/var/www/rise-social/backend`
- env file: `/var/www/rise-social/backend/.env`
- uploads: `/var/www/rise-social/backend/uploads`

## 4. Environment Variables

### Wajib untuk boot minimum

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public
JWT_SECRET=ganti-dengan-secret-panjang-minimal-32-karakter
FRONTEND_URL=https://frontend-domain-anda.com

MIDTRANS_MODE=PRODUCTION
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_PRODUCTION_URL=https://app.midtrans.com
```

### Wajib kalau masih pakai Midtrans sandbox

Kalau production Anda masih diarahkan ke sandbox untuk testing, sesuaikan:

```env
MIDTRANS_MODE=SANDBOX
MIDTRANS_SANDBOX_SERVER_KEY=...
MIDTRANS_SANDBOX_CLIENT_KEY=...
MIDTRANS_SANDBOX_URL=https://app.sandbox.midtrans.com
```

### Opsional tapi direkomendasikan

```env
POSTHOG_API_KEY=...
POSTHOG_HOST=https://us.i.posthog.com

BREVO_API_KEY=...
EMAIL_FROM_ADDRESS=noreply@domain-anda.com
EMAIL_FROM_NAME=Rise Social

CURRENCY_API_KEY=...
LOG_LEVEL=info
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=application/pdf,image/jpeg,image/jpg,image/png
```

### Catatan env yang perlu diperhatikan

- `JWT_SECRET` jangan biarkan kosong. Kode saat ini masih punya fallback default di plugin JWT, jadi di production secret ini harus dipastikan diisi manual.
- `FRONTEND_URL` dipakai untuk CORS dan beberapa URL yang dikirim ke user, jadi isi dengan domain frontend final.
- `MIDTRANS_*` penting karena client Midtrans diinisialisasi saat module import, bukan saat endpoint payment dipanggil.
- `POSTHOG_*` hanya efektif di `NODE_ENV=production`.

## 5. Initial Deploy

### 5.1 Clone dan install dependency

```bash
git clone <repo-url> /var/www/rise-social/backend
cd /var/www/rise-social/backend
npm ci
```

Kalau `npm ci` gagal karena lockfile tidak sinkron, fallback:

```bash
npm install
```

### 5.2 Buat file env

```bash
cp env.example .env
nano .env
```

### 5.3 Generate Prisma client dan apply migration

```bash
npx prisma generate
npx prisma migrate deploy
```

Optional, hanya jika memang perlu isi data awal:

```bash
npm run seed
```

Jangan jalankan seed di production tanpa memastikan datanya memang aman untuk environment production.

### 5.4 Siapkan folder uploads

Sebagian folder akan dibuat otomatis saat startup, tapi aman kalau dipastikan lebih dulu:

```bash
mkdir -p uploads/images uploads/documents
```

Kalau Anda menyimpan upload di volume terpisah, mount volume itu ke path `uploads/`.

### 5.5 Smoke test manual

Jalankan dulu tanpa daemon:

```bash
NODE_ENV=production npm start
```

Di shell lain:

```bash
curl http://127.0.0.1:3001/health
```

Respons yang diharapkan:

```json
{"status":"ok","service":"rise-social-backend"}
```

## 6. Menjalankan dengan systemd

Buat file service:

```bash
sudo nano /etc/systemd/system/rise-social-backend.service
```

Isi:

```ini
[Unit]
Description=Rise Social Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/rise-social/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/var/www/rise-social/backend/.env
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Lalu aktifkan:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rise-social-backend
sudo systemctl start rise-social-backend
sudo systemctl status rise-social-backend
```

Log:

```bash
sudo journalctl -u rise-social-backend -f
```

## 7. Reverse Proxy dengan Nginx

Buat config:

```bash
sudo nano /etc/nginx/sites-available/rise-social-backend
```

Contoh:

```nginx
server {
    listen 80;
    server_name api.domain-anda.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/rise-social-backend /etc/nginx/sites-enabled/rise-social-backend
sudo nginx -t
sudo systemctl reload nginx
```

Setelah itu pasang TLS, misalnya dengan Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.domain-anda.com
```

## 8. Update Deploy

Urutan aman untuk update biasa:

```bash
cd /var/www/rise-social/backend
git pull origin main
npm ci
npx prisma generate
npx prisma migrate deploy
sudo systemctl restart rise-social-backend
```

Lalu verifikasi:

```bash
curl https://api.domain-anda.com/health
```

## 9. Database Migration dan Backup

Sebelum deploy yang mengubah schema:

```bash
pg_dump "postgresql://USER:PASSWORD@HOST:5432/DB_NAME" > backup-$(date +%F-%H%M%S).sql
```

Lalu deploy migration:

```bash
npx prisma migrate deploy
```

Repo ini juga punya script migration khusus untuk migrasi payment:

- `scripts/production-migration-deploy.sh`
- `scripts/deploy-payment-migration-prisma.sh`

Script itu bukan untuk deploy harian biasa. Pakai hanya saat memang sedang menjalankan migrasi payment khusus yang relevan.

## 10. Checklist Pasca Deploy

Minimal cek ini:

1. `systemctl status rise-social-backend` harus `active (running)`.
2. `GET /health` harus `200`.
3. `GET /documentation` harus terbuka.
4. Login endpoint bisa dipanggil.
5. Upload file berhasil dan file bisa diakses balik.
6. Webhook/payment flow diuji jika release menyentuh pembayaran.
7. CORS hanya mengizinkan domain frontend yang benar.

## 11. Troubleshooting Cepat

### Server gagal boot karena Midtrans env

Gejala umum:

- error `Missing MIDTRANS_SERVER_KEY environment variable`
- error `Missing MIDTRANS_SANDBOX_SERVER_KEY environment variable`

Perbaikan:

- cek `MIDTRANS_MODE`
- pastikan pasangan env sesuai mode itu memang terisi
- restart service setelah ubah `.env`

### Server gagal konek database

Periksa:

```bash
npx prisma migrate status
```

dan:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
```

### CORS ditolak

Periksa nilai `FRONTEND_URL`. Kode saat ini membatasi origin berdasarkan env tersebut.

### Upload hilang setelah redeploy

Artinya folder `uploads/` tidak dipersist. Pindahkan ke persistent volume atau pastikan direktori itu tidak ikut terhapus saat release.

## 12. Saran Hardening Lanjutan

Beberapa perbaikan operasional yang sebaiknya dipertimbangkan sebelum traffic production besar:

- tambahkan validasi env saat startup
- hilangkan fallback `JWT_SECRET`
- tambahkan security headers seperti `@fastify/helmet`
- tambahkan rate limiting di auth dan payment endpoints
- pindahkan file upload ke object storage jika nanti butuh scaling horizontal
