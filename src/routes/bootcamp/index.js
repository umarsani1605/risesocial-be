import { bootcampController } from '../../controllers/bootcamp/bootcampController.js';
import { requireRole } from '../../lib/jwt.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';

/**
 * Bootcamp routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function bootcampRoutes(fastify) {
  const bootcampTag = { tags: ['Bootcamp'] };

  // ================================
  // PUBLIC ROUTES
  // ================================

  // GET /api/bootcamps - Get all bootcamps with pagination and filtering
  fastify.get(
    '/',
    {
      schema: {
        ...bootcampTag,
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            category: { type: 'string' },
            search: { type: 'string' },
            minRating: { type: 'number', minimum: 0, maximum: 5 },
            includeRelations: { type: 'boolean', default: false },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'array' },
              meta: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' },
                  hasNext: { type: 'boolean' },
                  hasPrev: { type: 'boolean' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: optionalAuthMiddleware,
    },
    bootcampController.getAllBootcamps
  );

  // GET /api/bootcamps/featured - Get featured bootcamps
  fastify.get(
    '/featured',
    {
      schema: {
        ...bootcampTag,
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 6 },
          },
        },
      },
    },
    bootcampController.getFeaturedBootcamps
  );

  // GET /api/bootcamps/categories - Get available categories
  fastify.get(
    '/categories',
    {
      schema: {
        ...bootcampTag,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'array',
                items: { type: 'string' },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    bootcampController.getCategories
  );

  // GET /api/bootcamps/:slug - Get bootcamp by slug
  fastify.get(
    '/:slug',
    {
      schema: {
        ...bootcampTag,
        params: {
          type: 'object',
          properties: {
            slug: { type: 'string', minLength: 3, maxLength: 100 },
          },
          required: ['slug'],
        },
      },
      preHandler: optionalAuthMiddleware,
    },
    bootcampController.getBootcampBySlug
  );

  // ================================
  // ADMIN ROUTES (Protected)
  // ================================

  // Register protected routes
  fastify.register(async function (protectedRoutes) {
    // POST /api/bootcamps - Create new bootcamp (Admin only)
    protectedRoutes.post(
      '/',
      {
        schema: {
          ...bootcampTag,
          body: {
            type: 'object',
            required: ['title', 'description'],
            properties: {
              title: { type: 'string', minLength: 3, maxLength: 255 },
              path_slug: { type: 'string', pattern: '^[a-z0-9-]+$', minLength: 3, maxLength: 100 },
              description: { type: 'string', minLength: 10 },
              duration: { type: 'string', maxLength: 100 },
              format: { type: 'string', maxLength: 100 },
              category: { type: 'string', maxLength: 100 },
              image_url: { type: 'string', format: 'uri', maxLength: 500 },
              certificate: { type: 'boolean', default: false },
              portfolio: { type: 'boolean', default: false },
              status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' },
              meta_title: { type: 'string', maxLength: 255 },
              meta_description: { type: 'string', maxLength: 500 },
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
        preHandler: requireRole(['admin']),
      },
      bootcampController.createBootcamp
    );

    // PUT /api/bootcamps/:id - Update bootcamp (Admin only)
    protectedRoutes.put(
      '/:id',
      {
        schema: {
          ...bootcampTag,
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
              title: { type: 'string', minLength: 3, maxLength: 255 },
              path_slug: { type: 'string', pattern: '^[a-z0-9-]+$', minLength: 3, maxLength: 100 },
              description: { type: 'string', minLength: 10 },
              duration: { type: 'string', maxLength: 100 },
              format: { type: 'string', maxLength: 100 },
              category: { type: 'string', maxLength: 100 },
              image_url: { type: 'string', format: 'uri', maxLength: 500 },
              certificate: { type: 'boolean' },
              portfolio: { type: 'boolean' },
              status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
              meta_title: { type: 'string', maxLength: 255 },
              meta_description: { type: 'string', maxLength: 500 },
            },
          },
        },
        preHandler: requireRole(['admin']),
      },
      bootcampController.updateBootcamp
    );

    // DELETE /api/bootcamps/:id - Delete bootcamp (Admin only)
    protectedRoutes.delete(
      '/:id',
      {
        schema: {
          ...bootcampTag,
          params: {
            type: 'object',
            properties: {
              id: { type: 'integer', minimum: 1 },
            },
            required: ['id'],
          },
        },
        preHandler: requireRole(['admin']),
      },
      bootcampController.deleteBootcamp
    );

    // GET /api/bootcamps/admin/statistics - Get statistics (Admin only)
    protectedRoutes.get(
      '/admin/statistics',
      {
        schema: {
          ...bootcampTag,
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    active: { type: 'integer' },
                    byCategory: { type: 'object' },
                  },
                },
                timestamp: { type: 'string' },
              },
            },
          },
        },
        preHandler: requireRole(['admin']),
      },
      bootcampController.getStatistics
    );
  });
}
