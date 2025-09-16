import { userService } from '../../services/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User Self-Management HTTP controllers
 * Handles user settings, profile, and self-management requests
 */
export class UserUserController {
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
   * Update user settings
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  updateUserSettings = async (request, reply) => {
    try {
      request.log.info('[userUserController] updateUserSettings start');
      request.log.debug({ body: request.body }, '[userUserController] rawBody');
      const { userId } = request.user;
      const settings = await userService.updateUserSettings(userId, request.body);
      request.log.info('[userUserController] updateUserSettings success');
      return reply.send(successResponse(settings, 'Settings updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] updateUserSettings error');
      return reply.status(500).send(errorResponse('Failed to update settings', 500, error.message));
    }
  };

  /**
   * Check username availability (Public utility)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  checkUsernameAvailability = async (request, reply) => {
    try {
      request.log.info('[userUserController] checkUsernameAvailability start');
      request.log.debug({ params: request.params }, '[userUserController] rawParams');
      const { username } = request.params;
      const result = await userService.checkUsernameAvailability(username);
      request.log.info('[userUserController] checkUsernameAvailability success');
      return reply.send(successResponse(result, 'Username availability checked'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] checkUsernameAvailability error');
      return reply.status(500).send(errorResponse('Failed to check username', 500, error.message));
    }
  };

  /**
   * Generate username suggestions (Public utility)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  generateUsernameSuggestions = async (request, reply) => {
    try {
      request.log.info('[userUserController] generateUsernameSuggestions start');
      request.log.debug({ query: request.query }, '[userUserController] rawQuery');
      const { first_name, last_name } = request.query;

      if (!first_name || !last_name) {
        return reply.status(400).send(errorResponse('first_name and last_name are required', 400));
      }

      const suggestions = await userService.generateUsernameSuggestions(first_name, last_name);
      request.log.info('[userUserController] generateUsernameSuggestions success');
      return reply.send(successResponse(suggestions, 'Username suggestions generated'));
    } catch (error) {
      request.log.error({ err: error }, '[userUserController] generateUsernameSuggestions error');
      return reply.status(500).send(errorResponse('Failed to generate username suggestions', 500, error.message));
    }
  };
}

// Export instance
export const userUserController = new UserUserController();
