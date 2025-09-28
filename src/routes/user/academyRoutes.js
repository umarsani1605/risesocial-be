import { userAcademyController } from '../../controllers/user/academyController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';

/**
 * User Academy routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function userAcademyRoutes(fastify) {
  // GET /api/academies - Get all academies with pagination and filtering
  fastify.get(
    '/',
    {
      preHandler: optionalAuthMiddleware,
    },
    userAcademyController.getAcademys
  );

  // GET /api/academies/categories - Get available categories
  fastify.get('/categories', userAcademyController.getCategories);

  // GET /api/academies/:slug - Get academy by slug
  fastify.get(
    '/:slug',
    {
      preHandler: optionalAuthMiddleware,
    },
    userAcademyController.getAcademyBySlug
  );
}
