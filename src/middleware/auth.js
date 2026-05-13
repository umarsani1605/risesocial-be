import { errorResponse } from '../utils/response.js';

export async function authMiddleware(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send(errorResponse('Access token required', 401));
    }

    const decoded = await request.jwtVerify();
    request.user = decoded;
  } catch {
    return reply.status(401).send(errorResponse('Invalid or expired token', 401));
  }
}

export async function optionalAuthMiddleware(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return;
    }

    const decoded = await request.jwtVerify();
    request.user = decoded;
  } catch {
    // Silently continue unauthenticated
  }
}

export async function adminMiddleware(request, reply) {
  await authMiddleware(request, reply);
  if (reply.sent) return;
  const role = request.user?.role;
  if (!['ADMIN', 'SUPERADMIN'].includes(role)) {
    return reply.status(403).send(errorResponse('Forbidden', 403));
  }
}

export function authorizeRoles(requiredRoles) {
  return async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send(errorResponse('Authentication required', 401));
    }

    const userRole = request.user.role;

    if (userRole === 'SUPERADMIN') {
      return;
    }

    if (!requiredRoles.includes(userRole)) {
      return reply.status(403).send(errorResponse('Insufficient permissions', 403));
    }
  };
}
