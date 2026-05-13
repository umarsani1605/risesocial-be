import { errorResponse } from '../utils/response.js';

export function validateSchema(schema) {
  return async (request, reply) => {
    try {

      return;
    } catch (error) {
      return reply.status(400).send(errorResponse('Validation failed', 400, error.validation));
    }
  };
}

export function sanitizeInput(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

const requestCounts = new Map();

export function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return async (request, reply) => {
    const key = request.ip;
    const now = Date.now();

    for (const [ip, data] of requestCounts.entries()) {
      if (now - data.resetTime > windowMs) {
        requestCounts.delete(ip);
      }
    }

    let requestData = requestCounts.get(key);
    if (!requestData || now - requestData.resetTime > windowMs) {
      requestData = { count: 0, resetTime: now };
      requestCounts.set(key, requestData);
    }

    if (requestData.count >= maxRequests) {
      return reply.status(429).send(errorResponse('Too many requests, please try again later', 429));
    }

    requestData.count++;
  };
}
