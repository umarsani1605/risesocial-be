import { errorResponse } from '../utils/response.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
export async function authMiddleware(request, reply) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send(errorResponse('Access token required', 401));
    }

    const token = authHeader.substring(7);

    // Verify JWT token using Fastify JWT plugin
    const decoded = await request.jwtVerify(token);

    // Attach user to request for use in routes
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send(errorResponse('Invalid or expired token', 401));
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
export async function optionalAuthMiddleware(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await request.jwtVerify(token);
      request.user = decoded;
    }
    // Continue even if no token or invalid token
  } catch (error) {
    // Ignore auth errors for optional middleware
    request.log.debug('Optional auth failed:', error.message);
  }
}
