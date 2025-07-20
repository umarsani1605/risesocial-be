import { errorResponse } from '../utils/response.js';

/**
 * Validation middleware factory
 * Creates middleware to validate request data against schema
 * @param {Object} schema - Fastify schema object
 * @returns {Function} Validation middleware function
 */
export function validateSchema(schema) {
  return async (request, reply) => {
    try {
      // Fastify handles validation automatically if schema is attached
      // This middleware can be used for custom validation logic
      return;
    } catch (error) {
      return reply.status(400).send(errorResponse('Validation failed', 400, error.validation));
    }
  };
}

/**
 * Sanitize input data
 * Removes potentially harmful content from string inputs
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
export function sanitizeInput(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Basic XSS prevention - remove script tags and suspicious content
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

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const requestCounts = new Map();

/**
 * Simple rate limiting middleware
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Rate limiting middleware
 */
export function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return async (request, reply) => {
    const key = request.ip;
    const now = Date.now();

    // Clean old entries
    for (const [ip, data] of requestCounts.entries()) {
      if (now - data.resetTime > windowMs) {
        requestCounts.delete(ip);
      }
    }

    // Get or create counter for this IP
    let requestData = requestCounts.get(key);
    if (!requestData || now - requestData.resetTime > windowMs) {
      requestData = { count: 0, resetTime: now };
      requestCounts.set(key, requestData);
    }

    // Check if limit exceeded
    if (requestData.count >= maxRequests) {
      return reply.status(429).send(errorResponse('Too many requests, please try again later', 429));
    }

    // Increment counter
    requestData.count++;
  };
}
