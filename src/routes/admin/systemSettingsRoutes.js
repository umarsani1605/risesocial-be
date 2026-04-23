import { adminSystemSettingsController } from '../../controllers/admin/systemSettingsController.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';

export async function systemSettingsRoutes(fastify) {
  const tag = { tags: ['Admin System Settings'] };

  fastify.addHook('preHandler', adminMiddleware);

  fastify.get('/', {
    schema: {
      ...tag,
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
    preHandler: requirePermission('admin.settings'),
    handler: adminSystemSettingsController.getAllSettings,
  });

  fastify.get('/:key', {
    schema: {
      ...tag,
      description: 'Get setting by key (Admin only)',
      params: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] },
    },
    preHandler: requirePermission('admin.settings'),
    handler: adminSystemSettingsController.getSetting,
  });

  fastify.put('/:key', {
    schema: {
      ...tag,
      description: 'Set setting value (Admin only)',
      params: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] },
      body: {
        type: 'object',
        properties: { value: { type: 'object' }, description: { type: 'string' } },
        required: ['value'],
      },
    },
    preHandler: requirePermission('admin.settings', 'EDITOR'),
    handler: adminSystemSettingsController.setSetting,
  });

  fastify.delete('/:key', {
    schema: {
      ...tag,
      description: 'Delete setting by key (Admin only)',
      params: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] },
    },
    preHandler: requirePermission('admin.settings', 'EDITOR'),
    handler: adminSystemSettingsController.deleteSetting,
  });

  fastify.get('/linkedin/rate-limit', {
    schema: {
      ...tag,
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
                jobs: { type: 'object', properties: { limit: { type: 'integer' }, remaining: { type: 'integer' }, reset: { type: 'integer' } } },
                requests: { type: 'object', properties: { limit: { type: 'integer' }, remaining: { type: 'integer' }, reset: { type: 'integer' } } },
                last_updated: { type: 'string' },
              },
            },
          },
        },
      },
    },
    preHandler: requirePermission('admin.settings'),
    handler: adminSystemSettingsController.getLinkedInRateLimit,
  });
}

export default systemSettingsRoutes;
