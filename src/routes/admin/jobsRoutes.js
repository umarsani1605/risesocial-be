import AdminJobsController from '../../controllers/admin/jobsController.js';
import { authMiddleware } from '../../middleware/auth.js';
import {
  getAllJobsSchema,
  getJobByIdSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
  getJobStatsSchema,
} from '../../schemas/jobsSchemas.js';

const adminJobsController = new AdminJobsController();

/**
 * Admin Jobs routes plugin
 * @param {Object} fastify - Fastify instance
 */
export async function jobsRoutes(fastify) {
  const jobsTag = { tags: ['Admin Jobs'] };

  // All admin routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // POST /api/admin/jobs/sync-linkedin - Sync jobs from LinkedIn
  fastify.post(
    '/sync-linkedin',
    {
      schema: {
        ...jobsTag,
        body: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            filter: {
              type: 'object',
              properties: {
                title_filter: { type: 'array', items: { type: 'string' } },
                location_filter: { type: 'array', items: { type: 'string' } },
                description_filter: { type: 'array', items: { type: 'string' } },
                organization_description_filter: { type: 'array', items: { type: 'string' } },
                organization_specialties_filter: { type: 'array', items: { type: 'string' } },
                type_filter: { type: 'array', items: { type: 'string' } },
                industry_filter: { type: 'array', items: { type: 'string' } },
                seniority_filter: { type: 'array', items: { type: 'string' } },
              },
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  totalJobs: { type: 'number' },
                  savedJobs: { type: 'number' },
                  skippedJobs: { type: 'number' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    adminJobsController.syncLinkedInJobs
  );

  // POST /api/admin/jobs - Create new job
  fastify.post(
    '/',
    {
      schema: { ...createJobSchema, ...jobsTag },
    },
    adminJobsController.createJob
  );

  // PUT /api/admin/jobs/:id - Update job
  fastify.put(
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
    },
    adminJobsController.updateJob
  );

  // DELETE /api/admin/jobs/:id - Delete job
  fastify.delete(
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
    },
    adminJobsController.deleteJob
  );

  // GET /api/admin/jobs/statistics - Get all jobs statistics
  fastify.get(
    '/statistics',
    {
      schema: {
        ...jobsTag,
      },
    },
    adminJobsController.getAllJobsStatistics
  );

  // GET /api/admin/jobs/:id/statistics - Get job statistics by ID
  fastify.get(
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
    },
    adminJobsController.getJobStatistics
  );
}

export default jobsRoutes;
