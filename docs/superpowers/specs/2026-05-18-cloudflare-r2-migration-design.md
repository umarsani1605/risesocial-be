# Cloudflare R2 Migration — Dual Storage Strategy

**Status:** Design — awaiting review
**Date:** 2026-05-18
**Linear:** (TBD)

## Context

Saat ini semua user-uploaded asset (avatar, image, attachment, PDF) di Rise Social disimpan di local disk `/backend/uploads/` dan di-serve via `@fastify/static` plugin. Kondisi ini menimbulkan beberapa keterbatasan:

- Bandwidth backend tersedot untuk serve static asset
- Storage terikat ke filesystem server tunggal (sulit horizontal scale)
- Tidak ada CDN — asset lambat untuk user yang jauh secara geografis
- Backup file harus terpisah dari backup DB

Tujuan: migrasi storage ke Cloudflare R2 dengan custom domain `assets.risesocial.org`, dengan tetap menjaga **backward compatibility** untuk asset legacy yang sudah tersimpan di disk production. Strategi: **dual storage** — file lama tetap di disk, file baru ke R2, dibedakan via cutoff timestamp.

## Scope — 10 Fitur Upload

| # | Feature | Endpoint | Tabel & Field |
|---|---|---|---|
| 1 | User avatar | PUT `/admin/users/:id` (+ self-profile) | `users.avatar` |
| 2 | Academy cover | POST/PUT `/admin/academies` | `academies.image_url` |
| 3 | Academy instructor avatar | POST/PUT `/admin/academies/:id/instructors` | `academy_instructors.avatar_url` |
| 4 | Academy testimonial avatar | POST/PUT `/admin/academies/:id/testimonials` | `academy_testimonials.avatar_url` |
| 5 | Cohort mentor avatar | POST/PUT `/admin/cohorts/:id/mentors` | `cohort_mentors.avatar` |
| 6 | Cohort module attachment | POST `/admin/cohorts/:id/modules/:moduleId/attachments` | `cohort_module_attachments.file_path` |
| 7 | RYLS headshot | POST `/uploads/headshot` | `file_uploads.file_path` |
| 8 | RYLS essay | (via RYLS form) | `file_uploads.file_path` |
| 9 | RYLS payment proof | POST `/uploads/payment-proof` | `file_uploads.file_path` |
| 10 | Cohort certificate PDF (auto-gen) | POST `/admin/cohorts/:id/complete` | `cohort_certificates.file_path` |

## Keputusan Desain

| Aspek | Keputusan |
|---|---|
| Strategi migrasi | **Dual storage** — file lama tetap di disk & di-serve via `/uploads/`, file baru ke R2 |
| Format DB | **Relative path saja** (mis. `academies/images/cover-uuid.png`); URL builder generate full URL di runtime |
| Diskriminator R2 vs legacy | **Cutoff timestamp** — env `R2_CUTOVER_AT`; record `created_at >= cutoff` → R2, else disk |
| Privacy | **Semua publik** via custom domain `assets.risesocial.org`. Filename randomized (UUID) cukup obscure untuk RYLS essay/payment proof |
| Upload flow | **Backend proxy** — pertahankan multipart middleware; frontend tidak berubah |
| Filename | `{slug-of-originalname}-{uuid}.{ext}` (mis. `cover-image-9f2a1b7c.png`) |
| Certificate flow | pdfkit → `/tmp/...` → R2 putObject → delete tmp; download endpoint 302 redirect ke R2 URL |
| Fonts & template PDF | **Tetap di repo** (`backend/uploads/certificates/fonts/`, `template.pdf`) — bundled deploy, bukan R2 |
| SDK | **`@aws-sdk/client-s3` v3** (R2 fully S3-compatible) |
| Cleanup file lama | **Hapus segera, best-effort** — setelah DB commit panggil R2 deleteObject; cek `created_at >= cutoff` sebelum delete (jangan hapus file legacy di disk dari sini) |
| Legacy redirect | **Out of scope** — endpoint `/uploads/*` tetap berfungsi seperti sekarang; tidak ada redirect ke R2 |

## Arsitektur

### Komponen Baru

#### `src/services/shared/r2Service.js`
Singleton wrapper di atas `@aws-sdk/client-s3`. Methods:

- `putObject(key, buffer, contentType)` — upload object; throws on failure
- `deleteObject(key)` — best-effort delete; log warning kalau gagal, jangan throw
- `headObject(key)` — check existence (untuk debugging / health check)

Inisialisasi `S3Client`:
```js
new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})
```

Ekspor sebagai singleton sesuai konvensi project: `export const r2Service = new R2Service()`.

#### `src/utils/assetUrl.js`
- `buildAssetUrl(relativePath, createdAt)` — pilih base URL berdasarkan cutoff
  - `createdAt >= R2_CUTOVER_AT` → `${R2_PUBLIC_BASE}/${relativePath}`
  - else → `${BACKEND_URL}/uploads/${relativePath}`
  - `relativePath` null/empty → return null
- `R2_CUTOVER_AT` di-parse sekali (module-level) jadi `Date` object
- `transformEntityUrls(record, fieldMap)` — helper batch transform untuk record dengan multiple field URL

#### Env Vars (`.env`)
```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=rise-assets
R2_PUBLIC_BASE=https://assets.risesocial.org
R2_CUTOVER_AT=2026-05-18T00:00:00Z
```

Tambahkan validasi di startup (`src/config/env.js` atau equivalent) — gagal boot kalau ada yang missing di production.

### Perubahan File Existing

| File | Perubahan |
|---|---|
| `src/services/shared/fileUploadService.js` | `upload()`: ganti `fs.writeFile` → `r2Service.putObject`. Filename `{slug}-{uuid}.{ext}`. Atomic: R2 fail → no DB insert. Tambah `delete(relativePath, createdAt)` untuk hapus by relativePath (best-effort, cek cutoff sebelum delete) |
| `src/services/admin/cohortService.js` | `_generatePDF()` output ke `os.tmpdir() + '/certificates/'`; setelah selesai upload ke R2, delete tmp. `completeCohort()` simpan path `certificates/{cohortId}/{certCode}.pdf` ke DB |
| `src/controllers/user/cohortController.js` | Certificate download endpoint: 302 redirect ke `buildAssetUrl(cert.file_path, cert.created_at)` (bukan stream) |
| Service layer (academy, user, cohort, ryls) | Transform field URL ke full URL via `buildAssetUrl` sebelum return ke controller. Pakai `created_at` masing-masing record (atau `updated_at` kalau file di-replace setelah cutoff) |
| `src/config/plugins.js` | **No change** — keep `@fastify/static` agar legacy `/uploads/*` tetap accessible |
| `package.json` | Tambah `@aws-sdk/client-s3`, `uuid` (jika belum ada) |

### Pattern Replace Avatar

Saat user/admin ganti avatar (replace existing):
1. `fileUploadService.upload(newFile, ...)` → write ke R2, dapat path baru
2. Update DB record dengan path baru (Prisma transaction)
3. Setelah commit sukses, panggil `fileUploadService.delete(oldPath, oldCreatedAt)`:
   - Cek `oldCreatedAt >= R2_CUTOVER_AT` → `r2Service.deleteObject(oldPath)`, log warning kalau gagal
   - `oldCreatedAt < R2_CUTOVER_AT` → skip (file di disk, biarkan; nanti ada cleanup job terpisah out-of-scope)

## Frontend

**Tidak ada perubahan flow upload.** Backend proxy strategy = frontend tetap POST multipart ke backend seperti sekarang.

**Audit & cleanup** hardcoded `${BACKEND_URL}/uploads/...` di komponen — ganti pakai field URL dari API response (backend sudah transform via `buildAssetUrl`):

- **frontend-v2**: `useImageUpload()`, `FormBasicInfo.vue`, `TestimonialModal.vue`, `InstructorModal.vue`, `InviteMentorModal.vue`, `ModuleModal.vue`, `UserDetailSlideover.vue`
- **frontend (v1)**: `TestimonialDialog.vue`, `InstructorDialog.vue`

## Inkonsistensi Existing (Out of Scope)

Tidak di-refactor di scope ini:

- Mix antara field URL langsung (`avatar_url`, `image_url`) di tabel masing-masing vs unified `file_uploads` table (RYLS). Refactor terpisah.
- Path `academies/images/` dipakai untuk academy cover & testimonial avatar. Biarkan, konsisten dengan `uploadConfig.js`.
- Endpoint legacy seperti `/admin/uploads/image` yang sudah jarang dipakai — tidak dihapus di scope ini.

## Testing

- **Unit**:
  - `r2Service` — mock `S3Client.send`, verifikasi PutObjectCommand/DeleteObjectCommand parameter
  - `buildAssetUrl` — matrix cutoff: created < cutoff, = cutoff, > cutoff, null path
  - Filename generation — kolisi UUID, slug edge case (spasi, unicode)
- **Integration**: `fileUploadService.upload()` end-to-end pakai `aws-sdk-client-mock`; assert (1) sukses → R2 putObject dipanggil + DB record dibuat, (2) R2 fail → tidak ada DB record, (3) DB fail → R2 object dihapus (rollback)
- **Manual smoke**: setelah deploy, 1 upload per kategori (avatar, cover, attachment, certificate generation, RYLS headshot)

## Verifikasi End-to-End

1. Backend boot: env R2 ter-read, validasi pass, `r2Service` init tanpa error
2. Upload avatar baru → cek R2 dashboard ada object, DB simpan relative path, API response URL = `https://assets.risesocial.org/...`
3. Avatar lama (created < cutoff) tetap accessible via `${BACKEND_URL}/uploads/...`
4. Replace avatar: file lama di R2 ter-delete, DB ter-update, file lama di disk tidak tersentuh
5. Complete cohort: certificate PDF tergenerate, ke R2, `/tmp/` bersih, download URL = 302 ke R2
6. CORS: image di frontend dari `assets.risesocial.org` ter-load di browser (tanpa CORS error)

## Rollout

1. Provision bucket R2 `rise-assets` + custom domain `assets.risesocial.org` (DNS CNAME ke R2 endpoint)
2. Set CORS rule di R2: allow GET dari `https://*.risesocial.org` dan domain dev
3. Tambah env vars di production secret manager
4. Deploy backend dengan `R2_CUTOVER_AT` = ISO timestamp waktu deploy
5. Verifikasi via smoke test (item 1–6 di atas)
6. Monitor log `[r2] failed to delete` selama 1 minggu pertama

## Future Work (Out of Scope)

- **Full migration script** — pindahkan semua file legacy dari disk ke R2, update DB path, dan retire endpoint `/uploads/*`
- **Refactor unified storage** — pindah semua field URL langsung (academies, users, dll) ke unified `file_uploads` table
- **Image transformation** — Cloudflare Images / R2 + Workers untuk on-the-fly resize avatar
- **Presigned upload** — direct-to-R2 upload untuk file besar (attachment > 5MB)
