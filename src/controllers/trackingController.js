import { sendEvent } from '../integrations/metaCapi.js';
import { successResponse, errorResponse } from '../utils/response.js';

const ALLOWED_EVENTS = ['Lead', 'Purchase', 'ViewContent', 'CompleteRegistration'];

class TrackingController {
  /**
   * Track a Meta event via CAPI
   * POST /tracking/event
   */
  trackEvent = async (request, reply) => {
    const { event_name, event_id, event_source_url, custom_data, user_data, fbp, fbc } = request.body ?? {};

    if (!event_name || !ALLOWED_EVENTS.includes(event_name)) {
      return reply.status(400).send(errorResponse('Invalid event_name', 400, `Allowed: ${ALLOWED_EVENTS.join(', ')}`));
    }

    // Fire-and-forget — never block the response
    sendEvent({
      eventName: event_name,
      eventId: event_id,
      eventSourceUrl: event_source_url,
      userData: user_data ?? {},
      customData: custom_data ?? {},
      fbp,
      fbc,
      clientIp: request.ip,
      userAgent: request.headers['user-agent'],
    }).catch(() => {});

    return reply.send(successResponse({ queued: true }, 'Event tracked'));
  };
}

export const trackingController = new TrackingController();
