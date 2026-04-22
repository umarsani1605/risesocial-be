import { userService } from '../../services/shared/userService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminUserController {
  exportUsersExcel = async (request, reply) => {
    try {
      request.log.info('[adminUserController] exportUsersExcel start');
      const users = await userService.exportAllForExcel(request.query);
      const buffer = await userService.generateExcelFile(users);
      const filename = `users-${new Date().toISOString().split('T')[0]}.xlsx`;
      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Length', buffer.length);
      request.log.info('[adminUserController] exportUsersExcel success');
      return reply.send(buffer);
    } catch (error) {
      request.log.error({ err: error }, '[adminUserController] exportUsersExcel error');
      return reply.status(500).send(errorResponse('Failed to export users', 500, error.message));
    }
  };

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

export const adminUserController = new AdminUserController();
