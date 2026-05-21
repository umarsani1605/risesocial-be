import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const captureMock = vi.fn();
const identifyMock = vi.fn();

vi.mock('posthog-node', () => ({
  PostHog: vi.fn(function PostHogMock() {
    this.capture = captureMock;
    this.identify = identifyMock;
  }),
}));

describe('posthog config helpers', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NODE_ENV = 'production';
  });

  it('reads correlation headers from the request', async () => {
    const { getPostHogRequestContext } = await import('../../../../src/config/posthog.js');

    expect(getPostHogRequestContext({
      headers: {
        'x-posthog-distinct-id': 'anon-123',
        'x-posthog-session-id': 'sess-456',
      },
    })).toEqual({
      distinctId: 'anon-123',
      sessionId: 'sess-456',
    });
  });

  it('captures business events with canonical distinct id plus correlation properties', async () => {
    const { captureEvent } = await import('../../../../src/config/posthog.js');

    captureEvent(99, 'auth.login_succeeded', { source: 'backend' }, {
      id: 'req-1',
      headers: {
        'x-posthog-distinct-id': 'anon-123',
        'x-posthog-session-id': 'sess-456',
      },
    });

    expect(captureMock).toHaveBeenCalledWith({
      distinctId: '99',
      event: 'auth.login_succeeded',
      properties: {
        source: 'backend',
        posthog_distinct_id: 'anon-123',
        posthog_session_id: 'sess-456',
        request_id: 'req-1',
      },
    });
  });

  it('falls back to the frontend distinct id when no canonical distinct id is provided', async () => {
    const { captureEvent } = await import('../../../../src/config/posthog.js');

    captureEvent(null, 'auth.login_failed', { source: 'backend' }, {
      headers: {
        'x-posthog-distinct-id': 'anon-123',
      },
    });

    expect(captureMock).toHaveBeenCalledWith({
      distinctId: 'anon-123',
      event: 'auth.login_failed',
      properties: {
        source: 'backend',
        posthog_distinct_id: 'anon-123',
      },
    });
  });

  it('identifies users with canonical person properties', async () => {
    const { identifyUser } = await import('../../../../src/config/posthog.js');

    identifyUser({
      id: 7,
      email: 'user@example.com',
      first_name: 'Rise',
      last_name: 'Social',
      role: 'USER',
    }, {
      headers: {
        'x-posthog-session-id': 'sess-456',
      },
    });

    expect(identifyMock).toHaveBeenCalledWith({
      distinctId: '7',
      properties: {
        email: 'user@example.com',
        name: 'Rise Social',
        role: 'USER',
        posthog_session_id: 'sess-456',
      },
    });
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });
});
