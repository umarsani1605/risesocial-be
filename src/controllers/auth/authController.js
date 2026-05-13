import { userService } from '../../services/shared/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import posthog, { captureEvent } from '../../config/posthog.js';

export class AuthController {
  async login(request, reply) {
    const { email, password, rememberMe = false } = request.body;
    try {
      const result = await userService.login(email, password, rememberMe, request.server);

      if (process.env.NODE_ENV === 'production') {
        posthog.identify({
          distinctId: String(result.user.id),
          properties: {
            email: result.user.email,
            name: `${result.user.first_name} ${result.user.last_name}`.trim(),
            role: result.user.role,
          },
        });
      }
      captureEvent(result.user.id, 'auth.login_succeeded', {
        user_id: result.user.id,
        role: result.user.role,
        method: 'password',
      });

      return reply.send(successResponse(result, 'Login successful'));
    } catch (error) {
      captureEvent(`anon:${email ?? 'unknown'}`, 'auth.login_failed', {
        identifier: email,
        reason: error.message,
      });

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

      if (process.env.NODE_ENV === 'production') {
        posthog.identify({
          distinctId: String(result.user.id),
          properties: {
            email: result.user.email,
            name: `${result.user.first_name} ${result.user.last_name}`.trim(),
            role: result.user.role,
          },
        });
      }
      captureEvent(result.user.id, 'auth.signup_succeeded', {
        user_id: result.user.id,
        role: result.user.role,
      });

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
      const { id: userId, role } = request.user;

      captureEvent(userId, 'auth.logout', { user_id: userId, role });

      return reply.send(successResponse(null, 'Logout successful'));
    } catch (error) {
      throw error;
    }
  }
}

export const authController = new AuthController();
