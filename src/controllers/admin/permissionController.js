import { adminPermissionService } from '../../services/admin/permissionService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminPermissionController {
  async listRegistry(request, reply) {
    try {
      const data = await adminPermissionService.listRegistry();
      return reply.send(successResponse(data, 'Permission registry retrieved'));
    } catch (error) {
      throw error;
    }
  }

  async getUserPermissions(request, reply) {
    try {
      const userId = Number(request.params.id);
      const data = await adminPermissionService.getUserPermissions(userId);
      return reply.send(successResponse(data, 'User permissions retrieved'));
    } catch (error) {
      const status = error.statusCode || 500;
      return reply.status(status).send(errorResponse(error.message, status));
    }
  }

  async setUserPermissions(request, reply) {
    try {
      const userId = Number(request.params.id);
      const { permissions } = request.body;
      const data = await adminPermissionService.setUserPermissions(userId, permissions);
      return reply.send(successResponse(data, 'User permissions updated'));
    } catch (error) {
      const status = error.statusCode || 500;
      return reply.status(status).send(errorResponse(error.message, status));
    }
  }

  async deleteUserPermission(request, reply) {
    try {
      const userId = Number(request.params.id);
      const { key } = request.params;
      await adminPermissionService.deleteUserPermission(userId, key);
      return reply.send(successResponse(null, 'Permission removed'));
    } catch (error) {
      const status = error.statusCode || 500;
      return reply.status(status).send(errorResponse(error.message, status));
    }
  }
}

export const adminPermissionController = new AdminPermissionController();
