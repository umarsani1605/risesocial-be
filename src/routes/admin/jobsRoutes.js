import { adminJobsController } from '../../controllers/admin/jobsController.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';
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
  fastify.addHook('preHandler', adminMiddleware);

  fastify.get('/', { schema: getAdminJobsSchema, preHandler: requirePermission('admin.jobs') }, adminJobsController.getJobs);
  fastify.get('/statistics', { schema: getAllJobsStatisticsSchema, preHandler: requirePermission('admin.jobs') }, adminJobsController.getAllJobsStatistics);
  fastify.get('/:id', { schema: getAdminJobByIdSchema, preHandler: requirePermission('admin.jobs') }, adminJobsController.getJobById);
  fastify.get('/:id/statistics', { schema: getJobStatisticsSchema, preHandler: requirePermission('admin.jobs') }, adminJobsController.getJobStatistics);
  fastify.post('/sync-linkedin', { schema: syncLinkedInJobsSchema, preHandler: requirePermission('admin.jobs', 'EDITOR') }, adminJobsController.syncLinkedInJobs);
  fastify.post('/', { schema: createJobSchema, preHandler: requirePermission('admin.jobs', 'EDITOR') }, adminJobsController.createJob);
  fastify.put('/:id', { schema: updateJobSchema, preHandler: requirePermission('admin.jobs', 'EDITOR') }, adminJobsController.updateJob);
  fastify.delete('/:id', { schema: deleteJobSchema, preHandler: requirePermission('admin.jobs', 'EDITOR') }, adminJobsController.deleteJob);
}

export default jobsRoutes;
