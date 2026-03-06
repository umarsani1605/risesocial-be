import { authController } from '../controllers/auth/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { loginSchema, registerSchema, getCurrentUserSchema, logoutSchema } from '../schemas/shared/userSchemas.js';

async function authRoutes(fastify, options) {
  const authTag = { tags: ['Auth'] };

  fastify.post('/login', { schema: { ...loginSchema, ...authTag } }, authController.login);
  fastify.post('/register', { schema: { ...registerSchema, ...authTag } }, authController.register);
  fastify.get(
    '/session',
    {
      schema: { ...getCurrentUserSchema, ...authTag },
      preHandler: authMiddleware,
    },
    authController.getCurrentUser,
  );
  fastify.post(
    '/logout',
    {
      schema: { ...logoutSchema, ...authTag },
      preHandler: authMiddleware,
    },
    authController.logout,
  );
}

export default authRoutes;
