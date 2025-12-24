import { adminUserController } from '../../controllers/admin/userController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { createUserSchema, updateUserSchema } from '../../schemas/userSchemas.js';

export default async function adminUserRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', adminUserController.getAllUsers);
  fastify.get('/:id', adminUserController.getUserById);
  fastify.post('/', { schema: createUserSchema }, adminUserController.createUser);
  fastify.put('/:id', { schema: updateUserSchema }, adminUserController.updateUser);
  fastify.delete('/:id', adminUserController.deleteUser);
}
