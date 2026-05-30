import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@fastify/schedule', () => ({
  default: {
    fastifySchedule: vi.fn(async function fastifySchedule() {}),
  },
}));

vi.mock('toad-scheduler', () => ({
  default: {
    AsyncTask: class AsyncTask {
      constructor(name, handler, onError) {
        this.name = name;
        this.handler = handler;
        this.onError = onError;
      }
    },
    SimpleIntervalJob: class SimpleIntervalJob {
      constructor(schedule, task, options) {
        this.schedule = schedule;
        this.task = task;
        this.options = options;
      }
    },
  },
}));

vi.mock('../../src/services/shared/jobSyncSchedulerService.js', () => ({
  jobSyncSchedulerService: {
    runDueLinkedInSync: vi.fn(),
    runDueLinkedInAutoHide: vi.fn(),
  },
}));

import jobSyncScheduler from '../../src/plugins/jobSyncScheduler.js';

describe('jobSyncScheduler plugin', () => {
  const originalEnv = process.env.SCHEDULER_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    process.env.SCHEDULER_ENABLED = originalEnv;
  });

  it('does not register scheduler internals when disabled', async () => {
    process.env.SCHEDULER_ENABLED = 'false';

    const fastify = {
      register: vi.fn(),
      addHook: vi.fn(),
      log: { info: vi.fn(), error: vi.fn() },
    };

    await jobSyncScheduler(fastify);

    expect(fastify.register).not.toHaveBeenCalled();
    expect(fastify.addHook).not.toHaveBeenCalled();
  });

  it('registers an onReady hook when enabled', async () => {
    process.env.SCHEDULER_ENABLED = 'true';

    let onReady;
    const fastify = {
      register: vi.fn().mockResolvedValue(undefined),
      addHook: vi.fn((name, hook) => {
        if (name === 'onReady') onReady = hook;
      }),
      scheduler: { addSimpleIntervalJob: vi.fn() },
      log: { info: vi.fn(), error: vi.fn() },
    };

    await jobSyncScheduler(fastify);

    expect(fastify.register).toHaveBeenCalledTimes(1);
    expect(fastify.addHook).toHaveBeenCalledWith('onReady', expect.any(Function));
    await onReady.call(fastify);
    expect(fastify.scheduler.addSimpleIntervalJob).toHaveBeenCalledTimes(2);
  });
});
