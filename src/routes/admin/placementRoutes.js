import { adminPlacementController } from '../../controllers/admin/placementController.js';
import { listEnrollmentsSchema, getEnrollmentSchema, assignToCohortSchema } from '../../schemas/admin/placementSchemas.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';

export default async function placementRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);
  const VIEW = requirePermission('admin.cohort');
  const EDIT = requirePermission('admin.cohort', 'EDITOR');

  fastify.get('/', {
    schema: listEnrollmentsSchema,
    preHandler: VIEW,
    handler: adminPlacementController.listEnrollments,
  });

  fastify.get('/:id', {
    schema: getEnrollmentSchema,
    preHandler: VIEW,
    handler: adminPlacementController.getEnrollmentDetail,
  });

  fastify.post('/:id/assign', {
    schema: assignToCohortSchema,
    preHandler: EDIT,
    handler: adminPlacementController.assignToCohort,
  });
}
