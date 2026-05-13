import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST,
  enableExceptionAutocapture: true,
});

export function captureEvent(distinctId, event, properties = {}) {
  if (process.env.NODE_ENV !== 'production') return;
  if (!distinctId) return;
  posthog.capture({
    distinctId: String(distinctId),
    event,
    properties,
  });
}

export default posthog;
