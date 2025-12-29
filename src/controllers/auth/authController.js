import { userService } from '../../services/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AuthController {
  async login(request, reply) {
    try {
      request.log.info('[authController] login start');
      request.log.debug({ body: { email: request.body?.email, rememberMe: request.body?.rememberMe } }, '[authController] rawBody');
      const { email, password, rememberMe = false } = request.body;

      const result = await userService.login(email, password, rememberMe, request.server);

      request.log.info('[authController] login success');
      return reply.send(successResponse(result, 'Login successful'));
    } catch (error) {
      request.log.error({ err: error }, '[authController] login error');

      if (error.statusCode === 401) {
        return reply.status(401).send({
          success: false,
          message: error.message,
          statusCode: 401,
        });
      }

      return reply.status(500).send({
        success: false,
        message: 'Login failed',
        statusCode: 500,
      });
    }
  }

  async register(request, reply) {
    try {
      request.log.info('[authController] register start');
      request.log.debug({ body: { email: request.body?.email } }, '[authController] rawBody');
      const result = await userService.register(request.body, request.server);

      request.log.info('[authController] register success');
      return reply.status(201).send(successResponse(result, 'Registration successful'));
    } catch (error) {
      request.log.error({ err: error }, '[authController] register error');

      if (error.statusCode === 400) {
        return reply.status(400).send({
          success: false,
          message: error.message,
          statusCode: 400,
        });
      }

      return reply.status(500).send({
        success: false,
        message: 'Failed to register user',
        statusCode: 500,
      });
    }
  }

  async getCurrentUser(request, reply) {
    try {
      request.log.info('[authController] getCurrentUser start');
      request.log.info({ user: request.user }, '[authController] request.user');
      const { userId } = request.user;
      request.log.debug({ userId }, '[authController] extracted userId');

      const user = await userService.getCurrentUser(userId);
      request.log.info({ user }, '[authController] user data from service');

      request.log.info('[authController] getCurrentUser success');

      return reply.send(successResponse(user, 'User profile retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[authController] getCurrentUser error');

      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          message: error.message,
          statusCode: 404,
        });
      }

      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch user profile',
        statusCode: 500,
      });
    }
  }

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

export const authController = new AuthController();
