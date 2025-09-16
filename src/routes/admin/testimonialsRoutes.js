import { adminTestimonialsController } from '../../controllers/admin/testimonialsController.js';
import { authMiddleware } from '../../middleware/auth.js';

/**
 * Admin Testimonials routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function adminTestimonialsRoutes(fastify) {
  const testimonialsTag = { tags: ['Admin Testimonials'] };

  // GET /api/admin/testimonials - Get all testimonials for admin (Admin only)
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

  // POST /api/admin/testimonials - Create new testimonial (Admin only)
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

  // PUT /api/admin/testimonials/:id - Update testimonial (Admin only)
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

  // DELETE /api/admin/testimonials/:id - Delete testimonial (Admin only)
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

  // GET /api/admin/testimonials/:id/statistics - Get testimonial statistics (Admin only)
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

  // GET /api/admin/testimonials/statistics - Get all testimonials statistics (Admin only)
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

  // PUT /api/admin/testimonials/:id/toggle-featured - Toggle testimonial featured status (Admin only)
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

  // PUT /api/admin/testimonials/:id/approve - Approve testimonial (Admin only)
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

  // PUT /api/admin/testimonials/:id/reject - Reject testimonial (Admin only)
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
}
