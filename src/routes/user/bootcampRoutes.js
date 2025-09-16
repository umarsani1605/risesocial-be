import { userBootcampController } from '../../controllers/user/bootcampController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import {
  getAllBootcampsSchema,
  getFeaturedBootcampsSchema,
  getBootcampCategoriesSchema,
  getBootcampBySlugSchema,
} from '../../schemas/bootcampSchemas.js';

/**
 * User Bootcamp routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function userBootcampRoutes(fastify) {
  // GET /api/bootcamps - Get all bootcamps with pagination and filtering
  fastify.get(
    '/',
    {
      schema: {
        ...getAllBootcampsSchema,
        response: {
          // Disable strict response schema validation to allow additional fields
          // 200: getAllBootcampsSchema.response[200],
        },
      },
      preHandler: optionalAuthMiddleware,
    },
    userBootcampController.getBootcamps
  );

  // GET /api/bootcamps/featured - Get featured bootcamps
  fastify.get('/featured', { schema: getFeaturedBootcampsSchema }, userBootcampController.getFeaturedBootcamps);

  // GET /api/bootcamps/categories - Get available categories
  fastify.get('/categories', { schema: getBootcampCategoriesSchema }, userBootcampController.getCategories);

  // GET /api/bootcamps/:slug - Get bootcamp by slug
  fastify.get(
    '/:slug',
    {
      schema: getBootcampBySlugSchema,
      preHandler: optionalAuthMiddleware,
    },
    userBootcampController.getBootcampBySlug
  );
}
