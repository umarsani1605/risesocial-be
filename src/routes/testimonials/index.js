import { TestimonialsController } from '../../controllers/testimonials/testimonialsController.js';

const testimonialsController = new TestimonialsController();
import { authMiddleware } from '../../middleware/auth.js';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  searchTestimonialsSchema,
  featuredTestimonialsSchema,
  testimonialIdSchema,
  testimonialsByCountrySchema,
  testimonialsByRatingSchema,
  adminSearchTestimonialsSchema,
} from '../../schemas/testimonialsSchemas.js';

/**
 * Testimonials routes plugin
 * @param {Object} fastify - Fastify instance
 */
export async function testimonialsRoutes(fastify) {
  const testimonialsTag = { tags: ['Testimonials'] };

  // ================================
  // PUBLIC ROUTES
  // ================================

  // GET /api/testimonials - Get all testimonials with search and filtering
  fastify.get(
    '/',
    {
      schema: {
        ...testimonialsTag,
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
      },
    },
    testimonialsController.getTestimonials
  );

  // GET /api/testimonials/featured - Get featured testimonials
  fastify.get(
    '/featured',
    {
      schema: {
        ...testimonialsTag,
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 6 },
          },
        },
      },
    },
    testimonialsController.getFeaturedTestimonials
  );

  // GET /api/testimonials/countries - Get testimonials by country
  fastify.get(
    '/countries',
    {
      schema: {
        ...testimonialsTag,
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
      },
    },
    testimonialsController.getTestimonialsByCountry
  );

  // GET /api/testimonials/ratings - Get testimonials by rating
  fastify.get(
    '/ratings',
    {
      schema: {
        ...testimonialsTag,
        querystring: {
          type: 'object',
          properties: {
            minRating: { type: 'integer', minimum: 1, maximum: 5, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
      },
    },
    testimonialsController.getTestimonialsByRating
  );

  // GET /api/testimonials/:id - Get testimonial by ID
  fastify.get(
    '/:id',
    {
      schema: {
        ...testimonialsTag,
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
      },
    },
    testimonialsController.getTestimonialById
  );

  // ================================
  // ADMIN ROUTES (Protected)
  // ================================

  // Register protected routes
  fastify.register(async function (protectedRoutes) {
    // POST /api/testimonials - Create new testimonial (Admin only)
    protectedRoutes.post(
      '/',
      {
        schema: {
          ...testimonialsTag,
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
        },
        preHandler: authMiddleware,
      },
      testimonialsController.createTestimonial
    );

    // PUT /api/testimonials/:id - Update testimonial (Admin only)
    protectedRoutes.put(
      '/:id',
      {
        schema: {
          ...testimonialsTag,
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
        },
        preHandler: authMiddleware,
      },
      testimonialsController.updateTestimonial
    );

    // DELETE /api/testimonials/:id - Delete testimonial (Admin only)
    protectedRoutes.delete(
      '/:id',
      {
        schema: {
          ...testimonialsTag,
          params: {
            type: 'object',
            properties: {
              id: { type: 'integer', minimum: 1 },
            },
            required: ['id'],
          },
        },
        preHandler: authMiddleware,
      },
      testimonialsController.deleteTestimonial
    );

    // GET /api/testimonials/admin/search - Admin search testimonials
    protectedRoutes.get(
      '/admin/search',
      {
        schema: {
          ...testimonialsTag,
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
        },
        preHandler: authMiddleware,
      },
      testimonialsController.adminSearchTestimonials
    );

    // GET /api/testimonials/:id/statistics - Get testimonial statistics (Admin only)
    protectedRoutes.get(
      '/:id/statistics',
      {
        schema: {
          ...testimonialsTag,
          params: {
            type: 'object',
            properties: {
              id: { type: 'integer', minimum: 1 },
            },
            required: ['id'],
          },
        },
        preHandler: authMiddleware,
      },
      testimonialsController.getTestimonialStatistics
    );

    // GET /api/testimonials/admin/statistics - Get all testimonials statistics (Admin only)
    protectedRoutes.get(
      '/admin/statistics',
      {
        schema: {
          ...testimonialsTag,
        },
        preHandler: authMiddleware,
      },
      testimonialsController.getAllTestimonialsStatistics
    );

    // PUT /api/testimonials/:id/toggle-featured - Toggle testimonial featured status (Admin only)
    protectedRoutes.put(
      '/:id/toggle-featured',
      {
        schema: {
          ...testimonialsTag,
          params: {
            type: 'object',
            properties: {
              id: { type: 'integer', minimum: 1 },
            },
            required: ['id'],
          },
        },
        preHandler: authMiddleware,
      },
      testimonialsController.toggleFeaturedTestimonial
    );

    // PUT /api/testimonials/:id/approve - Approve testimonial (Admin only)
    protectedRoutes.put(
      '/:id/approve',
      {
        schema: {
          ...testimonialsTag,
          params: {
            type: 'object',
            properties: {
              id: { type: 'integer', minimum: 1 },
            },
            required: ['id'],
          },
        },
        preHandler: authMiddleware,
      },
      testimonialsController.approveTestimonial
    );

    // PUT /api/testimonials/:id/reject - Reject testimonial (Admin only)
    protectedRoutes.put(
      '/:id/reject',
      {
        schema: {
          ...testimonialsTag,
          params: {
            type: 'object',
            properties: {
              id: { type: 'integer', minimum: 1 },
            },
            required: ['id'],
          },
        },
        preHandler: authMiddleware,
      },
      testimonialsController.rejectTestimonial
    );
  });
}

export default testimonialsRoutes;
