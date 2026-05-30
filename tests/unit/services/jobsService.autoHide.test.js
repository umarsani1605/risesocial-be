import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockJobsRepository = {
  autoHideExpiredLinkedInJobs: vi.fn(),
};

vi.mock('../../../src/repositories/shared/jobsRepository.js', () => ({
  jobsRepository: mockJobsRepository,
}));

vi.mock('../../../src/integrations/linkedinJobSearch.js', () => ({
  linkedInJobSearch: {
    searchJobs: vi.fn(),
  },
}));

vi.mock('../../../src/services/admin/systemSettingsService.js', () => ({
  systemSettingsService: {
    setLinkedInLastSyncedAt: vi.fn(),
  },
}));

const { JobsService } = await import('../../../src/services/shared/jobsService.js');

describe('JobsService.autoHideExpiredLinkedInJobs', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new JobsService();
    mockJobsRepository.autoHideExpiredLinkedInJobs.mockResolvedValue({ count: 5 });
  });

  it('passes now and the created_at fallback cutoff to the repository', async () => {
    const now = new Date('2026-05-30T10:00:00.000Z');

    const result = await service.autoHideExpiredLinkedInJobs(2, now);

    expect(mockJobsRepository.autoHideExpiredLinkedInJobs).toHaveBeenCalledWith({
      now,
      fallbackCreatedBefore: new Date('2026-05-16T10:00:00.000Z'),
    });
    expect(result).toEqual({ updatedCount: 5 });
  });
});
