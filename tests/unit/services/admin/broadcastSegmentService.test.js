/**
 * BroadcastSegmentService Unit Tests
 * Verifies each recipient segment resolves correctly and custom input is parsed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  user: { findMany: vi.fn() },
  rylsDraftRegistration: { findMany: vi.fn() },
  rylsRegistration: { findMany: vi.fn() },
  userSetting: { findMany: vi.fn() },
};

vi.mock('../../../../src/config/database.js', () => ({ default: mockPrisma }));

const { BroadcastSegmentService } = await import('../../../../src/services/admin/broadcastSegmentService.js');
const { BROADCAST_SEGMENTS } = await import('../../../../src/constants/broadcast.js');

describe('BroadcastSegmentService', () => {
  let service;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new BroadcastSegmentService();
  });

  it('rejects unknown segments', async () => {
    await expect(service.resolveSegment('nope')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('resolves all users', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ email: 'A@x.com' }, { email: 'b@x.com' }]);
    const res = await service.resolveSegment(BROADCAST_SEGMENTS.ALL_USERS);
    expect(res).toEqual(['a@x.com', 'b@x.com']);
  });

  it('resolves RYLS submitted (has a submission)', async () => {
    mockPrisma.rylsRegistration.findMany.mockResolvedValue([{ email: 's@x.com' }]);
    const res = await service.resolveSegment(BROADCAST_SEGMENTS.RYLS_SUBMITTED);
    expect(mockPrisma.rylsRegistration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { fully_funded_submission: { isNot: null } },
            { self_funded_submission: { isNot: null } },
          ],
        },
      }),
    );
    expect(res).toEqual(['s@x.com']);
  });

  it('resolves program subscribers from notification_preferences flag', async () => {
    mockPrisma.userSetting.findMany.mockResolvedValue([
      { value: { program_notification: true }, user: { email: 'p@x.com' } },
      { value: { program_notification: false }, user: { email: 'no@x.com' } },
      { value: null, user: { email: 'null@x.com' } },
    ]);
    const res = await service.resolveSegment(BROADCAST_SEGMENTS.PROGRAM_SUBSCRIBERS);
    expect(res).toEqual(['p@x.com']);
  });

  it('parses a custom list with mixed delimiters, dedupes, drops invalid', async () => {
    const res = await service.resolveSegment(BROADCAST_SEGMENTS.CUSTOM_LIST, {
      emails: 'a@x.com, b@x.com;\nA@x.com\nbroken;c@x.com',
    });
    expect(res).toEqual(['a@x.com', 'b@x.com', 'c@x.com']);
  });

  it('rejects a custom list with no valid emails', async () => {
    await expect(
      service.resolveSegment(BROADCAST_SEGMENTS.CUSTOM_LIST, { emails: 'nope; also-nope' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('returns counts for all fixed segments (excluding custom_list)', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ email: 'a@x.com' }, { email: 'b@x.com' }]);
    mockPrisma.rylsRegistration.findMany.mockResolvedValue([
      { email: 's1@x.com' }, { email: 's2@x.com' }, { email: 's3@x.com' },
    ]);
    mockPrisma.userSetting.findMany.mockResolvedValue([
      { value: { program_notification: true, job_notification: true }, user: { email: 'p@x.com' } },
    ]);

    const counts = await service.getAllSegmentCounts();

    expect(counts).toEqual({
      all_users: 2,
      program_subscribers: 1,
      job_subscribers: 1,
      ryls_submitted: 3,
    });
    expect(counts).not.toHaveProperty('custom_list');
  });
});
