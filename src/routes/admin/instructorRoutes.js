import { adminInstructorController } from '../../controllers/admin/instructorController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadMiddleware } from '../../middleware/fileUploadMiddleware.js';

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

  // GET /api/admin/instructors/available/:academyId - Get available instructors for academy (Admin only)
  fastify.get(
    '/available/:academyId',
    {
      schema: {
        ...instructorTag,
        description: 'Get available instructors for academy (Admin only)',
        params: {
          type: 'object',
          properties: {
            academyId: { type: 'integer', minimum: 1 },
          },
          required: ['academyId'],
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
    adminInstructorController.getAvailableInstructorsForAcademy
  );

  // POST /api/admin/instructors/assign/:academyId - Assign instructor to academy (Admin only)
  fastify.post(
    '/assign/:academyId',
    {
      schema: {
        ...instructorTag,
        description: 'Assign instructor to academy (Admin only)',
        params: {
          type: 'object',
          properties: {
            academyId: { type: 'integer', minimum: 1 },
          },
          required: ['academyId'],
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
    adminInstructorController.assignInstructorToAcademy
  );

  // DELETE /api/admin/instructors/remove/:academyId/:instructorId - Remove instructor from academy (Admin only)
  fastify.delete(
    '/remove/:academyId/:instructorId',
    {
      schema: {
        ...instructorTag,
        description: 'Remove instructor from academy (Admin only)',
        params: {
          type: 'object',
          properties: {
            academyId: { type: 'integer', minimum: 1 },
            instructorId: { type: 'integer', minimum: 1 },
          },
          required: ['academyId', 'instructorId'],
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
    adminInstructorController.removeInstructorFromAcademy
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

  // Upload instructor avatar
  fastify.post(
    '/:id/avatar',
    {
      preHandler: [authMiddleware, uploadMiddleware],
      schema: {
        description: 'Upload instructor avatar',
        tags: ['Admin Instructors'],
        consumes: ['multipart/form-data'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  avatar_url: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    adminInstructorController.uploadInstructorAvatar
  );
}
