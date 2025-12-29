import { adminSystemSettingsController } from '../../controllers/admin/systemSettingsController.js';
import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';

export async function systemSettingsRoutes(fastify) {
  const systemSettingsTag = { tags: ['Admin System Settings'] };

  fastify.get(
    '/',
    {
      schema: {
        ...systemSettingsTag,
        description: 'Get all system settings (Admin only)',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    key: { type: 'string' },
                    value: { type: 'object' },
                    description: { type: 'string' },
                    created_at: { type: 'string' },
                    updated_at: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    },
    adminSystemSettingsController.getAllSettings
  );

  fastify.get(
    '/:key',
    {
      schema: {
        ...systemSettingsTag,
        params: {
          type: 'object',
          properties: {
            key: { type: 'string' },
          },
          required: ['key'],
        },
        description: 'Get setting by key (Admin only)',
      },
      preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    },
    adminSystemSettingsController.getSetting
  );

  fastify.put(
    '/:key',
    {
      schema: {
        ...systemSettingsTag,
        params: {
          type: 'object',
          properties: {
            key: { type: 'string' },
          },
          required: ['key'],
        },
        body: {
          type: 'object',
          properties: {
            value: { type: 'object' },
            description: { type: 'string' },
          },
          required: ['value'],
        },
        description: 'Set setting value (Admin only)',
      },
      preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    },
    adminSystemSettingsController.setSetting
  );

  fastify.delete(
    '/:key',
    {
      schema: {
        ...systemSettingsTag,
        params: {
          type: 'object',
          properties: {
            key: { type: 'string' },
          },
          required: ['key'],
        },
        description: 'Delete setting by key (Admin only)',
      },
      preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    },
    adminSystemSettingsController.deleteSetting
  );

  fastify.get(
    '/linkedin/rate-limit',
    {
      schema: {
        ...systemSettingsTag,
        description: 'Get LinkedIn API rate limit data (Admin only)',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  jobs: {
                    type: 'object',
                    properties: {
                      limit: { type: 'integer' },
                      remaining: { type: 'integer' },
                      reset: { type: 'integer' },
                    },
                  },
                  requests: {
                    type: 'object',
                    properties: {
                      limit: { type: 'integer' },
                      remaining: { type: 'integer' },
                      reset: { type: 'integer' },
                    },
                  },
                  last_updated: { type: 'string' },
                },
              },
            },
          },
        },
      },
      preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    },
    adminSystemSettingsController.getLinkedInRateLimit
  );
}

export default systemSettingsRoutes;
