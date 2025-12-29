import { userJobsController } from '../../controllers/user/jobsController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import {
  getUserJobsSchema,
  getFeaturedJobsSchema,
  getJobCategoriesSchema,
  getUserCompaniesSchema,
  getUserSearchJobsSchema,
  getUserJobByIdSchema,
  getJobRecommendationsSchema,
} from '../../schemas/jobsSchemas.js';

export async function jobsRoutes(fastify) {
  fastify.get('/', {
    schema: getUserJobsSchema,
    preHandler: optionalAuthMiddleware,
    handler: userJobsController.getJobs,
  });

  fastify.get('/featured', {
    schema: getFeaturedJobsSchema,
    handler: userJobsController.getFeaturedJobs,
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

  fastify.get('/search', {
    schema: getUserSearchJobsSchema,
    handler: userJobsController.searchJobs,
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
