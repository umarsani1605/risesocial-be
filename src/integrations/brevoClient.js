import { BrevoClient } from '@getbrevo/brevo';

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

/** Brevo error `code` → clear, user-facing message. */
const BREVO_CODE_MESSAGES = {
  not_enough_credits:
    'Brevo sending quota reached. The daily email allowance (300/day on the free plan) is used up or credits are insufficient.',
  invalid_parameter: 'Invalid data (check the sender address, subject, or recipient emails).',
  missing_parameter: 'A required field is missing (sender/subject).',
  out_of_range: 'The recipient count or payload size exceeds what Brevo allows.',
  unauthorized: 'Brevo authentication failed. The API key is invalid or lacks permission.',
  permission_denied: 'The Brevo account does not have permission for this operation.',
  account_under_validation: 'The Brevo account is still under validation and cannot send emails yet.',
  duplicate_request: 'An identical request was sent too frequently. Please try again shortly.',
  document_not_found: 'A referenced resource was not found in Brevo.',
};

/** Brevo HTTP status to a clear message (fallback when `code` is absent). */
const BREVO_STATUS_MESSAGES = {
  400: 'The request to Brevo was invalid (check the sender, subject, or recipient emails).',
  401: 'The Brevo API key is invalid or missing.',
  402: 'Brevo quota/credits are insufficient to send emails.',
  403: 'Brevo denied access. The sender address may not be verified or permission is missing.',
  404: 'The Brevo endpoint or resource was not found.',
  429: 'Too many requests to Brevo (rate limit). Please try again shortly.',
  500: 'Brevo is having issues (server error). Please try again later.',
  503: 'The Brevo service is unavailable. Please try again later.',
};

/**
 * Turns a thrown Brevo SDK error (BrevoError: `{ statusCode, body: { code, message } }`)
 * into a single clear sentence, so it reads well in `error_detail` / toasts instead
 * of the SDK's verbose default ("Status code: 400\nBody: {...}").
 */
export function formatBrevoError(error) {
  const statusCode = error?.statusCode ?? error?.response?.statusCode ?? error?.status;
  const body = error?.body ?? error?.response?.body ?? {};
  const code = typeof body === 'object' ? body?.code : undefined;
  const apiMessage = typeof body === 'object' ? body?.message : undefined;

  if (code && BREVO_CODE_MESSAGES[code]) {
    return apiMessage ? `${BREVO_CODE_MESSAGES[code]} (${apiMessage})` : BREVO_CODE_MESSAGES[code];
  }
  if (statusCode && BREVO_STATUS_MESSAGES[statusCode]) {
    return apiMessage ? `${BREVO_STATUS_MESSAGES[statusCode]} (${apiMessage})` : BREVO_STATUS_MESSAGES[statusCode];
  }
  return apiMessage || error?.message || 'Failed to reach Brevo.';
}

/** Wraps a Brevo SDK call so any failure rethrows with a clear, formatted message. */
async function callBrevo(fn) {
  try {
    return await fn();
  } catch (error) {
    const formatted = new Error(formatBrevoError(error));
    formatted.statusCode = error?.statusCode ?? error?.status;
    formatted.cause = error;
    throw formatted;
  }
}

export async function sendEmail({ to, toName, subject, htmlContent }) {
  const result = await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.EMAIL_FROM_NAME,
      email: process.env.EMAIL_FROM_ADDRESS,
    },
    to: [{ email: to, name: toName }],
    subject,
    htmlContent,
  });

  return result;
}

/**
 * List senders registered in the Brevo account.
 * Returns `[{ id, name, email, active }]`. `active` indicates a verified sender.
 */
export async function getSenders() {
  const result = await callBrevo(() => brevo.senders.getSenders());
  const senders = result?.senders ?? [];
  return senders.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    active: s.active ?? false,
  }));
}

/**
 * Send one broadcast to many recipients in a single API call using
 * `messageVersions` (one recipient per version, so recipients never see each
 * other). Every message is tagged so stats can be pulled back by tag later.
 *
 * @param {object} args
 * @param {string[]} args.recipients - recipient email addresses
 * @param {{ email: string, name: string }} args.sender
 * @param {string} args.subject
 * @param {string} args.htmlContent
 * @param {string} args.tag - e.g. "broadcast-12"
 * @returns {Promise<{ messageIds: string[] }>}
 */
export async function sendBroadcast({ recipients, sender, subject, htmlContent, tag }) {
  const result = await callBrevo(() =>
    brevo.transactionalEmails.sendTransacEmail({
      sender: { email: sender.email, name: sender.name },
      subject,
      htmlContent,
      tags: [tag],
      messageVersions: recipients.map((email) => ({ to: [{ email }] })),
    }),
  );

  // messageVersions responses return `messageIds`; single sends return `messageId`.
  const messageIds = result?.messageIds ?? (result?.messageId ? [result.messageId] : []);
  return { messageIds, raw: result };
}

/**
 * Pull aggregated transactional stats for a broadcast by its tag.
 * Returns normalized counters (Brevo delivers camelCase fields).
 */
export async function getBroadcastStats(tag, log) {
  const r = (await callBrevo(() => brevo.transactionalEmails.getAggregatedSmtpReport({ tag }))) ?? {};
  // Log the raw Brevo response so 0-value counters can be debugged (parse vs. genuinely 0).
  log?.debug?.({ tag, raw: r }, '[brevoClient] getBroadcastStats raw Brevo response');
  return {
    requests: r.requests ?? 0,
    delivered: r.delivered ?? 0,
    opens: r.opens ?? 0,
    unique_opens: r.uniqueOpens ?? 0,
    clicks: r.clicks ?? 0,
    unique_clicks: r.uniqueClicks ?? 0,
    hard_bounces: r.hardBounces ?? 0,
    soft_bounces: r.softBounces ?? 0,
    spam_reports: r.spamReports ?? 0,
    blocked: r.blocked ?? 0,
    invalid: r.invalid ?? 0,
    unsubscribed: r.unsubscribed ?? 0,
  };
}
