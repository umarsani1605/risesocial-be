/**
 * Test Server Helper
 * Provides utilities for creating test Fastify instances and authentication
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';

import { errorHandler, notFoundHandler } from '../../src/middleware/index.js';
import authRoutes from '../../src/routes/authRoutes.js';
import userUserRoutes from '../../src/routes/user/userRoutes.js';
import adminUserRoutes from '../../src/routes/admin/userRoutes.js';
import userAcademyRoutes from '../../src/routes/user/academyRoutes.js';
import adminAcademyRoutes from '../../src/routes/admin/academyRoutes.js';
import jobsRoutes from '../../src/routes/user/jobsRoutes.js';

/**
 * Create a configured Fastify test instance
 * @returns {Promise<FastifyInstance>}
 */
export async function createTestApp() {
  const fastify = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Register multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Register JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-purposes-only',
  });

  // Set error handlers
  fastify.setErrorHandler(errorHandler);
  fastify.setNotFoundHandler(notFoundHandler);

  // Health check endpoint
  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'rise-social-backend-test',
  }));

  // Register routes with /api prefix
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userUserRoutes, { prefix: '/api/users' });
  await fastify.register(adminUserRoutes, { prefix: '/api/admin/users' });
  await fastify.register(userAcademyRoutes, { prefix: '/api/academies' });
  await fastify.register(adminAcademyRoutes, { prefix: '/api/admin/academies' });
  await fastify.register(jobsRoutes, { prefix: '/api/jobs' });

  await fastify.ready();

  return fastify;
}

/**
 * Generate a test JWT token
 * @param {Object} payload - Token payload
 * @param {number} payload.userId - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role (USER or ADMIN)
 * @param {string} [payload.firstName] - User first name
 * @param {string} [payload.lastName] - User last name
 * @returns {string} JWT token
 */
export function generateAuthToken(payload) {
  const fastify = Fastify();
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-purposes-only',
  });

  // Wait for plugin registration
  return new Promise((resolve, reject) => {
    fastify.ready((err) => {
      if (err) {
        reject(err);
        return;
      }

      const token = fastify.jwt.sign(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role || 'USER',
          firstName: payload.firstName || 'Test',
          lastName: payload.lastName || 'User',
        },
        { expiresIn: '1h' }
      );

      fastify.close();
      resolve(token);
    });
  });
}

/**
 * Generate a test admin token
 * @param {number} userId - Admin user ID
 * @param {string} email - Admin email
 * @returns {Promise<string>} JWT token
 */
export async function generateAdminToken(userId = 1, email = 'admin@test.com') {
  return generateAuthToken({
    userId,
    email,
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
  });
}

/**
 * Generate a test user token
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<string>} JWT token
 */
export async function generateUserToken(userId = 1, email = 'user@test.com') {
  return generateAuthToken({
    userId,
    email,
    role: 'USER',
    firstName: 'Test',
    lastName: 'User',
  });
}

/**
 * Make an authenticated request to the test server
 * @param {FastifyInstance} app - Fastify test instance
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method
 * @param {string} options.url - Request URL
 * @param {Object} [options.payload] - Request body
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Response object
 */
export async function authenticatedRequest(app, options, token) {
  return app.inject({
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export default {
  createTestApp,
  generateAuthToken,
  generateAdminToken,
  generateUserToken,
  authenticatedRequest,
};
