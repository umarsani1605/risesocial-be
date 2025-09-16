import { adminInstructorController } from '../../controllers/admin/instructorController.js';
import { authMiddleware } from '../../middleware/auth.js';

/**
 * Admin Instructor routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function adminInstructorRoutes(fastify) {
  const instructorTag = { tags: ['Admin Instructors'] };

  // POST /api/admin/instructors - Create new instructor (Admin only)
  fastify.post(
    '/',
    {
      schema: {
        ...instructorTag,
        description: 'Create new instructor (Admin only)',
        body: {
          type: 'object',
          required: ['name', 'job_title'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 255 },
            job_title: { type: 'string', minLength: 2, maxLength: 255 },
            avatar_url: { type: 'string', format: 'uri' },
            description: { type: 'string' },
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
    adminInstructorController.createInstructor
  );

  // PUT /api/admin/instructors/:id - Update instructor (Admin only)
  fastify.put(
    '/:id',
    {
      schema: {
        ...instructorTag,
        description: 'Update instructor (Admin only)',
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
            name: { type: 'string', minLength: 2, maxLength: 255 },
            job_title: { type: 'string', minLength: 2, maxLength: 255 },
            avatar_url: { type: 'string', format: 'uri' },
            description: { type: 'string' },
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
    adminInstructorController.updateInstructor
  );

  // DELETE /api/admin/instructors/:id - Delete instructor (Admin only)
  fastify.delete(
    '/:id',
    {
      schema: {
        ...instructorTag,
        description: 'Delete instructor (Admin only)',
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
    adminInstructorController.deleteInstructor
  );

  // GET /api/admin/instructors/available/:bootcampId - Get available instructors for bootcamp (Admin only)
  fastify.get(
    '/available/:bootcampId',
    {
      schema: {
        ...instructorTag,
        description: 'Get available instructors for bootcamp (Admin only)',
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
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
    adminInstructorController.getAvailableInstructorsForBootcamp
  );

  // POST /api/admin/instructors/assign/:bootcampId - Assign instructor to bootcamp (Admin only)
  fastify.post(
    '/assign/:bootcampId',
    {
      schema: {
        ...instructorTag,
        description: 'Assign instructor to bootcamp (Admin only)',
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
        body: {
          type: 'object',
          required: ['instructor_id'],
          properties: {
            instructor_id: { type: 'integer', minimum: 1 },
            instructor_order: { type: 'integer', minimum: 1, default: 1 },
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
    adminInstructorController.assignInstructorToBootcamp
  );

  // DELETE /api/admin/instructors/remove/:bootcampId/:instructorId - Remove instructor from bootcamp (Admin only)
  fastify.delete(
    '/remove/:bootcampId/:instructorId',
    {
      schema: {
        ...instructorTag,
        description: 'Remove instructor from bootcamp (Admin only)',
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
            instructorId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId', 'instructorId'],
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
    adminInstructorController.removeInstructorFromBootcamp
  );

  // GET /api/admin/instructors/statistics - Get instructor statistics (Admin only)
  fastify.get(
    '/statistics',
    {
      schema: {
        ...instructorTag,
        description: 'Get instructor statistics (Admin only)',
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
    adminInstructorController.getInstructorStats
  );
}
