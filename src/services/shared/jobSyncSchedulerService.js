import { systemSettingsService } from '../admin/systemSettingsService.js';
import { jobsService } from './jobsService.js';
import posthog from '../../config/posthog.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;
/** Jakarta is UTC+7 year-round (no DST), so a fixed offset is exact. */
const JAKARTA_OFFSET_MS = 7 * MS_PER_HOUR;
const toMondayFirstDay = (utcDay) => (utcDay + 6) % 7;

/**
 * Orchestrates the admin-scheduled LinkedIn job sync. The Fastify plugin ticks
 * hourly; this service decides whether a sync is actually due based on the
 * admin schedule (`linkedin_sync_schedule`) and the persisted last-run time
 * (`linkedin_last_synced_at`), so the schedule survives restarts/deploys.
 */
export class JobSyncSchedulerService {
  /**
   * True when the schedule is enabled AND `now` (in Asia/Jakarta wall-clock) is
   * on the configured weekday at or after the configured hour AND at least
   * `interval_weeks` have elapsed since the last sync (1-day slack so a weekly
   * run never skips a week). Using "at or after the hour" (not an exact match)
   * keeps it self-healing: a deploy/restart or a missed hourly tick still runs
   * later the same day, and the elapsed-interval guard prevents a repeat run.
   */
  isDue(schedule, lastSyncedAt, now = new Date()) {
    if (!schedule || schedule.enabled !== true) return false;

    const jakarta = new Date(now.getTime() + JAKARTA_OFFSET_MS);
    if (toMondayFirstDay(jakarta.getUTCDay()) !== schedule.day_of_week) return false;
    if (jakarta.getUTCHours() < schedule.hour) return false;

    if (lastSyncedAt) {
      const last = new Date(lastSyncedAt);
      if (!Number.isNaN(last.getTime())) {
        const daysSince = (now.getTime() - last.getTime()) / MS_PER_DAY;
        if (daysSince < schedule.interval_weeks * 7 - 1) return false;
      }
    }
    return true;
  }

  /**
   * Runs the LinkedIn sync if the admin schedule says it is due. Never throws —
   * failures are logged and swallowed so the recurring scheduler job stays alive.
   * The last-run timestamp is written by `jobsService.syncJobsFromLinkedIn` so
   * manual and scheduled syncs share one cadence.
   * @param {{ info?: Function, error?: Function }} [log] - Fastify/pino logger.
   */
  async runDueLinkedInSync(log = console) {
    try {
      const [schedule, lastSyncedAt] = await Promise.all([
        systemSettingsService.getLinkedInSyncSchedule(),
        systemSettingsService.getLinkedInLastSyncedAt(),
      ]);

      if (!this.isDue(schedule, lastSyncedAt)) {
        return { ran: false, reason: 'not_due' };
      }

      log.info?.('[JobSyncSchedulerService] runDueLinkedInSync start');
      const filter = await systemSettingsService.getLinkedInSyncFilter();
      const result = await jobsService.syncJobsFromLinkedIn({ filter, limit: schedule.job_limit });

      log.info?.(
        `[JobSyncSchedulerService] runDueLinkedInSync success (saved=${result?.savedJobs ?? 0}, skipped=${result?.skippedJobs ?? 0})`,
      );
      return { ran: true, result };
    } catch (error) {
      log.error?.({ err: error }, '[JobSyncSchedulerService] runDueLinkedInSync error');
      // Background job — never reaches the request errorHandler, so capture
      // explicitly (mirrors integrations/currencyConverter.js).
      if (process.env.NODE_ENV === 'production') {
        posthog.captureException(error, undefined, {
          integration: 'linkedin_job_sync',
          source: 'scheduler',
        });
      }
      return { ran: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Hourly housekeeping sweep that marks synced LinkedIn/RapidAPI jobs as
   * inactive once they pass `valid_until`, or `created_at + hide_after_weeks`
   * when the source does not provide a deadline. This is intentionally
   * independent from the sync cadence toggle so old synced jobs still age out
   * even if new automatic fetches are paused.
   */
  async runDueLinkedInAutoHide(log = console) {
    try {
      const schedule = await systemSettingsService.getLinkedInSyncSchedule();
      const result = await jobsService.autoHideExpiredLinkedInJobs(schedule.hide_after_weeks);

      log.info?.(
        `[JobSyncSchedulerService] runDueLinkedInAutoHide success (updated=${result?.updatedCount ?? 0}, hide_after_weeks=${schedule.hide_after_weeks})`,
      );
      return { ran: true, updatedCount: result?.updatedCount ?? 0 };
    } catch (error) {
      log.error?.({ err: error }, '[JobSyncSchedulerService] runDueLinkedInAutoHide error');
      if (process.env.NODE_ENV === 'production') {
        posthog.captureException(error, undefined, {
          integration: 'linkedin_job_auto_hide',
          source: 'scheduler',
        });
      }
      return { ran: false, reason: 'error', error: error.message };
    }
  }
}

export const jobSyncSchedulerService = new JobSyncSchedulerService();
