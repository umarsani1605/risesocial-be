// Both packages ship as CommonJS, so default-import and destructure (named ESM
// imports throw under Node ESM). The scheduler plugin lives in @fastify/schedule;
// the AsyncTask / SimpleIntervalJob primitives live in toad-scheduler.
import fp from 'fastify-plugin';
import schedulePlugin from '@fastify/schedule';
import toad from 'toad-scheduler';

import { jobSyncSchedulerService } from '../services/shared/jobSyncSchedulerService.js';

const { fastifySchedule } = schedulePlugin;
const { AsyncTask, SimpleIntervalJob } = toad;

/**
 * Schedules the admin-configured LinkedIn job sync. The toad-scheduler timer is
 * in-memory, so instead of a fragile fixed interval we tick hourly and let
 * `jobSyncSchedulerService` decide if the sync is due (it reads the admin
 * schedule + persisted last-run timestamp). Hourly granularity lets the due
 * check honour the configured hour; `runImmediately` also checks once on boot.
 *
 * Wrapped in `fastify-plugin` so registering `@fastify/schedule` decorates the
 * root instance (its `scheduler` decorator does NOT escape an encapsulated
 * context on its own). Guarded by `SCHEDULER_ENABLED` so it stays off in
 * local/test. Assumes a single instance (no multi-replica locking).
 */
async function jobSyncScheduler(fastify) {
  if (process.env.SCHEDULER_ENABLED !== 'true') {
    fastify.log.info('[jobSyncScheduler] disabled (set SCHEDULER_ENABLED=true to enable)');
    return;
  }

  fastify.log.info('[jobSyncScheduler] registering @fastify/schedule');
  await fastify.register(fastifySchedule);
  fastify.log.info('[jobSyncScheduler] @fastify/schedule registered');

  fastify.addHook('onReady', async function onReady() {
    fastify.log.info('[jobSyncScheduler] onReady start');
    const syncTask = new AsyncTask(
      'linkedin-sync',
      () => jobSyncSchedulerService.runDueLinkedInSync(fastify.log),
      (err) => fastify.log.error({ err }, '[jobSyncScheduler] linkedin-sync task error'),
    );

    const syncJob = new SimpleIntervalJob(
      { hours: 1, runImmediately: true },
      syncTask,
      { id: 'linkedin-sync', preventOverrun: true },
    );

    const autoHideTask = new AsyncTask(
      'linkedin-auto-hide',
      () => jobSyncSchedulerService.runDueLinkedInAutoHide(fastify.log),
      (err) => fastify.log.error({ err }, '[jobSyncScheduler] linkedin-auto-hide task error'),
    );

    const autoHideJob = new SimpleIntervalJob(
      { hours: 1, runImmediately: true },
      autoHideTask,
      { id: 'linkedin-auto-hide', preventOverrun: true },
    );

    fastify.scheduler.addSimpleIntervalJob(syncJob);
    fastify.scheduler.addSimpleIntervalJob(autoHideJob);
    fastify.log.info('[jobSyncScheduler] linkedin-sync scheduled (hourly tick, admin-configured cadence)');
    fastify.log.info('[jobSyncScheduler] linkedin-auto-hide scheduled (hourly sweep for expired synced jobs)');
  });
}

export default fp(jobSyncScheduler, { name: 'job-sync-scheduler', fastify: '5.x' });
