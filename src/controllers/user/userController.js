import { userService } from '../../services/userService.js';
import { fileUploadService } from '../../services/fileUploadService.js';
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
   * Update user account information
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  updateUserAccount = async (request, reply) => {
    try {
      request.log.info('[userUserController] updateUserAccount start');
      request.log.debug({ body: request.body }, '[userUserController] rawBody');
      const { userId } = request.user;
      const accountData = request.body;

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

  /**
   * Upload user avatar
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  uploadUserAvatar = async (request, reply) => {
    try {
      request.log.info('[userUserController] uploadUserAvatar start');

      const { userId } = request.user;
      const { file } = request;

      if (!file) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      // Upload file using service
      const uploadResult = await fileUploadService.uploadFile(file, {
        uploadType: 'USER_AVATAR',
        maxSize: 2 * 1024 * 1024, // 2MB for user avatar
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });

      // Update user with new avatar URL
      const user = await userService.updateUser(userId, {
        avatar_url: uploadResult.fileUrl,
      });

      request.log.info('[userUserController] uploadUserAvatar success');
      return reply.status(200).send(successResponse(user, 'User avatar uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] uploadUserAvatar error');
      return reply.status(500).send(errorResponse('Failed to upload user avatar', 500, error.message));
    }
  };
}

// Export instance
export const userController = new UserController();
