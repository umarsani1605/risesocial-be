import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AdminPermissionRepository {
  get logger() {
    return getLogger();
  }

  async listRegistry() {
    return prisma.adminPermission.findMany({ orderBy: { key: 'asc' } });
  }

  async findRegistryKey(key) {
    return prisma.adminPermission.findUnique({ where: { key } });
  }

  async getUserPermissions(userId) {
    return prisma.userAdminPermission.findMany({
      where: { user_id: userId },
      select: { permission_key: true, access_level: true },
    });
  }

  async replaceUserPermissions(userId, permissions) {
    return prisma.$transaction([
      prisma.userAdminPermission.deleteMany({ where: { user_id: userId } }),
      prisma.userAdminPermission.createMany({
        data: permissions.map((p) => ({
          user_id: userId,
          permission_key: p.key,
          access_level: p.access_level,
        })),
      }),
    ]);
  }

  async deleteUserPermission(userId, key) {
    return prisma.userAdminPermission.delete({
      where: { user_id_permission_key: { user_id: userId, permission_key: key } },
    });
  }
}

export const adminPermissionRepository = new AdminPermissionRepository();
