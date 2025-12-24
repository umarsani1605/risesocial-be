import { userAcademyController } from '../../controllers/user/academyController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import { getAllAcademiesSchema, getAcademyCategoriesSchema, getAcademyBySlugSchema } from '../../schemas/academySchemas.js';

export default async function userAcademyRoutes(fastify) {
  fastify.get('/', { schema: getAllAcademiesSchema, preHandler: optionalAuthMiddleware }, userAcademyController.getAcademys);
  fastify.get('/categories', { schema: getAcademyCategoriesSchema }, userAcademyController.getCategories);
  fastify.get('/:slug', { schema: getAcademyBySlugSchema, preHandler: optionalAuthMiddleware }, userAcademyController.getAcademyBySlug);
}
