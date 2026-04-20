import { adminUserController } from '../../controllers/admin/userController.js';
import { authMiddleware } from '../../middleware/auth.js';

export default async function adminUserRoutes(fastify) {
  const userTag = { tags: ['Admin Users'] };

  fastify.addHook('preHandler', authMiddleware);

  fastify.get(
    '/',
    {
      schema: {
        ...userTag,
        description: 'Get all users with pagination and filtering (Admin only)',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            id: { type: 'integer' },
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

  fastify.post(
    '/',
    {
      schema: {
        ...userTag,
        description: 'Create new user (Admin only)',
        body: {
          type: 'object',
          required: ['email', 'password', 'first_name', 'last_name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
          },
        },
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

  fastify.put(
    '/:id',
    {
      schema: {
        ...userTag,
        description: 'Update user by ID (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['user', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
          },
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
