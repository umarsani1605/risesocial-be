// src/routes/authRoutes.js
import { authController } from '../controllers/auth/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { loginSchema, registerSchema, getCurrentUserSchema } from '../schemas/userSchemas.js';

/**
 * Plugin Fastify untuk mendaftarkan semua route terkait Autentikasi.
 * @param {import('fastify').FastifyInstance} fastify - Instance Fastify
 * @param {object} options - Opsi plugin
 */
async function authRoutes(fastify, options) {
  const authTag = { tags: ['Auth'] };

  // POST /api/auth/login - Endpoint untuk login user
  fastify.post('/login', { schema: { ...loginSchema, ...authTag } }, authController.login);

  // POST /api/auth/register - Endpoint untuk register user baru
  fastify.post('/register', { schema: { ...registerSchema, ...authTag } }, authController.register);

  // GET /api/auth/me - Endpoint untuk get current user profile (protected)
  fastify.get(
    '/me',
    {
      schema: { ...getCurrentUserSchema, ...authTag },
      preHandler: authMiddleware,
    },
    authController.getCurrentUser
  );
}

export default authRoutes;
