import { adminUserController } from '../../controllers/admin/userController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { createUserSchema, updateUserSchema } from '../../schemas/userSchemas.js';

/**
 * Admin User Management routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function adminUserRoutes(fastify) {
  const userTag = { tags: ['Admin User Management'] };

  // ================================
  // USER MANAGEMENT ROUTES (Admin Only)
  // ================================

  // GET /api/admin/users - Get all users with pagination (Admin only)
  fastify.get(
    '/',
    {
      schema: {
        ...userTag,
        description: 'Get all users with pagination and filtering (Admin only)',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
            sort: { type: 'string', enum: ['created_at', 'updated_at', 'username', 'email'] },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'array' },
              meta: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminUserController.getAllUsers
  );

  // GET /api/admin/users/:id - Get user by ID (Admin only)
  fastify.get(
    '/:id',
    {
      schema: {
        ...userTag,
        description: 'Get user by ID (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminUserController.getUserById
  );

  // POST /api/admin/users - Create new user (Admin only)
  fastify.post(
    '/',
    {
      schema: {
        ...createUserSchema,
        ...userTag,
        description: 'Create new user (Admin only)',
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminUserController.createUser
  );

  // PUT /api/admin/users/:id - Update user (Admin only)
  fastify.put(
    '/:id',
    {
      schema: {
        ...updateUserSchema,
        ...userTag,
        description: 'Update user by ID (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminUserController.updateUser
  );

  // DELETE /api/admin/users/:id - Delete user (Admin only)
  fastify.delete(
    '/:id',
    {
      schema: {
        ...userTag,
        description: 'Delete user by ID (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'null' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminUserController.deleteUser
  );
}
