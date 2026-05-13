# Backend Implementation Audit

**Date:** 2026-05-13
**Scope:** `backend/` (Fastify 5 + Prisma 6 + Node.js ES modules)
**Methodology:** 3 paralel pass berdasarkan skill `fastify-best-practices` + `node` best practices — Fastify patterns, security & data hygiene, code quality & structure. Findings telah diverifikasi langsung dengan baca file + git inspection untuk mencegah false positives.

---

## Konteks observability (sudah selesai sebelum audit ini)

Branch `dev` sudah punya 5 commit observability refactor:
- Pino off di production, observability via PostHog (`api.request` wide event + business events + `captureException`)
- 696 logger calls dihapus, 13 business events ter-instrument dengan dot-notation taxonomy
- 143 controller catch blocks refactor dari `return reply.status(500)` ke `throw error` (lewat global errorHandler)
- Webhook capture sebelum return 500 (untuk Midtrans retry)
- Prisma error capture di `handlerPrismaError`

Test parity: 581 pass / 37 fail (semua failure pre-existing, zero regression). Audit ini cover area di luar observability.

---

## ⚠️ False positives (sudah diverifikasi, JANGAN dikira issue)

Dua klaim yang muncul di pass-pass audit tapi setelah diverifikasi langsung ternyata salah:

1. **`.env` ke-commit di git** — ❌ FALSE.
   - `git ls-files | grep env` hanya menunjukkan `env.example` + test helpers.
   - `.env` ada di `.gitignore` line 14, terverifikasi via `git check-ignore -v .env`.
   - Tidak ada secret leak.

2. **Route ordering bug (`/:slug` menelan `/pricing`)** — ❌ FALSE.
   - Fastify pakai `find-my-way` (radix tree router) yang **otomatis prioritaskan static segments di atas parametric**, regardless of registration order.
   - `GET /pricing` akan match handler `/pricing`, bukan `/:slug`.
   - Static-vs-param order di file route tidak masalah di Fastify.

---

## 🔴 P0 — Prod-blocker (security/stability)

### 1. JWT secret fallback default
**File:** `src/config/plugins.js:64`
```js
secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development',
```
**Risk:** Kalau env var lupa di-set di prod, server boot pakai weak hardcoded secret. JWT bisa di-forge oleh anyone yang lihat repo.
**Fix:** Throw di startup kalau `JWT_SECRET` missing atau < 32 chars.

### 2. Tidak ada env var validation di startup
**File:** `src/server.js`
**Risk:** Server boot meski `DATABASE_URL`, `JWT_SECRET`, `MIDTRANS_SERVER_KEY`, `BREVO_API_KEY`, dll. tidak ada. Failure runtime, bukan startup — susah debug.
**Fix:** Tambah Zod (atau JSON Schema dengan `ajv`) di awal `server.js`:
```js
const env = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  POSTHOG_API_KEY: z.string().optional(),
  // ...
}).parse(process.env);
```

### 3. Tidak ada security headers (Helmet)
**File:** `src/config/plugins.js`
**Risk:** Missing X-Frame-Options (clickjacking), X-Content-Type-Options (MIME sniffing), HSTS, CSP, Referrer-Policy.
**Fix:** Register `@fastify/helmet`:
```js
import helmet from '@fastify/helmet';
await fastify.register(helmet, {
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
  hsts: { maxAge: 31536000, includeSubDomains: true },
});
```

### 4. Tidak ada rate limit di endpoint sensitif
**File:** `src/routes/authRoutes.js`, `src/routes/payments/`
**Risk:** Login/register brute-forceable. Custom rate limiter di `src/middleware/validation.js:41-64` cuma in-memory (per-instance) dan **tidak dipasang di auth routes**.
**Fix:** `@fastify/rate-limit` dengan Redis store (Redis sudah ada di env). Limit ketat:
- Login: 5/15min per IP+email
- Register: 3/jam per IP
- Password reset: 3/jam per IP

### 5. Password minimum 6 chars
**Files:** `src/schemas/shared/userSchemas.js:119` (`minLength: 6`), `src/services/shared/userService.js:395`
**Risk:** OWASP recommend ≥ 12 chars + complexity. 6-char password rentan brute force.
**Fix:** Naikkan ke 12 chars + require campuran upper/lower/digit/symbol. Reject common passwords (opsional: `zxcvbn`).

### 6. Login user enumeration via timing
**File:** `src/services/shared/userService.js:169-196`
**Risk:** Login error message sama untuk "user not found" vs "wrong password", tapi timing beda — `bcrypt.compare` cuma jalan kalau user ditemukan. Attacker bisa enumerate emails via timing difference.
**Fix:** Constant-time login — selalu run `bcrypt.compare` (pakai dummy hash kalau user tidak ditemukan):
```js
const user = await userRepository.findByEmail(email);
const hash = user?.password ?? '$2a$12$0000000000000000000000.dummyhash000000000000000';
const ok = await bcrypt.compare(password, hash);
if (!user || !ok) throw makeError('Invalid email or password', 401);
```

### 7. Webhook tidak punya replay protection
**File:** `src/controllers/shared/webhookController.js`
**Risk:** Midtrans bisa kirim notification yang sama 2x (retry behavior). Tidak ada idempotency key check → transaksi diproses 2x → kemungkinan double-enrollment, double event ke PostHog.
**Fix:** Cek apakah `MidtransTransaction.notified_at` sudah ada untuk `transaction_id` dengan status sama → skip. Atau kombinasikan dedup berdasarkan `signature_key` Midtrans.

### 8. Graceful shutdown tanpa timeout + tidak ada `unhandledRejection` handler
**File:** `src/server.js:25-44`
**Risk:** Kalau `fastify.close()` atau `disconnectDatabase()` hang, pod nggak pernah exit → orchestrator force-kill setelah grace period (data loss risk untuk in-flight requests). Selain itu tidak ada `process.on('unhandledRejection')` / `'uncaughtException')` → silent crashes tanpa capture ke PostHog.
**Fix:**
```js
const gracefulShutdown = async (signal) => {
  const timer = setTimeout(() => process.exit(1), 30000).unref();
  try {
    await fastify.close();
    await disconnectDatabase();
    await posthog.shutdown();
    clearTimeout(timer);
    process.exit(0);
  } catch { process.exit(1); }
};

process.on('unhandledRejection', (reason) => {
  posthog.captureException(reason instanceof Error ? reason : new Error(String(reason)));
});
process.on('uncaughtException', (err) => {
  posthog.captureException(err);
  process.exit(1);
});
```

---

## 🟡 P1 — High (best practice & maintainability)

### 9. Dead code `.old.js` files
**Files:**
- `src/controllers/payments/rylsPaymentController.old.js`
- `src/repositories/user/rylsPaymentRepository.old.js`
- `src/services/user/rylsPaymentService.old.js`

**Risk:** Confusion, false-positive search results, ikut ke-strip oleh refactor script. Hapus.

### 10. Backup test files `.bak*`
**Files:**
- `tests/e2e/user-academies.test.js.bak`
- `tests/unit/repositories/testimonialsRepository.pbt.test.js.bak`, `.bak4`
- `tests/unit/services/testimonialsService.pbt.test.js.bak`, `.bak2`, `.bak3`
- `tests/unit/services/testimonialsService.test.js.bak2`, `.bak3`

**Risk:** Noise di test suite, ikut grep result. Hapus.

### 11. Seed script tidak punya prod safety check
**File:** `prisma/seeds/index.js`
**Risk:** Kalau ada yang accidentally run `pnpm seed` di prod dengan env yang salah, data prod bisa di-wipe / overwritten.
**Fix:**
```js
if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_SEED_IN_PRODUCTION) {
  throw new Error('Seeding blocked in production');
}
```

### 12. `request.user` tidak di-decorate (V8 hidden class)
**Files:** `src/middleware/auth.js` (set `request.user`), `src/middleware/uploadMiddleware.js` (set `request.uploadedFile`)
**Risk:** V8 hidden class transition pada setiap assignment → slightly slower property access (mikro-perf, tapi best practice Fastify).
**Fix:** Di plugin / server setup:
```js
fastify.decorateRequest('user', null);
fastify.decorateRequest('uploadedFile', null);
```

### 13. Response schema missing di banyak route
**File:** `src/routes/user/academyRoutes.js:19-117`, dan rute lain
**Risk:** Tanpa `response` schema, Fastify pakai `JSON.stringify` standard (~10K ops/s) bukan `fast-json-stringify` (~40K ops/s). Untuk list endpoint dengan ratusan item, latency naik 5-10ms.
**Fix:** Tambah `response: { 200: schema }` untuk hot endpoint dulu (admin lists, user academy listing).

### 14. Multipart upload pakai `preValidation` instead of `preHandler`
**File:** `src/routes/admin/academyRoutes.js:53, 71, 89` (dan rute lain dengan upload)
**Risk:** `preValidation` run sebelum schema validation. Kalau ada body schema, validation gagal karena body belum di-parse multipart middleware. Saat ini "work by accident" karena `@fastify/multipart` set `body = null` early.
**Fix:** Pindah ke `preHandler`, atau pastikan schema body opsional/relaxed untuk multipart routes.

### 15. JSON Schema `additionalProperties: false` tidak konsisten
**Risk:** Field extra dari client di-accept silent. Bisa lead ke mass assignment vulnerability kalau ada code yang spread `request.body` ke Prisma create/update.
**Fix:** Set `additionalProperties: false` default di shared schemas. Audit semua schema body inline.

### 16. File serving pakai `inline` Content-Disposition
**File:** `src/controllers/guest/fileUploadController.js:61`
**Risk:** PDF/SVG/HTML di-render inline di browser → bisa kena XSS dari user-uploaded content (mis. SVG dengan `<script>`).
**Fix:** `attachment` untuk dokumen, `inline` hanya untuk image types yang trusted (jpeg, png, webp, gif). Tambah `X-Content-Type-Options: nosniff`.

### 17. PII di email template tidak di-escape
**Files:** `src/templates/email/*.js` (`welcomeEmail.js:13-14`, dll)
**Risk:** `${name}` di-interpolate ke HTML email tanpa escape. Kalau user register dengan nama berisi `<script>`, email-nya ke-render dengan script. Mail clients biasanya sandbox script, tapi tetap injection risk.
**Fix:** Helper `escapeHtml` di template:
```js
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
```

### 18. PostHog `posthog.identify` punya field `email` & `name`
**File:** `src/controllers/auth/authController.js:14-19, 56-61`
**Status:** **By design** (PostHog people-properties butuh ini untuk identify users di dashboard). Tapi perhatikan: data ini terkirim ke PostHog server. Kalau region/GDPR sensitive, set PostHog data residency atau opt-out properties.

### 19. Tidak ada password reset / forgot password flow
**Status:** Missing entirely di codebase.
**Risk:** User yang lupa password tidak punya recovery — support harus reset manual via DB.
**Fix:** Endpoint `POST /auth/forgot-password` (rate-limited) → generate one-time token (32 bytes random, hashed di DB, TTL 15min) → kirim via email → `POST /auth/reset-password` validate & update password. Track di table `password_reset_tokens` (single-use).

### 20. Tidak ada `engines` field di package.json
**File:** `package.json`
**Risk:** Different Node versions across dev/prod bisa cause subtle bugs (ES module behavior, native API).
**Fix:**
```json
"engines": { "node": ">=20.0.0" },
"packageManager": "pnpm@9.x"
```

### 21. `setSchemaErrorFormatter` missing
**File:** `src/server.js`
**Risk:** Validation error melewati global `errorHandler` (extra hop). `fastify.setSchemaErrorFormatter()` lebih efficient untuk early intercept validation error.
**Fix:** Pindahkan validation error formatting logic dari `errorHandler.js:5-34` ke `setSchemaErrorFormatter`.

---

## 🟢 P2 — Medium (nice-to-have)

### 22. Tidak pakai `fastify-plugin` (fp) wrapper di custom plugin
**File:** `src/plugins/posthogRequestEvent.js`
**Status:** Saat ini fine karena plugin tidak expose decorator ke parent scope. Tapi convention Fastify 5 prefer explicit `fp()`. Wrap supaya intent jelas.

### 23. Tidak ada compression
**File:** `src/config/plugins.js`
**Risk:** Bandwidth waste, slower response untuk list endpoints. JSON gzip bisa 60-80% reduction.
**Fix:** `await fastify.register(compress, { threshold: 1024 })`.

### 24. N+1 risk di endpoint cohort & academy nested data
**Files:** `src/controllers/admin/cohortController.js` punya nested loop `cohort.modules → module.attachments`. Service-layer fetching pattern perlu diverifikasi pakai Prisma `include` (bukan loop + query).
**Fix:** Audit setiap `findMany` yang di-iterate apakah pakai `include` untuk relations.

### 25. `getAllPricing()` / `getAllFeatures()` tanpa pagination
**File:** `src/services/shared/academyService.js:49-51`
**Risk:** Kalau ada 1000+ academies, load all + `flatMap` → memory bloat.
**Fix:** Tambah pagination atau filter by `academy_id`.

### 26. Inkonsistensi snake_case (DB) vs camelCase (JS)
**Risk:** Frontend perlu translate. Bisa-bisa ada bug typo.
**Fix:** DTO/mapper layer atau Prisma `select` alias. Optional — big refactor.

### 27. Prisma connection pool tidak di-config
**File:** `src/config/database.js`
**Status:** Default pool size Prisma is `num_physical_cpus * 2 + 1` — usually fine. Tapi explicit setting via `DATABASE_URL?connection_limit=10` lebih transparan.

### 28. Background job queue belum ada
**Status:** Redis di env tapi belum dipakai untuk job queue. Email send fire-and-forget (no retry). Tidak ada cleanup job untuk expired drafts/sessions.
**Fix (future):** BullMQ atau pg-boss untuk email queue + retry, cleanup cron.

### 29. Empty `if` block di webhook
**File:** `src/controllers/shared/webhookController.js:115-116`
```js
if (academyEnrollment) {
}
```
**Risk:** Dead code dari refactor sebelumnya. Hapus.

### 30. Swagger schema tagging tidak konsisten
**Risk:** Swagger UI grouping kurang clean.
**Fix:** Optional — tag per domain (Academies, Cohorts, Payments, RYLS) di tiap route definition.

---

## 🟢 Positive findings (sudah bagus, jangan di-touch)

- ✅ ES modules konsisten, no CommonJS leftover, `.js` extension di import
- ✅ Layering Controller → Service → Repository → Prisma rapi
- ✅ Singleton pattern konsisten (`export const xService = new XService()`)
- ✅ Prisma transactions dipakai di multi-step mutation (webhook handler, academy create)
- ✅ Tidak ada `prisma.$queryRaw` / `$executeRaw` → no SQL injection surface
- ✅ Bcrypt 12 rounds (secure)
- ✅ Plugin order di `plugins.js` benar (CORS → multipart → static → JWT → swagger)
- ✅ File upload sanitization (`path.basename`, char whitelist, length cap)
- ✅ MIME type whitelist di `UPLOAD_CONFIG`
- ✅ JWT payload tidak punya field sensitive (no password_hash)
- ✅ `setErrorHandler` + `setNotFoundHandler` properly registered
- ✅ Async pattern: `Promise.all` di paralel queries, no async `forEach`
- ✅ Coverage threshold di vitest 70%, `fileParallelism: false` (anti-flake)
- ✅ ErrorHandler comprehensive (validation, Prisma codes, JWT, statusCode-based, fallback captureException)
- ✅ PostHog observability lengkap (wide event + business + exception)
- ✅ `dotenv.config()` di awal `server.js` (before plugins)
- ✅ Logger pino-pretty cuma di dev, off di prod (no file transport, no rotation needed)
- ✅ Static assets (`@fastify/static`) di-config dengan path scope yang aman
- ✅ JWT plugin di-register sebelum auth middleware dipakai

---

## Summary table

| # | Severity | Area | File reference | Effort |
| --- | --- | --- | --- | --- |
| 1 | 🔴 P0 | JWT default fallback | `src/config/plugins.js:64` | XS (1 line) |
| 2 | 🔴 P0 | Env validation startup | `src/server.js` | S (helper + schema) |
| 3 | 🔴 P0 | Helmet security headers | `src/config/plugins.js` | S (1 plugin) |
| 4 | 🔴 P0 | Rate-limit auth/payment | `src/routes/authRoutes.js`, `payments/` | M (Redis + per-route) |
| 5 | 🔴 P0 | Password 6→12 + complexity | `src/schemas/shared/userSchemas.js:119` | S |
| 6 | 🔴 P0 | Constant-time login | `src/services/shared/userService.js:169-196` | XS |
| 7 | 🔴 P0 | Webhook idempotency | `src/controllers/shared/webhookController.js` | S (DB check) |
| 8 | 🔴 P0 | Shutdown timeout + unhandledRejection | `src/server.js:25-44` | XS |
| 9 | 🟡 P1 | Dead `.old.js` files | 3 files | XS (delete) |
| 10 | 🟡 P1 | `.bak*` test files | 6 files | XS (delete) |
| 11 | 🟡 P1 | Seed prod safety | `prisma/seeds/index.js` | XS |
| 12 | 🟡 P1 | `decorateRequest('user', null)` | server setup | XS |
| 13 | 🟡 P1 | Response schemas hot endpoints | route files | M (per-route) |
| 14 | 🟡 P1 | Upload middleware: preValidation→preHandler | `src/routes/admin/academyRoutes.js` etc | S |
| 15 | 🟡 P1 | `additionalProperties: false` consistency | Many schemas | M (audit) |
| 16 | 🟡 P1 | File download inline→attachment | `src/controllers/guest/fileUploadController.js:61` | XS |
| 17 | 🟡 P1 | Email template HTML escape | `src/templates/email/*.js` | S (helper) |
| 19 | 🟡 P1 | Password reset flow | new endpoints | L (feature) |
| 20 | 🟡 P1 | `engines` field | `package.json` | XS |
| 21 | 🟡 P1 | `setSchemaErrorFormatter` | `src/server.js` | S |
| 22 | 🟢 P2 | `fastify-plugin` wrapper | `src/plugins/posthogRequestEvent.js` | XS |
| 23 | 🟢 P2 | Compression | `src/config/plugins.js` | XS |
| 24 | 🟢 P2 | N+1 audit nested data | controller/service | M |
| 25 | 🟢 P2 | `getAllPricing` pagination | `src/services/shared/academyService.js` | S |
| 26 | 🟢 P2 | snake_case ↔ camelCase | Many files | L (refactor) |
| 27 | 🟢 P2 | Connection pool config | `src/config/database.js` | XS (env var) |
| 28 | 🟢 P2 | Job queue (BullMQ) | new | L (feature) |
| 29 | 🟢 P2 | Empty `if` webhook | `src/controllers/shared/webhookController.js:115` | XS |
| 30 | 🟢 P2 | Swagger tag consistency | schemas | S |

**Effort legend:** XS = <30 min, S = 1-2 hrs, M = half-day, L = 1+ days

---

## Suggested grouping (kalau nanti dieksekusi)

**Sprint 1 — Production hardening (P0):** #1-8. ~1-2 hari kerja. **Required sebelum prod launch.**

**Sprint 2 — Cleanup & quick wins:** #9-12, #20, #29. ~3 jam kerja.

**Sprint 3 — Defense-in-depth:** #15-17, #21-23. ~1 hari kerja.

**Sprint 4 — Polish:** #13-14, #18, #24-25, #27, #30. ~2 hari kerja.

**Sprint 5 — Feature work:** #19 (password reset), #28 (job queue), DTO layer (#26). Schedule terpisah.

**Long-term (out of audit scope):** TypeScript migration (incremental folder-by-folder, `allowJs: true`).

---

## Verification (kalau nanti dieksekusi)

Untuk tiap fix dari P0:
1. Unit test untuk validation behavior (JWT throw on missing, password strength, login timing).
2. Integration test webhook idempotency (kirim webhook 2x, assert hanya 1 enrollment created).
3. Smoke test: `NODE_ENV=production` + missing env → server refuse to start dengan pesan jelas.
4. Manual: hit `/auth/login` 6x dalam 15 menit dari satu IP → 429.
5. Inspect response headers via `curl -i` untuk verifikasi Helmet headers.
6. Shutdown test: kirim SIGTERM saat ada in-flight request → assert graceful close + timeout fallback.
