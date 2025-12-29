import { userController } from '../../controllers/user/userController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadUserAvatar } from '../../middleware/fileUploadMiddleware.js';
import {
  getUserProfileSchema,
  getUserSettingsSchema,
  updateUserSettingsSchema,
  getNotificationPreferencesSchema,
  updateNotificationPreferencesSchema,
  updateUserAccountSchema,
  updateUserPasswordSchema,
} from '../../schemas/userSchemas.js';

export default async function userUserRoutes(fastify) {
  fastify.get('/profile', {
    schema: getUserProfileSchema,
    preHandler: authMiddleware,
    handler: userController.getCurrentUser,
  });

  fastify.get('/settings', {
    schema: getUserSettingsSchema,
    preHandler: authMiddleware,
    handler: userController.getUserSettings,
  });

  fastify.put('/settings', {
    schema: updateUserSettingsSchema,
    preHandler: authMiddleware,
    handler: userController.updateUserSettings,
  });

  fastify.get('/notification-preferences', {
    schema: getNotificationPreferencesSchema,
    preHandler: authMiddleware,
    handler: userController.getNotificationPreferences,
  });

  fastify.put('/notification-preferences', {
    schema: updateNotificationPreferencesSchema,
    preHandler: authMiddleware,
    handler: userController.updateNotificationPreferences,
  });

  fastify.put('/account', {
    schema: updateUserAccountSchema,
    preHandler: [authMiddleware, uploadUserAvatar],
    handler: userController.updateUserAccount,
  });

  fastify.put('/security', {
    schema: updateUserPasswordSchema,
    preHandler: authMiddleware,
    handler: userController.updateUserPassword,
  });
}
