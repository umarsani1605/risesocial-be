import { createHash } from 'crypto';
import { getLogger } from '../lib/loggerContext.js';

function normalizeAndHash(value) {
  if (!value) return undefined;
  return createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  return digits;
}

function buildUserData({ email, phone, firstName, lastName } = {}, { fbp, fbc, clientIp, userAgent } = {}) {
  return {
    em: normalizeAndHash(email),
    ph: normalizeAndHash(normalizePhone(phone)),
    fn: normalizeAndHash(firstName),
    ln: normalizeAndHash(lastName),
    ...(fbp && { fbp }),
    ...(fbc && { fbc }),
    ...(clientIp && { client_ip_address: clientIp }),
    ...(userAgent && { client_user_agent: userAgent }),
  };
}

async function postToCapi(events, testEventCode, pixelId, accessToken) {
  const logger = getLogger();

  if (!pixelId || !accessToken) {
    logger.warn('[metaCapi] pixelId or accessToken not provided, skipping CAPI');
    return;
  }

  const payload = {
    data: events,
    ...(testEventCode && { test_event_code: testEventCode }),
  };

  const url = `https://graph.facebook.com/v22.0/${pixelId}/events?access_token=${accessToken}`;

  logger.info(
    {
      pixelId,
      data: events,
      ...(testEventCode && { test_event_code: testEventCode }),
    },
    '[metaCapi] sending event',
  );

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      logger.warn({ pixelId, statusCode: res.status, capiResponse: json }, '[metaCapi] non-200 response');
    } else {
      logger.info({ pixelId, statusCode: res.status, capiResponse: json }, '[metaCapi] success');
    }
  } catch (err) {
    logger.error({ pixelId, err }, '[metaCapi] fetch error');
  }
}

const getTestEventCode = () => process.env.META_TEST_EVENT_CODE || null;

/**
 * Send a generic event to Meta CAPI.
 *
 * @param {Object} params
 * @param {string} params.eventName - Meta standard event name (e.g. 'Lead', 'Purchase')
 * @param {string} params.eventId   - UUID for deduplication with Pixel
 * @param {string} [params.eventSourceUrl] - Page URL where event occurred
 * @param {Object} [params.userData] - { email, phone, firstName, lastName }
 * @param {Object} [params.customData] - Arbitrary custom data object
 * @param {string} [params.fbp] - _fbp cookie value
 * @param {string} [params.fbc] - _fbc cookie value
 * @param {string} [params.clientIp] - Client IP from request
 * @param {string} [params.userAgent] - User-Agent from request
 */
export async function sendEvent({ eventName, eventId, eventSourceUrl, userData = {}, customData = {}, fbp, fbc, clientIp, userAgent }) {
  const eventPayload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    ...(eventSourceUrl && { event_source_url: eventSourceUrl }),
    user_data: buildUserData(userData, { fbp, fbc, clientIp, userAgent }),
    ...(Object.keys(customData).length > 0 && { custom_data: customData }),
  };

  // Primary pixel (always)
  await postToCapi([eventPayload], getTestEventCode(), process.env.META_PIXEL_ID, process.env.META_ACCESS_TOKEN);

  // Secondary pixel (only if env exists)
  if (process.env.META_PIXEL_ID_2 && process.env.META_ACCESS_TOKEN_2) {
    await postToCapi([eventPayload], null, process.env.META_PIXEL_ID_2, process.env.META_ACCESS_TOKEN_2);
  }
}
