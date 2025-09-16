import { userTestimonialsController } from '../../controllers/user/testimonialsController.js';

/**
 * User Testimonials routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function userTestimonialsRoutes(fastify) {
  const testimonialsTag = { tags: ['User Testimonials'] };

  // GET /api/testimonials - Get all testimonials with search and filtering
  fastify.get(
    '/',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get all active testimonials with search and filtering',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string' },
            country: { type: 'string' },
            minRating: { type: 'integer', minimum: 1, maximum: 5 },
            featured: { type: 'boolean' },
            sortBy: { type: 'string', enum: ['createdAt', 'name', 'rating', 'country'], default: 'createdAt' },
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
    },
    userTestimonialsController.getTestimonials
  );

  // GET /api/testimonials/featured - Get featured testimonials
  fastify.get(
    '/featured',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get featured testimonials',
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 6 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'array' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    userTestimonialsController.getFeaturedTestimonials
  );

  // GET /api/testimonials/by-country - Get testimonials by country
  fastify.get(
    '/by-country',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get testimonials by country',
        querystring: {
          type: 'object',
          required: ['country'],
          properties: {
            country: { type: 'string', minLength: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'array' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    userTestimonialsController.getTestimonialsByCountry
  );

  // GET /api/testimonials/by-rating - Get testimonials by rating
  fastify.get(
    '/by-rating',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get testimonials by rating',
        querystring: {
          type: 'object',
          required: ['rating'],
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'array' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    userTestimonialsController.getTestimonialsByRating
  );

  // GET /api/testimonials/countries - Get countries with testimonial counts
  fastify.get(
    '/countries',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get countries with testimonial counts',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'array' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    userTestimonialsController.getCountriesWithCounts
  );

  // GET /api/testimonials/:id - Get testimonial by ID
  fastify.get(
    '/:id',
    {
      schema: {
        ...testimonialsTag,
        description: 'Get testimonial by ID',
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
    },
    userTestimonialsController.getTestimonialById
  );
}
