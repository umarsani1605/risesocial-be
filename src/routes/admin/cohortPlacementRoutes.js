import { adminPlacementController } from '../../controllers/admin/placementController.js';
import { dropPlacementSchema } from '../../schemas/admin/placementSchemas.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';

export default async function cohortPlacementRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);

  fastify.post('/:id/drop', {
    schema: dropPlacementSchema,
    preHandler: requirePermission('admin.cohort', 'EDITOR'),
    handler: adminPlacementController.dropPlacement,
  });
}
