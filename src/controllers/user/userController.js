import { userService } from '../../services/shared/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { captureEvent } from '../../config/posthog.js';

export class UserController {
  getCurrentUser = async (request, reply) => {
    try {
      const { userId } = request.user;
      const user = await userService.getCurrentUser(userId);
      return reply.send(successResponse(user, 'User profile retrieved successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch user profile', 500, error.message));
    }
  };

  getUserSettings = async (request, reply) => {
    try {
      const { userId } = request.user;
      const settings = await userService.getUserSettings(userId);
      return reply.send(successResponse(settings, 'User settings retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch user settings', 500, error.message));
    }
  };

  updateUserSettings = async (request, reply) => {
    try {
      const { userId } = request.user;
      const { settings } = request.body;

      if (!settings || !Array.isArray(settings)) {
        return reply.status(400).send(errorResponse('Settings array is required', 400));
      }

      const updatedSettings = await userService.updateUserSettings(userId, settings);
      return reply.send(successResponse(updatedSettings, 'Settings updated successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to update settings', 500, error.message));
    }
  };

  getNotificationPreferences = async (request, reply) => {
    try {
      const { userId } = request.user;

      const preferences = await userService.getNotificationPreferences(userId);

      // Ensure preferences is a plain object for serialization
      const plainPreferences = {
        promo_notification: preferences.promo_notification,
        job_notification: preferences.job_notification,
        program_notification: preferences.program_notification,
      };

      return reply.send(successResponse(plainPreferences, 'Notification preferences retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to get notification preferences', 500, error.message));
    }
  };

  updateNotificationPreferences = async (request, reply) => {
    try {
      const { userId } = request.user;
      const { preferences } = request.body;

      if (!preferences || typeof preferences !== 'object') {
        return reply.status(400).send(errorResponse('Preferences object is required', 400));
      }

      const updatedPreferences = await userService.updateNotificationPreferences(userId, preferences);

      // Ensure preferences is a plain object for serialization
      const plainPreferences = {
        promo_notification: updatedPreferences.promo_notification,
        job_notification: updatedPreferences.job_notification,
        program_notification: updatedPreferences.program_notification,
      };

      return reply.send(successResponse(plainPreferences, 'Notification preferences updated successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to update notification preferences', 500, error.message));
    }
  };

  updateUserAccount = async (request, reply) => {
    try {
      const { userId } = request.user;
      const accountData = request.body || {};

      if (request.uploadedFile) {
        accountData.avatarFile = request.uploadedFile;
      } else {
      }

      const updatedUser = await userService.updateUserAccount(userId, accountData);

      captureEvent(userId, 'user.account_updated', {
        user_id: userId,
        has_avatar_change: !!accountData.avatarFile || accountData.avatar === null,
      });

      return reply.send(successResponse(updatedUser, 'Account updated successfully'));
    } catch (error) {

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to update account', 500, error.message));
    }
  };

  updateUserPassword = async (request, reply) => {
    try {
      const { userId } = request.user;
      const { password, repeatPassword } = request.body;

      if (!password || !repeatPassword) {
        return reply.status(400).send(errorResponse('Password and repeat password are required', 400));
      }

      if (password !== repeatPassword) {
        return reply.status(400).send(errorResponse('Passwords do not match', 400));
      }

      await userService.updateUserPassword(userId, password);

      captureEvent(userId, 'user.password_changed', { user_id: userId });

      return reply.send(successResponse(null, 'Password updated successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to update password', 500, error.message));
    }
  };
}

export const userController = new UserController();
