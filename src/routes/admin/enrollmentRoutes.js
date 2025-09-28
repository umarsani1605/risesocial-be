import { adminEnrollmentController } from '../../controllers/admin/enrollmentController.js';
import { authMiddleware } from '../../middleware/auth.js';

/**
 * Admin Enrollment routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function adminEnrollmentRoutes(fastify) {
  const enrollmentTag = { tags: ['Admin Enrollments'] };

  // GET /api/admin/enrollments - Get all enrollments (Admin only)
  fastify.get(
    '/',
    {
      schema: {
        ...enrollmentTag,
        description: 'Get all enrollments with filtering and pagination (Admin only)',
        querystring: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', minimum: 1 },
            academy_id: { type: 'integer', minimum: 1 },
            enrollment_status: {
              type: 'string',
              enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            },
            progress_min: { type: 'integer', minimum: 0, maximum: 100 },
            progress_max: { type: 'integer', minimum: 0, maximum: 100 },
            enrolled_from: { type: 'string', format: 'date-time' },
            enrolled_to: { type: 'string', format: 'date-time' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            include_user: { type: 'boolean', default: false },
            include_academy: { type: 'boolean', default: false },
            include_pricing: { type: 'boolean', default: false },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminEnrollmentController.getAllEnrollments
  );

  // GET /api/admin/enrollments/academy/:academyId - Get academy enrollments (Admin only)
  fastify.get(
    '/academy/:academyId',
    {
      schema: {
        ...enrollmentTag,
        description: 'Get enrollments for specific academy (Admin only)',
        params: {
          type: 'object',
          properties: {
            academyId: { type: 'integer', minimum: 1 },
          },
          required: ['academyId'],
        },
        querystring: {
          type: 'object',
          properties: {
            enrollment_status: {
              type: 'string',
              enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            },
            progress_min: { type: 'integer', minimum: 0, maximum: 100 },
            progress_max: { type: 'integer', minimum: 0, maximum: 100 },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminEnrollmentController.getAcademyEnrollments
  );

  // POST /api/admin/enrollments - Create new enrollment (Admin only)
  fastify.post(
    '/',
    {
      schema: {
        ...enrollmentTag,
        description: 'Create new enrollment (Admin only)',
        body: {
          type: 'object',
          required: ['user_id', 'academy_id', 'pricing_tier_id'],
          properties: {
            user_id: { type: 'integer', minimum: 1 },
            academy_id: { type: 'integer', minimum: 1 },
            pricing_tier_id: { type: 'integer', minimum: 1 },
            enrollment_status: {
              type: 'string',
              enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
              default: 'ENROLLED',
            },
            progress_percentage: { type: 'integer', minimum: 0, maximum: 100, default: 0 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminEnrollmentController.createEnrollment
  );

  // PUT /api/admin/enrollments/:id - Update enrollment (Admin only)
  fastify.put(
    '/:id',
    {
      schema: {
        ...enrollmentTag,
        description: 'Update enrollment (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', minimum: 1 },
            academy_id: { type: 'integer', minimum: 1 },
            pricing_tier_id: { type: 'integer', minimum: 1 },
            enrollment_status: {
              type: 'string',
              enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
            },
            progress_percentage: { type: 'integer', minimum: 0, maximum: 100 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminEnrollmentController.updateEnrollment
  );

  // PUT /api/admin/enrollments/:id/status - Update enrollment status (Admin only)
  fastify.put(
    '/:id/status',
    {
      schema: {
        ...enrollmentTag,
        description: 'Update enrollment status (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
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
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminEnrollmentController.updateStatus
  );

  // DELETE /api/admin/enrollments/:id - Delete enrollment (Admin only)
  fastify.delete(
    '/:id',
    {
      schema: {
        ...enrollmentTag,
        description: 'Delete enrollment (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'null' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminEnrollmentController.deleteEnrollment
  );

  // GET /api/admin/enrollments/statistics - Get enrollment statistics (Admin only)
  fastify.get(
    '/statistics',
    {
      schema: {
        ...enrollmentTag,
        description: 'Get enrollment statistics (Admin only)',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminEnrollmentController.getEnrollmentStats
  );
}
