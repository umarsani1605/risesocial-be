import AdminJobsController from '../../controllers/admin/jobsController.js';
import { authMiddleware } from '../../middleware/auth.js';

const adminJobsController = new AdminJobsController();

/**
 * Admin Jobs routes plugin
 * @param {Object} fastify - Fastify instance
 */
export async function jobsRoutes(fastify) {
  const jobsTag = { tags: ['Admin Jobs'] };

  fastify.addHook('preHandler', authMiddleware);

  fastify.post(
    '/sync-linkedin',
    {
      schema: {
        ...jobsTag,
      },
    },
    adminJobsController.syncLinkedInJobs
  );

  fastify.post(
    '/',
    {
      schema: {
        ...jobsTag,
      },
    },
    adminJobsController.createJob
  );

  fastify.put(
    '/:id',
    {
      schema: {
        ...jobsTag,
      },
    },
    adminJobsController.updateJob
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        ...jobsTag,
      },
    },
    adminJobsController.deleteJob
  );

  fastify.get(
    '/statistics',
    {
      schema: {
        ...jobsTag,
      },
    },
    adminJobsController.getAllJobsStatistics
  );

  fastify.get(
    '/:id/statistics',
    {
      schema: {
        ...jobsTag,
      },
    },
    adminJobsController.getJobStatistics
  );
}

export default jobsRoutes;
