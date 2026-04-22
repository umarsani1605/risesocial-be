import prisma from '../config/database.js';
import { errorResponse } from '../utils/response.js';

export function requirePermission(key, requiredLevel = 'VIEWER') {
  return async function (request, reply) {
    const user = request.user;

    if (user.role === 'SUPERADMIN') return;

    const permission = await prisma.userAdminPermission.findUnique({
      where: {
        user_id_permission_key: { user_id: user.id, permission_key: key },
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
