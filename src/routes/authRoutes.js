import { authController } from '../controllers/auth/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { loginSchema, registerSchema, getCurrentUserSchema, logoutSchema } from '../schemas/userSchemas.js';

export default async function authRoutes(fastify) {
  fastify.post('/login', { schema: loginSchema }, authController.login);
  fastify.post('/register', { schema: registerSchema }, authController.register);
  fastify.get('/session', { schema: getCurrentUserSchema, preHandler: authMiddleware }, authController.getCurrentUser);
  fastify.post('/logout', { schema: logoutSchema, preHandler: authMiddleware }, authController.logout);
}
