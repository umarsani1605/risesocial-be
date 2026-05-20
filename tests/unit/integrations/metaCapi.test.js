import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'crypto';

const hash = (value) => createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex');

describe('metaCapi integration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ events_received: 1 }),
    }));

    delete process.env.META_PIXEL_ID;
    delete process.env.META_ACCESS_TOKEN;
    delete process.env.META_TEST_EVENT_CODE;
    delete process.env.META_PIXEL_ACCESS_TOKENS;
  });

  it('sends a normalized Meta CAPI payload to the global pixel', async () => {
    process.env.META_PIXEL_ID = 'global-pixel';
    process.env.META_ACCESS_TOKEN = 'global-token';
    process.env.META_TEST_EVENT_CODE = 'TEST123';

    const { sendEvent } = await import('../../../src/integrations/metaCapi.js');

    await sendEvent({
      eventName: 'Lead',
      eventId: 'lead-123',
      eventSourceUrl: 'https://risesocial.org/programs/rise-young-leaders-summit/registration/success',
      userData: {
        email: ' Umar@Example.COM ',
        phone: '0812-3456-7890',
        firstName: 'Umar',
        lastName: 'Sani',
      },
      customData: {
        content_name: 'Fully Funded',
        value: 15,
        currency: 'USD',
      },
      fbp: 'fb.1.123',
      fbc: 'fb.1.456',
      clientIp: '127.0.0.1',
      userAgent: 'Vitest',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('https://graph.facebook.com/v22.0/global-pixel/events?access_token=global-token');
    expect(options.method).toBe('POST');

    const payload = JSON.parse(options.body);
    expect(payload.test_event_code).toBe('TEST123');
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0]).toMatchObject({
      event_name: 'Lead',
      event_id: 'lead-123',
      action_source: 'website',
      event_source_url: 'https://risesocial.org/programs/rise-young-leaders-summit/registration/success',
      custom_data: {
        content_name: 'Fully Funded',
        value: 15,
        currency: 'USD',
      },
    });
    expect(payload.data[0].user_data).toMatchObject({
      em: hash('umar@example.com'),
      ph: hash('6281234567890'),
      fn: hash('umar'),
      ln: hash('sani'),
      fbp: 'fb.1.123',
      fbc: 'fb.1.456',
      client_ip_address: '127.0.0.1',
      client_user_agent: 'Vitest',
    });
  });

  it('uses the configured token map for an academy pixel', async () => {
    process.env.META_PIXEL_ACCESS_TOKENS = JSON.stringify({
      'academy-pixel': 'academy-token',
    });

    const { sendEvent } = await import('../../../src/integrations/metaCapi.js');

    await sendEvent({
      eventName: 'Purchase',
      eventId: 'TRX-001',
      eventSourceUrl: 'https://risesocial.org/academy/esg/payment',
      pixelId: 'academy-pixel',
      customData: { value: 150000, currency: 'IDR' },
      userData: { email: 'buyer@example.com' },
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('https://graph.facebook.com/v22.0/academy-pixel/events?access_token=academy-token');
  });

  it('skips CAPI without configured credentials', async () => {
    const { sendEvent } = await import('../../../src/integrations/metaCapi.js');

    await sendEvent({
      eventName: 'Lead',
      eventId: 'lead-123',
      eventSourceUrl: 'https://risesocial.org/success',
    });

    expect(fetch).not.toHaveBeenCalled();
  });
});
