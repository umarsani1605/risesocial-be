import { adminPermissionController } from '../../controllers/admin/permissionController.js';
import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';
import { listRegistrySchema } from '../../schemas/admin/permissionSchemas.js';

const superadminOnly = [authMiddleware, authorizeRoles(['SUPERADMIN'])];

export default async function adminPermissionRoutes(fastify) {
  // GET /admin/permissions
  fastify.get('/', {
    schema: listRegistrySchema,
    preHandler: superadminOnly,
    handler: adminPermissionController.listRegistry,
  });
}
