import { userEnrollmentController } from '../../controllers/user/enrollmentController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';

/**
 * User Enrollment routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function userEnrollmentRoutes(fastify) {
  const enrollmentTag = { tags: ['User Enrollments'] };

  // GET /api/enrollments/:id - Get enrollment by ID (with user ownership check)
  fastify.get(
    '/:id',
    {
      schema: {
        ...enrollmentTag,
        description: 'Get enrollment by ID',
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
      preHandler: optionalAuthMiddleware,
    },
    userEnrollmentController.getEnrollmentById
  );

  // GET /api/enrollments/user/:userId/bootcamp/:bootcampId - Get enrollment by user and bootcamp
  fastify.get(
    '/user/:userId/bootcamp/:bootcampId',
    {
      schema: {
        ...enrollmentTag,
        description: 'Get enrollment by user and bootcamp',
        params: {
          type: 'object',
          properties: {
            userId: { type: 'integer', minimum: 1 },
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['userId', 'bootcampId'],
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
      preHandler: optionalAuthMiddleware,
    },
    userEnrollmentController.getEnrollmentByUserAndBootcamp
  );

  // GET /api/enrollments/user/:userId - Get user enrollments
  fastify.get(
    '/user/:userId',
    {
      schema: {
        ...enrollmentTag,
        description: 'Get user enrollments with pagination and filtering',
        params: {
          type: 'object',
          properties: {
            userId: { type: 'integer', minimum: 1 },
          },
          required: ['userId'],
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
      preHandler: optionalAuthMiddleware,
    },
    userEnrollmentController.getUserEnrollments
  );

  // PUT /api/enrollments/:id/progress - Update enrollment progress (user can update their own)
  fastify.put(
    '/:id/progress',
    {
      schema: {
        ...enrollmentTag,
        description: 'Update enrollment progress',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          required: ['progress_percentage'],
          properties: {
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
        },
      },
      preHandler: optionalAuthMiddleware,
    },
    userEnrollmentController.updateProgress
  );
}
