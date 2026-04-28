# Rise LMS — Database Schema: Cohort Feature (v3)

**Version:** 3.0 (post-cohort-placement-refactor)
**Updated:** 2026-04-28
**Replaces:** CohortEnrollment-based schema (v2)

---

## Overview

The cohort feature separates **payment lifecycle** from **cohort placement lifecycle** into two distinct entities:

| Entity | Table | Purpose |
| --- | --- | --- |
| `AcademyEnrollment` | `academy_enrollments` | Parent — represents purchase of an academy |
| `CohortPlacement` | `cohort_placements` | Child — represents assignment to a specific cohort batch |

This 1:1 separation allows:
- Purchasing an academy before any cohort is available
- Admin-controlled placement (not silent auto-assignment)
- Multiple enrollments per user per academy (re-purchase after completion)
- Archive access to completed cohorts

---

## Entity: AcademyEnrollment

```sql
-- Table: academy_enrollments
id             SERIAL PRIMARY KEY
academy_id     INTEGER NOT NULL  REFERENCES academies(id) ON DELETE CASCADE
user_id        INTEGER NOT NULL  REFERENCES users(id) ON DELETE CASCADE
transaction_id INTEGER NOT NULL  UNIQUE  REFERENCES transactions(id)
status         VARCHAR(20) NOT NULL DEFAULT 'pending'
completed_at   TIMESTAMPTZ
notes          TEXT
created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at     TIMESTAMPTZ NOT NULL

INDEX (user_id, academy_id, status)
INDEX (status)
```

### Status Lifecycle

```
pending ──(webhook settlement)──> active ──(cohort completed)──> completed
   │                                │
   └──(admin cancel / expired)──────┴──(admin cancel)──> cancelled
```

| Status | Semantics |
| --- | --- |
| `pending` | Payment initiated, not yet settled |
| `active` | Payment settled — academy ownership confirmed. May or may not have a placement yet. |
| `completed` | The cohort the user attended was marked completed. Archive access retained. |
| `cancelled` | Admin cancelled or payment expired. No access. |

### Field Notes

- `transaction_id @unique` — enforces 1:1 with `Transaction`. One purchase = one enrollment.
- No `paid_at` — use `Transaction.paid_at` as single source of truth for payment time.
- `completed_at` — set by `completeCohort()` when the associated cohort finishes.
- Multiple `AcademyEnrollment` rows per `(user_id, academy_id)` are allowed — this enables re-purchase after completion or after cancellation.

---

## Entity: CohortPlacement

```sql
-- Table: cohort_placements
id                    SERIAL PRIMARY KEY
academy_enrollment_id INTEGER NOT NULL  UNIQUE  REFERENCES academy_enrollments(id) ON DELETE CASCADE
cohort_id             INTEGER NOT NULL  REFERENCES cohorts(id) ON DELETE CASCADE
user_id               INTEGER NOT NULL  REFERENCES users(id) ON DELETE CASCADE
academy_id            INTEGER NOT NULL  REFERENCES academies(id) ON DELETE CASCADE
notes                 TEXT
created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at            TIMESTAMPTZ NOT NULL

UNIQUE (cohort_id, user_id)
INDEX (cohort_id)
INDEX (academy_id)
```

### Design Constraints

| Constraint | Purpose |
| --- | --- |
| `academy_enrollment_id @unique` | One placement per enrollment (1:1) |
| `@@unique([cohort_id, user_id])` | A user can only appear once in a given cohort |

### Denormalized Fields

`user_id` and `academy_id` are denormalized onto `CohortPlacement` for performance. They are always consistent with the parent `AcademyEnrollment`.

### Existence = Access

**Row existence in `cohort_placements` is the sole gate for cohort access.**
No status field — if the row exists, the user has access. Transfer = delete old + create new.

---

## Entity: CohortCertificate

```sql
-- Table: cohort_certificates
id                SERIAL PRIMARY KEY
academy_id        INTEGER NOT NULL  REFERENCES academies(id)
cohort_id         INTEGER NOT NULL  REFERENCES cohorts(id) ON DELETE CASCADE
placement_id      INTEGER NOT NULL  UNIQUE  REFERENCES cohort_placements(id) ON DELETE CASCADE
user_id           INTEGER NOT NULL  REFERENCES users(id) ON DELETE CASCADE
certificate_code  VARCHAR(50) NOT NULL UNIQUE
student_name      VARCHAR(255) NOT NULL
academy_title     VARCHAR(255) NOT NULL
cohort_name       VARCHAR(255) NOT NULL
grades_transcript JSON
certificate_path  VARCHAR(500)
issued_at         TIMESTAMPTZ NOT NULL DEFAULT now()
created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at        TIMESTAMPTZ NOT NULL
```

### Key Change from v2

`enrollment_id` (FK to `cohort_enrollments`) replaced by `placement_id` (FK to `cohort_placements`).

---

## Relationships

```
User ──1:M── AcademyEnrollment ──1:1── CohortPlacement ──1:1── CohortCertificate
                │                              │
             Academy                        Cohort
```

```
Transaction ──1:1── AcademyEnrollment
```

---

## What Was Renamed / Removed (v2 → v3)

| v2 (old) | v3 (new) | Change |
| --- | --- | --- |
| `CohortEnrollment` | — | Removed entirely |
| `cohort_enrollments` table | — | Replaced by `academy_enrollments` + `cohort_placements` |
| `CohortEnrollment.status` | `AcademyEnrollment.status` | Payment lifecycle moved to parent |
| `CohortEnrollment.transaction_id` | `AcademyEnrollment.transaction_id` | Moved to parent |
| `CohortCertificate.enrollment_id` | `CohortCertificate.placement_id` | FK updated to placement |

The table `cohort_enrollments` still exists in the DB as a legacy artifact but is **no longer used by any service**. It can be dropped once all references are verified.

---

## Migration Reference

- `20260427212017_refactor_cohort_placement` — adds `academy_enrollments`, `cohort_placements`, updates `cohort_certificates.placement_id`, migrates data.
