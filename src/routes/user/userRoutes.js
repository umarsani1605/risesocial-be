import { userController } from '../../controllers/user/userController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadUserAvatar } from '../../middleware/fileUploadMiddleware.js';

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
      preHandler: authMiddleware,
    },
    userController.getCurrentUser
  );

  // GET /api/users/settings - Get user settings
  fastify.get(
    '/settings',
    {
      preHandler: authMiddleware,
    },
    userController.getUserSettings
  );

  // PUT /api/users/settings - Update user settings
  fastify.put(
    '/settings',
    {
      preHandler: authMiddleware,
    },
    userController.updateUserSettings
  );

  // GET /api/users/notification-preferences - Get notification preferences
  fastify.get(
    '/notification-preferences',
    {
      preHandler: authMiddleware,
    },
    userController.getNotificationPreferences
  );

  // PUT /api/users/notification-preferences - Update notification preferences
  fastify.put(
    '/notification-preferences',
    {
      preHandler: authMiddleware,
    },
    userController.updateNotificationPreferences
  );

  // PUT /api/users/account - Update user account information
  fastify.put(
    '/account',
    {
      preHandler: [authMiddleware, uploadUserAvatar],
    },
    userController.updateUserAccount
  );

  // PUT /api/users/security - Update user password
  fastify.put(
    '/security',
    {
      preHandler: authMiddleware,
    },
    userController.updateUserPassword
  );
}
