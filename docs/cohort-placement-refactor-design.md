# Cohort Placement Refactor — Design Document

**Status:** Draft
**Author:** Umar Sani
**Created:** 2026-04-27
**Linear Project:** [Cohort Placement Refactor](https://linear.app/umarsani1602/project/cohort-placement-refactor-41a2343751a9)

---

## 1. Overview

Refactor sistem cohort enrollment dari **silent auto-assignment** ke **admin-driven placement**. Pisahkan semantik **pembelian academy** dari **penempatan cohort** ke dalam dua entity yang masing-masing punya tanggung jawab tunggal.

## 2. Problem Statement

### Current behavior

Saat user beli academy via `POST /payments/academy/transactions`:

1. `academyPaymentService.createTransaction()` panggil `academyPaymentRepository.findLatestCohortByAcademyId(academyId)` ([src/repositories/user/academyPaymentRepository.js:26-39](../src/repositories/user/academyPaymentRepository.js#L26-L39)).
2. Repository return cohort dengan `status='not_started'`, sort `created_at DESC, id DESC`.
3. Cohort ID itu langsung di-embed ke `CohortEnrollment` baru.
4. User dapat akses cohort begitu pembayaran sukses.

### Why it's broken

- Kalau ada **>1 cohort `not_started`** untuk academy yang sama (sequential batches: April + Mei sudah pre-create; atau parallel batches: pagi vs sore), user di-assign ke yang created paling akhir tanpa visibility.
- User mungkin sebenarnya mau cohort yang start lebih cepat / mentor tertentu / jadwal cocok.
- Admin tidak punya kontrol untuk:
  - Memilih cohort tertentu untuk student tertentu (mentor matching, level kurasi)
  - Membuka penjualan academy sebelum cohort di-create
  - Memindahkan student antar cohort

### Constraint

- Database belum production — masih di-seed manual. Migration aman untuk drop & recreate.
- Tidak ada SLA assignment — user yang sudah bayar lihat placeholder "Kelas belum dimulai" sampai admin assign.
- User dapat akses arsip cohort lama setelah selesai. Untuk ulang batch, user harus beli academy lagi (bukan lifetime unlimited access).

## 3. Goals & Non-Goals

### Goals

1. Pisahkan **payment lifecycle** dari **cohort placement lifecycle**
2. Beri admin kontrol penuh atas placement (assign, transfer, cancel, drop)
3. Allow purchase sebelum cohort tersedia
4. Allow re-purchase setelah cohort selesai (multiple journey per academy per user)
5. Preserve akses arsip cohort yang sudah selesai
6. TDD discipline — tests dulu per layer

### Non-Goals (this iteration)

- SLA / deadline tracking untuk admin assignment
- Email notifikasi saat di-assign cohort (placeholder UI saja)
- Cohort capacity / max_students enforcement
- Self-service refund (manual via Midtrans dashboard)
- Frontend UI implementation

## 4. Data Model

### 4.1 New entity — `AcademyEnrollment`

Parent entity. Represents **the act of purchasing an academy** dan menggambarkan ownership level academy.

```prisma
model AcademyEnrollment {
  id              Int                @id @default(autoincrement())
  academy_id      Int
  user_id         Int
  transaction_id  Int                @unique
  status          String             @default("pending") @db.VarChar(20)
  completed_at    DateTime?
  notes           String?
  created_at      DateTime           @default(now())
  updated_at      DateTime           @updatedAt

  academy         Academy            @relation("AcademyEnrollments", fields: [academy_id], references: [id], onDelete: Cascade)
  user            User               @relation("UserAcademyEnrollments", fields: [user_id], references: [id], onDelete: Cascade)
  transaction     Transaction        @relation("TransactionToAcademyEnrollment", fields: [transaction_id], references: [id])
  placement       CohortPlacement?

  @@index([user_id, academy_id, status])
  @@index([status])
  @@map("academy_enrollments")
}
```

**Status transitions:**

```
pending ──(webhook paid)──> active ──(cohort completed)──> completed
   │                          │
   └──(admin cancel/expired)──┴──(admin cancel)──> cancelled
```


| Status      | Arti                                                                                   |
| ----------- | -------------------------------------------------------------------------------------- |
| `pending`   | Payment dibuat, belum di-bayar / belum settled                                         |
| `active`    | Sudah dibayar — academy ownership aktif. Mungkin sudah punya placement, mungkin belum. |
| `completed` | Cohort yang user ikuti sudah selesai — akses arsip tetap berlaku                       |
| `cancelled` | Pembayaran failed/expired atau admin cancel. Tidak ada akses.                          |


**Catatan field:**

- ❌ Tidak ada `paid_at` — gunakan `Transaction.paid_at` (single source of truth).
- ✅ `completed_at` — set saat cohort yang user ikuti di-mark completed.
- ✅ `transaction_id @unique` — enforce 1:1 dengan Transaction.

### 4.2 New entity — `CohortPlacement`

Child entity. Represents **the placement of a student into a specific cohort**. Existence row = sumber kebenaran "user ada di cohort ini".

```prisma
model CohortPlacement {
  id                    Int                @id @default(autoincrement())
  academy_enrollment_id Int                @unique
  cohort_id             Int
  user_id               Int                // denorm utk @@unique
  academy_id            Int                // denorm utk query
  notes                 String?
  created_at            DateTime           @default(now())
  updated_at            DateTime           @updatedAt

  academy_enrollment    AcademyEnrollment  @relation(fields: [academy_enrollment_id], references: [id], onDelete: Cascade)
  cohort                Cohort             @relation("CohortPlacements", fields: [cohort_id], references: [id], onDelete: Cascade)
  user                  User               @relation("UserCohortPlacements", fields: [user_id], references: [id], onDelete: Cascade)
  academy               Academy            @relation("AcademyCohortPlacements", fields: [academy_id], references: [id], onDelete: Cascade)
  certificate           CohortCertificate? @relation("PlacementCertificate")

  @@unique([cohort_id, user_id])
  @@index([cohort_id])
  @@index([academy_id])
  @@map("cohort_placements")
}
```

**Apa yang DIHILANGKAN dari model lama (`CohortEnrollment`)** dan kenapa:


| Field lama        | Hilang? | Alasan                                                                      |
| ----------------- | ------- | --------------------------------------------------------------------------- |
| `status`          | ✅       | Existence row = access. Lifecycle ada di parent `AcademyEnrollment.status`. |
| `enrolled_at`     | ✅       | `created_at` sudah cukup.                                                   |
| `completion_date` | ✅       | Pakai `academy_enrollment.completed_at`.                                    |
| `transaction_id`  | ✅       | Pindah ke parent (`AcademyEnrollment.transaction_id`).                      |


**Constraint:**

- `academy_enrollment_id @unique` — satu placement per pembelian (1:1).
- `@@unique([cohort_id, user_id])` — user hanya bisa muncul sekali di cohort yang sama.

### 4.3 Updated entity — `CohortCertificate`

```prisma
model CohortCertificate {
  id               Int              @id @default(autoincrement())
  academy_id       Int
  cohort_id        Int
  placement_id     Int              @unique  // RENAMED from enrollment_id
  user_id          Int
  certificate_code String           @unique @db.VarChar(100)
  // ... rest unchanged

  placement        CohortPlacement  @relation("PlacementCertificate", fields: [placement_id], references: [id], onDelete: Cascade)
  // ... rest unchanged

  @@unique([cohort_id, user_id])
  @@map("cohort_certificates")
}
```

**Change:** field `enrollment_id` → `placement_id`. Semantik tetap sama (1 certificate per placement).

### 4.4 Removed entity — `CohortEnrollment`

Drop seluruh model. Replaced by `AcademyEnrollment` + `CohortPlacement`.

### 4.5 Back-relations updates


| Entity        | Before                                   | After                                                                               |
| ------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `User`        | `cohort_enrollments: CohortEnrollment[]` | `academy_enrollments: AcademyEnrollment[]` + `cohort_placements: CohortPlacement[]` |
| `Academy`     | `enrollments: CohortEnrollment[]`        | `enrollments: AcademyEnrollment[]` + `cohort_placements: CohortPlacement[]`         |
| `Transaction` | `cohort_enrollment: CohortEnrollment?`   | `academy_enrollment: AcademyEnrollment?`                                            |
| `Cohort`      | `enrollments: CohortEnrollment[]`        | `placements: CohortPlacement[]`                                                     |


### 4.6 Untouched entities

- `CohortAssignmentCompletion` — track homework submission per `(cohort_module_id, user_id)`. Tidak dependent ke enrollment/placement.
- `CohortMentor`, `CohortModule`, `CohortModuleAttachment`, `Cohort` — tidak ada perubahan struktur.

## 5. Domain Rules

### 5.1 Access rule


| Pertanyaan                                  | Query                                                               |
| ------------------------------------------- | ------------------------------------------------------------------- |
| User punya akses cohort X?                  | `CohortPlacement(cohort_id=X, user_id=Y)` exists                    |
| User selesai academy X?                     | `AcademyEnrollment(user, X, status=completed)` exists               |
| User punya transaksi pending utk academy X? | `AcademyEnrollment(user, X, status=pending)` exists                 |
| User boleh beli academy X (lagi)?           | TIDAK ada `AcademyEnrollment(user, X, status in [pending, active])` |


### 5.2 Re-purchase rule

User boleh beli academy yang sama lagi **kalau dan hanya kalau**:

- Tidak ada `AcademyEnrollment(user, academy, status='pending')` AND
- Tidak ada `AcademyEnrollment(user, academy, status='active')`

Status `completed` dan `cancelled` tidak block re-purchase. Setiap re-purchase = baris `AcademyEnrollment` baru, dengan kemungkinan placement baru.

### 5.3 Placement state


| Parent `AcademyEnrollment.status` | `CohortPlacement` exists? | Arti                                                           |
| --------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `pending`                         | No                        | Belum bayar                                                    |
| `active`                          | No                        | Sudah bayar, belum di-assign cohort. UI: "Kelas belum dimulai" |
| `active`                          | Yes                       | Sudah bayar, sudah di-assign. Boleh akses modul.               |
| `completed`                       | Yes                       | Cohort selesai. Placement preserved utk arsip access.          |
| `cancelled`                       | No                        | Cancelled — placement (kalau ada) sudah dihapus admin          |


**Note:** kombinasi `status=cancelled` + placement exists tidak boleh terjadi (dijaga di service layer).

## 6. Flow Diagrams

### 6.1 Purchase → Payment → Assignment → Access

```
┌─────────────────────────────────────────────────────────────────┐
│ User                                                            │
└─────────────────────────────────────────────────────────────────┘
   │ POST /payments/academy/transactions { academy_id, pricing_id }
   ▼
┌─────────────────────────────────────────────────────────────────┐
│ AcademyPaymentService.createTransaction                         │
│ - re-purchase check (block kalau ada pending/active)            │
│ - generate transaction_code                                     │
│ - create Snap transaction via Midtrans                          │
│ - prisma.$transaction:                                          │
│   * Transaction (Layer 1)                                       │
│   * MidtransTransaction (Layer 2)                               │
│   * AcademyEnrollment(status=pending) (Layer 3)                 │
│ - return snap_token + redirect_url                              │
└─────────────────────────────────────────────────────────────────┘
   │ user pays via Midtrans
   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Midtrans → Webhook                                              │
│ POST /webhook/midtrans                                          │
└─────────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────────┐
│ WebhookController.handleMidtransWebhook                         │
│ - verify signature                                              │
│ - prisma.$transaction:                                          │
│   * Transaction.status = paid                                   │
│   * MidtransTransaction.last_notification = ...                 │
│   * AcademyEnrollment.status = active                           │
│ - fire-and-forget email                                         │
└─────────────────────────────────────────────────────────────────┘
   │ user state: AcademyEnrollment.active, no placement
   │ UI: "Kelas belum dimulai"
   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Admin (later, no SLA)                                           │
│ POST /admin/academy-enrollments/:id/assign { cohort_id }        │
└─────────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────────┐
│ AdminPlacementService.assignToCohort                            │
│ - validate enrollment.status === 'active'                       │
│ - validate cohort same academy + status in [not_started,        │
│   in_progress]                                                  │
│ - validate no existing placement for this enrollment            │
│ - create CohortPlacement                                        │
└─────────────────────────────────────────────────────────────────┘
   │ user state: AcademyEnrollment.active + CohortPlacement
   │ UI: cohort detail accessible, modules accessible
   ▼
┌─────────────────────────────────────────────────────────────────┐
│ User: GET /cohorts/:id/modules                                  │
│ UserCohortService.getCohortModules                              │
│ - check CohortPlacement(cohort_id, user_id) exists              │
│ - return modules                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Cohort completion

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin: PUT /admin/cohorts/:id { status: completed }             │
└─────────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────────┐
│ AdminCohortService.completeCohort (atomic)                      │
│ - cohort.status = completed                                     │
│ - for each CohortPlacement in cohort:                           │
│   * AcademyEnrollment.status = completed                        │
│   * AcademyEnrollment.completed_at = now()                      │
│   * generate CohortCertificate (kalau belum ada)                │
└─────────────────────────────────────────────────────────────────┘
   │ user state: placement preserved, AcademyEnrollment.completed
   │ UI: arsip access (modules accessible read-only)
```

### 6.3 Transfer student

```
Admin: POST /admin/cohort-placements/:id/transfer { cohort_id }
   │
   ▼
AdminPlacementService.transferPlacement (atomic)
- validate new cohort: same academy + status not_started/in_progress
- prisma.$transaction:
  * delete CohortPlacement(currentId)
  * create CohortPlacement(academy_enrollment_id, newCohortId, ...)
   │
   ▼
User loses access to old cohort, gains access to new cohort
```

### 6.4 Cancel scenarios

```
Pre-placement cancel (admin refund):
  AcademyEnrollment.status = active, no placement
  → admin POST /admin/academy-enrollments/:id/cancel
  → AcademyEnrollment.status = cancelled

Post-placement cancel (admin refund mid-cohort):
  AcademyEnrollment.status = active, placement exists
  → admin POST /admin/academy-enrollments/:id/cancel
  → atomic: delete placement + AcademyEnrollment.status = cancelled

Drop placement only (re-assign later):
  → admin POST /admin/cohort-placements/:id/drop
  → delete placement
  → AcademyEnrollment.status remains active (eligible for re-assignment)
```

## 7. API Endpoints

### 7.1 New admin endpoints


| Method | Path                                    | Body                    | Description                                                                     |
| ------ | --------------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| GET    | `/admin/academy-enrollments`            | —                       | List enrollments dengan filter `?status=active&placed=false&academy_id&user_id` |
| GET    | `/admin/academy-enrollments/:id`        | —                       | Detail enrollment + transaction + placement                                     |
| POST   | `/admin/academy-enrollments/:id/assign` | `{ cohort_id, notes? }` | Create CohortPlacement                                                          |
| POST   | `/admin/academy-enrollments/:id/cancel` | `{ reason? }`           | Cancel enrollment + delete placement (kalau ada)                                |
| POST   | `/admin/cohort-placements/:id/transfer` | `{ cohort_id, notes? }` | Atomic transfer ke cohort lain                                                  |
| POST   | `/admin/cohort-placements/:id/drop`     | `{ reason? }`           | Drop placement (enrollment status tetap)                                        |


### 7.2 Modified user endpoints


| Method | Path                                     | Change                                          |
| ------ | ---------------------------------------- | ----------------------------------------------- |
| POST   | `/payments/academy/transactions`         | Tidak select cohort. Body unchanged.            |
| GET    | `/payments/academy/check?academy_id`     | Query AcademyEnrollment, bukan CohortEnrollment |
| GET    | `/payments/academy/:enrollmentId/status` | `enrollmentId` = `AcademyEnrollment.id`         |
| GET    | `/cohorts/my`                            | Response include nullable `placement` field     |
| GET    | `/cohorts/:id/modules`                   | Access via CohortPlacement existence            |
| GET    | `/cohorts/:id/modules/:moduleId`         | Access via CohortPlacement existence            |
| GET    | `/cohorts/:id/students`                  | Query CohortPlacement                           |
| GET    | `/cohorts/:id/certificate/download`      | Query Cert via placement_id                     |


### 7.3 Webhook (no API contract change)

Path tetap `POST /webhook/midtrans`. Layer 3 update target diganti dari `cohort_enrollments` → `academy_enrollments`.

## 8. Service Layer Mapping


| Service                 | File                                          | Change                              |
| ----------------------- | --------------------------------------------- | ----------------------------------- |
| `AcademyPaymentService` | `src/services/user/academyPaymentService.js`  | Major refactor (RS-26)              |
| `WebhookController`     | `src/controllers/shared/webhookController.js` | Layer 3 target (RS-27)              |
| `AdminPlacementService` | `src/services/admin/placementService.js`      | New (RS-28)                         |
| `UserCohortService`     | `src/services/user/cohortService.js`          | Module access via placement (RS-29) |
| `AdminCohortService`    | `src/services/admin/cohortService.js`         | Cohort completion cascade (RS-30)   |


## 9. Repository Layer


| Repository                    | File                                                      | Change                               |
| ----------------------------- | --------------------------------------------------------- | ------------------------------------ |
| `AcademyEnrollmentRepository` | `src/repositories/cohorts/academyEnrollmentRepository.js` | New (RS-25)                          |
| `CohortPlacementRepository`   | `src/repositories/cohorts/cohortPlacementRepository.js`   | New (RS-25)                          |
| `AcademyPaymentRepository`    | `src/repositories/user/academyPaymentRepository.js`       | Remove `findLatestCohortByAcademyId` |
| `UserCohortRepository`        | `src/repositories/user/cohortRepository.js`               | Replace CohortEnrollment queries     |
| `AdminCohortRepository`       | `src/repositories/admin/cohortRepository.js`              | Bulk update query for completion     |


## 10. Edge Cases & Decisions

### 10.1 Race condition: simultaneous double-payment

User klik "Beli" 2× cepat → 2 request `createTransaction` paralel.

**Mitigation:** wrap `findActiveByUserAcademy` + `createPendingEnrollment` di `prisma.$transaction` dengan `Serializable` isolation, atau pakai unique partial index `(user_id, academy_id) WHERE status IN ('pending', 'active')` (Postgres supports). Pilih yang lebih sederhana di service layer dulu, evaluasi nanti.

### 10.2 Race condition: simultaneous double-assign

Admin A & B klik assign student yang sama secara bersamaan.

**Mitigation:** `CohortPlacement.academy_enrollment_id @unique` + `@@unique([cohort_id, user_id])` — DB-level enforcement. Service catch `P2002` Prisma error → return 409.

### 10.3 Webhook arrives before AcademyEnrollment created

Tidak mungkin — webhook trigger by Midtrans hanya setelah `createTransaction` sukses commit semua 3 layer.

### 10.4 Webhook tries to update non-existent AcademyEnrollment

Edge: Layer 3 lookup return null. Solusi: kalau `RylsPayment` juga null, log warning + return 200 (tidak retry — Midtrans akan terus retry kalau 500). Untuk MVP, cukup gunakan `findFirst` dan skip update kalau null.

### 10.5 Cancel race vs webhook

Admin cancel saat webhook in-flight. Both update `AcademyEnrollment.status`. **Last writer wins** — acceptable trade-off, audit log di database melalui `updated_at`.

### 10.6 Cohort deletion saat ada placement

Saat ini `Cohort.placements` cascade onDelete. Kalau admin delete cohort, semua placement ikut hilang → user kehilangan akses. **Decision:** keep cascade. Block delete di service kalau ada placement (validasi service-level).

### 10.7 Multiple AcademyEnrollment di academy yang sama

User completed cohort A → buy lagi → AcademyEnrollment baru. User punya:

- `AcademyEnrollment(academy=X, status=completed)` + `CohortPlacement(cohort=A)` → arsip access
- `AcademyEnrollment(academy=X, status=active)` + `CohortPlacement(cohort=B)` → active access

Both placements valid. Module access query natural — cek per cohort.

### 10.8 Admin assign ke cohort yang sudah `in_progress`

**Allowed.** Late join scenario. Student start dari modul current.

### 10.9 Admin assign ke cohort `completed`

**Blocked** di service layer.

## 11. Migration Plan

### Database state

Database masih dari seeder, **belum production**. Jadi:

1. `prisma migrate reset` — drop semua data
2. Apply migration baru
3. `pnpm seed` — re-seed semua

### Migration file content (auto-generated by Prisma)

```sql
-- Drop old table
DROP TABLE IF EXISTS "cohort_enrollments";

-- Create new tables
CREATE TABLE "academy_enrollments" (...);
CREATE TABLE "cohort_placements" (...);

-- Update CohortCertificate
ALTER TABLE "cohort_certificates" DROP COLUMN "enrollment_id";
ALTER TABLE "cohort_certificates" ADD COLUMN "placement_id" INTEGER NOT NULL UNIQUE;
ALTER TABLE "cohort_certificates" ADD CONSTRAINT "..." FOREIGN KEY ("placement_id") REFERENCES "cohort_placements"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX ... ON "academy_enrollments";
CREATE UNIQUE INDEX ... ON "cohort_placements" ("academy_enrollment_id");
CREATE UNIQUE INDEX ... ON "cohort_placements" ("cohort_id", "user_id");
```

### Seed updates

`prisma/seeds/payments.*` — generate seeds dengan struktur baru:

- `AcademyEnrollment` (status mix: pending, active, completed)
- `CohortPlacement` untuk subset
- `CohortCertificate` untuk completed placements

## 12. Test Strategy (TDD)

### 12.1 Layer-by-layer

Setiap issue dimulai dengan **write tests → run (red) → implement → run (green) → refactor**.

### 12.2 Coverage targets

- Repository layer: > 80%
- Service layer: > 80%
- Webhook: integration tests cover all status transitions

### 12.3 Test pyramid

```
       ┌──────────┐
       │   E2E    │  RS-31 (8 scenarios)
       │   ~8     │
       ├──────────┤
       │ Integ    │  RS-27, RS-28, RS-30 (per-feature)
       │  ~30     │
       ├──────────┤
       │  Unit    │  RS-25, RS-26, RS-28, RS-29, RS-30
       │  ~80     │
       └──────────┘
```

### 12.4 Test infrastructure

- **Vitest** existing (`tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/repositories/`)
- Coverage threshold global 70% (di [vitest.config.js](../vitest.config.js))
- Per-test isolation: `tests/setup-env.js` + `tests/teardown.js` already wired
- Helper folders: `tests/helpers/`

## 13. Implementation Order (Linear Issues)

```
RS-24 [Schema Migration]
   │
   ▼
RS-25 [Repository Layer (TDD)]
   │
   ├──► RS-26 [Refactor Academy Payment Service (TDD)]
   ├──► RS-27 [Refactor Midtrans Webhook (TDD)]
   ├──► RS-28 [Admin Placement Service & Endpoints (TDD)]
   ├──► RS-29 [Refactor User Cohort Module Access (TDD)]
   │      │
   │      ▼
   └──► RS-30 [Cohort Completion Cascade (TDD)]
          │
          ▼
        RS-31 [End-to-End Integration Tests]
          │
          ▼
        RS-32 [Documentation Update]
```

**Parallelizable:** RS-26, RS-27, RS-28 dapat dikerjakan paralel setelah RS-25 selesai. RS-29 paralel juga, tapi RS-30 depend on RS-29.

## 14. Open Questions

1. **Audit log:** apakah perlu tabel terpisah `placement_audit_logs` untuk track admin actions (assign/transfer/cancel)? Untuk MVP cukup logger; tabel bisa ditambah nanti.
2. **Refund flow:** admin cancel → tidak ada auto-refund via Midtrans API. Untuk MVP, refund manual via Midtrans dashboard. Future: API integration.
3. **Notifikasi:** user tidak dapat notifikasi saat di-assign cohort. Future: email + in-app notification.
4. **Cohort capacity:** belum ada `max_students` di schema. Future iteration kalau dibutuhkan.

## 15. Appendix

### 15.1 Reference files (sebelum refactor)

- [src/services/user/academyPaymentService.js](../src/services/user/academyPaymentService.js)
- [src/repositories/user/academyPaymentRepository.js](../src/repositories/user/academyPaymentRepository.js)
- [src/controllers/shared/webhookController.js](../src/controllers/shared/webhookController.js)
- [src/services/user/cohortService.js](../src/services/user/cohortService.js)
- [prisma/schema.prisma](../prisma/schema.prisma) lines 633-794 (Cohort* models)

### 15.2 Related docs

- [Rise_LMS_Database_Schema_Cohort_v3.md](./Rise_LMS_Database_Schema_Cohort_v3.md) — to be updated in RS-32
- [Rise_LMS_Cohort_Implementation_Guide.md](./Rise_LMS_Cohort_Implementation_Guide.md) — to be updated in RS-32
- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) — base architecture

### 15.3 Linear

- Project: [https://linear.app/umarsani1602/project/cohort-placement-refactor-41a2343751a9](https://linear.app/umarsani1602/project/cohort-placement-refactor-41a2343751a9)
- Issues: RS-24 → RS-32

