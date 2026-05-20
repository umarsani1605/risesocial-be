import { beforeEach, describe, expect, it, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../../../src/integrations/metaCapi.js', () => ({
  sendEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('trackingRoutes', () => {
  let app;
  let sendEvent;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    app = Fastify({ logger: false });
    const metaCapi = await import('../../../../src/integrations/metaCapi.js');
    sendEvent = metaCapi.sendEvent;
    const { default: trackingRoutes } = await import('../../../../src/routes/shared/trackingRoutes.js');
    await app.register(trackingRoutes, { prefix: '/tracking' });
    await app.ready();
  });

  it('accepts a public tracking event and queues CAPI delivery', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/tracking/event',
      headers: {
        'user-agent': 'Vitest',
      },
      payload: {
        event_name: 'Lead',
        event_id: 'lead-123',
        event_source_url: 'https://risesocial.org/success',
        pixel_id: 'pixel-123',
        custom_data: { value: 15, currency: 'USD' },
        user_data: { email: 'umar@example.com' },
        fbp: 'fb.1.123',
        fbc: 'fb.1.456',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expect.objectContaining({
      success: true,
      data: { queued: true },
    }));
    expect(sendEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventName: 'Lead',
      eventId: 'lead-123',
      eventSourceUrl: 'https://risesocial.org/success',
      pixelId: 'pixel-123',
      customData: { value: 15, currency: 'USD' },
      userData: { email: 'umar@example.com' },
      fbp: 'fb.1.123',
      fbc: 'fb.1.456',
      userAgent: 'Vitest',
    }));
  });

  it('rejects unsupported event names', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/tracking/event',
      payload: {
        event_name: 'UnsupportedEvent',
        event_id: 'event-123',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(sendEvent).not.toHaveBeenCalled();
  });
});
