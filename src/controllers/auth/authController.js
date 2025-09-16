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
      request.log.info('[authController] login start');
      request.log.debug({ body: { email: request.body?.email, rememberMe: request.body?.rememberMe } }, '[authController] rawBody');
      const { email, password, rememberMe = false } = request.body;

      const result = await userService.login(email, password, rememberMe, request.server);

      request.log.info('[authController] login success');
      return reply.send(result);
    } catch (error) {
      request.log.error({ err: error }, '[authController] login error');

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
      request.log.info('[authController] register start');
      request.log.debug({ body: { email: request.body?.email } }, '[authController] rawBody');
      const result = await userService.register(request.body, request.server);

      request.log.info('[authController] register success');
      return reply.status(201).send(result);
    } catch (error) {
      request.log.error({ err: error }, '[authController] register error');

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
      request.log.info('[authController] getCurrentUser start');
      request.log.info({ user: request.user }, '[authController] request.user');
      const { userId } = request.user;
      request.log.debug({ userId }, '[authController] extracted userId');

      const user = await userService.getCurrentUser(userId);
      request.log.info({ user }, '[authController] user data from service');

      request.log.info('[authController] getCurrentUser success');

      // Return user data directly for Sidebase Auth compatibility
      return reply.send(user);
    } catch (error) {
      request.log.error({ err: error }, '[authController] getCurrentUser error');

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch user profile', 500, error.message));
    }
  }

  /**
   * User logout
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async logout(request, reply) {
    try {
      request.log.info('[authController] logout start');
      const { id: userId, email, role } = request.user;
      request.log.info({ userId, email, role }, '[authController] logout user details');

      request.log.info('[authController] logout success');
      return reply.send(successResponse(null, 'Logout successful'));
    } catch (error) {
      request.log.error({ err: error }, '[authController] logout error');
      return reply.status(500).send(errorResponse('Logout failed', 500, error.message));
    }
  }
}

// Export instance
export const authController = new AuthController();
