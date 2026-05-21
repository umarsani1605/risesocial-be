import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST,
  enableExceptionAutocapture: true,
});

function readHeader(request, name) {
  const value = request?.headers?.[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function getPostHogRequestContext(request) {
  return {
    distinctId: readHeader(request, 'x-posthog-distinct-id'),
    sessionId: readHeader(request, 'x-posthog-session-id'),
  };
}

export function identifyUser(user, request) {
  if (process.env.NODE_ENV !== 'production') return;
  if (!user?.id) return;

  posthog.identify({
    distinctId: String(user.id),
    properties: {
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      role: user.role,
      ...(getPostHogRequestContext(request).sessionId
        ? { posthog_session_id: getPostHogRequestContext(request).sessionId }
        : {}),
    },
  });
}

export function captureEvent(distinctId, event, properties = {}, request) {
  if (process.env.NODE_ENV !== 'production') return;
  const context = getPostHogRequestContext(request);
  const resolvedDistinctId = distinctId != null ? String(distinctId) : context.distinctId;
  if (!resolvedDistinctId) return;

  posthog.capture({
    distinctId: resolvedDistinctId,
    event,
    properties: {
      ...properties,
      ...(context.distinctId ? { posthog_distinct_id: context.distinctId } : {}),
      ...(context.sessionId ? { posthog_session_id: context.sessionId } : {}),
      ...(request?.id ? { request_id: request.id } : {}),
    },
  });
}

export default posthog;
