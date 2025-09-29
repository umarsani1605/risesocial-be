import { userService } from '../../services/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User Self-Management HTTP controllers
 * Handles user settings, profile, and self-management requests
 */
export class UserController {
  /**
   * Get current user profile
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  getCurrentUser = async (request, reply) => {
    try {
      request.log.info('[userUserController] getCurrentUser start');
      const { userId } = request.user;
      request.log.debug({ userId }, '[userUserController] jwtUser');
      const user = await userService.getCurrentUser(userId);
      request.log.info('[userUserController] getCurrentUser success');
      return reply.send(successResponse(user, 'User profile retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] getCurrentUser error');

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch user profile', 500, error.message));
    }
  };

  /**
   * Get user settings
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  getUserSettings = async (request, reply) => {
    try {
      request.log.info('[userUserController] getUserSettings start');
      const { userId } = request.user;
      const settings = await userService.getUserSettings(userId);
      request.log.info('[userUserController] getUserSettings success');
      return reply.send(successResponse(settings, 'User settings retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] getUserSettings error');
      return reply.status(500).send(errorResponse('Failed to fetch user settings', 500, error.message));
    }
  };

  /**
   * Update user settings (key-value structure)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  updateUserSettings = async (request, reply) => {
    try {
      request.log.info('[userUserController] updateUserSettings start');
      request.log.debug({ body: request.body }, '[userUserController] rawBody');
      const { userId } = request.user;
      const { settings } = request.body;

      if (!settings || !Array.isArray(settings)) {
        return reply.status(400).send(errorResponse('Settings array is required', 400));
      }

      const updatedSettings = await userService.updateUserSettings(userId, settings);
      request.log.info('[userUserController] updateUserSettings success');
      return reply.send(successResponse(updatedSettings, 'Settings updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] updateUserSettings error');
      return reply.status(500).send(errorResponse('Failed to update settings', 500, error.message));
    }
  };

  /**
   * Get notification preferences (JSON format)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  getNotificationPreferences = async (request, reply) => {
    try {
      request.log.info('[userUserController] getNotificationPreferences start');
      const { userId } = request.user;

      const preferences = await userService.getNotificationPreferences(userId);
      request.log.info('[userUserController] getNotificationPreferences success');
      return reply.send(successResponse(preferences, 'Notification preferences retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] getNotificationPreferences error');
      return reply.status(500).send(errorResponse('Failed to get notification preferences', 500, error.message));
    }
  };

  /**
   * Update notification preferences (JSON format)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  updateNotificationPreferences = async (request, reply) => {
    try {
      request.log.info('[userUserController] updateNotificationPreferences start');
      request.log.debug({ body: request.body }, '[userUserController] rawBody');
      const { userId } = request.user;
      const { preferences } = request.body;

      if (!preferences || typeof preferences !== 'object') {
        return reply.status(400).send(errorResponse('Preferences object is required', 400));
      }

      const updatedPreferences = await userService.updateNotificationPreferences(userId, preferences);
      request.log.info('[userUserController] updateNotificationPreferences success');
      return reply.send(successResponse(updatedPreferences, 'Notification preferences updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] updateNotificationPreferences error');
      return reply.status(500).send(errorResponse('Failed to update notification preferences', 500, error.message));
    }
  };

  /**
   * Update user account information
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  updateUserAccount = async (request, reply) => {
    try {
      request.log.info('[userUserController] updateUserAccount start');
      request.log.debug({ body: request.body }, '[userUserController] rawBody');
      const { userId } = request.user;
      const accountData = request.body || {};

      // Handle avatar file upload
      if (request.uploadedFile) {
        accountData.avatarFile = request.uploadedFile;
        request.log.info({ uploadedFile: request.uploadedFile }, '[userUserController] user avatar file received from middleware');
      } else {
        request.log.info('[userUserController] no uploaded file found');
      }

      const updatedUser = await userService.updateUserAccount(userId, accountData);
      request.log.info('[userUserController] updateUserAccount success');
      return reply.send(successResponse(updatedUser, 'Account updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] updateUserAccount error');

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to update account', 500, error.message));
    }
  };

  /**
   * Update user password
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  updateUserPassword = async (request, reply) => {
    try {
      request.log.info('[userUserController] updateUserPassword start');
      request.log.debug({ body: request.body }, '[userUserController] rawBody');
      const { userId } = request.user;
      const { password, repeatPassword } = request.body;

      if (!password || !repeatPassword) {
        return reply.status(400).send(errorResponse('Password and repeat password are required', 400));
      }

      if (password !== repeatPassword) {
        return reply.status(400).send(errorResponse('Passwords do not match', 400));
      }

      await userService.updateUserPassword(userId, password);
      request.log.info('[userUserController] updateUserPassword success');
      return reply.send(successResponse(null, 'Password updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] updateUserPassword error');
      return reply.status(500).send(errorResponse('Failed to update password', 500, error.message));
    }
  };
}

// Export instance
export const userController = new UserController();
