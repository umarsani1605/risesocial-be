import prisma from '../config/database.js';
import { errorResponse } from '../utils/response.js';

export function requirePermission(key, requiredLevel = 'VIEWER') {
  return async function (request, reply) {
    const user = request.user;

    if (user.role === 'SUPERADMIN') return;

    const permission = await prisma.userAdminPermission.findUnique({
      where: {
        user_id_permission_key: { user_id: user.userId, permission_key: key },
      },
    });

    if (!permission) {
      return reply.status(403).send(errorResponse('Forbidden: no permission for this resource', 403));
    }

    if (requiredLevel === 'EDITOR' && permission.access_level === 'VIEWER') {
      return reply.status(403).send(errorResponse('Forbidden: read-only access', 403));
    }
  };
}

export function requireAnyPermission(requirements) {
  return async function (request, reply) {
    const user = request.user;

    if (user.role === 'SUPERADMIN') return;

    const keys = requirements.map((requirement) => requirement.key);
    const permissions = await prisma.userAdminPermission.findMany({
      where: {
        user_id: user.userId,
        permission_key: { in: keys },
      },
    });

    const hasAllowedPermission = permissions.some((permission) => {
      const requirement = requirements.find((item) => item.key === permission.permission_key);
      if (!requirement) return false;
      return requirement.level !== 'EDITOR' || permission.access_level === 'EDITOR';
    });

    if (!hasAllowedPermission) {
      return reply.status(403).send(errorResponse('Forbidden: no permission for this resource', 403));
    }
  };
}
