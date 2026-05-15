import { adminPlacementController } from '../../controllers/admin/placementController.js';
import { dropPlacementSchema } from '../../schemas/admin/placementSchemas.js';
import { adminMiddleware } from '../../middleware/auth.js';

export default async function cohortPlacementRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);

  fastify.post('/:id/drop', {
    schema: dropPlacementSchema,
    handler: adminPlacementController.dropPlacement,
  });
}
