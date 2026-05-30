/**
 * AdminBroadcastService Unit Tests
 * Mocks the repository, segment service, Brevo client, and template.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendBroadcastMock = vi.fn();
const getBroadcastStatsMock = vi.fn();

vi.mock('../../../../src/integrations/brevoClient.js', () => ({
  sendBroadcast: sendBroadcastMock,
  getBroadcastStats: getBroadcastStatsMock,
}));
vi.mock('../../../../src/templates/email/broadcastEmail.js', () => ({
  broadcastEmail: vi.fn(() => '<html>body</html>'),
}));

const { AdminBroadcastService } = await import('../../../../src/services/admin/broadcastService.js');

function makeService() {
  const service = new AdminBroadcastService();
  service.repository = {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdWithDetails: vi.fn(),
    findAll: vi.fn(),
    updateStatus: vi.fn((id, status, extra = {}) => ({ id, status, ...extra })),
    updateStats: vi.fn((id, stats) => ({ id, ...stats })),
  };
  service.segmentService = { resolveSegment: vi.fn() };
  return service;
}

describe('AdminBroadcastService', () => {
  let service;
  beforeEach(() => {
    vi.clearAllMocks();
    service = makeService();
  });

  describe('previewRecipients', () => {
    it('reports count and blocks when over the daily limit', async () => {
      const many = Array.from({ length: 301 }, (_, i) => `u${i}@x.com`);
      service.segmentService.resolveSegment.mockResolvedValue(many);
      const res = await service.previewRecipients('all_users');
      expect(res.count).toBe(301);
      expect(res.blocked).toBe(true);
      expect(res.sample).toHaveLength(5);
    });

    it('is not blocked at or under the limit', async () => {
      service.segmentService.resolveSegment.mockResolvedValue(['a@x.com']);
      const res = await service.previewRecipients('custom_list', { emails: 'a@x.com' });
      expect(res.blocked).toBe(false);
    });
  });

  describe('sendBroadcast', () => {
    const draft = {
      id: 5, status: 'DRAFT', segment: 'all_users', segment_criteria: null,
      subject: 'Hi', body_text: 'Body', sender_email: 'info@risesocial.org', sender_name: 'Rise',
    };

    it('transitions DRAFT -> SENDING -> SENT and records messageIds', async () => {
      service.repository.findById.mockResolvedValue(draft);
      service.segmentService.resolveSegment.mockResolvedValue(['a@x.com', 'b@x.com']);
      sendBroadcastMock.mockResolvedValue({ messageIds: ['<a>', '<b>'] });

      const res = await service.sendBroadcast(5);

      expect(service.repository.updateStatus).toHaveBeenNthCalledWith(1, 5, 'SENDING', { brevo_tag: 'broadcast-5-hi' });
      expect(sendBroadcastMock).toHaveBeenCalledWith(expect.objectContaining({ tag: 'broadcast-5-hi', recipients: ['a@x.com', 'b@x.com'] }));
      expect(service.repository.updateStatus).toHaveBeenLastCalledWith(5, 'SENT', expect.objectContaining({
        recipient_count: 2, message_ids: ['<a>', '<b>'],
      }));
      expect(res.status).toBe('SENT');
    });

    it('blocks and FAILS when recipients exceed the daily limit', async () => {
      service.repository.findById.mockResolvedValue(draft);
      service.segmentService.resolveSegment.mockResolvedValue(Array.from({ length: 301 }, (_, i) => `u${i}@x.com`));

      await expect(service.sendBroadcast(5)).rejects.toMatchObject({ statusCode: 400 });
      expect(service.repository.updateStatus).toHaveBeenLastCalledWith(5, 'FAILED', expect.objectContaining({ error_detail: expect.any(String) }));
      expect(sendBroadcastMock).not.toHaveBeenCalled();
    });

    it('FAILS when no recipients resolve', async () => {
      service.repository.findById.mockResolvedValue(draft);
      service.segmentService.resolveSegment.mockResolvedValue([]);
      await expect(service.sendBroadcast(5)).rejects.toMatchObject({ statusCode: 400 });
      expect(service.repository.updateStatus).toHaveBeenLastCalledWith(5, 'FAILED', expect.any(Object));
    });

    it('FAILS and rethrows when Brevo errors, never stuck in SENDING', async () => {
      service.repository.findById.mockResolvedValue(draft);
      service.segmentService.resolveSegment.mockResolvedValue(['a@x.com']);
      sendBroadcastMock.mockRejectedValue(new Error('Brevo 402'));
      await expect(service.sendBroadcast(5)).rejects.toThrow('Brevo 402');
      expect(service.repository.updateStatus).toHaveBeenLastCalledWith(5, 'FAILED', { error_detail: 'Brevo 402' });
    });

    it('rejects when broadcast is not in DRAFT', async () => {
      service.repository.findById.mockResolvedValue({ ...draft, status: 'SENT' });
      await expect(service.sendBroadcast(5)).rejects.toMatchObject({ statusCode: 400 });
      expect(service.repository.updateStatus).not.toHaveBeenCalled();
    });

    it('rejects when broadcast not found', async () => {
      service.repository.findById.mockResolvedValue(null);
      await expect(service.sendBroadcast(99)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('refreshStats', () => {
    it('pulls stats by tag and stores them for a SENT broadcast', async () => {
      service.repository.findById.mockResolvedValue({ id: 5, status: 'SENT', brevo_tag: 'broadcast-5' });
      getBroadcastStatsMock.mockResolvedValue({ delivered: 9, opens: 4, unique_opens: 3, clicks: 1, unique_clicks: 1, hard_bounces: 0 });

      const res = await service.refreshStats(5);
      expect(getBroadcastStatsMock).toHaveBeenCalledWith('broadcast-5', undefined);
      expect(service.repository.updateStats).toHaveBeenCalledWith(5, expect.objectContaining({ delivered: 9, opens: 4 }));
      expect(res.delivered).toBe(9);
    });

    it('rejects refresh for a non-sent broadcast', async () => {
      service.repository.findById.mockResolvedValue({ id: 5, status: 'DRAFT', brevo_tag: null });
      await expect(service.refreshStats(5)).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
