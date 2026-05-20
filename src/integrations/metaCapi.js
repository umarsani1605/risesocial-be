import { createHash } from 'crypto';

function normalizeAndHash(value) {
  if (!value) return undefined;
  return createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return digits || undefined;
}

function parsePixelTokenMap() {
  if (!process.env.META_PIXEL_ACCESS_TOKENS) return {};

  try {
    const parsed = JSON.parse(process.env.META_PIXEL_ACCESS_TOKENS);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    console.warn('[metaCapi] invalid META_PIXEL_ACCESS_TOKENS JSON');
    return {};
  }
}

function resolveCredentials(pixelId) {
  if (pixelId) {
    const tokens = parsePixelTokenMap();
    return { pixelId, accessToken: tokens[pixelId] };
  }

  return {
    pixelId: process.env.META_PIXEL_ID,
    accessToken: process.env.META_ACCESS_TOKEN,
  };
}

function buildUserData({ email, phone, firstName, lastName } = {}, { fbp, fbc, clientIp, userAgent } = {}) {
  return {
    ...(email && { em: normalizeAndHash(email) }),
    ...(phone && { ph: normalizeAndHash(normalizePhone(phone)) }),
    ...(firstName && { fn: normalizeAndHash(firstName) }),
    ...(lastName && { ln: normalizeAndHash(lastName) }),
    ...(fbp && { fbp }),
    ...(fbc && { fbc }),
    ...(clientIp && { client_ip_address: clientIp }),
    ...(userAgent && { client_user_agent: userAgent }),
  };
}

async function postToCapi(events, { pixelId, accessToken, testEventCode }) {
  if (!pixelId || !accessToken) {
    console.warn('[metaCapi] pixelId or accessToken not configured, skipping CAPI');
    return;
  }

  const payload = {
    data: events,
    ...(testEventCode && { test_event_code: testEventCode }),
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v22.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      console.warn('[metaCapi] non-200 response', { pixelId, statusCode: response.status, body });
    }
  } catch (error) {
    console.error('[metaCapi] fetch error', { pixelId, error });
  }
}

export async function sendEvent({
  eventName,
  eventId,
  eventSourceUrl,
  pixelId,
  userData = {},
  customData = {},
  fbp,
  fbc,
  clientIp,
  userAgent,
}) {
  const credentials = resolveCredentials(pixelId);
  const eventPayload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    ...(eventId && { event_id: eventId }),
    action_source: 'website',
    ...(eventSourceUrl && { event_source_url: eventSourceUrl }),
    user_data: buildUserData(userData, { fbp, fbc, clientIp, userAgent }),
    ...(Object.keys(customData).length > 0 && { custom_data: customData }),
  };

  await postToCapi([eventPayload], {
    ...credentials,
    testEventCode: process.env.META_TEST_EVENT_CODE || undefined,
  });
}

