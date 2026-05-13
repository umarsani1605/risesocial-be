import { errorResponse } from '../utils/response.js';
import posthog from '../config/posthog.js';

export function errorHandler(error, request, reply) {
  if (error.validation) {
    const messages = error.validation.map((err) => {
      const field = err.instancePath?.replace('/', '') || err.params?.missingProperty || 'field';

      switch (err.keyword) {
        case 'required':
          return `${err.params.missingProperty} is required`;
        case 'minLength':
          return `${field} must be at least ${err.params.limit} characters`;
        case 'maxLength':
          return `${field} must not exceed ${err.params.limit} characters`;
        case 'format':
          if (err.params.format === 'email') return `${field} must be a valid email`;
          return `${field} has invalid format`;
        case 'enum':
          return `${field} must be one of: ${err.params.allowedValues.join(', ')}`;
        case 'minimum':
          return `${field} must be at least ${err.params.limit}`;
        case 'maximum':
          return `${field} must not exceed ${err.params.limit}`;
        case 'type':
          return `${field} must be a ${err.params.type}`;
        case 'additionalProperties':
          return `Unknown field: ${err.params.additionalProperty}`;
        default:
          return err.message || `Invalid value for ${field}`;
      }
    });

    return reply.status(400).send(errorResponse(messages[0], 400, { errors: messages }));
  }

  if (typeof error.code === 'string' && error.code.startsWith('P')) {
    return handlePrismaError(error, request, reply);
  }

  if (error.message?.includes('jwt') || error.message?.includes('token')) {
    return reply.status(401).send(errorResponse('Invalid or expired token', 401));
  }

  if (error.statusCode) {
    if (error.statusCode >= 500) {
      captureException(error, request, error.statusCode);
    }
    return reply.status(error.statusCode).send(errorResponse(error.message, error.statusCode));
  }

  captureException(error, request, 500);
  return reply.status(500).send(errorResponse('Internal Server Error', 500));
}

function captureException(error, request, status_code) {
  const distinctId = request.user?.userId ? String(request.user.userId) : undefined;
  posthog.captureException(error, distinctId, {
    path: request.routerPath ?? request.url,
    method: request.method,
    status_code,
    user_role: request.user?.role,
  });
}

function handlePrismaError(error, request, reply) {
  switch (error.code) {
    case 'P2002':
      return reply.status(409).send(errorResponse('Resource already exists', 409));

    case 'P2025':
      return reply.status(404).send(errorResponse('Resource not found', 404));

    case 'P2003':
      return reply.status(400).send(errorResponse('Invalid reference to related resource', 400));

    case 'P2014':
      return reply.status(400).send(errorResponse('Required relation missing', 400));

    default:
      captureException(error, request, 500);
      return reply.status(500).send(errorResponse('Database error', 500));
  }
}

export function notFoundHandler(request, reply) {
  return reply.status(404).send(errorResponse(`Route ${request.method} ${request.url} not found`, 404));
}
