// src/routes/userRoutes.js
import { userController } from '../controllers/user/userController.js';
import { createUserSchema, updateUserSchema } from '../schemas/userSchemas.js';
// import { requireRole } from '../lib/jwt.js';

/**
 * Plugin Fastify untuk mendaftarkan semua route terkait User.
 * @param {import('fastify').FastifyInstance} fastify - Instance Fastify
 * @param {object} options - Opsi plugin
 */
async function userRoutes(fastify, options) {
  const userTag = { tags: ['User'] };
  const settingsTag = { tags: ['User Settings'] };
  const utilityTag = { tags: ['Utilities'] };

  // ================================
  // USER MANAGEMENT ROUTES (Admin Only)
  // ================================

  // GET /api/users - Mengambil semua user (Admin only)
  fastify.get('/', { schema: userTag }, userController.getAllUsers);

  // GET /api/users/:id - Mengambil user berdasarkan ID (Admin only)
  fastify.get('/:id', { schema: userTag }, userController.getUserById);

  // POST /api/users - Membuat user baru (Admin only)
  fastify.post('/', { schema: { ...createUserSchema, ...userTag } }, userController.createUser);

  // PUT /api/users/:id - Memperbarui user (Admin only)
  fastify.put('/:id', { schema: { ...updateUserSchema, ...userTag } }, userController.updateUser);

  // DELETE /api/users/:id - Menghapus user (Admin only)
  fastify.delete('/:id', { schema: userTag }, userController.deleteUser);

  // ================================
  // USER SETTINGS ROUTES (Authenticated Users)
  // ================================

  // GET /api/users/settings - Get user notification settings
  fastify.get('/settings', { schema: settingsTag }, userController.getUserSettings);

  // PUT /api/users/settings - Update user notification settings
  fastify.put(
    '/settings',
    {
      schema: {
        ...settingsTag,
        body: {
          type: 'object',
          properties: {
            job_notification: { type: 'boolean' },
            program_notification: { type: 'boolean' },
            promo_notification: { type: 'boolean' },
          },
        },
      },
    },
    userController.updateUserSettings
  );

  // ================================
  // UTILITY ROUTES (Public/Authenticated)
  // ================================

  // GET /api/users/check-username/:username - Check username availability
  fastify.get(
    '/check-username/:username',
    {
      schema: {
        ...utilityTag,
        params: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 30 },
          },
          required: ['username'],
        },
      },
    },
    userController.checkUsernameAvailability
  );

  // GET /api/users/username-suggestions - Generate username suggestions
  fastify.get(
    '/username-suggestions',
    {
      schema: {
        ...utilityTag,
        querystring: {
          type: 'object',
          properties: {
            first_name: { type: 'string', minLength: 1 },
            last_name: { type: 'string', minLength: 1 },
          },
          required: ['first_name', 'last_name'],
        },
      },
    },
    userController.generateUsernameSuggestions
  );
}

export default userRoutes;
