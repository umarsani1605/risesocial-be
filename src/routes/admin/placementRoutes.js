import { adminPlacementController } from '../../controllers/admin/placementController.js';
import { listEnrollmentsSchema, getEnrollmentSchema, assignToCohortSchema, cancelEnrollmentSchema } from '../../schemas/admin/placementSchemas.js';
import { adminMiddleware } from '../../middleware/auth.js';

export default async function placementRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);

  fastify.get('/', {
    schema: listEnrollmentsSchema,
    handler: adminPlacementController.listEnrollments,
  });

  fastify.get('/:id', {
    schema: getEnrollmentSchema,
    handler: adminPlacementController.getEnrollmentDetail,
  });

  fastify.post('/:id/assign', {
    schema: assignToCohortSchema,
    handler: adminPlacementController.assignToCohort,
  });

  fastify.post('/:id/cancel', {
    schema: cancelEnrollmentSchema,
    handler: adminPlacementController.cancelEnrollment,
  });
}
