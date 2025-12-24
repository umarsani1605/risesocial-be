import { userController } from '../../controllers/user/userController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadUserAvatar } from '../../middleware/fileUploadMiddleware.js';

export default async function userRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/profile', userController.getCurrentUser);
  fastify.get('/settings', userController.getUserSettings);
  fastify.put('/settings', userController.updateUserSettings);
  fastify.get('/notification-preferences', userController.getNotificationPreferences);
  fastify.put('/notification-preferences', userController.updateNotificationPreferences);
  fastify.put('/account', { preHandler: [uploadUserAvatar] }, userController.updateUserAccount);
  fastify.put('/security', userController.updateUserPassword);
}
