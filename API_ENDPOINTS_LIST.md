# 📋 DAFTAR LENGKAP ENDPOINT API - RISE SOCIAL BACKEND

## 🔐 **1. AUTHENTICATION**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/me` | Get current user profile | ✅ |

---

## 👤 **2. USER MANAGEMENT**

### 2.1 User Routes (Self-management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/settings` | Get user notification settings | ✅ |
| PUT | `/api/users/settings` | Update user notification settings | ✅ |
| GET | `/api/users/check-username/:username` | Check username availability | ❌ |
| GET | `/api/users/username-suggestions` | Generate username suggestions | ❌ |

### 2.2 Admin Routes (User Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | Get all users with pagination | ✅ Admin |
| GET | `/api/admin/users/:id` | Get user by ID | ✅ Admin |
| POST | `/api/admin/users` | Create new user | ✅ Admin |
| PUT | `/api/admin/users/:id` | Update user | ✅ Admin |
| DELETE | `/api/admin/users/:id` | Delete user | ✅ Admin |

---

## 📚 **3. PROGRAMS**

### 3.1 User Routes (Public Browsing)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/programs` | Get all active programs with pagination | ❌ |
| GET | `/api/programs/featured` | Get featured programs | ❌ |
| GET | `/api/programs/:id` | Get program by ID | ❌ |
| GET | `/api/programs/slug/:slug` | Get program by slug | ❌ |

### 3.2 Admin Routes (Program Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/programs` | Get all programs (including inactive) | ✅ Admin |
| POST | `/api/admin/programs` | Create new program | ✅ Admin |
| PUT | `/api/admin/programs/:id` | Update program | ✅ Admin |
| DELETE | `/api/admin/programs/:id` | Delete program | ✅ Admin |
| GET | `/api/admin/programs/search` | Search programs | ✅ Admin |
| GET | `/api/admin/programs/statistics` | Get program statistics | ✅ Admin |
| GET | `/api/admin/programs/statistics/all` | Get all programs statistics | ✅ Admin |
| GET | `/api/admin/programs/:id/statistics` | Get specific program statistics | ✅ Admin |

---

## 🎓 **4. BOOTCAMPS**

### 4.1 User Routes (Public Browsing)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bootcamps` | Get all bootcamps with pagination | ❌ |
| GET | `/api/bootcamps/featured` | Get featured bootcamps | ❌ |
| GET | `/api/bootcamps/categories` | Get bootcamp categories | ❌ |
| GET | `/api/bootcamps/:slug` | Get bootcamp by slug | ❌ |

### 4.2 Admin Routes (Bootcamp Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/bootcamps` | Create new bootcamp | ✅ Admin |
| PUT | `/api/admin/bootcamps/:id` | Update bootcamp | ✅ Admin |
| DELETE | `/api/admin/bootcamps/:id` | Delete bootcamp | ✅ Admin |
| GET | `/api/admin/bootcamps/statistics` | Get bootcamp statistics | ✅ Admin |

---

## 👨‍🏫 **5. INSTRUCTORS**

### 5.1 User Routes (Public Directory)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/instructors` | Get all instructors | ❌ |
| GET | `/api/instructors/:id` | Get instructor by ID | ❌ |
| GET | `/api/instructors/search` | Search instructors by name | ❌ |
| GET | `/api/instructors/by-job-title` | Get instructors by job title | ❌ |
| GET | `/api/instructors/popular` | Get popular instructors | ❌ |
| GET | `/api/instructors/bootcamp/:bootcampId` | Get instructors by bootcamp | ❌ |
| GET | `/api/instructors/:instructorId/bootcamps` | Get bootcamps by instructor | ❌ |

### 5.2 Admin Routes (Instructor Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/instructors` | Create new instructor | ✅ Admin |
| PUT | `/api/admin/instructors/:id` | Update instructor | ✅ Admin |
| DELETE | `/api/admin/instructors/:id` | Delete instructor | ✅ Admin |
| GET | `/api/admin/instructors/available/:bootcampId` | Get available instructors for bootcamp | ✅ Admin |
| POST | `/api/admin/instructors/assign/:bootcampId` | Assign instructor to bootcamp | ✅ Admin |
| DELETE | `/api/admin/instructors/remove/:bootcampId/:instructorId` | Remove instructor from bootcamp | ✅ Admin |
| GET | `/api/admin/instructors/statistics` | Get instructor statistics | ✅ Admin |

---

## 📝 **6. ENROLLMENTS**

### 6.1 User Routes (User Enrollments)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/enrollments` | Get user enrollments | ✅ |
| GET | `/api/enrollments/:id` | Get enrollment by ID | ✅ |
| GET | `/api/enrollments/user/:userId/bootcamp/:bootcampId` | Get specific user-bootcamp enrollment | ✅ |
| PUT | `/api/enrollments/:id/progress` | Update enrollment progress | ✅ |

### 6.2 Admin Routes (Enrollment Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/enrollments` | Get all enrollments | ✅ Admin |
| GET | `/api/admin/enrollments/bootcamp/:bootcampId` | Get enrollments by bootcamp | ✅ Admin |
| POST | `/api/admin/enrollments` | Create new enrollment | ✅ Admin |
| PUT | `/api/admin/enrollments/:id` | Update enrollment | ✅ Admin |
| PUT | `/api/admin/enrollments/:id/status` | Update enrollment status | ✅ Admin |
| DELETE | `/api/admin/enrollments/:id` | Delete enrollment | ✅ Admin |
| GET | `/api/admin/enrollments/statistics` | Get enrollment statistics | ✅ Admin |

---

## 💼 **7. JOBS**

### 7.1 User Routes (Public Job Search)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/jobs` | Get all jobs with pagination | ❌ |
| GET | `/api/jobs/featured` | Get featured jobs | ❌ |
| GET | `/api/jobs/categories` | Get job categories | ❌ |
| GET | `/api/jobs/search` | Search jobs | ❌ |
| GET | `/api/jobs/:id` | Get job by ID | ❌ |
| GET | `/api/jobs/:id/recommendations` | Get job recommendations | ❌ |

### 7.2 Admin Routes (Job Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/jobs` | Create new job | ✅ Admin |
| PUT | `/api/admin/jobs/:id` | Update job | ✅ Admin |
| DELETE | `/api/admin/jobs/:id` | Delete job | ✅ Admin |
| POST | `/api/admin/jobs/sync-linkedin` | Sync jobs from LinkedIn API | ✅ Admin |
| GET | `/api/admin/jobs/statistics` | Get job statistics | ✅ Admin |
| GET | `/api/admin/jobs/:id/statistics` | Get specific job statistics | ✅ Admin |

---

## 💬 **8. TESTIMONIALS**

### 8.1 User Routes (Public Testimonials)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/testimonials` | Get all approved testimonials | ❌ |
| GET | `/api/testimonials/:id` | Get testimonial by ID | ❌ |
| GET | `/api/testimonials/featured` | Get featured testimonials | ❌ |
| GET | `/api/testimonials/by-country` | Get testimonials by country | ❌ |
| GET | `/api/testimonials/by-rating` | Get testimonials by rating | ❌ |
| GET | `/api/testimonials/countries-with-counts` | Get countries with testimonial counts | ❌ |

### 8.2 Admin Routes (Testimonial Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/testimonials` | Create new testimonial | ✅ Admin |
| PUT | `/api/admin/testimonials/:id` | Update testimonial | ✅ Admin |
| DELETE | `/api/admin/testimonials/:id` | Delete testimonial | ✅ Admin |
| GET | `/api/admin/testimonials/admin` | Get all testimonials for admin | ✅ Admin |
| GET | `/api/admin/testimonials/statistics` | Get testimonial statistics | ✅ Admin |
| GET | `/api/admin/testimonials/statistics/all` | Get all testimonial statistics | ✅ Admin |
| PUT | `/api/admin/testimonials/:id/toggle-featured` | Toggle featured status | ✅ Admin |
| PUT | `/api/admin/testimonials/:id/approve` | Approve testimonial | ✅ Admin |
| PUT | `/api/admin/testimonials/:id/reject` | Reject testimonial | ✅ Admin |

---

## 📋 **9. RYLS REGISTRATION**

### 9.1 User Routes (Registration Submissions)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ryls/registrations` | Create registration | ❌ |
| POST | `/api/ryls/registrations/fully-funded` | Submit fully funded registration | ❌ |
| POST | `/api/ryls/registrations/self-funded` | Submit self funded registration | ❌ |
| GET | `/api/ryls/registrations/submission/:submissionId` | Get registration by submission ID | ❌ |
| GET | `/api/ryls/registrations/check-email/:email` | Check if email exists | ❌ |
| GET | `/api/ryls/registrations/health` | Health check | ❌ |

### 9.2 Admin Routes (Registration Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/ryls/registrations` | Get all registrations with pagination | ✅ Admin |
| GET | `/api/admin/ryls/registrations/:id` | Get registration by ID | ✅ Admin |
| PATCH | `/api/admin/ryls/registrations/:id/status` | Update registration status | ✅ Admin |
| DELETE | `/api/admin/ryls/registrations/:id` | Delete registration | ✅ Admin |
| GET | `/api/admin/ryls/registrations/stats` | Get registration statistics | ✅ Admin |
| GET | `/api/admin/ryls/registrations/date-range` | Get registrations by date range | ✅ Admin |
| GET | `/api/admin/ryls/registrations/export` | Export registrations | ✅ Admin |
| GET | `/api/admin/ryls/registrations/export-excel` | Export registrations to Excel | ✅ Admin |

---

## 📁 **10. FILE UPLOAD**

### 10.1 User Routes (File Operations)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/uploads/essay` | Upload essay file (PDF) | ❌ |
| POST | `/api/uploads/headshot` | Upload headshot file (Image) | ❌ |
| POST | `/api/uploads/payment-proof` | Upload payment proof (Image) | ❌ |
| GET | `/api/uploads/:id` | Download/view file by ID | ❌ |
| GET | `/api/uploads/:id/info` | Get file information | ❌ |
| GET | `/api/uploads/type/:uploadType` | Get files by type | ❌ |
| GET | `/api/uploads/health` | Upload service health check | ❌ |

### 10.2 Admin Routes (File Management)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/uploads` | Get all files with advanced filtering | ✅ Admin |
| DELETE | `/api/admin/uploads/:id` | Delete file by ID | ✅ Admin |
| GET | `/api/admin/uploads/stats` | Get upload statistics | ✅ Admin |
| POST | `/api/admin/uploads/cleanup` | Cleanup orphaned files | ✅ Admin |
| GET | `/api/admin/uploads/usage-stats` | Get file usage statistics | ✅ Admin |
| GET | `/api/admin/uploads/storage-info` | Get storage information | ✅ Admin |
| POST | `/api/admin/uploads/bulk-delete` | Bulk delete files | ✅ Admin |
| GET | `/api/admin/uploads/report` | Generate usage report | ✅ Admin |

---

## ⚙️ **11. SYSTEM SETTINGS**

### 11.1 Admin Routes (System Configuration)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/system/settings` | Get all system settings | ✅ Admin |
| GET | `/api/admin/system/settings/:key` | Get setting by key | ✅ Admin |
| PUT | `/api/admin/system/settings/:key` | Set setting value | ✅ Admin |
| DELETE | `/api/admin/system/settings/:key` | Delete setting | ✅ Admin |
| GET | `/api/admin/system/settings/linkedin/rate-limit` | Get LinkedIn rate limit | ✅ Admin |

---

## 🏫 **12. BOOTCAMP RELATED**

### 12.1 Public Routes (Bootcamp Details)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bootcamp-related/all/:bootcampId` | Get all bootcamp related data | ❌ |
| GET | `/api/bootcamp-related/stats/:bootcampId` | Get bootcamp statistics | ❌ |
| GET | `/api/bootcamp-related/pricing/:bootcampId` | Get pricing tiers | ❌ |
| GET | `/api/bootcamp-related/features/:bootcampId` | Get features & benefits | ❌ |
| GET | `/api/bootcamp-related/topics/:bootcampId` | Get curriculum topics | ❌ |
| GET | `/api/bootcamp-related/faqs/:bootcampId` | Get FAQs | ❌ |
| GET | `/api/bootcamp-related/faqs/search/:bootcampId` | Search FAQs | ❌ |
| GET | `/api/bootcamp-related/info` | Get service info | ❌ |

---

## 💳 **13. PAYMENTS**

### 13.1 Mixed Routes (User Transactions & System)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/ryls/transactions` | Create payment transaction | ❌ |
| GET | `/api/payments/ryls/:registrationId/status` | Get payment status | ❌ |
| POST | `/api/payments/ryls/:orderId/cancel` | Cancel payment | ❌ |
| POST | `/api/payments/notifications` | Webhook notification handler | ❌ (System) |
| GET | `/api/payments/ryls/statistics` | Get payment statistics | ✅ Admin |
| GET | `/api/payments/health` | Payment service health check | ❌ |

---

## 📊 **SUMMARY**
- **Total Endpoints**: ~120+ endpoints
- **Public Endpoints**: ~40 endpoints
- **User Authenticated**: ~15 endpoints  
- **Admin Only**: ~65+ endpoints
- **System/Webhook**: ~5 endpoints
