import { adminSystemSettingsController } from '../../controllers/admin/systemSettingsController.js';
import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';

const controller = adminSystemSettingsController;

/**
 * Admin System Settings Routes
 * Handles system configuration and settings management (Admin only)
 */
export default async function adminSystemSettingsRoutes(fastify) {
  const systemSettingsTag = { tags: ['Admin System Settings'] };

  // GET /api/admin/system/settings - Get all system settings
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
    controller.getAllSettings
  );

  // GET /api/admin/system/settings/:key - Get setting by key
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
    controller.getSetting
  );

  // PUT /api/admin/system/settings/:key - Set setting value
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
    controller.setSetting
  );

  // DELETE /api/admin/system/settings/:key - Delete setting
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
    controller.deleteSetting
  );

  // GET /api/admin/system/settings/linkedin/rate-limit - Get LinkedIn rate limit
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
    controller.getLinkedInRateLimit
  );
}
