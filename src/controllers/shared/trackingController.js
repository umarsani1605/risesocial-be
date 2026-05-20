import { sendEvent } from '../../integrations/metaCapi.js';
import { errorResponse, successResponse } from '../../utils/response.js';

const ALLOWED_EVENTS = [
  'ViewContent',
  'InitiateCheckout',
  'Lead',
  'Purchase',
  'CompleteRegistration',
  'CompleteRegistrationStep2',
  'CompleteRegistrationStep3',
  'RYLSRegisterClick',
  'RYLSGuidebookClick',
];

export class TrackingController {
  async trackEvent(request, reply) {
    const {
      event_name,
      event_id,
      event_source_url,
      pixel_id,
      custom_data,
      user_data,
      fbp,
      fbc,
    } = request.body ?? {};

    if (!event_name || !ALLOWED_EVENTS.includes(event_name)) {
      return reply.status(400).send(errorResponse('Invalid event_name', 400, `Allowed: ${ALLOWED_EVENTS.join(', ')}`));
    }

    sendEvent({
      eventName: event_name,
      eventId: event_id,
      eventSourceUrl: event_source_url,
      pixelId: pixel_id,
      userData: user_data ?? {},
      customData: custom_data ?? {},
      fbp,
      fbc,
      clientIp: request.ip,
      userAgent: request.headers['user-agent'],
    }).catch((error) => {
      request.log?.warn({ err: error }, 'Meta CAPI event delivery failed');
    });

    return reply.send(successResponse({ queued: true }, 'Event tracked'));
  }
}

export const trackingController = new TrackingController();

