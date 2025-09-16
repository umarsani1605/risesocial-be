import UserJobsController from '../../controllers/user/jobsController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import { getAllJobsSchema, getJobByIdSchema, searchJobsSchema, getJobStatsSchema, getCompaniesSchema } from '../../schemas/jobsSchemas.js';

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
        querystring: getAllJobsSchema.querystring,
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
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 6 },
          },
        },
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
    userJobsController.getJobCategories
  );

  // GET /api/jobs/company - Get companies with filtering
  fastify.get(
    '/company',
    {
      schema: {
        ...jobsTag,
        querystring: getCompaniesSchema.querystring,
        response: getCompaniesSchema.response,
      },
      preHandler: optionalAuthMiddleware,
    },
    userJobsController.getCompanies
  );

  // GET /api/jobs/search - Search jobs
  fastify.get(
    '/search',
    {
      schema: { ...searchJobsSchema, ...jobsTag },
    },
    userJobsController.searchJobs
  );

  // GET /api/jobs/:id - Get job by ID
  fastify.get(
    '/:id',
    {
      schema: { ...getJobByIdSchema, ...jobsTag },
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
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
          },
        },
      },
    },
    userJobsController.getJobRecommendations
  );
}

export default jobsRoutes;
