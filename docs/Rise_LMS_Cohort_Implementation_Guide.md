# Rise LMS — Cohort Implementation Guide (v3)

**Version:** 3.0 (admin-driven placement)
**Updated:** 2026-04-28
**Schema reference:** [Rise_LMS_Database_Schema_Cohort_v3.md](./Rise_LMS_Database_Schema_Cohort_v3.md)

---

## 1. Overview

The cohort system uses **admin-driven placement**: users purchase an academy, but admin manually assigns them to a specific cohort batch. This replaces the previous silent auto-assignment.

### Flow Diagram

```
User buys academy
      │
      ▼
AcademyEnrollment (status=pending)
      │
[Midtrans webhook settlement]
      │
      ▼
AcademyEnrollment (status=active)
      │
      │   ← Admin sees "Pending Placement" queue
      │
[Admin POST /admin/academy-enrollments/:id/assign { cohort_id }]
      │
      ▼
CohortPlacement created
      │
User can access cohort modules
      │
[Admin marks cohort completed]
      │
      ▼
CohortPlacement retained (archive access)
AcademyEnrollment (status=completed)
CohortCertificate generated
```

---

## 2. Access Control

### Module Access Gate

Access to cohort modules is controlled by `CohortPlacement` existence:

```js
// userCohortService — getCohortModules
const placement = await cohortPlacementRepository.findByUserCohort(userId, cohortId);
if (!placement) throw new Error('You are not enrolled in this cohort');
```

**Row existence = access.** No status check on the placement itself.

### Access States

| `AcademyEnrollment.status` | `CohortPlacement` exists | User experience |
| --- | --- | --- |
| `pending` | No | "Waiting for payment" |
| `active` | No | "Class not started yet" (waiting for admin) |
| `active` | Yes | Full module access |
| `completed` | Yes (retained) | Archive read access |
| `cancelled` | No (deleted on cancel) | No access |

---

## 3. API Endpoints

### User Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/cohorts` | Public | List all cohorts |
| `GET` | `/cohorts/:id` | Public | Cohort details |
| `GET` | `/cohorts/my` | User | My enrollments (enrollment-centric list) |
| `GET` | `/cohorts/:id/modules` | User + placement | List modules (403 if no placement) |
| `GET` | `/cohorts/:id/modules/:moduleId` | User + placement | Module detail |
| `GET` | `/cohorts/:id/students` | User + placement | Fellow students list |
| `GET` | `/cohorts/:id/certificate/download` | User + placement | Download PDF cert |
| `GET` | `/certificates/:code/verify` | Public | Verify cert by code |

### Payment Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/payments/academy/transactions` | User | Create purchase transaction |
| `GET` | `/payments/academy/check?academy_id=:id` | User | Check enrollment status |
| `GET` | `/payments/academy/:enrollmentId/status` | User | Payment status |
| `POST` | `/api/webhooks/midtrans` | System | Midtrans settlement callback |

### Admin Placement Management Endpoints

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/admin/academy-enrollments` | `admin.cohort VIEWER` | List all enrollments (filterable) |
| `GET` | `/admin/academy-enrollments/:id` | `admin.cohort VIEWER` | Enrollment detail |
| `POST` | `/admin/academy-enrollments/:id/assign` | `admin.cohort EDITOR` | Assign to cohort (re-assign for transfer) |
| `POST` | `/admin/cohort-placements/:id/drop` | `admin.cohort EDITOR` | Drop from cohort (enrollment stays active) |

### Admin Cohort Endpoints

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/admin/cohorts` | `admin.cohort VIEWER` | List cohorts |
| `POST` | `/admin/cohorts` | `admin.cohort EDITOR` | Create cohort |
| `PUT` | `/admin/cohorts/:id` | `admin.cohort EDITOR` | Update cohort name/description/dates (status not editable) |
| `POST` | `/admin/cohorts/:id/complete` | `admin.cohort EDITOR` | Complete cohort + issue certificates (irreversible) |
| `DELETE` | `/admin/cohorts/:id` | `admin.cohort EDITOR` | Delete cohort |
| `POST` | `/admin/cohorts/:id/placements/:placementId/certificate` | `admin.cohort EDITOR` | Generate certificate |

---

## 4. Key Business Rules

### Purchase

- A user can purchase the same academy multiple times **only if** the previous enrollment has `status = 'completed'` or `status = 'cancelled'`.
- If existing enrollment is `active`, purchase is blocked → `409 You are already enrolled in this academy`.
- If existing enrollment is `pending`, the existing snap token is returned (if not expired).

### Assignment

- Only `active` enrollments can be assigned → `422` if status is not `active`.
- Cohort must belong to the same academy as the enrollment → `422` if mismatch.
- Cohort must have `status in ['not_started', 'ongoing']` → `422` if `completed`.
- One placement per enrollment → `409 Enrollment already has a placement`.
- One placement per `(cohort_id, user_id)` → `409 User already placed in this cohort`.

### Transfer

- Creates a new `CohortPlacement` and deletes the old one in a single DB transaction.
- Target cohort must be from the same academy and not `completed`.
- User cannot be transferred to a cohort they are already in.

### Cancel

- Cancelling an enrollment with a placement: placement is deleted first, then enrollment status → `cancelled`.
- After cancel, user can re-purchase the same academy.

### Completion Cascade

When admin completes cohort via `POST /admin/cohorts/:id/complete`:

1. `Cohort.status` → `completed`
2. All `CohortPlacement` rows for that cohort are retained (not deleted)
3. For each placement: `AcademyEnrollment.status` → `completed`, `completed_at` = now()
4. `CohortCertificate` generated per placement (PDF + unique code)
5. Email sent to each student

### Archive Access

After cohort completion, `CohortPlacement` rows are **kept**. This allows users to continue accessing cohort modules in read-only / archive mode. The access gate (`placement exists`) still passes.

---

## 5. Service Layer

### Key Services

| Service | File | Responsibility |
| --- | --- | --- |
| `AcademyPaymentService` | `services/user/academyPaymentService.js` | Purchase flow, payment status, check enrollment |
| `AdminPlacementService` | `services/admin/placementService.js` | List enrollments, assign, cancel, transfer, drop |
| `AdminCohortService` | `services/admin/cohortService.js` | Cohort CRUD, completion cascade, certificate generation |
| `UserCohortService` | `services/user/cohortService.js` | Module access, student list, cert download |

### Key Repositories

| Repository | File | Responsibility |
| --- | --- | --- |
| `AcademyEnrollmentRepository` | `repositories/cohorts/academyEnrollmentRepository.js` | CRUD for `AcademyEnrollment` |
| `CohortPlacementRepository` | `repositories/cohorts/cohortPlacementRepository.js` | CRUD for `CohortPlacement` |
| `AdminCohortRepository` | `repositories/admin/adminCohortRepository.js` | Admin-side cohort queries |

---

## 6. 3-Layer Payment Architecture

The academy purchase follows the same 3-layer payment pattern as RYLS:

| Layer | Model | Purpose |
| --- | --- | --- |
| 1 | `Transaction` | Generic payment record (provider-agnostic) |
| 2 | `MidtransTransaction` | Midtrans-specific data (snap token, order ID) |
| 3 | `AcademyEnrollment` | Business entity created post-payment |

**Note:** `Transaction.product_type_id` is set to `0` as a placeholder at creation time, then updated to the actual `AcademyEnrollment.id` after the enrollment record is created (circular dependency). This is intentional — see `academyPaymentService.createTransaction`.

---

## 7. Testing

### Unit Tests

```
tests/unit/services/admin/cohortService.test.js       — certificate generation
tests/unit/services/admin/cohortCompletion.test.js    — completion cascade
tests/unit/services/admin/cohortService.emailHook.test.js — email hook
```

### E2E Tests

```
tests/e2e/cohort-placement.test.js — 8 full lifecycle scenarios
```

Run e2e: `pnpm test:e2e` or `npx vitest run tests/e2e/cohort-placement.test.js`

All tests mock Midtrans API calls (`createSnapTransaction`, `cancelTransaction`). `verifyWebhookSignature` uses the real crypto implementation.

### Fixtures

`tests/helpers/cohortFixtures.js` provides:
- `createUser(overrides)` — create test user
- `createAcademyWithPricing()` — academy + pricing tier
- `createCohort(academyId, overrides)` — cohort
- `createActiveEnrollment(userId, academyId)` — full 3-layer payment + active enrollment
- `createCompletedEnrollment(userId, academyId)` — completed enrollment
- `createPlacement(enrollmentId, cohortId, userId, academyId)` — direct placement (bypasses HTTP)
- `buildSettlementWebhook(orderId, amount)` — Midtrans webhook payload with valid signature
