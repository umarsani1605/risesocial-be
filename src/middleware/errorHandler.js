import { errorResponse } from '../utils/response.js';

/**
 * Global error handler middleware for Fastify
 * Handles all types of errors in a centralized way
 * @param {Error} error - The error object
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
export function errorHandler(error, request, reply) {
  const { log } = request;

  // Log error untuk debugging (always log in server)
  log.error({
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    params: request.params,
    query: request.query,
  });

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.status(400).send(errorResponse('Validation Error', 400, error.validation));
  }

  // Handle Prisma errors
  if (error.code) {
    return handlePrismaError(error, reply);
  }

  // Handle JWT errors
  if (error.message?.includes('jwt') || error.message?.includes('token')) {
    return reply.status(401).send(errorResponse('Invalid or expired token', 401));
  }

  // Handle custom errors with statusCode
  if (error.statusCode) {
    return reply.status(error.statusCode).send(errorResponse(error.message, error.statusCode));
  }

  // Default server error
  return reply.status(500).send(errorResponse('Internal Server Error', 500));
}

/**
 * Handle Prisma-specific errors
 * @param {Error} error - Prisma error
 * @param {Object} reply - Fastify reply object
 */
function handlePrismaError(error, reply) {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      return reply.status(409).send(errorResponse('Resource already exists', 409));

    case 'P2025':
      // Record not found
      return reply.status(404).send(errorResponse('Resource not found', 404));

    case 'P2003':
      // Foreign key constraint violation
      return reply.status(400).send(errorResponse('Invalid reference to related resource', 400));

    case 'P2014':
      // Required relation violation
      return reply.status(400).send(errorResponse('Required relation missing', 400));

    default:
      // Generic database error
      return reply.status(500).send(errorResponse('Database error', 500));
  }
}

/**
 * 404 Not Found handler
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
export function notFoundHandler(request, reply) {
  return reply.status(404).send(errorResponse(`Route ${request.method} ${request.url} not found`, 404));
}
