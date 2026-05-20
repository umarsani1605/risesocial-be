import { beforeEach, describe, expect, it, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../../../src/controllers/admin/systemSettingsController.js', () => ({
  adminSystemSettingsController: {
    sendTestEmailTemplates: vi.fn(async (_request, reply) => {
      return reply.send({ success: true, data: { recipient: 'umarsani361@gmail.com', results: [] } });
    }),
    getAllSettings: vi.fn(),
    getSetting: vi.fn(),
    setSetting: vi.fn(),
    deleteSetting: vi.fn(),
    getLinkedInRateLimit: vi.fn(),
  },
}));

vi.mock('../../../../src/middleware/permissionMiddleware.js', () => ({
  requirePermission: vi.fn(() => async () => {}),
}));

describe('systemSettingsRoutes public email test endpoint', () => {
  let app;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    app = Fastify({ logger: false });
    const { default: systemSettingsRoutes } = await import('../../../../src/routes/admin/systemSettingsRoutes.js');
    await app.register(systemSettingsRoutes, { prefix: '/admin/system/settings' });
    await app.ready();
  });

  it('allows GET /admin/system/settings/test-email-templates without bearer token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/admin/system/settings/test-email-templates',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ recipient: 'umarsani361@gmail.com' }),
      }),
    );
  });
});
