import { EnrollmentRepository } from '../../repositories/enrollmentRepository.js';
import { EnrollmentService } from '../../services/enrollmentService.js';
import { EnrollmentController } from '../../controllers/enrollment/enrollmentController.js';
import { EnrollmentSchemas } from '../../schemas/enrollmentSchemas.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize dependencies
const enrollmentRepository = new EnrollmentRepository(prisma);
const enrollmentService = new EnrollmentService(enrollmentRepository);
const enrollmentController = new EnrollmentController(enrollmentService);

/**
 * Enrollment Routes dengan dokumentasi Swagger lengkap
 * @param {Object} app - Fastify app instance
 */
async function enrollmentRoutes(app, options) {
  // Mendapatkan semua enrollment
  app.get('/', {
    schema: {
      description: 'Mendapatkan semua enrollment dengan filter dan pagination',
      tags: ['Enrollments'],
      querystring: {
        type: 'object',
        properties: {
          user_id: { type: 'integer', description: 'Filter berdasarkan user ID' },
          bootcamp_id: { type: 'integer', description: 'Filter berdasarkan bootcamp ID' },
          enrollment_status: {
            type: 'string',
            enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            description: 'Filter berdasarkan status enrollment',
          },
          progress_min: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress minimum' },
          progress_max: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress maximum' },
          enrolled_from: { type: 'string', format: 'date-time', description: 'Tanggal mulai enrollment' },
          enrolled_to: { type: 'string', format: 'date-time', description: 'Tanggal akhir enrollment' },
          page: { type: 'integer', minimum: 1, description: 'Halaman' },
          limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Jumlah data per halaman' },
          include_user: { type: 'boolean', description: 'Include data user' },
          include_bootcamp: { type: 'boolean', description: 'Include data bootcamp' },
          include_pricing: { type: 'boolean', description: 'Include data pricing' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { type: 'object' } },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
                summary: { type: 'object' },
              },
            },
          },
        },
      },
    },
    handler: enrollmentController.getAllEnrollments.bind(enrollmentController),
  });

  // Mendapatkan enrollment berdasarkan ID
  app.get('/:id', {
    schema: {
      description: 'Mendapatkan enrollment berdasarkan ID',
      tags: ['Enrollments'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID enrollment' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        404: {
          description: 'Enrollment tidak ditemukan',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },

    handler: enrollmentController.getEnrollmentById.bind(enrollmentController),
  });

  // Mendapatkan enrollment berdasarkan user dan bootcamp
  app.get('/user/:userId/bootcamp/:bootcampId', {
    schema: {
      description: 'Mendapatkan enrollment berdasarkan user dan bootcamp',
      tags: ['Enrollments'],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'integer', description: 'ID user' },
          bootcampId: { type: 'integer', description: 'ID bootcamp' },
        },
        required: ['userId', 'bootcampId'],
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        404: {
          description: 'Enrollment tidak ditemukan',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },

    handler: enrollmentController.getEnrollmentByUserAndBootcamp.bind(enrollmentController),
  });

  // Mendapatkan enrollment berdasarkan user
  app.get('/user/:userId', {
    schema: {
      description: 'Mendapatkan semua enrollment berdasarkan user ID',
      tags: ['Enrollments'],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'integer', description: 'ID user' },
        },
        required: ['userId'],
      },
      querystring: {
        type: 'object',
        properties: {
          enrollment_status: {
            type: 'string',
            enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            description: 'Filter berdasarkan status enrollment',
          },
          progress_min: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress minimum' },
          progress_max: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress maximum' },
          page: { type: 'integer', minimum: 1, description: 'Halaman' },
          limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Jumlah data per halaman' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment user',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { type: 'object' } },
                pagination: { type: 'object' },
                summary: { type: 'object' },
              },
            },
          },
        },
      },
    },

    handler: enrollmentController.getUserEnrollments.bind(enrollmentController),
  });

  // Mendapatkan enrollment berdasarkan bootcamp
  app.get('/bootcamp/:bootcampId', {
    schema: {
      description: 'Mendapatkan semua enrollment berdasarkan bootcamp ID',
      tags: ['Enrollments'],
      params: {
        type: 'object',
        properties: {
          bootcampId: { type: 'integer', description: 'ID bootcamp' },
        },
        required: ['bootcampId'],
      },
      querystring: {
        type: 'object',
        properties: {
          enrollment_status: {
            type: 'string',
            enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            description: 'Filter berdasarkan status enrollment',
          },
          progress_min: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress minimum' },
          progress_max: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress maximum' },
          page: { type: 'integer', minimum: 1, description: 'Halaman' },
          limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Jumlah data per halaman' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment bootcamp',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { type: 'object' } },
                pagination: { type: 'object' },
                summary: { type: 'object' },
              },
            },
          },
        },
      },
    },

    handler: enrollmentController.getBootcampEnrollments.bind(enrollmentController),
  });

  // Membuat enrollment baru
  app.post('/', {
    schema: {
      description: 'Membuat enrollment baru',
      tags: ['Enrollments'],
      body: {
        type: 'object',
        required: ['user_id', 'bootcamp_id'],
        properties: {
          user_id: { type: 'integer', description: 'ID user' },
          bootcamp_id: { type: 'integer', description: 'ID bootcamp' },
          pricing_tier_id: { type: 'integer', description: 'ID pricing tier (optional)' },
          enrollment_status: {
            type: 'string',
            enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            description: 'Status enrollment (default: ENROLLED)',
          },
          progress_percentage: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress percentage (default: 0)' },
        },
      },
      response: {
        201: {
          description: 'Enrollment berhasil dibuat',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        400: {
          description: 'Validation error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            errors: { type: 'array' },
          },
        },
      },
    },

    handler: enrollmentController.createEnrollment.bind(enrollmentController),
  });

  // Update enrollment
  app.put('/:id', {
    schema: {
      description: 'Update enrollment',
      tags: ['Enrollments'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID enrollment' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          enrollment_status: {
            type: 'string',
            enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            description: 'Status enrollment',
          },
          progress_percentage: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress percentage' },
          pricing_tier_id: { type: 'integer', description: 'ID pricing tier' },
        },
      },
      response: {
        200: {
          description: 'Enrollment berhasil diupdate',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.updateEnrollment.bind(enrollmentController),
  });

  // Update progress enrollment
  app.put('/:id/progress', {
    schema: {
      description: 'Update progress enrollment',
      tags: ['Enrollments'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID enrollment' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        required: ['progress_percentage'],
        properties: {
          progress_percentage: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress percentage' },
        },
      },
      response: {
        200: {
          description: 'Progress enrollment berhasil diupdate',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.updateProgress.bind(enrollmentController),
  });

  // Update status enrollment
  app.put('/:id/status', {
    schema: {
      description: 'Update status enrollment',
      tags: ['Enrollments'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID enrollment' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        required: ['enrollment_status'],
        properties: {
          enrollment_status: {
            type: 'string',
            enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            description: 'Status enrollment',
          },
        },
      },
      response: {
        200: {
          description: 'Status enrollment berhasil diupdate',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.updateStatus.bind(enrollmentController),
  });

  // Bulk update status enrollment
  app.put('/bulk-status', {
    schema: {
      description: 'Bulk update status enrollment',
      tags: ['Enrollments'],
      body: {
        type: 'object',
        required: ['enrollment_ids', 'enrollment_status'],
        properties: {
          enrollment_ids: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Array of enrollment IDs',
          },
          enrollment_status: {
            type: 'string',
            enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            description: 'Status enrollment baru',
          },
        },
      },
      response: {
        200: {
          description: 'Bulk update status berhasil',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.bulkUpdateStatus.bind(enrollmentController),
  });

  // Mendapatkan statistik enrollment
  app.get('/stats', {
    schema: {
      description: 'Mendapatkan statistik enrollment',
      tags: ['Enrollment Analytics'],
      querystring: {
        type: 'object',
        properties: {
          bootcamp_id: { type: 'integer', description: 'Filter berdasarkan bootcamp ID' },
          user_id: { type: 'integer', description: 'Filter berdasarkan user ID' },
          date_from: { type: 'string', format: 'date-time', description: 'Tanggal mulai' },
          date_to: { type: 'string', format: 'date-time', description: 'Tanggal akhir' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan statistik enrollment',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.getEnrollmentStats.bind(enrollmentController),
  });

  // Mendapatkan enrollment yang akan berakhir
  app.get('/expiring', {
    schema: {
      description: 'Mendapatkan enrollment yang akan berakhir',
      tags: ['Enrollment Analytics'],
      querystring: {
        type: 'object',
        properties: {
          days: { type: 'integer', minimum: 1, maximum: 365, description: 'Jumlah hari (default: 7)' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment yang akan berakhir',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },

    handler: enrollmentController.getExpiringEnrollments.bind(enrollmentController),
  });

  // Mendapatkan top learners
  app.get('/top-learners', {
    schema: {
      description: 'Mendapatkan top learners berdasarkan progress',
      tags: ['Enrollment Analytics'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Jumlah top learners (default: 10)' },
          bootcamp_id: { type: 'integer', description: 'Filter berdasarkan bootcamp ID' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan top learners',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },

    handler: enrollmentController.getTopLearners.bind(enrollmentController),
  });

  // Mendapatkan dashboard overview
  app.get('/dashboard', {
    schema: {
      description: 'Mendapatkan dashboard overview enrollment',
      tags: ['Enrollment Analytics'],
      querystring: {
        type: 'object',
        properties: {
          bootcamp_id: { type: 'integer', description: 'Filter berdasarkan bootcamp ID' },
          user_id: { type: 'integer', description: 'Filter berdasarkan user ID' },
          date_from: { type: 'string', format: 'date-time', description: 'Tanggal mulai' },
          date_to: { type: 'string', format: 'date-time', description: 'Tanggal akhir' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan dashboard overview',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.getDashboardOverview.bind(enrollmentController),
  });

  // Search enrollments
  app.get('/search', {
    schema: {
      description: 'Mencari enrollment berdasarkan kriteria',
      tags: ['Enrollments'],
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', description: 'Query pencarian umum' },
          user_name: { type: 'string', description: 'Nama user' },
          bootcamp_title: { type: 'string', description: 'Judul bootcamp' },
          email: { type: 'string', format: 'email', description: 'Email user' },
          enrollment_status: {
            type: 'string',
            enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            description: 'Status enrollment',
          },
          progress_min: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress minimum' },
          progress_max: { type: 'integer', minimum: 0, maximum: 100, description: 'Progress maximum' },
          page: { type: 'integer', minimum: 1, description: 'Halaman' },
          limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Jumlah data per halaman' },
        },
      },
      response: {
        200: {
          description: 'Berhasil melakukan search enrollment',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.searchEnrollments.bind(enrollmentController),
  });

  // Mendapatkan enrollment overview
  app.get('/overview', {
    schema: {
      description: 'Mendapatkan enrollment overview',
      tags: ['Enrollment Analytics'],
      querystring: {
        type: 'object',
        properties: {
          bootcamp_id: { type: 'integer', description: 'Filter berdasarkan bootcamp ID' },
          user_id: { type: 'integer', description: 'Filter berdasarkan user ID' },
          date_from: { type: 'string', format: 'date-time', description: 'Tanggal mulai' },
          date_to: { type: 'string', format: 'date-time', description: 'Tanggal akhir' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment overview',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.getEnrollmentOverview.bind(enrollmentController),
  });

  // Mendapatkan enrollment analysis
  app.get('/analysis', {
    schema: {
      description: 'Mendapatkan enrollment analysis',
      tags: ['Enrollment Analytics'],
      querystring: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
            description: 'Period analisis (default: monthly)',
          },
          bootcamp_id: { type: 'integer', description: 'Filter berdasarkan bootcamp ID' },
          date_from: { type: 'string', format: 'date-time', description: 'Tanggal mulai' },
          date_to: { type: 'string', format: 'date-time', description: 'Tanggal akhir' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment analysis',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.getEnrollmentAnalysis.bind(enrollmentController),
  });

  // Mendapatkan enrollment trends
  app.get('/trends', {
    schema: {
      description: 'Mendapatkan enrollment trends',
      tags: ['Enrollment Analytics'],
      querystring: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['7days', '30days', '90days', '1year'],
            description: 'Period trends (default: 30days)',
          },
          bootcamp_id: { type: 'integer', description: 'Filter berdasarkan bootcamp ID' },
          group_by: {
            type: 'string',
            enum: ['day', 'week', 'month'],
            description: 'Group by period (default: day)',
          },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment trends',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.getEnrollmentTrends.bind(enrollmentController),
  });

  // Mendapatkan enrollment reports
  app.get('/reports', {
    schema: {
      description: 'Mendapatkan enrollment reports',
      tags: ['Enrollment Analytics'],
      querystring: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['summary', 'detailed', 'progress', 'completion'],
            description: 'Tipe report (default: summary)',
          },
          format: {
            type: 'string',
            enum: ['json', 'csv', 'excel'],
            description: 'Format report (default: json)',
          },
          bootcamp_id: { type: 'integer', description: 'Filter berdasarkan bootcamp ID' },
          user_id: { type: 'integer', description: 'Filter berdasarkan user ID' },
          date_from: { type: 'string', format: 'date-time', description: 'Tanggal mulai' },
          date_to: { type: 'string', format: 'date-time', description: 'Tanggal akhir' },
        },
      },
      response: {
        200: {
          description: 'Berhasil mendapatkan enrollment reports',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },

    handler: enrollmentController.getEnrollmentReports.bind(enrollmentController),
  });

  // Delete enrollment (soft delete)
  app.delete('/:id', {
    schema: {
      description: 'Menghapus enrollment (soft delete - mengubah status menjadi CANCELLED)',
      tags: ['Enrollments'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID enrollment' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Enrollment berhasil dihapus',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        404: {
          description: 'Enrollment tidak ditemukan',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },

    handler: enrollmentController.deleteEnrollment.bind(enrollmentController),
  });
}

// Temporary handlers for CommonJS compatibility

// Export menggunakan ES6 modules
export default enrollmentRoutes;
