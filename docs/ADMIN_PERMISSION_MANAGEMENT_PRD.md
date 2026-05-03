# Admin Permission Management — PRD

**Status**: In Development  
**Date**: 2026-04-22  
**Project**: [Linear — Admin Permission Management](https://linear.app/umarsani1602/project/admin-permission-management-fbd630e31e9b)

---

## 1. Problem Statement

Saat ini semua user dengan role `ADMIN` memiliki akses penuh ke seluruh endpoint `/admin/*`. Tidak ada cara untuk membatasi admin tertentu agar hanya bisa mengakses section tertentu (misalnya hanya academy management, tanpa akses ke system settings atau transactions).

Dibutuhkan sistem permission yang granular agar:
- Satu admin hanya bisa mengakses section yang diizinkan
- Superadmin bisa mengatur hak akses setiap admin
- Perubahan hak akses berlaku langsung (tanpa perlu admin login ulang)

---

## 2. Goals

- Tambahkan role `SUPERADMIN` sebagai role tertinggi dengan full akses (bypass semua permission check)
- Admin dapat di-assign permission per-resource dengan level `VIEWER` atau `EDITOR`
- Enforcement otomatis di semua route `/admin/*` via middleware, langsung berlaku tanpa grace period
- SUPERADMIN dapat mengelola permission admin lain melalui API
- Session response menyertakan daftar permission aktif user

## 3. Non-Goals

- Tidak ada row-level permission (misalnya "hanya bisa edit academy miliknya")
- Tidak ada custom admin roles / role groups
- Tidak ada audit log perubahan permission (bisa ditambah di iterasi berikutnya)

---

## 4. Roles

| Role | Deskripsi |
|---|---|
| `USER` | User biasa, tidak punya akses admin |
| `ADMIN` | Admin dengan permission terbatas, dikonfigurasi per-resource |
| `SUPERADMIN` | Full akses ke semua endpoint admin, bypass permission check |

---

## 5. Permission Resources

| Resource | Key | Available Levels | Catatan |
|---|---|---|---|
| Dashboard | `admin.dashboard` | `VIEWER` | Konten adaptif sesuai permission lain |
| Academy | `admin.academy` | `VIEWER`, `EDITOR` | |
| Cohort | `admin.cohort` | `VIEWER`, `EDITOR` | |
| Transactions | `admin.transactions` | `VIEWER`, `EDITOR` | EDITOR = bisa update status |
| RYLS | `admin.ryls` | `VIEWER`, `EDITOR` | |
| Jobs | `admin.jobs` | `VIEWER`, `EDITOR` | |
| Statistics | `admin.statistics` | `VIEWER` | Read-only by nature |
| Settings | `admin.settings` | `VIEWER`, `EDITOR` | EDITOR = bisa ubah system settings |

### Access Levels

| Level | HTTP Methods yang Diizinkan |
|---|---|
| `VIEWER` | `GET`, `HEAD` |
| `EDITOR` | `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE` |

---

## 6. Database Schema

### Tambahan pada UserRole enum

```prisma
enum UserRole {
  USER
  ADMIN
  SUPERADMIN  // NEW
}
```

### Model Baru: AdminPermission (Registry)

```prisma
model AdminPermission {
  key              String   @id  // e.g. "admin.academy"
  name             String        // e.g. "Academy Management"
  description      String?
  available_levels String[]      // ["VIEWER"] atau ["VIEWER", "EDITOR"]
  created_at       DateTime @default(now())

  user_permissions UserAdminPermission[]
}
```

### Model Baru: UserAdminPermission (Assignment)

```prisma
model UserAdminPermission {
  id             Int              @id @default(autoincrement())
  user_id        Int
  permission_key String
  access_level   AdminAccessLevel
  created_at     DateTime         @default(now())
  updated_at     DateTime         @updatedAt

  user           User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
  permission     AdminPermission  @relation(fields: [permission_key], references: [key], onDelete: Cascade)

  @@unique([user_id, permission_key])
  @@index([user_id])
}
```

### Enum Baru: AdminAccessLevel

```prisma
enum AdminAccessLevel {
  VIEWER
  EDITOR
}
```

### Seed Data (AdminPermission registry)

```javascript
const permissions = [
  { key: 'admin.dashboard',    name: 'Dashboard',     available_levels: ['VIEWER'] },
  { key: 'admin.academy',      name: 'Academy',        available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.cohort',       name: 'Cohort',         available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.transactions', name: 'Transactions',   available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.ryls',         name: 'RYLS',           available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.jobs',         name: 'Jobs',           available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.statistics',   name: 'Statistics',     available_levels: ['VIEWER'] },
  { key: 'admin.settings',     name: 'System Settings',available_levels: ['VIEWER', 'EDITOR'] },
];
```

---

## 7. Middleware

### requirePermission(key, requiredLevel?)

```javascript
// src/middleware/permissionMiddleware.js
export function requirePermission(key, requiredLevel = 'VIEWER') {
  return async function (request, reply) {
    const user = request.user;

    // SUPERADMIN bypass
    if (user.role === 'SUPERADMIN') return;

    // ADMIN: cek dari DB
    const permission = await prisma.userAdminPermission.findUnique({
      where: { user_id_permission_key: { user_id: user.id, permission_key: key } }
    });

    if (!permission) {
      return reply.status(403).send(errorResponse('Forbidden: no permission for this resource', 403));
    }

    if (requiredLevel === 'EDITOR' && permission.access_level === 'VIEWER') {
      return reply.status(403).send(errorResponse('Forbidden: read-only access', 403));
    }
  };
}
```

### Update adminMiddleware

```javascript
// Ganti cek role !== 'ADMIN' menjadi:
if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
  return reply.status(403).send(errorResponse('Forbidden', 403));
}
```

---

## 8. API Endpoints Baru

Semua endpoint berikut hanya bisa diakses oleh `SUPERADMIN`.

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/admin/permissions` | List semua permission resources dari registry |
| `GET` | `/admin/users/:id/permissions` | Lihat permission yang dimiliki admin tertentu |
| `PUT` | `/admin/users/:id/permissions` | Set/update permission untuk admin tertentu |
| `DELETE` | `/admin/users/:id/permissions/:key` | Hapus satu permission dari admin |

### PUT /admin/users/:id/permissions — Request Body

```json
{
  "permissions": [
    { "key": "admin.academy",      "access_level": "EDITOR" },
    { "key": "admin.transactions", "access_level": "VIEWER" },
    { "key": "admin.dashboard",    "access_level": "VIEWER" }
  ]
}
```

Semantik: **replace all** — semua permission lama dihapus, diganti dengan yang dikirim.

---

## 9. Session Response Update

`GET /auth/session` dan response login akan menyertakan field `permissions` untuk user dengan role `ADMIN`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "admin@example.com",
      "role": "ADMIN",
      "permissions": [
        { "key": "admin.academy",      "access_level": "EDITOR" },
        { "key": "admin.transactions", "access_level": "VIEWER" }
      ]
    }
  }
}
```

Untuk `SUPERADMIN`, field `permissions` tidak disertakan (semua akses granted implisit).

---

## 10. Route Permission Mapping

| Route Group | Permission Key | VIEWER Methods | EDITOR Methods |
|---|---|---|---|
| `/admin/dashboard` | `admin.dashboard` | GET | — |
| `/admin/academies` | `admin.academy` | GET | POST, PUT, DELETE |
| `/admin/cohorts` | `admin.cohort` | GET | POST, PUT, DELETE |
| `/admin/transactions` | `admin.transactions` | GET | PUT |
| `/admin/ryls/registrations` | `admin.ryls` | GET | PUT, DELETE |
| `/admin/jobs` | `admin.jobs` | GET | POST, PUT, DELETE |
| `/admin/system/settings` | `admin.settings` | GET | POST, PUT, DELETE |
| `/admin/users` | `admin.users`* | GET | PUT, DELETE |

*`admin.users` ditambah ke registry karena route ini sensitif.

---

## 11. File Structure

### Files to Create

```
src/
├── middleware/
│   └── permissionMiddleware.js       # requirePermission() factory
├── repositories/admin/
│   └── permissionRepository.js       # AdminPermissionRepository
├── services/admin/
│   └── permissionService.js          # AdminPermissionService
├── controllers/admin/
│   └── permissionController.js       # AdminPermissionController
├── routes/admin/
│   └── permissionRoutes.js           # /admin/permissions & /admin/users/:id/permissions
└── schemas/admin/
    └── permissionSchemas.js          # Fastify validation schemas
```

### Files to Modify

```
prisma/schema.prisma                  # Tambah enum + models baru
prisma/seeds/permissionSeed.js        # Seed registry data
src/middleware/auth.js                # Update adminMiddleware untuk SUPERADMIN
src/config/routes.js                  # Register permissionRoutes
src/routes/admin/*/                   # Semua admin routes — tambah requirePermission
src/controllers/auth/authController.js # Include permissions di session response
```

---

## 12. Testing Plan

- Unit test `requirePermission` middleware: SUPERADMIN bypass, VIEWER → EDITOR rejection, no permission → 403
- E2E test: SUPERADMIN assign permission → ADMIN request berhasil/gagal sesuai level
- E2E test: SUPERADMIN cabut permission → ADMIN langsung 403 di request berikutnya
