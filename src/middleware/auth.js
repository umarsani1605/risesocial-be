import { errorResponse } from '../utils/response.js';

export async function authMiddleware(request, reply) {
  try {
    request.log.info('[authMiddleware] start');
    const authHeader = request.headers.authorization;
    request.log.debug({ hasAuthHeader: !!authHeader }, '[authMiddleware] header');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send(errorResponse('Access token required', 401));
    }

    const token = authHeader.substring(7);
    request.log.debug({ tokenPrefix: token ? token.slice(0, 12) : '' }, '[authMiddleware] tokenPrefix');

    request.log.info('[authMiddleware] verifying jwt');
    const decoded = await request.jwtVerify();
    request.log.info({ decoded }, '[authMiddleware] decoded payload');

    request.user = decoded;
    request.log.info({ userId: decoded?.userId, role: decoded?.role }, '[authMiddleware] verified');
  } catch (error) {
    request.log.error({ err: error }, '[authMiddleware] verify error');
    return reply.status(401).send(errorResponse('Invalid or expired token', 401));
  }
}

export async function optionalAuthMiddleware(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return; 
    }

    const token = authHeader.substring(7);
    request.log.debug({ tokenPrefix: token ? token.slice(0, 12) : '' }, '[optionalAuth] tokenPrefix');
    const decoded = await request.jwtVerify();
    request.user = decoded;
    request.log.info({ userId: decoded?.userId, role: decoded?.role }, '[optionalAuth] verified');
  } catch (error) {
    request.log.warn({ err: error?.message }, '[optionalAuth] verify failed, continuing unauthenticated');
  }
}

export function authorizeRoles(requiredRoles) {
  return async (request, reply) => {
    try {
      request.log.info('[authorizeRoles] start', { requiredRoles });

      if (!request.user) {
        request.log.error('[authorizeRoles] no user in request');
        return reply.status(401).send(errorResponse('Authentication required', 401));
      }

      const userRole = request.user.role;
      request.log.debug({ userRole, requiredRoles }, '[authorizeRoles] checking');

      if (!requiredRoles.includes(userRole)) {
        request.log.warn({ userRole, requiredRoles }, '[authorizeRoles] insufficient permissions');
        return reply.status(403).send(errorResponse('Insufficient permissions', 403));
      }

      request.log.info('[authorizeRoles] authorized', { userRole });
    } catch (error) {
      request.log.error({ err: error }, '[authorizeRoles] error');
      return reply.status(500).send(errorResponse('Authorization check failed', 500));
    }
  };
}
