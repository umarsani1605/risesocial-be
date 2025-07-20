import { userService } from '../../services/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Authentication HTTP controllers
 * Handles login, register, and current user operations
 */
export class AuthController {
  /**
   * User login
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async login(request, reply) {
    try {
      const { email, password, rememberMe = false } = request.body;

      const result = await userService.login(email, password, rememberMe, request.server);

      return reply.send(successResponse(result, 'Login successful'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 401) {
        return reply.status(401).send(errorResponse(error.message, 401));
      }

      return reply.status(500).send(errorResponse('Login failed', 500, error.message));
    }
  }

  /**
   * User registration
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async register(request, reply) {
    try {
      const result = await userService.register(request.body, request.server);

      return reply.status(201).send(successResponse(result, 'User registered successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to register user', 500, error.message));
    }
  }

  /**
   * Get current user (requires authentication)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getCurrentUser(request, reply) {
    try {
      const { userId } = request.user;
      const user = await userService.getCurrentUser(userId);

      return reply.send(successResponse(user, 'Current user retrieved successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch user profile', 500, error.message));
    }
  }
}

// Export instance
export const authController = new AuthController();
