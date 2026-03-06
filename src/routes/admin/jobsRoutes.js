import { adminJobsController } from '../../controllers/admin/jobsController.js';
import { authMiddleware } from '../../middleware/auth.js';

export async function jobsRoutes(fastify) {
  const jobsTag = { tags: ['Admin Jobs'] };

  fastify.addHook('preHandler', authMiddleware);

  fastify.get(
    '/',
    {
      schema: {
        ...jobsTag,
        summary: 'Get all jobs for admin',
        description: 'Retrieve all jobs with optional status filter',
        querystring: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'all'],
              default: 'all',
              description: 'Filter by job status',
            },
            page: { type: 'integer', minimum: 1, description: 'Page number' },
            limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Items per page' },
          },
        },
      },
    },
    adminJobsController.getJobs,
  );

  fastify.get(
    '/statistics',
    {
      schema: { ...jobsTag, description: 'Get all jobs statistics' },
    },
    adminJobsController.getAllJobsStatistics,
  );

  fastify.get(
    '/:id',
    {
      schema: {
        ...jobsTag,
        description: 'Get job by ID',
        params: {
          type: 'object',
          properties: { id: { type: 'integer' } },
          required: ['id'],
        },
      },
    },
    adminJobsController.getJobById,
  );

  fastify.get(
    '/:id/statistics',
    {
      schema: {
        ...jobsTag,
        description: 'Get job statistics by ID',
        params: {
          type: 'object',
          properties: { id: { type: 'integer' } },
          required: ['id'],
        },
      },
    },
    adminJobsController.getJobStatistics,
  );

  fastify.post(
    '/sync-linkedin',
    {
      schema: { ...jobsTag, description: 'Sync jobs from LinkedIn' },
    },
    adminJobsController.syncLinkedInJobs,
  );

  fastify.post(
    '/',
    {
      schema: {
        ...jobsTag,
        description: 'Create a new job',
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            jobType: { type: 'string' },
            experienceLevel: { type: 'string' },
          },
          required: ['title'],
        },
      },
    },
    adminJobsController.createJob,
  );

  fastify.put(
    '/:id',
    {
      schema: {
        ...jobsTag,
        description: 'Update a job',
        params: {
          type: 'object',
          properties: { id: { type: 'integer' } },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            jobType: { type: 'string' },
            experienceLevel: { type: 'string' },
          },
        },
      },
    },
    adminJobsController.updateJob,
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        ...jobsTag,
        description: 'Delete a job',
        params: {
          type: 'object',
          properties: { id: { type: 'integer' } },
          required: ['id'],
        },
      },
    },
    adminJobsController.deleteJob,
  );
}

export default jobsRoutes;
