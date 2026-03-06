import { userJobsController } from '../../controllers/user/jobsController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import {
  getUserJobsSchema,
  getJobCategoriesSchema,
  getUserCompaniesSchema,
  getUserJobByIdSchema,
  getJobRecommendationsSchema,
} from '../../schemas/shared/jobsSchemas.js';

export async function jobsRoutes(fastify) {
  fastify.get('/', {
    schema: getUserJobsSchema,
    preHandler: optionalAuthMiddleware,
    handler: userJobsController.getJobs,
  });

  fastify.get('/categories', {
    schema: getJobCategoriesSchema,
    handler: userJobsController.getJobCategories,
  });

  fastify.get('/company', {
    schema: getUserCompaniesSchema,
    preHandler: optionalAuthMiddleware,
    handler: userJobsController.getCompanies,
  });

  fastify.get('/:id', {
    schema: getUserJobByIdSchema,
    preHandler: optionalAuthMiddleware,
    handler: userJobsController.getJobById,
  });

  fastify.get('/:id/recommendations', {
    schema: getJobRecommendationsSchema,
    handler: userJobsController.getJobRecommendations,
  });
}

export default jobsRoutes;
