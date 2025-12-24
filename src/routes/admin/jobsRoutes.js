import { adminJobsController } from '../../controllers/admin/jobsController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { createJobSchema, updateJobSchema, deleteJobSchema } from '../../schemas/jobsSchemas.js';

export default async function adminJobsRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/statistics', adminJobsController.getAllJobsStatistics);
  fastify.get('/:id/statistics', adminJobsController.getJobStatistics);
  fastify.post('/sync-linkedin', adminJobsController.syncLinkedInJobs);
  fastify.post('/', { schema: createJobSchema }, adminJobsController.createJob);
  fastify.put('/:id', { schema: updateJobSchema }, adminJobsController.updateJob);
  fastify.delete('/:id', { schema: deleteJobSchema }, adminJobsController.deleteJob);
}
