import UserJobsController from '../../controllers/user/jobsController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';

const userJobsController = new UserJobsController();

/**
 * User Jobs routes plugin
 * @param {Object} fastify - Fastify instance
 */
export async function jobsRoutes(fastify) {
  const jobsTag = { tags: ['User Jobs'] };

  // GET /api/jobs - Get all jobs with search and filtering
  fastify.get(
    '/',
    {
      schema: {
        ...jobsTag,
      },
      preHandler: optionalAuthMiddleware,
    },
    userJobsController.getJobs
  );

  // GET /api/jobs/featured - Get featured jobs
  fastify.get(
    '/featured',
    {
      schema: {
        ...jobsTag,
      },
    },
    userJobsController.getFeaturedJobs
  );

  // GET /api/jobs/categories - Get job categories
  fastify.get(
    '/categories',
    {
      schema: {
        ...jobsTag,
      },
    },
    userJobsController.getJobCategories
  );

  // GET /api/jobs/company - Get companies with filtering
  fastify.get(
    '/company',
    {
      schema: {
        ...jobsTag,
      },
      preHandler: optionalAuthMiddleware,
    },
    userJobsController.getCompanies
  );

  // GET /api/jobs/search - Search jobs
  fastify.get(
    '/search',
    {
      schema: {
        ...jobsTag,
      },
    },
    userJobsController.searchJobs
  );

  // GET /api/jobs/:id - Get job by ID
  fastify.get(
    '/:id',
    {
      schema: {
        ...jobsTag,
      },
      preHandler: optionalAuthMiddleware,
    },
    userJobsController.getJobById
  );

  // GET /api/jobs/:id/recommendations - Get job recommendations
  fastify.get(
    '/:id/recommendations',
    {
      schema: {
        ...jobsTag,
      },
    },
    userJobsController.getJobRecommendations
  );
}

export default jobsRoutes;
