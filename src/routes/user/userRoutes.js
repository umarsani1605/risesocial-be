import { userUserController } from '../../controllers/user/userController.js';
import { authMiddleware } from '../../middleware/auth.js';

/**
 * User Self-Management routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function userUserRoutes(fastify) {
  const userTag = { tags: ['User Self-Management'] };
  const utilityTag = { tags: ['User Utilities'] };

  // ================================
  // USER SETTINGS ROUTES (Authenticated Users)
  // ================================

  // GET /api/users/profile - Get current user profile
  fastify.get(
    '/profile',
    {
      schema: {
        ...userTag,
        description: 'Get current user profile',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    userUserController.getCurrentUser
  );

  // GET /api/users/settings - Get user notification settings
  fastify.get(
    '/settings',
    {
      schema: {
        ...userTag,
        description: 'Get user notification settings',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    userUserController.getUserSettings
  );

  // PUT /api/users/settings - Update user notification settings
  fastify.put(
    '/settings',
    {
      schema: {
        ...userTag,
        description: 'Update user notification settings',
        body: {
          type: 'object',
          properties: {
            job_notification: { type: 'boolean' },
            program_notification: { type: 'boolean' },
            promo_notification: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    userUserController.updateUserSettings
  );

  // ================================
  // UTILITY ROUTES (Public)
  // ================================

  // GET /api/users/check-username/:username - Check username availability
  fastify.get(
    '/check-username/:username',
    {
      schema: {
        ...utilityTag,
        description: 'Check username availability',
        params: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 30 },
          },
          required: ['username'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    userUserController.checkUsernameAvailability
  );

  // GET /api/users/username-suggestions - Generate username suggestions
  fastify.get(
    '/username-suggestions',
    {
      schema: {
        ...utilityTag,
        description: 'Generate username suggestions',
        querystring: {
          type: 'object',
          properties: {
            first_name: { type: 'string', minLength: 1 },
            last_name: { type: 'string', minLength: 1 },
          },
          required: ['first_name', 'last_name'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'array' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    userUserController.generateUsernameSuggestions
  );
}
