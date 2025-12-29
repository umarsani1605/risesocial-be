import { adminTestimonialsController } from '../../controllers/admin/testimonialsController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadMiddleware } from '../../middleware/fileUploadMiddleware.js';

export default async function adminTestimonialsRoutes(fastify) {
  const testimonialsTag = { tags: ['Admin Testimonials'] };

  fastify.addHook('preHandler', authMiddleware);

  fastify.get(
    '/',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get all testimonials with all statuses (Admin only)',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING'] },
            country: { type: 'string' },
            minRating: { type: 'integer', minimum: 1, maximum: 5 },
            featured: { type: 'boolean' },
            sortBy: { type: 'string', enum: ['createdAt', 'name', 'rating', 'country', 'featured'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
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
    adminTestimonialsController.getTestimonialsForAdmin
  );

  fastify.post(
    '/',
    {
      schema: {
        ...testimonialsTag,
        description: 'Create new testimonial (Admin only)',
        body: {
          type: 'object',
          required: ['name', 'country', 'text'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 255 },
            country: { type: 'string', minLength: 2, maxLength: 255 },
            text: { type: 'string', minLength: 10 },
            rating: { type: 'integer', minimum: 1, maximum: 5, default: 5 },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING'], default: 'PENDING' },
            featured: { type: 'boolean', default: false },
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
    adminTestimonialsController.createTestimonial
  );

  fastify.put(
    '/:id',
    {
      schema: {
        ...testimonialsTag,
        description: 'Update testimonial (Admin only)',
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
            country: { type: 'string', minLength: 2, maxLength: 255 },
            text: { type: 'string', minLength: 10 },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING'] },
            featured: { type: 'boolean' },
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
    adminTestimonialsController.updateTestimonial
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        ...testimonialsTag,
        description: 'Delete testimonial (Admin only)',
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
    adminTestimonialsController.deleteTestimonial
  );

  fastify.get(
    '/:id/statistics',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get testimonial statistics (Admin only)',
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
        },
      },
      preHandler: authMiddleware,
    },
    adminTestimonialsController.getTestimonialStatistics
  );

  fastify.get(
    '/statistics',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get all testimonials statistics (Admin only)',
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
    adminTestimonialsController.getAllTestimonialsStatistics
  );

  fastify.put(
    '/:id/toggle-featured',
    {
      schema: {
        ...testimonialsTag,
        description: 'Toggle testimonial featured status (Admin only)',
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
        },
      },
      preHandler: authMiddleware,
    },
    adminTestimonialsController.toggleFeaturedTestimonial
  );

  fastify.put(
    '/:id/approve',
    {
      schema: {
        ...testimonialsTag,
        description: 'Approve testimonial (Admin only)',
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
        },
      },
      preHandler: authMiddleware,
    },
    adminTestimonialsController.approveTestimonial
  );

  fastify.put(
    '/:id/reject',
    {
      schema: {
        ...testimonialsTag,
        description: 'Reject testimonial (Admin only)',
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
        },
      },
      preHandler: authMiddleware,
    },
    adminTestimonialsController.rejectTestimonial
  );

  fastify.post(
    '/:id/avatar',
    {
      preHandler: [authMiddleware, uploadMiddleware],
      schema: {
        description: 'Upload testimonial avatar',
        tags: ['Admin Testimonials'],
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
    adminTestimonialsController.uploadTestimonialAvatar
  );
}
