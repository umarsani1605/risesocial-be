import { adminPermissionService } from '../../services/admin/permissionService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminPermissionController {
  async listRegistry(request, reply) {
    try {
      request.log.info('[permissionController] listRegistry start');
      const data = await adminPermissionService.listRegistry();
      return reply.send(successResponse(data, 'Permission registry retrieved'));
    } catch (error) {
      request.log.error({ err: error }, '[permissionController] listRegistry error');
      return reply.status(500).send(errorResponse('Failed to retrieve permission registry', 500));
    }
  }

  async getUserPermissions(request, reply) {
    try {
      request.log.info('[permissionController] getUserPermissions start');
      const userId = Number(request.params.id);
      const data = await adminPermissionService.getUserPermissions(userId);
      return reply.send(successResponse(data, 'User permissions retrieved'));
    } catch (error) {
      request.log.error({ err: error }, '[permissionController] getUserPermissions error');
      const status = error.statusCode || 500;
      return reply.status(status).send(errorResponse(error.message, status));
    }
  }

  async setUserPermissions(request, reply) {
    try {
      request.log.info('[permissionController] setUserPermissions start');
      const userId = Number(request.params.id);
      const { permissions } = request.body;
      const data = await adminPermissionService.setUserPermissions(userId, permissions);
      return reply.send(successResponse(data, 'User permissions updated'));
    } catch (error) {
      request.log.error({ err: error }, '[permissionController] setUserPermissions error');
      const status = error.statusCode || 500;
      return reply.status(status).send(errorResponse(error.message, status));
    }
  }

  async deleteUserPermission(request, reply) {
    try {
      request.log.info('[permissionController] deleteUserPermission start');
      const userId = Number(request.params.id);
      const { key } = request.params;
      await adminPermissionService.deleteUserPermission(userId, key);
      return reply.send(successResponse(null, 'Permission removed'));
    } catch (error) {
      request.log.error({ err: error }, '[permissionController] deleteUserPermission error');
      const status = error.statusCode || 500;
      return reply.status(status).send(errorResponse(error.message, status));
    }
  }
}

export const adminPermissionController = new AdminPermissionController();
