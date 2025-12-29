import { adminEnrollmentController } from '../../controllers/admin/enrollmentController.js';
import { authMiddleware } from '../../middleware/auth.js';
import {
  getAllEnrollmentsSchema,
  getAcademyEnrollmentsSchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  updateStatusSchema,
  deleteEnrollmentSchema,
  getEnrollmentStatsSchema,
} from '../../schemas/enrollmentSchemas.js';

export default async function adminEnrollmentRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', {
    schema: getAllEnrollmentsSchema,
    handler: adminEnrollmentController.getAllEnrollments,
  });

  fastify.get('/academy/:academyId', {
    schema: getAcademyEnrollmentsSchema,
    handler: adminEnrollmentController.getAcademyEnrollments,
  });

  fastify.post('/', {
    schema: createEnrollmentSchema,
    handler: adminEnrollmentController.createEnrollment,
  });

  fastify.put('/:id', {
    schema: updateEnrollmentSchema,
    handler: adminEnrollmentController.updateEnrollment,
  });

  fastify.put('/:id/status', {
    schema: updateStatusSchema,
    handler: adminEnrollmentController.updateStatus,
  });

  fastify.delete('/:id', {
    schema: deleteEnrollmentSchema,
    handler: adminEnrollmentController.deleteEnrollment,
  });

  fastify.get('/statistics', {
    schema: getEnrollmentStatsSchema,
    handler: adminEnrollmentController.getEnrollmentStats,
  });
}
