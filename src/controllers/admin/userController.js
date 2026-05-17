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
      throw error;
    }
  };

  getAllUsers = async (request, reply) => {
    try {
      const result = await userService.getAllUsers(request.query);
      return reply.send(successResponse(result.data, 'Users retrieved successfully', result.meta));
    } catch (error) {
      throw error;
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

      throw error;
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

      throw error;
    }
  };

  updateUser = async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body || {};

      if (request.uploadedFile) {
        updateData.avatarFile = request.uploadedFile;
      }

      const user = await userService.updateUser(Number(id), updateData);
      return reply.send(successResponse(user, 'User updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      throw error;
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

      throw error;
    }
  };
}

export const adminUserController = new AdminUserController();
