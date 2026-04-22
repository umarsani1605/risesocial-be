import { adminPermissionRepository } from '../../repositories/admin/permissionRepository.js';
import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AdminPermissionService {
  get logger() {
    return getLogger();
  }

  async listRegistry() {
    this.logger.info('[permissionService] listRegistry start');
    const result = await adminPermissionRepository.listRegistry();
    this.logger.info('[permissionService] listRegistry success');
    return result;
  }

  async _requireAdminUser(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    if (user.role !== 'ADMIN') {
      const err = new Error('Permissions can only be managed for ADMIN users');
      err.statusCode = 400;
      throw err;
    }
    return user;
  }

  async getUserPermissions(userId) {
    this.logger.info('[permissionService] getUserPermissions start');
    await this._requireAdminUser(userId);
    const rows = await adminPermissionRepository.getUserPermissions(userId);
    this.logger.info('[permissionService] getUserPermissions success');
    return rows.map((r) => ({ key: r.permission_key, access_level: r.access_level }));
  }

  async setUserPermissions(userId, permissions) {
    this.logger.info('[permissionService] setUserPermissions start');
    await this._requireAdminUser(userId);

    const registry = await adminPermissionRepository.listRegistry();
    const registryMap = Object.fromEntries(registry.map((r) => [r.key, r]));

    for (const p of permissions) {
      const entry = registryMap[p.key];
      if (!entry) {
        const err = new Error(`Unknown permission key: ${p.key}`);
        err.statusCode = 400;
        throw err;
      }
      if (!entry.available_levels.includes(p.access_level)) {
        const err = new Error(`Access level '${p.access_level}' is not allowed for '${p.key}'. Allowed: ${entry.available_levels.join(', ')}`);
        err.statusCode = 400;
        throw err;
      }
    }

    await adminPermissionRepository.replaceUserPermissions(userId, permissions);
    const rows = await adminPermissionRepository.getUserPermissions(userId);
    this.logger.info('[permissionService] setUserPermissions success');
    return rows.map((r) => ({ key: r.permission_key, access_level: r.access_level }));
  }

  async deleteUserPermission(userId, key) {
    this.logger.info('[permissionService] deleteUserPermission start');
    await this._requireAdminUser(userId);
    try {
      await adminPermissionRepository.deleteUserPermission(userId, key);
    } catch (e) {
      if (e.code === 'P2025') {
        const err = new Error('Permission not found for this user');
        err.statusCode = 404;
        throw err;
      }
      throw e;
    }
    this.logger.info('[permissionService] deleteUserPermission success');
  }
}

export const adminPermissionService = new AdminPermissionService();
