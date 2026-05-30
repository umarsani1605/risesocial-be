/**
 * brevoClient broadcast helpers — unit tests with a mocked @getbrevo/brevo SDK.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendTransacEmail = vi.fn();
const getAggregatedSmtpReport = vi.fn();
const getSenders = vi.fn();

vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: class {
    transactionalEmails = { sendTransacEmail, getAggregatedSmtpReport };
    senders = { getSenders };
  },
}));

const brevo = await import('../../../src/integrations/brevoClient.js');

describe('brevoClient broadcast helpers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getSenders maps fields and defaults active to false', async () => {
    getSenders.mockResolvedValue({ senders: [{ id: 1, name: 'Rise', email: 'info@risesocial.org', active: true }, { id: 2, name: 'X', email: 'x@y.com' }] });
    const res = await brevo.getSenders();
    expect(res).toEqual([
      { id: 1, name: 'Rise', email: 'info@risesocial.org', active: true },
      { id: 2, name: 'X', email: 'x@y.com', active: false },
    ]);
  });

  it('sendBroadcast uses messageVersions (one per recipient) and a tag', async () => {
    sendTransacEmail.mockResolvedValue({ messageIds: ['<a>', '<b>'] });
    const res = await brevo.sendBroadcast({
      recipients: ['a@x.com', 'b@x.com'],
      sender: { email: 'info@risesocial.org', name: 'Rise' },
      subject: 'Hi',
      htmlContent: '<p>Hi</p>',
      tag: 'broadcast-7',
    });

    const arg = sendTransacEmail.mock.calls[0][0];
    expect(arg.tags).toEqual(['broadcast-7']);
    expect(arg.messageVersions).toEqual([
      { to: [{ email: 'a@x.com' }] },
      { to: [{ email: 'b@x.com' }] },
    ]);
    expect(arg.to).toBeUndefined();
    expect(res.messageIds).toEqual(['<a>', '<b>']);
  });

  it('sendBroadcast falls back to messageId when messageIds absent', async () => {
    sendTransacEmail.mockResolvedValue({ messageId: '<solo>' });
    const res = await brevo.sendBroadcast({ recipients: ['a@x.com'], sender: { email: 'e', name: 'n' }, subject: 's', htmlContent: 'h', tag: 't' });
    expect(res.messageIds).toEqual(['<solo>']);
  });

  it('getBroadcastStats normalizes Brevo camelCase to snake_case counters', async () => {
    getAggregatedSmtpReport.mockResolvedValue({
      requests: 12, delivered: 10, opens: 8, uniqueOpens: 6, clicks: 4, uniqueClicks: 3,
      hardBounces: 1, softBounces: 2, spamReports: 1, blocked: 1, invalid: 1, unsubscribed: 1,
    });
    const res = await brevo.getBroadcastStats('broadcast-7');
    expect(getAggregatedSmtpReport).toHaveBeenCalledWith({ tag: 'broadcast-7' });
    expect(res).toEqual({
      requests: 12, delivered: 10, opens: 8, unique_opens: 6, clicks: 4, unique_clicks: 3,
      hard_bounces: 1, soft_bounces: 2, spam_reports: 1, blocked: 1, invalid: 1, unsubscribed: 1,
    });
  });

  it('getBroadcastStats defaults missing fields to 0', async () => {
    getAggregatedSmtpReport.mockResolvedValue({});
    const res = await brevo.getBroadcastStats('broadcast-7');
    expect(res).toEqual({
      requests: 0, delivered: 0, opens: 0, unique_opens: 0, clicks: 0, unique_clicks: 0,
      hard_bounces: 0, soft_bounces: 0, spam_reports: 0, blocked: 0, invalid: 0, unsubscribed: 0,
    });
  });

  describe('formatBrevoError', () => {
    it('maps a known error code to a clear message (with the API detail)', () => {
      const msg = brevo.formatBrevoError({ statusCode: 402, body: { code: 'not_enough_credits', message: 'Not enough credits' } });
      expect(msg).toContain('Brevo sending quota reached');
      expect(msg).toContain('Not enough credits');
    });

    it('falls back to HTTP status when no known code', () => {
      const msg = brevo.formatBrevoError({ statusCode: 401, body: {} });
      expect(msg).toContain('Brevo API key is invalid');
    });

    it('falls back to the API message, then a generic default', () => {
      expect(brevo.formatBrevoError({ body: { message: 'Weird thing' } })).toBe('Weird thing');
      expect(brevo.formatBrevoError(new Error('socket hang up'))).toBe('socket hang up');
      expect(brevo.formatBrevoError({})).toBe('Failed to reach Brevo.');
    });
  });

  it('sendBroadcast rethrows Brevo failures with a clear formatted message', async () => {
    sendTransacEmail.mockRejectedValue({ statusCode: 402, body: { code: 'not_enough_credits', message: 'Not enough credits' } });
    await expect(
      brevo.sendBroadcast({ recipients: ['a@x.com'], sender: { email: 'e', name: 'n' }, subject: 's', htmlContent: 'h', tag: 't' }),
    ).rejects.toThrow('Brevo sending quota reached');
  });
});
