import { userService } from '../../services/userService.js';
import { successResponse, errorResponse, paginationMeta } from '../../utils/response.js';

/**
 * User HTTP controllers
 * Handles request/response only, delegates business logic to service
 */
export class UserController {
  /**
   * Get all users with pagination
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAllUsers(request, reply) {
    try {
      const result = await userService.getAllUsers(request.query);
      return reply.send(successResponse(result.data, 'Users retrieved successfully', result.meta));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(errorResponse('Failed to fetch users', 500, error.message));
    }
  }

  /**
   * Get user by ID
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getUserById(request, reply) {
    try {
      const { id } = request.params;
      const user = await userService.getUserById(Number(id));
      return reply.send(successResponse(user, 'User retrieved successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch user', 500, error.message));
    }
  }

  /**
   * Create new user
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createUser(request, reply) {
    try {
      const user = await userService.createUser(request.body);
      return reply.status(201).send(successResponse(user, 'User created successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to create user', 500, error.message));
    }
  }

  /**
   * Update user by ID
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateUser(request, reply) {
    try {
      const { id } = request.params;
      const user = await userService.updateUser(Number(id), request.body);
      return reply.send(successResponse(user, 'User updated successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to update user', 500, error.message));
    }
  }

  /**
   * Delete user by ID
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteUser(request, reply) {
    try {
      const { id } = request.params;
      await userService.deleteUser(Number(id));
      return reply.send(successResponse(null, 'User deleted successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete user', 500, error.message));
    }
  }

  /**
   * Get current user profile
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getCurrentUser(request, reply) {
    try {
      const { userId } = request.user;
      const user = await userService.getCurrentUser(userId);
      return reply.send(successResponse(user, 'User profile retrieved successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch user profile', 500, error.message));
    }
  }

  /**
   * Get user settings
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getUserSettings(request, reply) {
    try {
      const { userId } = request.user;
      const settings = await userService.getUserSettings(userId);
      return reply.send(successResponse(settings, 'User settings retrieved successfully'));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(errorResponse('Failed to fetch user settings', 500, error.message));
    }
  }

  /**
   * Update user settings
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateUserSettings(request, reply) {
    try {
      const { userId } = request.user;
      const settings = await userService.updateUserSettings(userId, request.body);
      return reply.send(successResponse(settings, 'Settings updated successfully'));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(errorResponse('Failed to update settings', 500, error.message));
    }
  }

  /**
   * Check username availability
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async checkUsernameAvailability(request, reply) {
    try {
      const { username } = request.params;
      const result = await userService.checkUsernameAvailability(username);
      return reply.send(successResponse(result, 'Username availability checked'));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(errorResponse('Failed to check username', 500, error.message));
    }
  }

  /**
   * Generate username suggestions
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async generateUsernameSuggestions(request, reply) {
    try {
      const { first_name, last_name } = request.query;

      if (!first_name || !last_name) {
        return reply.status(400).send(errorResponse('first_name and last_name are required', 400));
      }

      const suggestions = await userService.generateUsernameSuggestions(first_name, last_name);
      return reply.send(successResponse(suggestions, 'Username suggestions generated'));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(errorResponse('Failed to generate username suggestions', 500, error.message));
    }
  }
}

// Export instance
export const userController = new UserController();
