import { JobsController } from '../../controllers/jobs/jobsController.js';

const jobsController = new JobsController();
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth.js';
import { createJobSchema, updateJobSchema, searchJobsSchema, jobRecommendationsSchema, jobIdSchema } from '../../schemas/jobsSchemas.js';

/**
 * Jobs routes plugin
 * @param {Object} fastify - Fastify instance
 */
export async function jobsRoutes(fastify) {
  const jobsTag = { tags: ['Jobs'] };

  // ================================
  // PUBLIC ROUTES
  // ================================

  // GET /api/jobs - Get all jobs with search and filtering
  fastify.get(
    '/',
    {
      schema: {
        ...jobsTag,
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string' },
            location: { type: 'string' },
            jobType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE'] },
            experienceLevel: { type: 'string', enum: ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR'] },
            minSalary: { type: 'integer' },
            maxSalary: { type: 'integer' },
            isRemote: { type: 'boolean' },
            companyName: { type: 'string' },
            skills: { type: 'string' },
            sortBy: { type: 'string', enum: ['createdAt', 'title', 'company', 'location', 'minSalary', 'maxSalary'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: optionalAuthMiddleware,
    },
    jobsController.getJobs.bind(jobsController)
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
    jobsController.getFeaturedJobs.bind(jobsController)
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
    jobsController.getJobCategories.bind(jobsController)
  );

  // GET /api/jobs/search - Search jobs
  fastify.get(
    '/search',
    {
      schema: {
        ...jobsTag,
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string' },
            location: { type: 'string' },
            jobType: { type: 'string' },
            experienceLevel: { type: 'string' },
            skills: { type: 'string' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        },
      },
    },
    jobsController.searchJobs.bind(jobsController)
  );

  // GET /api/jobs/:id - Get job by ID
  fastify.get(
    '/:id',
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
      },
      preHandler: optionalAuthMiddleware,
    },
    jobsController.getJobById.bind(jobsController)
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
    jobsController.getJobRecommendations
  );

  // ================================
  // PROTECTED ROUTES (Admin only)
  // ================================

  // Register protected routes
  fastify.register(async function (protectedRoutes) {
    // POST /api/jobs - Create new job (Admin only)
    protectedRoutes.post(
      '/',
      {
        schema: {
          ...jobsTag,
          body: {
            type: 'object',
            required: ['title', 'description', 'company', 'location', 'jobType', 'experienceLevel'],
            properties: {
              title: { type: 'string', minLength: 3, maxLength: 255 },
              description: { type: 'string', minLength: 10 },
              company: { type: 'string', minLength: 2, maxLength: 255 },
              location: { type: 'string', minLength: 2, maxLength: 255 },
              jobType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE'] },
              experienceLevel: { type: 'string', enum: ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR'] },
              minSalary: { type: 'integer', minimum: 0 },
              maxSalary: { type: 'integer', minimum: 0 },
              skills: { type: 'array', items: { type: 'string' } },
              requirements: { type: 'array', items: { type: 'string' } },
              benefits: { type: 'array', items: { type: 'string' } },
              isRemote: { type: 'boolean', default: false },
              applicationDeadline: { type: 'string', format: 'date-time' },
              applicationUrl: { type: 'string', format: 'uri' },
              contactEmail: { type: 'string', format: 'email' },
              companyDescription: { type: 'string' },
              companyWebsite: { type: 'string', format: 'uri' },
              companySize: { type: 'string' },
            },
          },
        },
        preHandler: authMiddleware,
      },
      jobsController.createJob
    );

    // PUT /api/jobs/:id - Update job (Admin only)
    protectedRoutes.put(
      '/:id',
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
          body: {
            type: 'object',
            properties: {
              title: { type: 'string', minLength: 3, maxLength: 255 },
              description: { type: 'string', minLength: 10 },
              company: { type: 'string', minLength: 2, maxLength: 255 },
              location: { type: 'string', minLength: 2, maxLength: 255 },
              jobType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE'] },
              experienceLevel: { type: 'string', enum: ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR'] },
              minSalary: { type: 'integer', minimum: 0 },
              maxSalary: { type: 'integer', minimum: 0 },
              skills: { type: 'array', items: { type: 'string' } },
              requirements: { type: 'array', items: { type: 'string' } },
              benefits: { type: 'array', items: { type: 'string' } },
              isRemote: { type: 'boolean' },
              applicationDeadline: { type: 'string', format: 'date-time' },
              applicationUrl: { type: 'string', format: 'uri' },
              contactEmail: { type: 'string', format: 'email' },
              companyDescription: { type: 'string' },
              companyWebsite: { type: 'string', format: 'uri' },
              companySize: { type: 'string' },
            },
          },
        },
        preHandler: authMiddleware,
      },
      jobsController.updateJob
    );

    // DELETE /api/jobs/:id - Delete job (Admin only)
    protectedRoutes.delete(
      '/:id',
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
        },
        preHandler: authMiddleware,
      },
      jobsController.deleteJob
    );

    // GET /api/jobs/:id/statistics - Get job statistics (Admin only)
    protectedRoutes.get(
      '/:id/statistics',
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
        },
        preHandler: authMiddleware,
      },
      jobsController.getJobStatistics
    );

    // GET /api/jobs/admin/statistics - Get all jobs statistics (Admin only)
    protectedRoutes.get(
      '/admin/statistics',
      {
        schema: {
          ...jobsTag,
        },
        preHandler: authMiddleware,
      },
      jobsController.getAllJobsStatistics
    );
  });
}

export default jobsRoutes;
