import { userJobsController } from '../../controllers/user/jobsController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import { getAllJobsSchema, getJobByIdSchema, searchJobsSchema, getCompaniesSchema } from '../../schemas/jobsSchemas.js';

export default async function userJobsRoutes(fastify) {
  fastify.get('/', { schema: getAllJobsSchema, preHandler: optionalAuthMiddleware }, userJobsController.getJobs);
  fastify.get('/featured', userJobsController.getFeaturedJobs);
  fastify.get('/categories', userJobsController.getJobCategories);
  fastify.get('/company', { schema: getCompaniesSchema, preHandler: optionalAuthMiddleware }, userJobsController.getCompanies);
  fastify.get('/search', { schema: searchJobsSchema }, userJobsController.searchJobs);
  fastify.get('/:id', { schema: getJobByIdSchema, preHandler: optionalAuthMiddleware }, userJobsController.getJobById);
  fastify.get('/:id/recommendations', userJobsController.getJobRecommendations);
}
