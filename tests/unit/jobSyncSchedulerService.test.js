import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock collaborators BEFORE importing the service under test.
vi.mock('../../src/services/admin/systemSettingsService.js', () => ({
  systemSettingsService: {
    getLinkedInSyncSchedule: vi.fn(),
    getLinkedInLastSyncedAt: vi.fn(),
    getLinkedInSyncFilter: vi.fn(),
  },
}));

vi.mock('../../src/services/shared/jobsService.js', () => ({
  jobsService: {
    syncJobsFromLinkedIn: vi.fn(),
    autoHideExpiredLinkedInJobs: vi.fn(),
  },
}));

import { jobSyncSchedulerService } from '../../src/services/shared/jobSyncSchedulerService.js';
import { systemSettingsService } from '../../src/services/admin/systemSettingsService.js';
import { jobsService } from '../../src/services/shared/jobsService.js';

const silentLog = { info: vi.fn(), error: vi.fn() };

// A UTC Date whose Asia/Jakarta (UTC+7) wall-clock is the given Y/M/D/H.
const jakartaTime = (y, mo, d, h) => new Date(Date.UTC(y, mo, d, h) - 7 * 60 * 60 * 1000);
// 2024-01-01 is a Monday → day_of_week 0 in Monday-first indexing.
const MON_0200 = jakartaTime(2024, 0, 1, 2);
const daysBefore = (date, n) => new Date(date.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const schedule = (over = {}) => ({ enabled: true, job_limit: 10, interval_weeks: 2, day_of_week: 0, hour: 2, hide_after_weeks: 2, ...over });

describe('JobSyncSchedulerService.isDue', () => {
  it('false when disabled', () => {
    expect(jobSyncSchedulerService.isDue(schedule({ enabled: false }), null, MON_0200)).toBe(false);
  });

  it('true when enabled, matching day+hour, never synced', () => {
    expect(jobSyncSchedulerService.isDue(schedule(), null, MON_0200)).toBe(true);
  });

  it('true when interval elapsed (15d >= 14d)', () => {
    expect(jobSyncSchedulerService.isDue(schedule(), daysBefore(MON_0200, 15), MON_0200)).toBe(true);
  });

  it('false on wrong weekday', () => {
    expect(jobSyncSchedulerService.isDue(schedule({ day_of_week: 2 }), null, MON_0200)).toBe(false);
  });

  it('false before the configured hour', () => {
    expect(jobSyncSchedulerService.isDue(schedule({ hour: 3 }), null, MON_0200)).toBe(false);
  });

  it('true at or after the configured hour (self-heals a missed tick / late deploy)', () => {
    // Configured Monday 02:00, but now is Monday 05:00 → still runs today.
    expect(jobSyncSchedulerService.isDue(schedule({ hour: 2 }), null, jakartaTime(2024, 0, 1, 5))).toBe(true);
  });

  it('false when interval not yet elapsed (5d < 14d)', () => {
    expect(jobSyncSchedulerService.isDue(schedule(), daysBefore(MON_0200, 5), MON_0200)).toBe(false);
  });

  it('weekly (interval_weeks 1) runs again after ~7 days', () => {
    expect(jobSyncSchedulerService.isDue(schedule({ interval_weeks: 1 }), daysBefore(MON_0200, 7), MON_0200)).toBe(true);
  });
});

describe('JobSyncSchedulerService.runDueLinkedInSync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    systemSettingsService.getLinkedInSyncSchedule.mockResolvedValue(schedule());
    systemSettingsService.getLinkedInLastSyncedAt.mockResolvedValue(null);
    systemSettingsService.getLinkedInSyncFilter.mockResolvedValue({ advanced_title_filter: ['esg'] });
    jobsService.syncJobsFromLinkedIn.mockResolvedValue({ success: true, savedJobs: 3, skippedJobs: 7 });
    jobsService.autoHideExpiredLinkedInJobs.mockResolvedValue({ updatedCount: 4 });
  });

  it('runs sync with the stored filter when due', async () => {
    vi.spyOn(jobSyncSchedulerService, 'isDue').mockReturnValue(true);

    const res = await jobSyncSchedulerService.runDueLinkedInSync(silentLog);

    expect(jobsService.syncJobsFromLinkedIn).toHaveBeenCalledWith({ filter: { advanced_title_filter: ['esg'] }, limit: 10 });
    expect(res.ran).toBe(true);
  });

  it('skips sync when not due', async () => {
    vi.spyOn(jobSyncSchedulerService, 'isDue').mockReturnValue(false);

    const res = await jobSyncSchedulerService.runDueLinkedInSync(silentLog);

    expect(jobsService.syncJobsFromLinkedIn).not.toHaveBeenCalled();
    expect(res.ran).toBe(false);
    expect(res.reason).toBe('not_due');
  });

  it('does not throw when sync fails', async () => {
    vi.spyOn(jobSyncSchedulerService, 'isDue').mockReturnValue(true);
    jobsService.syncJobsFromLinkedIn.mockRejectedValue(new Error('RapidAPI down'));

    const res = await jobSyncSchedulerService.runDueLinkedInSync(silentLog);

    expect(res.ran).toBe(false);
    expect(res.reason).toBe('error');
  });
});

describe('JobSyncSchedulerService.runDueLinkedInAutoHide', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    systemSettingsService.getLinkedInSyncSchedule.mockResolvedValue(schedule({ enabled: false, hide_after_weeks: 3 }));
    jobsService.autoHideExpiredLinkedInJobs.mockResolvedValue({ updatedCount: 2 });
  });

  it('auto-hides LinkedIn jobs using the configured fallback week threshold', async () => {
    const res = await jobSyncSchedulerService.runDueLinkedInAutoHide(silentLog);

    expect(jobsService.autoHideExpiredLinkedInJobs).toHaveBeenCalledWith(3);
    expect(res.ran).toBe(true);
    expect(res.updatedCount).toBe(2);
  });

  it('does not throw when auto-hide fails', async () => {
    jobsService.autoHideExpiredLinkedInJobs.mockRejectedValue(new Error('DB timeout'));

    const res = await jobSyncSchedulerService.runDueLinkedInAutoHide(silentLog);

    expect(res.ran).toBe(false);
    expect(res.reason).toBe('error');
  });
});
