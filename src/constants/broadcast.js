/**
 * Email broadcast recipient segments.
 * Each value is a stable identifier stored on EmailBroadcast.segment and
 * resolved to a list of recipient emails by BroadcastSegmentService.
 */
export const BROADCAST_SEGMENTS = {
  ALL_USERS: 'all_users',
  RYLS_SUBMITTED: 'ryls_submitted',
  PROGRAM_SUBSCRIBERS: 'program_subscribers',
  JOB_SUBSCRIBERS: 'job_subscribers',
  CUSTOM_LIST: 'custom_list',
};

export const BROADCAST_SEGMENT_VALUES = Object.values(BROADCAST_SEGMENTS);

/** Maps a subscriber segment to its notification_preferences JSON flag. */
export const SEGMENT_NOTIFICATION_FLAG = {
  [BROADCAST_SEGMENTS.PROGRAM_SUBSCRIBERS]: 'program_notification',
  [BROADCAST_SEGMENTS.JOB_SUBSCRIBERS]: 'job_notification',
};

/** Brevo free-tier daily sending cap (transactional + marketing combined). */
export const BROADCAST_DAILY_LIMIT = 300;

/** Builds the Brevo tag used to correlate stats with a broadcast. */
/** Builds a unique, readable Brevo tag: id keeps it unique, slug keeps it readable. */
export function broadcastTag(id, subject) {
  const slug = String(subject ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 50)
    .replace(/-+$/, '');
  return `broadcast-${id}-${slug || 'untitled'}`;
}
