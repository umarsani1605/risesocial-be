import { userService } from '../../services/shared/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminUserController {
  exportUsersExcel = async (request, reply) => {
    try {
      const users = await userService.exportAllForExcel(request.query);
      const buffer = await userService.generateExcelFile(users);
      const filename = `users-${new Date().toISOString().split('T')[0]}.xlsx`;
      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Length', buffer.length);
      return reply.send(buffer);
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to export users', 500, error.message));
    }
  };

  getAllUsers = async (request, reply) => {
    try {
      const result = await userService.getAllUsers(request.query);
      return reply.send(successResponse(result.data, 'Users retrieved successfully', result.meta));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch users', 500, error.message));
    }
  };

  getUserById = async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await userService.getUserById(Number(id));
      return reply.send(successResponse(user, 'User retrieved successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch user', 500, error.message));
    }
  };

  createUser = async (request, reply) => {
    try {
      const user = await userService.createUser(request.body);
      return reply.status(201).send(successResponse(user, 'User created successfully'));
    } catch (error) {

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to create user', 500, error.message));
    }
  };

  updateUser = async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await userService.updateUser(Number(id), request.body);
      return reply.send(successResponse(user, 'User updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to update user', 500, error.message));
    }
  };

  deleteUser = async (request, reply) => {
    try {
      const { id } = request.params;
      await userService.deleteUser(Number(id));
      return reply.send(successResponse(null, 'User deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete user', 500, error.message));
    }
  };
}

export const adminUserController = new AdminUserController();
