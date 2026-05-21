import { userService } from '../../services/shared/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { captureEvent, identifyUser } from '../../config/posthog.js';

export class AuthController {
  async login(request, reply) {
      const { email, password, rememberMe = false } = request.body;
      try {
      const result = await userService.login(email, password, rememberMe, request.server);

      identifyUser(result.user, request);
      captureEvent(result.user.id, 'auth.login_succeeded', {
        source: 'backend',
        user_id: result.user.id,
        role: result.user.role,
        method: 'password',
      }, request);

      return reply.send(successResponse(result, 'Login successful'));
    } catch (error) {
      captureEvent(null, 'auth.login_failed', {
        source: 'backend',
        identifier: email,
        reason: error.message,
      }, request);

      if (error.statusCode === 401) {
        return reply.status(401).send({
          success: false,
          message: error.message,
          statusCode: 401,
        });
      }

      throw error;
    }
  }

  async register(request, reply) {
    try {
      const result = await userService.register(request.body, request.server);

      identifyUser(result.user, request);
      captureEvent(result.user.id, 'auth.signup_succeeded', {
        source: 'backend',
        user_id: result.user.id,
        role: result.user.role,
      }, request);

      return reply.status(201).send(successResponse(result, 'Registration successful'));
    } catch (error) {

      if (error.statusCode === 400) {
        return reply.status(400).send({
          success: false,
          message: error.message,
          statusCode: 400,
        });
      }

      throw error;
    }
  }

  async getCurrentUser(request, reply) {
    try {
      const { userId } = request.user;

      const user = await userService.getCurrentUser(userId);


      return reply.send(successResponse(user, 'User profile retrieved successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          message: error.message,
          statusCode: 404,
        });
      }

      throw error;
    }
  }

  async logout(request, reply) {
    try {
      const { userId, role } = request.user;

      captureEvent(userId, 'auth.logout', {
        source: 'backend',
        user_id: userId,
        role
      }, request);

      return reply.send(successResponse(null, 'Logout successful'));
    } catch (error) {
      throw error;
    }
  }
}

export const authController = new AuthController();
