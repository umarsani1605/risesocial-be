import { adminJobsController } from '../../controllers/admin/jobsController.js';
import { authMiddleware } from '../../middleware/auth.js';
import {
  getAdminJobsSchema,
  getAdminJobByIdSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
  syncLinkedInJobsSchema,
  getJobStatisticsSchema,
  getAllJobsStatisticsSchema,
} from '../../schemas/admin/jobsSchemas.js';

export async function jobsRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', { schema: getAdminJobsSchema }, adminJobsController.getJobs);
  fastify.get('/statistics', { schema: getAllJobsStatisticsSchema }, adminJobsController.getAllJobsStatistics);
  fastify.get('/:id', { schema: getAdminJobByIdSchema }, adminJobsController.getJobById);
  fastify.get('/:id/statistics', { schema: getJobStatisticsSchema }, adminJobsController.getJobStatistics);
  fastify.post('/sync-linkedin', { schema: syncLinkedInJobsSchema }, adminJobsController.syncLinkedInJobs);
  fastify.post('/', { schema: createJobSchema }, adminJobsController.createJob);
  fastify.put('/:id', { schema: updateJobSchema }, adminJobsController.updateJob);
  fastify.delete('/:id', { schema: deleteJobSchema }, adminJobsController.deleteJob);
}

export default jobsRoutes;
