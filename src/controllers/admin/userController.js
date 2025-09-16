import { userService } from '../../services/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin User Management HTTP controllers
 * Handles admin-only user CRUD and management requests
 */
export class AdminUserController {
  /**
   * Get all users with pagination (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  getAllUsers = async (request, reply) => {
    try {
      request.log.info('[adminUserController] getAllUsers start');
      request.log.debug({ query: request.query }, '[adminUserController] rawQuery');
      const result = await userService.getAllUsers(request.query);
      request.log.info('[adminUserController] getAllUsers success');
      return reply.send(successResponse(result.data, 'Users retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[adminUserController] getAllUsers error');
      return reply.status(500).send(errorResponse('Failed to fetch users', 500, error.message));
    }
  };

  /**
   * Get user by ID (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  getUserById = async (request, reply) => {
    try {
      request.log.info('[adminUserController] getUserById start');
      request.log.debug({ params: request.params }, '[adminUserController] rawParams');
      const { id } = request.params;
      const user = await userService.getUserById(Number(id));
      request.log.info('[adminUserController] getUserById success');
      return reply.send(successResponse(user, 'User retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminUserController] getUserById error');

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch user', 500, error.message));
    }
  };

  /**
   * Create new user (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  createUser = async (request, reply) => {
    try {
      request.log.info('[adminUserController] createUser start');
      request.log.debug({ body: request.body }, '[adminUserController] rawBody');
      const user = await userService.createUser(request.body);
      request.log.info('[adminUserController] createUser success');
      return reply.status(201).send(successResponse(user, 'User created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminUserController] createUser error');

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to create user', 500, error.message));
    }
  };

  /**
   * Update user by ID (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  updateUser = async (request, reply) => {
    try {
      request.log.info('[adminUserController] updateUser start');
      request.log.debug({ params: request.params, body: request.body }, '[adminUserController] rawParams');
      const { id } = request.params;
      const user = await userService.updateUser(Number(id), request.body);
      request.log.info('[adminUserController] updateUser success');
      return reply.send(successResponse(user, 'User updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminUserController] updateUser error');

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to update user', 500, error.message));
    }
  };

  /**
   * Delete user by ID (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  deleteUser = async (request, reply) => {
    try {
      request.log.info('[adminUserController] deleteUser start');
      request.log.debug({ params: request.params }, '[adminUserController] rawParams');
      const { id } = request.params;
      await userService.deleteUser(Number(id));
      request.log.info('[adminUserController] deleteUser success');
      return reply.send(successResponse(null, 'User deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminUserController] deleteUser error');

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete user', 500, error.message));
    }
  };
}

// Export instance
export const adminUserController = new AdminUserController();
