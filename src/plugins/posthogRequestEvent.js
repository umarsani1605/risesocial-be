import posthog from '../config/posthog.js';

export default async function posthogRequestEvent(fastify) {
  fastify.addHook('onResponse', async (request, reply) => {
    if (process.env.NODE_ENV !== 'production') return;

    const status = reply.statusCode;
    const duration_ms = Math.round(reply.elapsedTime ?? 0);
    const distinctId = request.user?.userId
      ? String(request.user.userId)
      : `anon:${request.ip}`;

    posthog.capture({
      distinctId,
      event: 'api.request',
      properties: {
        method: request.method,
        path: request.routerPath ?? request.url.split('?')[0],
        status_code: status,
        duration_ms,
        user_id: request.user?.userId ?? null,
        user_role: request.user?.role ?? null,
        is_error: status >= 500,
        slow_request: duration_ms > 1000,
        request_id: request.id,
        app_env: process.env.NODE_ENV,
      },
    });
  });
}
