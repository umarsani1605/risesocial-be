# Rise Social Backend - Architecture Documentation

## 1. Overview

Rise Social Backend adalah REST API yang dibangun menggunakan Node.js dengan Fastify framework, PostgreSQL database, dan Prisma ORM. Backend ini menyediakan layanan untuk platform pembelajaran online dan manajemen pekerjaan.

### 1.1 Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Fastify 5.x
- **Database**: PostgreSQL
- **ORM**: Prisma 6.x
- **Authentication**: JWT (@fastify/jwt)
- **File Upload**: @fastify/multipart
- **API Documentation**: Swagger/OpenAPI (@fastify/swagger)
- **Testing**: Vitest
- **Payment Gateway**: Midtrans
- **Logging**: Pino (built-in Fastify logger)

### 1.2 Key Features

- ✅ User authentication & authorization (JWT)
- ✅ Academy management (courses/bootcamps)
- ✅ Job board with LinkedIn integration
- ✅ RYLS (Rise Young Leaders Summit) registration
- ✅ Payment processing (Midtrans integration)
- ✅ File upload management
- ✅ Admin dashboard
- ✅ Webhook handling
- ✅ Multi-currency support
- ✅ Comprehensive testing (225+ tests)

---

## 2. Architecture Pattern

### 2.1 Layered Architecture

```
┌─────────────────────────────────────────┐
│         HTTP Layer (Fastify)            │  ← Routes, Middleware
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Controllers                     │  ← Request/Response handling
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Services                        │  ← Business Logic
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Repositories                    │  ← Data Access Layer
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      Prisma ORM + PostgreSQL            │  ← Database
└─────────────────────────────────────────┘
```

### 2.2 Directory Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── constants/        # Constants & helpers
│   ├── controllers/      # Request handlers
│   │   ├── admin/       # Admin controllers
│   │   ├── user/        # User controllers
│   │   ├── auth/        # Auth controllers
│   │   ├── payments/    # Payment controllers
│   │   └── shared/      # Shared controllers
│   ├── integrations/     # External service integrations
│   ├── middleware/       # Fastify middleware
│   ├── repositories/     # Data access layer
│   │   ├── admin/       # Admin repositories
│   │   ├── user/        # User repositories
│   │   ├── shared/      # Shared repositories
│   │   └── base/        # Base repository class
│   ├── routes/          # Route definitions
│   │   ├── admin/       # Admin routes
│   │   ├── user/        # User routes
│   │   ├── payments/    # Payment routes
│   │   └── shared/      # Shared routes (webhooks)
│   ├── schemas/         # Validation schemas
│   │   ├── admin/       # Admin schemas
│   │   ├── user/        # User schemas
│   │   └── shared/      # Shared schemas
│   ├── services/        # Business logic
│   │   ├── admin/       # Admin services
│   │   ├── user/        # User services
│   │   └── shared/      # Shared services
│   ├── utils/           # Utility functions
│   └── server.js        # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seeds/           # Database seeders
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   ├── e2e/             # End-to-end tests
│   └── helpers/         # Test utilities
└── docs/                # Documentation
```

---

## 3. Core Components

### 3.1 Server Configuration (server.js)

Entry point aplikasi yang mengatur:

- Fastify instance dengan logger
- Plugin registration
- Route registration
- Error handlers
- Graceful shutdown

### 3.2 Configuration Files

#### config/database.js

- Prisma client initialization
- Database connection management
- Graceful disconnect

#### config/logger.js

- Pino logger configuration
- Environment-based log levels
- Pretty printing for development

#### config/plugins.js

- CORS configuration
- JWT authentication
- Swagger/OpenAPI documentation
- Static file serving
- Multipart file upload

#### config/routes.js

- Central route registration
- Route prefixes
- Health check endpoint

#### config/swagger.js

- API documentation configuration
- Swagger UI setup
- Tag definitions

---

## 4. API Routes Structure

### 4.1 Authentication Routes (`/auth`)

**File**: `src/routes/authRoutes.js`

| Method | Endpoint         | Description         | Auth Required |
| ------ | ---------------- | ------------------- | ------------- |
| POST   | `/auth/register` | User registration   | No            |
| POST   | `/auth/login`    | User login          | No            |
| GET    | `/auth/session`  | Get current session | Yes           |
| POST   | `/auth/refresh`  | Refresh JWT token   | Yes           |
| POST   | `/auth/logout`   | User logout         | Yes           |

### 4.2 User Routes

#### User Management (`/users`)

**File**: `src/routes/user/userRoutes.js`

| Method | Endpoint          | Description         | Auth Required |
| ------ | ----------------- | ------------------- | ------------- |
| GET    | `/users/profile`  | Get user profile    | Yes           |
| PUT    | `/users/profile`  | Update user profile | Yes           |
| PUT    | `/users/password` | Change password     | Yes           |
| DELETE | `/users/account`  | Delete account      | Yes           |

#### Academy Routes (`/academies`)

**File**: `src/routes/user/academyRoutes.js`

| Method | Endpoint                  | Description         | Auth Required |
| ------ | ------------------------- | ------------------- | ------------- |
| GET    | `/academies`              | List all academies  | No            |
| GET    | `/academies/:slug`        | Get academy by slug | No            |
| GET    | `/academies/categories`   | Get categories      | No            |
| GET    | `/academies/pricing`      | Get pricing tiers   | No            |
| GET    | `/academies/features`     | Get features        | No            |
| GET    | `/academies/instructors`  | Get instructors     | No            |
| GET    | `/academies/themes`       | Get themes          | No            |
| GET    | `/academies/topics`       | Get topics          | No            |
| GET    | `/academies/testimonials` | Get testimonials    | No            |
| GET    | `/academies/faqs`         | Get FAQs            | No            |

#### Jobs Routes (`/jobs`)

**File**: `src/routes/user/jobsRoutes.js`

| Method | Endpoint             | Description           | Auth Required |
| ------ | -------------------- | --------------------- | ------------- |
| GET    | `/jobs`              | List all jobs         | No            |
| GET    | `/jobs/:id`          | Get job by ID         | No            |
| POST   | `/jobs/:id/apply`    | Apply for job         | Yes           |
| GET    | `/jobs/applications` | Get user applications | Yes           |
| POST   | `/jobs/:id/save`     | Save job              | Yes           |
| DELETE | `/jobs/:id/unsave`   | Unsave job            | Yes           |
| GET    | `/jobs/saved`        | Get saved jobs        | Yes           |

#### RYLS Registration (`/ryls/registrations`)

**File**: `src/routes/user/rylsRegistrationRoutes.js`

| Method | Endpoint                  | Description         | Auth Required |
| ------ | ------------------------- | ------------------- | ------------- |
| POST   | `/ryls/registrations`     | Create registration | No            |
| GET    | `/ryls/registrations/:id` | Get registration    | No            |
| PUT    | `/ryls/registrations/:id` | Update registration | No            |

#### File Upload (`/uploads`)

**File**: `src/routes/user/fileUploadRoutes.js`

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/uploads`           | Upload file       | Yes           |
| GET    | `/uploads/:filename` | Get uploaded file | No            |

### 4.3 Admin Routes

#### Admin Dashboard (`/admin`)

**File**: `src/routes/adminRoutes.js`

| Method | Endpoint           | Description         | Auth Required |
| ------ | ------------------ | ------------------- | ------------- |
| GET    | `/admin/dashboard` | Get dashboard stats | Admin         |

#### Admin Users (`/admin/users`)

**File**: `src/routes/admin/userRoutes.js`

| Method | Endpoint                           | Description              | Auth Required            |
| ------ | ---------------------------------- | ------------------------ | ------------------------ |
| GET    | `/admin/users`                     | List all users           | Admin + admin.users VIEWER |
| GET    | `/admin/users/:id`                 | Get user by ID           | Admin + admin.users VIEWER |
| POST   | `/admin/users`                     | Create user              | Admin + admin.users EDITOR |
| PUT    | `/admin/users/:id`                 | Update user              | Admin + admin.users EDITOR |
| DELETE | `/admin/users/:id`                 | Delete user              | Admin + admin.users EDITOR |
| GET    | `/admin/users/:id/permissions`     | Get user permissions     | SUPERADMIN only          |
| PUT    | `/admin/users/:id/permissions`     | Set user permissions     | SUPERADMIN only          |
| DELETE | `/admin/users/:id/permissions/:key`| Remove user permission   | SUPERADMIN only          |

#### Admin Permissions (`/admin/permissions`)

**File**: `src/routes/admin/permissionRoutes.js`

| Method | Endpoint             | Description              | Auth Required   |
| ------ | -------------------- | ------------------------ | --------------- |
| GET    | `/admin/permissions` | List permission registry | SUPERADMIN only |

#### Admin Academies (`/admin/academies`)

**File**: `src/routes/admin/academyRoutes.js`

| Method | Endpoint                                           | Description        | Auth Required |
| ------ | -------------------------------------------------- | ------------------ | ------------- |
| GET    | `/admin/academies`                                 | List academies     | Admin         |
| GET    | `/admin/academies/:slug`                           | Get academy        | Admin         |
| POST   | `/admin/academies`                                 | Create academy     | Admin         |
| PUT    | `/admin/academies/:id`                             | Update academy     | Admin         |
| DELETE | `/admin/academies/:id`                             | Delete academy     | Admin         |
| POST   | `/admin/academies/:id/pricing`                     | Add pricing        | Admin         |
| PUT    | `/admin/academies/:id/pricing/:pricingId`          | Update pricing     | Admin         |
| DELETE | `/admin/academies/:id/pricing/:pricingId`          | Delete pricing     | Admin         |
| POST   | `/admin/academies/:id/features`                    | Add feature        | Admin         |
| PUT    | `/admin/academies/:id/features/:featureId`         | Update feature     | Admin         |
| DELETE | `/admin/academies/:id/features/:featureId`         | Delete feature     | Admin         |
| POST   | `/admin/academies/:id/instructors`                 | Add instructor     | Admin         |
| PUT    | `/admin/academies/:id/instructors/:instructorId`   | Update instructor  | Admin         |
| DELETE | `/admin/academies/:id/instructors/:instructorId`   | Delete instructor  | Admin         |
| POST   | `/admin/academies/:id/topics`                      | Add topic          | Admin         |
| PUT    | `/admin/academies/:id/topics/:topicId`             | Update topic       | Admin         |
| DELETE | `/admin/academies/:id/topics/:topicId`             | Delete topic       | Admin         |
| POST   | `/admin/academies/:id/testimonials`                | Add testimonial    | Admin         |
| PUT    | `/admin/academies/:id/testimonials/:testimonialId` | Update testimonial | Admin         |
| DELETE | `/admin/academies/:id/testimonials/:testimonialId` | Delete testimonial | Admin         |
| POST   | `/admin/academies/:id/faqs`                        | Add FAQ            | Admin         |
| PUT    | `/admin/academies/:id/faqs/:faqId`                 | Update FAQ         | Admin         |
| DELETE | `/admin/academies/:id/faqs/:faqId`                 | Delete FAQ         | Admin         |

#### Admin Jobs (`/admin/jobs`)

**File**: `src/routes/admin/jobsRoutes.js`

| Method | Endpoint                   | Description          | Auth Required |
| ------ | -------------------------- | -------------------- | ------------- |
| GET    | `/admin/jobs`              | List all jobs        | Admin         |
| GET    | `/admin/jobs/:id`          | Get job by ID        | Admin         |
| POST   | `/admin/jobs`              | Create job           | Admin         |
| PUT    | `/admin/jobs/:id`          | Update job           | Admin         |
| DELETE | `/admin/jobs/:id`          | Delete job           | Admin         |
| GET    | `/admin/jobs/applications` | Get all applications | Admin         |

#### Admin RYLS (`/admin/ryls/registrations`)

**File**: `src/routes/admin/rylsRegistrationRoutes.js`

| Method | Endpoint                           | Description         | Auth Required |
| ------ | ---------------------------------- | ------------------- | ------------- |
| GET    | `/admin/ryls/registrations`        | List registrations  | Admin         |
| GET    | `/admin/ryls/registrations/:id`    | Get registration    | Admin         |
| PUT    | `/admin/ryls/registrations/:id`    | Update registration | Admin         |
| DELETE | `/admin/ryls/registrations/:id`    | Delete registration | Admin         |
| GET    | `/admin/ryls/registrations/export` | Export to Excel     | Admin         |

#### Admin System Settings (`/admin/system/settings`)

**File**: `src/routes/admin/systemSettingsRoutes.js`

| Method | Endpoint                      | Description        | Auth Required |
| ------ | ----------------------------- | ------------------ | ------------- |
| GET    | `/admin/system/settings`      | Get all settings   | Admin         |
| GET    | `/admin/system/settings/:key` | Get setting by key | Admin         |
| PUT    | `/admin/system/settings/:key` | Update setting     | Admin         |
| POST   | `/admin/system/settings`      | Create setting     | Admin         |
| DELETE | `/admin/system/settings/:key` | Delete setting     | Admin         |

### 4.4 Payment Routes (`/payments`)

**File**: `src/routes/payments/rylsPaymentRoutes.js`

| Method | Endpoint                     | Description        | Auth Required |
| ------ | ---------------------------- | ------------------ | ------------- |
| POST   | `/payments/create`           | Create payment     | No            |
| GET    | `/payments/:transactionCode` | Get payment status | No            |
| POST   | `/payments/verify`           | Verify payment     | No            |

### 4.5 Webhook Routes (`/api/webhooks`)

**File**: `src/routes/shared/webhookRoutes.js`

| Method | Endpoint                 | Description           | Auth Required  |
| ------ | ------------------------ | --------------------- | -------------- |
| POST   | `/api/webhooks/midtrans` | Midtrans notification | No (Signature) |

---

## 5. Controllers Layer

Controllers bertanggung jawab untuk:

- Menerima HTTP request
- Validasi input (via Fastify schemas)
- Memanggil service layer
- Format response
- Error handling

### 5.1 Controller Structure

```javascript
class ExampleController {
  async getAll(request, reply) {
    try {
      request.log.info('[ExampleController] getAll start');

      const { page, limit, search } = request.query;
      const result = await exampleService.getAll({ page, limit, search });

      request.log.info('[ExampleController] getAll success');
      return reply.send(successResponse(result, 'Data retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[ExampleController] getAll error');
      return reply.status(500).send(errorResponse('Failed to retrieve data', 500, error.message));
    }
  }
}
```

### 5.2 Controller Organization

**Admin Controllers** (`src/controllers/admin/`)

- `academyController.js` - Academy CRUD operations
- `userController.js` - User management
- `jobsController.js` - Job management
- `rylsRegistrationController.js` - RYLS registration management
- `systemSettingsController.js` - System configuration

**User Controllers** (`src/controllers/user/`)

- `userController.js` - User profile management
- `academyController.js` - Academy browsing
- `jobsController.js` - Job browsing & applications
- `rylsRegistrationController.js` - RYLS registration
- `fileUploadController.js` - File upload handling

**Auth Controllers** (`src/controllers/auth/`)

- `authController.js` - Authentication & authorization

**Payment Controllers** (`src/controllers/payments/`)

- `rylsPaymentController.js` - Payment processing

**Shared Controllers** (`src/controllers/shared/`)

- `webhookController.js` - Webhook handling

---

## 6. Services Layer

Services mengandung business logic dan orchestration:

- Validasi business rules
- Koordinasi multiple repositories
- Transaction management
- External API calls
- Data transformation

### 6.1 Service Structure

```javascript
class ExampleService {
  constructor() {
    this.logger = getLogger();
    this.repository = exampleRepository;
  }

  async create(data) {
    this.logger.info('[ExampleService] create start');

    try {
      // Business validation
      await this.validateData(data);

      // Call repository
      const result = await this.repository.create(data);

      // Additional processing
      const enrichedResult = await this.enrichData(result);

      this.logger.info('[ExampleService] create success');
      return enrichedResult;
    } catch (error) {
      this.logger.error({ err: error }, '[ExampleService] create error');
      throw error;
    }
  }

  async validateData(data) {
    // Business validation logic
    if (!data.required_field) {
      throw new Error('Required field is missing');
    }
  }
}
```

### 6.2 Service Organization

**Admin Services** (`src/services/admin/`)

- `academyService.js` - Academy business logic
- `userService.js` - User management logic
- `jobsService.js` - Job management logic
- `rylsRegistrationService.js` - RYLS registration logic

**User Services** (`src/services/user/`)

- `userService.js` - User profile logic
- `academyService.js` - Academy browsing logic
- `jobsService.js` - Job application logic
- `rylsRegistrationService.js` - RYLS registration logic
- `rylsPaymentService.js` - Payment processing logic
- `fileUploadService.js` - File upload logic

**Shared Services** (`src/services/shared/`)

- `academyService.js` - Shared academy logic
- `webhookService.js` - Webhook processing

---

## 7. Repositories Layer

Repositories bertanggung jawab untuk:

- Database queries (via Prisma)
- Data access patterns
- Query optimization
- Transaction handling
- Order management

### 7.1 Repository Structure

```javascript
class ExampleRepository {
  constructor() {
    this.logger = getLogger();
    this.model = prisma.example;
  }

  async findById(id) {
    this.logger.info({ id }, '[ExampleRepository] findById called');

    const result = await this.model.findUnique({
      where: { id },
      include: {
        relatedData: true,
      },
    });

    this.logger.info({ id, found: !!result }, '[ExampleRepository] findById result');
    return result;
  }

  async create(data) {
    this.logger.info({ data }, '[ExampleRepository] create called');

    const result = await prisma.$transaction(async (tx) => {
      // Handle order management if needed
      const order = await this.getNextOrder(tx);

      return await tx.example.create({
        data: { ...data, order },
      });
    });

    this.logger.info({ id: result.id }, '[ExampleRepository] create success');
    return result;
  }
}
```

### 7.2 Repository Organization

**Admin Repositories** (`src/repositories/admin/`)

- `academyRepository.js` - Academy data access
- `userRepository.js` - User data access
- `jobsRepository.js` - Job data access
- `rylsRegistrationRepository.js` - RYLS data access

**User Repositories** (`src/repositories/user/`)

- `userRepository.js` - User profile data access
- `jobsRepository.js` - Job application data access
- `rylsRegistrationRepository.js` - RYLS registration data access
- `rylsPaymentRepository.js` - Payment data access

**Shared Repositories** (`src/repositories/shared/`)

- `academyRepository.js` - Shared academy queries
- `webhookRepository.js` - Webhook data access

**Base Repository** (`src/repositories/base/`)

- `BaseRepository.js` - Base class with common methods

### 7.3 Order Management Pattern

Repositories mengimplementasikan automatic order management untuk sub-tables:

```javascript
async create(parentId, data) {
  return await prisma.$transaction(async (tx) => {
    const { order, ...rest } = data;
    let finalOrder = order;

    if (!order) {
      // Auto-increment: get max order + 1
      const maxRecord = await tx.model.findFirst({
        where: { parent_id: parentId },
        orderBy: { order: 'desc' },
      });
      finalOrder = maxRecord ? maxRecord.order + 1 : 1;
    } else {
      // Shift existing records
      await tx.model.updateMany({
        where: { parent_id: parentId, order: { gte: order } },
        data: { order: { increment: 1 } },
      });
    }

    return await tx.model.create({
      data: { parent_id: parentId, ...rest, order: finalOrder },
    });
  });
}
```

---

## 8. Schemas & Validation

Fastify menggunakan JSON Schema untuk validasi request/response.

### 8.1 Schema Structure

```javascript
export const createExampleSchema = {
  tags: ['Examples'],
  summary: 'Create new example',
  description: 'Create a new example record',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'description'],
    properties: {
      name: { type: 'string', minLength: 3, maxLength: 100 },
      description: { type: 'string', minLength: 10 },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(exampleEntitySchema),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
```

### 8.2 Schema Organization

**Shared Schemas** (`src/schemas/shared/`)

- `baseSchemas.js` - Common response schemas
- `academySchemas.js` - Academy validation schemas
- `jobSchemas.js` - Job validation schemas
- `testimonialSchemas.js` - Testimonial schemas

**User Schemas** (`src/schemas/user/`)

- `userSchemas.js` - User profile schemas
- `rylsRegistrationSchemas.js` - RYLS registration schemas
- `fileUploadSchemas.js` - File upload schemas

**Admin Schemas** (`src/schemas/admin/`)

- `userSchemas.js` - Admin user management schemas
- `systemSettingsSchemas.js` - System settings schemas

### 8.3 Base Schemas

**Success Response**:

```javascript
{
  success: true,
  message: "Operation successful",
  data: { /* result */ },
  meta: { /* pagination */ }
}
```

**Error Response**:

```javascript
{
  success: false,
  message: "Error message",
  error: "Detailed error",
  statusCode: 400
}
```

---

## 9. Middleware

### 9.1 Authentication Middleware

**File**: `src/middleware/auth.js`

```javascript
// Required authentication
export async function authMiddleware(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send(errorResponse('Unauthorized', 401));
  }
}

// Optional authentication
export async function optionalAuthMiddleware(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    // Continue without authentication
  }
}

// Admin role check (ADMIN or SUPERADMIN)
export async function adminMiddleware(request, reply) {
  await authMiddleware(request, reply);
  if (reply.sent) return;
  if (!['ADMIN', 'SUPERADMIN'].includes(request.user?.role)) {
    reply.status(403).send(errorResponse('Forbidden', 403));
  }
}

// Resource-level permission check (used after adminMiddleware)
// File: src/middleware/permissionMiddleware.js
export function requirePermission(key, requiredLevel = 'VIEWER') {
  return async function (request, reply) {
    if (request.user.role === 'SUPERADMIN') return; // bypass
    const permission = await prisma.userAdminPermission.findUnique({ where: { ... } });
    if (!permission) return reply.status(403).send(errorResponse('Forbidden: no permission', 403));
    if (requiredLevel === 'EDITOR' && permission.access_level === 'VIEWER')
      return reply.status(403).send(errorResponse('Forbidden: read-only access', 403));
  };
}
```

### 9.2 File Upload Middleware

**File**: `src/middleware/fileUploadMiddleware.js`

Handles multipart file uploads dengan validasi:

- File size limits
- File type validation (MIME types)
- Secure filename generation
- Storage management

```javascript
export async function uploadAcademyImage(request, reply) {
  const data = await request.file({
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  if (data) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(data.mimetype)) {
      throw new Error('Invalid file type');
    }

    const filename = `${Date.now()}-${data.filename}`;
    const filepath = path.join(uploadDir, filename);

    await pump(data.file, fs.createWriteStream(filepath));

    request.body.image_url = `/uploads/${filename}`;
  }
}
```

### 9.3 Error Handler

**File**: `src/middleware/errorHandler.js`

Global error handler untuk menangani semua errors:

```javascript
export function errorHandler(error, request, reply) {
  request.log.error({ err: error }, 'Unhandled error');

  // Prisma errors
  if (error.code?.startsWith('P')) {
    return reply.status(400).send(errorResponse('Database error', 400, error.message));
  }

  // Validation errors
  if (error.validation) {
    return reply.status(400).send(errorResponse('Validation error', 400, error.message));
  }

  // JWT errors
  if (error.message?.includes('jwt')) {
    return reply.status(401).send(errorResponse('Unauthorized', 401));
  }

  // Default error
  return reply.status(500).send(errorResponse('Internal server error', 500));
}
```

### 9.4 Validation Middleware

**File**: `src/middleware/validation.js`

Custom validation middleware untuk business rules yang kompleks.

---

## 10. File Upload System

### 10.1 Architecture

```
Client → Multipart Upload → Middleware → Storage → Database Record
```

### 10.2 Upload Flow

1. **Client sends multipart/form-data**
2. **Middleware processes file**:
   - Validate file type
   - Validate file size
   - Generate secure filename
   - Save to disk
3. **Create database record**:
   - Store file metadata
   - Link to parent entity
4. **Return file URL**

### 10.3 File Upload Controller

**File**: `src/controllers/user/fileUploadController.js`

```javascript
async uploadFile(request, reply) {
  try {
    const data = await request.file({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    });

    if (!data) {
      return reply.status(400).send(errorResponse('No file uploaded', 400));
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.status(400).send(errorResponse('Invalid file type', 400));
    }

    // Generate filename
    const ext = path.extname(data.filename);
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    await pump(data.file, fs.createWriteStream(filepath));

    // Create database record
    const fileRecord = await fileUploadService.create({
      original_name: data.filename,
      file_path: `/uploads/${filename}`,
      file_size: (await fs.stat(filepath)).size,
      mime_type: data.mimetype,
      upload_type: request.body.upload_type || 'general',
    });

    return reply.status(201).send(successResponse(fileRecord, 'File uploaded successfully'));
  } catch (error) {
    request.log.error({ err: error }, 'File upload error');
    return reply.status(500).send(errorResponse('File upload failed', 500, error.message));
  }
}
```

### 10.4 File Storage

**Directory Structure**:

```
backend/
└── uploads/
    ├── academies/      # Academy images
    ├── instructors/    # Instructor avatars
    ├── testimonials/   # Testimonial images
    ├── ryls/          # RYLS documents
    │   ├── essays/    # Essay files
    │   ├── headshots/ # Headshot photos
    │   └── proofs/    # Payment proofs
    └── general/       # General uploads
```

### 10.5 File Metadata (Database)

```prisma
model FileUpload {
  id            Int      @id @default(autoincrement())
  original_name String   @db.VarChar(255)
  file_path     String   @db.VarChar(500)
  file_size     Int
  mime_type     String   @db.VarChar(100)
  upload_type   String   @db.VarChar(50)
  created_at    DateTime @default(now())

  // Relations
  fully_funded_essays   RylsFullyFundedSubmission?
  self_funded_headshots RylsSelfFundedSubmission?
  payment_proofs        RylsPayment?
}
```

### 10.6 Security Considerations

- ✅ File type validation (whitelist)
- ✅ File size limits
- ✅ Secure filename generation (no user input)
- ✅ Virus scanning (recommended for production)
- ✅ Access control (authentication required)
- ✅ Rate limiting (prevent abuse)

---

## 11. Payment System Architecture

### 11.1 Payment Flow Overview

```
User Registration → Payment Creation → Midtrans → Webhook → Status Update
```

### 11.2 Three-Layer Payment Architecture

#### Layer 1: Generic Transaction (Provider-Agnostic)

**Model**: `Transaction`

```prisma
model Transaction {
  id                    Int      @id @default(autoincrement())
  transaction_code      String   @unique
  provider_reference    String?
  amount                Int
  currency              String   @default("IDR")
  status                String   @default("pending")
  provider              String   // "MIDTRANS", "STRIPE", etc.
  payment_method        String?
  payment_token         String?
  payment_url           String?
  customer_name         String
  customer_email        String
  customer_phone        String?
  user_id               Int?
  product_type          String   // "RYLS_REGISTRATION"
  product_type_id       Int
  metadata              Json?
  paid_at               DateTime?
  expired_at            DateTime?
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  midtrans_data         MidtransTransaction?
  ryls_payment          RylsPayment?
  items                 TransactionItem[]
  user                  User?
}
```

**Purpose**:

- Provider-agnostic payment tracking
- Unified payment interface
- Easy provider switching

#### Layer 2: Provider-Specific Data (Midtrans)

**Model**: `MidtransTransaction`

```prisma
model MidtransTransaction {
  id                      Int      @id @default(autoincrement())
  transaction_id          Int      @unique
  snap_token              String
  redirect_url            String?
  midtrans_order_id       String
  midtrans_transaction_id String?
  transaction_status      String?
  fraud_status            String?
  payment_type            String?
  bank                    String?
  va_numbers              Json?
  masked_card             String?
  status_code             String?
  status_message          String?
  approval_code           String?
  create_response         Json?
  last_notification       Json?
  status_response         Json?
  settlement_time         DateTime?
  notified_at             DateTime?
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt

  transaction             Transaction @relation(fields: [transaction_id], references: [id])
}
```

**Purpose**:

- Store Midtrans-specific data
- Handle Midtrans webhooks
- Track Midtrans transaction lifecycle

#### Layer 3: Product-Specific Payment (RYLS)

**Model**: `RylsPayment`

```prisma
model RylsPayment {
  id               Int          @id @default(autoincrement())
  registration_id  Int?
  transaction_id   Int?         @unique
  payment_proof_id Int?         @unique
  status           String       @default("pending")
  scholarship_type String
  payment_method   String
  created_at       DateTime     @default(now())
  updated_at       DateTime     @updatedAt

  // Relations
  registration     RylsRegistration?
  transaction      Transaction?
  payment_proof    FileUpload?
}
```

**Purpose**:

- Link payment to specific product (RYLS registration)
- Track product-specific payment status
- Handle manual payment proofs

### 11.3 Payment Creation Flow

**File**: `src/services/user/rylsPaymentService.js`

```javascript
async createTransaction(registrationId, paymentData) {
  this.logger.info('[RylsPaymentService] createTransaction start');

  try {
    // 1. Get registration data
    const registration = await this.registrationRepository.findById(registrationId);

    // 2. Calculate amount
    const amount = await getPaymentAmountIdr(
      registration.scholarship_type,
      paymentData.payment_method
    );

    // 3. Generate transaction code
    const sequence = await this.paymentRepository.getNextSequenceNumber();
    const transactionCode = generateTransactionCode('RYLS', sequence);

    // 4. Create transaction (Layer 1)
    const transaction = await prisma.$transaction(async (tx) => {
      // Create generic transaction
      const txn = await tx.transaction.create({
        data: {
          transaction_code: transactionCode,
          amount,
          currency: 'IDR',
          status: 'pending',
          provider: 'MIDTRANS',
          customer_name: registration.full_name,
          customer_email: registration.email,
          customer_phone: registration.whatsapp,
          product_type: 'RYLS_REGISTRATION',
          product_type_id: registrationId,
          expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // 5. Create Midtrans transaction (Layer 2)
      const midtransResponse = await this.createMidtransTransaction(txn, registration);

      await tx.midtransTransaction.create({
        data: {
          transaction_id: txn.id,
          snap_token: midtransResponse.token,
          redirect_url: midtransResponse.redirect_url,
          midtrans_order_id: transactionCode,
          create_response: midtransResponse,
        },
      });

      // 6. Create RYLS payment (Layer 3)
      await tx.rylsPayment.create({
        data: {
          registration_id: registrationId,
          transaction_id: txn.id,
          scholarship_type: registration.scholarship_type,
          payment_method: paymentData.payment_method,
          status: 'pending',
        },
      });

      return txn;
    });

    this.logger.info('[RylsPaymentService] createTransaction success');
    return transaction;
  } catch (error) {
    this.logger.error({ err: error }, '[RylsPaymentService] createTransaction error');
    throw error;
  }
}
```

### 11.4 Midtrans Integration

**File**: `src/integrations/midtransClient.js`

```javascript
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function createSnapTransaction(transactionDetails) {
  const parameter = {
    transaction_details: {
      order_id: transactionDetails.order_id,
      gross_amount: transactionDetails.amount,
    },
    customer_details: {
      first_name: transactionDetails.customer_name,
      email: transactionDetails.customer_email,
      phone: transactionDetails.customer_phone,
    },
    item_details: transactionDetails.items,
    callbacks: {
      finish: `${process.env.FRONTEND_URL}/payment/finish`,
      error: `${process.env.FRONTEND_URL}/payment/error`,
      pending: `${process.env.FRONTEND_URL}/payment/pending`,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  return {
    token: transaction.token,
    redirect_url: transaction.redirect_url,
  };
}

export async function getTransactionStatus(orderId) {
  return await snap.transaction.status(orderId);
}
```

### 11.5 Webhook Handling

**File**: `src/controllers/shared/webhookController.js`

```javascript
async handleMidtransNotification(request, reply) {
  try {
    const notification = request.body;

    this.logger.info({ notification }, '[WebhookController] Midtrans notification received');

    // Verify signature
    const isValid = await this.verifyMidtransSignature(notification);
    if (!isValid) {
      return reply.status(401).send({ message: 'Invalid signature' });
    }

    // Process notification
    await webhookService.processMidtransNotification(notification);

    return reply.status(200).send({ message: 'OK' });
  } catch (error) {
    this.logger.error({ err: error }, '[WebhookController] Webhook error');
    return reply.status(500).send({ message: 'Internal server error' });
  }
}
```

**Webhook Service**:

```javascript
async processMidtransNotification(notification) {
  const {
    order_id,
    transaction_status,
    fraud_status,
    payment_type,
    transaction_id,
    settlement_time,
  } = notification;

  // Find transaction
  const transaction = await prisma.transaction.findFirst({
    where: { transaction_code: order_id },
    include: {
      midtrans_data: true,
      ryls_payment: true,
    },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Update transaction status
  await prisma.$transaction(async (tx) => {
    // Update Layer 1 (Generic Transaction)
    let newStatus = 'pending';
    let paidAt = null;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'paid';
        paidAt = settlement_time ? new Date(settlement_time) : new Date();
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newStatus = 'failed';
    }

    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        payment_method: payment_type,
        paid_at: paidAt,
        provider_reference: transaction_id,
      },
    });

    // Update Layer 2 (Midtrans)
    await tx.midtransTransaction.update({
      where: { transaction_id: transaction.id },
      data: {
        midtrans_transaction_id: transaction_id,
        transaction_status,
        fraud_status,
        payment_type,
        settlement_time: settlement_time ? new Date(settlement_time) : null,
        last_notification: notification,
        notified_at: new Date(),
      },
    });

    // Update Layer 3 (RYLS Payment)
    if (transaction.ryls_payment) {
      await tx.rylsPayment.update({
        where: { id: transaction.ryls_payment.id },
        data: { status: newStatus },
      });
    }
  });

  this.logger.info({ order_id, status: newStatus }, '[WebhookService] Transaction updated');
}
```

### 11.6 Payment Status Flow

```
pending → capture/settlement → paid
pending → cancel/deny/expire → failed
```

### 11.7 Currency Conversion

**File**: `src/integrations/currencyConverter.js`

```javascript
import Freecurrencyapi from '@everapi/freecurrencyapi-js';

const freecurrencyapi = new Freecurrencyapi(process.env.CURRENCY_API_KEY);

export async function convertUsdToIdr(usdAmount) {
  try {
    const response = await freecurrencyapi.latest({
      base_currency: 'USD',
      currencies: 'IDR',
    });

    const rate = response.data.IDR;
    if (!rate || rate <= 0) {
      throw new Error('Invalid rate from currency API');
    }

    const idrAmount = Math.round(usdAmount * rate);

    return {
      usd: usdAmount,
      idr: idrAmount,
      rate,
      timestamp: new Date(),
    };
  } catch (error) {
    throw new Error(`Currency conversion failed: ${error.message}`);
  }
}
```

### 11.8 Payment Constants

**File**: `src/constants/payments.js`

```javascript
export const PAYMENT_METHODS = {
  ONLINE: 'ONLINE',
  BANK_TRANSFER: 'BANK_TRANSFER',
};

export const SCHOLARSHIP_TYPES = {
  FULLY_FUNDED: 'FULLY_FUNDED',
  SELF_FUNDED: 'SELF_FUNDED',
};

export const PAYMENT_AMOUNTS_USD = {
  FULLY_FUNDED: {
    ONLINE: 0, // Free
    BANK_TRANSFER: 0,
  },
  SELF_FUNDED: {
    ONLINE: 750,
    BANK_TRANSFER: 750,
  },
};

export async function getPaymentAmountIdr(scholarshipType, paymentMethod) {
  const usdAmount = PAYMENT_AMOUNTS_USD[scholarshipType][paymentMethod];

  if (usdAmount === 0) {
    return 0;
  }

  const conversion = await convertUsdToIdr(usdAmount);
  return conversion.idr;
}
```

---

## 12. Authentication & Authorization

### 12.1 JWT Authentication

**Configuration**: `@fastify/jwt`

```javascript
// config/plugins.js
fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: '7d', // Token expires in 7 days
  },
});
```

### 12.2 User Registration Flow

```javascript
async register(request, reply) {
  const { username, email, password, first_name, last_name } = request.body;

  // 1. Check if user exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    return reply.status(409).send(errorResponse('Email already registered', 409));
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create user
  const user = await userRepository.create({
    username,
    email,
    password: hashedPassword,
    first_name,
    last_name,
    role: 'USER',
  });

  // 4. Generate JWT token
  const token = fastify.jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return reply.status(201).send(successResponse({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
  }, 'Registration successful'));
}
```

### 12.3 Login Flow

```javascript
async login(request, reply) {
  const { email, password } = request.body;

  // 1. Find user
  const user = await userRepository.findByEmail(email);
  if (!user) {
    return reply.status(401).send(errorResponse('Invalid credentials', 401));
  }

  // 2. Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return reply.status(401).send(errorResponse('Invalid credentials', 401));
  }

  // 3. Generate JWT token
  const token = fastify.jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return reply.send(successResponse({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
  }, 'Login successful'));
}
```

### 12.4 Authorization Levels

**User Roles**:

```prisma
enum UserRole {
  USER
  ADMIN
  SUPERADMIN
}
```

**Access Control**:

- `USER`: Access to user-facing endpoints only
- `ADMIN`: Access to admin panel; specific resources controlled by per-user permissions
- `SUPERADMIN`: Full access to all endpoints and permission management; bypasses all permission checks

**Middleware Usage**:

```javascript
// Public endpoint (no auth)
fastify.get('/academies', academyController.getAll);

// User endpoint (auth required)
fastify.get('/profile', { preHandler: [authMiddleware], handler: userController.getProfile });

// Admin endpoint with permission check
fastify.get('/admin/academies', {
  preHandler: [adminMiddleware, requirePermission('admin.academy')],
  handler: adminAcademyController.getAll,
});

// SUPERADMIN-only endpoint
fastify.put('/admin/users/:id/permissions', {
  preHandler: [adminMiddleware, authorizeRoles(['SUPERADMIN'])],
  handler: adminPermissionController.setUserPermissions,
});
```

### 12.5 Permission System

Admin access is controlled at resource level via the `AdminPermission` and `UserAdminPermission` tables.

**Permission Registry** (`admin_permissions` table):

| Key | Resource | Available Levels |
| --- | -------- | ---------------- |
| `admin.dashboard` | Dashboard | VIEWER |
| `admin.users` | User Management | VIEWER, EDITOR |
| `admin.academy` | Academy | VIEWER, EDITOR |
| `admin.cohort` | Cohort | VIEWER, EDITOR |
| `admin.transactions` | Transactions | VIEWER, EDITOR |
| `admin.ryls` | RYLS | VIEWER, EDITOR |
| `admin.jobs` | Jobs | VIEWER, EDITOR |
| `admin.statistics` | Statistics | VIEWER |
| `admin.settings` | System Settings | VIEWER, EDITOR |

**Access Levels**:

- `VIEWER`: Read-only access (GET endpoints)
- `EDITOR`: Full read+write access (GET + POST/PUT/DELETE endpoints)

**`requirePermission` middleware** (`src/middleware/permissionMiddleware.js`):

```javascript
// Usage in route definitions
fastify.get('/', { preHandler: [adminMiddleware, requirePermission('admin.academy')] });          // VIEWER
fastify.post('/', { preHandler: [adminMiddleware, requirePermission('admin.academy', 'EDITOR')] }); // EDITOR
```

- SUPERADMIN always bypasses — no DB query, immediate pass
- ADMIN without assignment → 403 "no permission for this resource"
- ADMIN with VIEWER attempting EDITOR route → 403 "read-only access"
- Permission revocation takes effect immediately on next request (no re-login required)

**Permission Management API** (SUPERADMIN only):

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/admin/permissions` | List all permission registry entries |
| GET | `/admin/users/:id/permissions` | Get permissions for an admin user |
| PUT | `/admin/users/:id/permissions` | Replace all permissions (replace-all semantics) |
| DELETE | `/admin/users/:id/permissions/:key` | Remove a single permission |

### 12.6 JWT Token Structure

```json
{
  "id": 123,
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 12.6 Token Refresh

```javascript
async refreshToken(request, reply) {
  try {
    // Verify current token
    await request.jwtVerify();

    // Generate new token
    const newToken = fastify.jwt.sign({
      id: request.user.id,
      email: request.user.email,
      role: request.user.role,
    });

    return reply.send(successResponse({ token: newToken }, 'Token refreshed'));
  } catch (error) {
    return reply.status(401).send(errorResponse('Invalid token', 401));
  }
}
```

---

## 13. External Integrations

### 13.1 Midtrans Payment Gateway

**Purpose**: Payment processing for RYLS registrations

**Features**:

- Snap payment (credit card, bank transfer, e-wallet)
- Webhook notifications
- Transaction status checking
- Fraud detection

**Configuration**:

```env
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false
```

### 13.2 Currency Converter API

**Purpose**: USD to IDR conversion for international payments

**Provider**: FreeCurrencyAPI

**Configuration**:

```env
CURRENCY_API_KEY=your_api_key
```

**Usage**:

```javascript
const conversion = await convertUsdToIdr(750);
// Returns: { usd: 750, idr: 11250000, rate: 15000, timestamp: Date }
```

### 13.3 LinkedIn Job Search API (Planned)

**Purpose**: Job data aggregation

**File**: `src/integrations/linkedinJobSearch.js`

Currently stores job data with LinkedIn metadata for future integration.

---

## 14. Database Design

### 14.1 Database Schema Overview

**Total Models**: 30+

**Main Domains**:

1. **User Management**: Users, UserSettings
2. **Academy**: Academies, Pricing, Features, Instructors, Topics, Themes, Testimonials, FAQs
3. **Jobs**: Jobs, Companies, Locations, Applications, SavedJobs, AIInsights
4. **RYLS**: Registrations, Payments, Submissions, FileUploads
5. **Payments**: Transactions, MidtransTransactions, TransactionItems
6. **System**: SystemSettings, Testimonials, Programs

### 14.2 Key Database Patterns

#### Cascade Delete

```prisma
model Academy {
  id       Int              @id
  pricing  AcademyPricing[] @relation(onDelete: Cascade)
  features AcademyFeature[] @relation(onDelete: Cascade)
}
```

#### Soft Delete (Status-based)

```prisma
model Academy {
  status AcademyStatus @default(ACTIVE) // DRAFT, ACTIVE, ARCHIVED
}
```

#### Denormalization

```prisma
model AcademyInstructor {
  // Instructor data stored directly, not referenced
  name        String
  job_title   String
  avatar_url  String
  description String
}
```

#### Order Management

```prisma
model AcademyPricing {
  order Int @default(1) // Auto-managed ordering
}
```

### 14.3 Indexing Strategy

**Primary Indexes**:

- Foreign keys
- Unique constraints
- Status fields

**Composite Indexes**:

```prisma
@@index([academy_id, order])
@@index([category, status])
@@index([created_at(sort: Desc)])
```

**Full-text Search** (Future):

```prisma
@@index([title, description], type: GIN)
```

---

## 15. Testing Strategy

### 15.1 Test Structure

```
tests/
├── unit/              # Unit tests (mocked dependencies)
│   ├── controllers/
│   ├── services/
│   └── repositories/
├── integration/       # Integration tests (real database)
│   ├── repositories/
│   └── services/
├── e2e/              # End-to-end tests (HTTP API)
│   ├── auth.test.js
│   ├── user-academies.test.js
│   └── admin-academies.test.js
└── helpers/          # Test utilities
    ├── testDb.js
    ├── testServer.js
    └── fixtures.js
```

### 15.2 Test Coverage

**Total Tests**: 225+

**Coverage by Layer**:

- Controllers: 40+ tests
- Services: 90+ tests
- Repositories: 80+ tests
- E2E: 15+ tests

### 15.3 Test Database

**Configuration**:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/risesocial_test
NODE_ENV=test
```

**Test Utilities**:

```javascript
// testDb.js
export async function resetDatabase() {
  await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE academies CASCADE`;
  // ... reset all tables
}

export async function seedTestData() {
  const user = await prisma.user.create({
    /* ... */
  });
  const academy = await prisma.academy.create({
    /* ... */
  });
  return { user, academy };
}
```

### 15.4 Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 16. Logging & Monitoring

### 16.1 Logging Strategy

**Logger**: Pino (built-in Fastify logger)

**Log Levels**:
- `fatal`: Application crash
- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages
- `debug`: Debug messages
- `trace`: Very detailed debug

**Configuration**:
```javascript
// Development
{
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
}

// Production
{
  level: 'info',
  // JSON output for log aggregation
}
```

### 16.2 Structured Logging

```javascript
// Controller logging
request.log.info('[AcademyController] getAll start');
request.log.debug({ params: request.params }, '[AcademyController] getAll params');
request.log.error({ err: error }, '[AcademyController] getAll error');

// Service logging
this.logger.info({ academyId }, '[AcademyService] create start');
this.logger.warn({ academyId }, '[AcademyService] validation warning');

// Repository logging
this.logger.info({ id, found: !!result }, '[AcademyRepository] findById result');
```

### 16.3 Request Logging

Fastify automatically logs:
- Request method & URL
- Response status code
- Response time
- Request ID (for tracing)

```json
{
  "level": 30,
  "time": 1234567890,
  "pid": 12345,
  "hostname": "server",
  "reqId": "req-1",
  "req": {
    "method": "GET",
    "url": "/academies",
    "headers": { /* ... */ }
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 45.2,
  "msg": "request completed"
}
```

### 16.4 Error Tracking

```javascript
// Global error handler logs all errors
fastify.setErrorHandler((error, request, reply) => {
  request.log.error({
    err: error,
    reqId: request.id,
    url: request.url,
    method: request.method,
  }, 'Unhandled error');
  
  // Send error response
  reply.status(500).send(errorResponse('Internal server error', 500));
});
```

### 16.5 Performance Monitoring

```javascript
// Log slow queries
fastify.addHook('onResponse', (request, reply, done) => {
  const responseTime = reply.getResponseTime();
  
  if (responseTime > 1000) {
    request.log.warn({
      url: request.url,
      method: request.method,
      responseTime,
    }, 'Slow request detected');
  }
  
  done();
});
```

---

## 17. Security Best Practices

### 17.1 Input Validation

✅ **Fastify JSON Schema validation**
- All request bodies validated
- Query parameters validated
- Path parameters validated

✅ **Business logic validation**
- Service layer validates business rules
- Repository layer validates data integrity

### 17.2 SQL Injection Prevention

✅ **Prisma ORM**
- Parameterized queries
- Type-safe database access
- No raw SQL (except for specific cases with proper escaping)

### 17.3 Authentication Security

✅ **Password hashing**: bcrypt with salt rounds
✅ **JWT tokens**: Signed with secret key
✅ **Token expiration**: 7 days default
✅ **HTTPS only**: Production environment

### 17.4 File Upload Security

✅ **File type validation**: Whitelist approach
✅ **File size limits**: Configurable per endpoint
✅ **Secure filenames**: Generated, not user input
✅ **Virus scanning**: Recommended for production

### 17.5 CORS Configuration

```javascript
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
```

### 17.6 Rate Limiting (Recommended)

```javascript
// Future implementation
fastify.register(rateLimit, {
  max: 100, // 100 requests
  timeWindow: '1 minute',
});
```

### 17.7 Environment Variables

```env
# Never commit to git
JWT_SECRET=your_secret_key_here
DATABASE_URL=postgresql://...
MIDTRANS_SERVER_KEY=...
CURRENCY_API_KEY=...
```

---

## 18. Deployment

### 18.1 Environment Setup

**Development**:
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Production**:
```bash
npm install --production
npx prisma generate
npx prisma migrate deploy
npm start
```

### 18.2 Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### 18.3 Environment Variables

**Required**:
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

**Optional**:
```env
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_IS_PRODUCTION=true
CURRENCY_API_KEY=...
FRONTEND_URL=https://...
```

### 18.4 Health Check

```bash
curl http://localhost:3001/health
# Response: {"status":"ok","service":"rise-social-backend"}
```

### 18.5 Graceful Shutdown

Server handles SIGTERM and SIGINT signals:
1. Stop accepting new requests
2. Complete ongoing requests
3. Close database connections
4. Exit process

---

## 19. API Documentation

### 19.1 Swagger/OpenAPI

**Access**: `http://localhost:3001/documentation`

**Features**:
- Interactive API explorer
- Request/response examples
- Schema definitions
- Authentication testing

### 19.2 Generating API Docs

Swagger automatically generates documentation from:
- Route schemas
- Request/response schemas
- Tag definitions
- Security definitions

### 19.3 API Versioning

Currently: Single version (v1 implicit)

Future: Version in URL path
```
/api/v1/academies
/api/v2/academies
```

---

## 20. Performance Optimization

### 20.1 Database Query Optimization

✅ **Indexes**: Strategic indexing on frequently queried fields
✅ **Eager loading**: Include relations in single query
✅ **Pagination**: Limit result sets
✅ **Select specific fields**: Avoid SELECT *

```javascript
// Good: Specific fields + pagination
const academies = await prisma.academy.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    image_url: true,
  },
  take: 10,
  skip: 0,
});

// Bad: All fields + no pagination
const academies = await prisma.academy.findMany();
```

### 20.2 Caching Strategy (Future)

**Recommended**:
- Redis for session storage
- Cache frequently accessed data
- Cache invalidation on updates

```javascript
// Example caching
const cacheKey = `academy:${slug}`;
let academy = await cache.get(cacheKey);

if (!academy) {
  academy = await prisma.academy.findUnique({ where: { slug } });
  await cache.set(cacheKey, academy, { ttl: 300 }); // 5 minutes
}
```

### 20.3 Connection Pooling

Prisma automatically manages connection pooling:
```env
DATABASE_URL=postgresql://...?connection_limit=10
```

### 20.4 Response Compression

```javascript
// Future implementation
fastify.register(compress, {
  global: true,
  threshold: 1024, // Compress responses > 1KB
});
```

---

## 21. Error Handling

### 21.1 Error Types

**Validation Errors** (400):
```javascript
{
  "success": false,
  "message": "Validation error",
  "error": "Title is required",
  "statusCode": 400
}
```

**Authentication Errors** (401):
```javascript
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```

**Authorization Errors** (403):
```javascript
{
  "success": false,
  "message": "Forbidden",
  "statusCode": 403
}
```

**Not Found Errors** (404):
```javascript
{
  "success": false,
  "message": "Resource not found",
  "statusCode": 404
}
```

**Server Errors** (500):
```javascript
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

### 21.2 Error Handling Pattern

```javascript
try {
  // Operation
  const result = await service.operation();
  return reply.send(successResponse(result, 'Success'));
} catch (error) {
  request.log.error({ err: error }, 'Operation failed');
  
  // Handle specific errors
  if (error.code === 'P2002') {
    return reply.status(409).send(errorResponse('Duplicate entry', 409));
  }
  
  if (error.message === 'Not found') {
    return reply.status(404).send(errorResponse('Resource not found', 404));
  }
  
  // Default error
  return reply.status(500).send(errorResponse('Operation failed', 500, error.message));
}
```

---

## 22. Future Enhancements

### 22.1 Planned Features

- [ ] GraphQL API
- [ ] Real-time updates (WebSocket)
- [ ] Advanced search (Elasticsearch)
- [ ] Email notifications (SendGrid/AWS SES)
- [ ] SMS notifications (Twilio)
- [ ] File storage (AWS S3/CloudFlare R2)
- [ ] CDN integration
- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Multi-language support (i18n)

### 22.2 Technical Improvements

- [ ] Redis caching
- [ ] Rate limiting
- [ ] Request throttling
- [ ] API versioning
- [ ] Microservices architecture
- [ ] Event-driven architecture
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Service mesh (Istio)
- [ ] Container orchestration (Kubernetes)

---

## 23. Troubleshooting

### 23.1 Common Issues

**Database Connection Failed**:
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

**Migration Failed**:
```bash
# Check migration status
npx prisma migrate status

# Reset database (dev only)
npx prisma migrate reset

# Apply migrations
npx prisma migrate deploy
```

**JWT Token Invalid**:
```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Verify token expiration
# Check token format in Authorization header
```

**File Upload Failed**:
```bash
# Check upload directory exists
ls -la uploads/

# Check file permissions
chmod 755 uploads/

# Check file size limits in middleware
```

### 23.2 Debug Mode

```bash
# Enable debug logging
NODE_ENV=development npm run dev

# Check logs
tail -f logs/app.log
```

---

## 24. Contact & Support

**Documentation**: `/backend/docs/`
**API Docs**: `http://localhost:3001/documentation`
**Tests**: `/backend/tests/`

**Technical Docs**:
- `ACADEMY_TECHNICAL_DESIGN.md` - Academy feature documentation
- `PAYMENT_TRANSACTION_TECHNICAL_DESIGN.md` - Payment system documentation
- `USER_MANAGEMENT_TECHNICAL_DESIGN.md` - User management documentation
- `BACKEND_ARCHITECTURE.md` - This document

---

**Last Updated**: March 8, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅

