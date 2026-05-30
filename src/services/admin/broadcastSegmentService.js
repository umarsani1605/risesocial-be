import prisma from '../../config/database.js';
import {
  BROADCAST_SEGMENTS,
  BROADCAST_SEGMENT_VALUES,
  SEGMENT_NOTIFICATION_FLAG,
} from '../../constants/broadcast.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resolves a broadcast recipient segment into a deduplicated list of emails.
 * All segments are sourced from our own DB (or admin-provided custom input).
 */
export class BroadcastSegmentService {
  /**
   * @param {string} segment - one of BROADCAST_SEGMENTS
   * @param {object} [criteria] - { email } for single, { emails } for custom list
   * @returns {Promise<string[]>} unique, lowercased, valid emails
   */
  async resolveSegment(segment, criteria = {}) {
    if (!BROADCAST_SEGMENT_VALUES.includes(segment)) {
      const err = new Error(`Unknown recipient segment: ${segment}`);
      err.statusCode = 400;
      throw err;
    }

    let emails;
    switch (segment) {
      case BROADCAST_SEGMENTS.ALL_USERS:
        emails = await this._resolveAllUsers();
        break;
      case BROADCAST_SEGMENTS.RYLS_SUBMITTED:
        emails = await this._resolveRylsSubmitted();
        break;
      case BROADCAST_SEGMENTS.PROGRAM_SUBSCRIBERS:
      case BROADCAST_SEGMENTS.JOB_SUBSCRIBERS:
        emails = await this._resolveNotificationSubscribers(SEGMENT_NOTIFICATION_FLAG[segment]);
        break;
      case BROADCAST_SEGMENTS.CUSTOM_LIST:
        emails = this._resolveCustomList(criteria);
        break;
      default:
        emails = [];
    }

    return this._normalize(emails);
  }

  /**
   * Recipient counts for the fixed (DB-backed) segments. `custom_list` is
   * excluded because its count depends on admin-provided input.
   */
  async getAllSegmentCounts() {
    const fixed = [
      BROADCAST_SEGMENTS.ALL_USERS,
      BROADCAST_SEGMENTS.PROGRAM_SUBSCRIBERS,
      BROADCAST_SEGMENTS.JOB_SUBSCRIBERS,
      BROADCAST_SEGMENTS.RYLS_SUBMITTED,
    ];
    const entries = await Promise.all(
      fixed.map(async (segment) => [segment, (await this.resolveSegment(segment)).length]),
    );
    return Object.fromEntries(entries);
  }

  async _resolveAllUsers() {
    const rows = await prisma.user.findMany({ select: { email: true } });
    return rows.map((r) => r.email);
  }

  async _resolveRylsSubmitted() {
    const rows = await prisma.rylsRegistration.findMany({
      where: {
        OR: [
          { fully_funded_submission: { isNot: null } },
          { self_funded_submission: { isNot: null } },
        ],
      },
      select: { email: true },
    });
    return rows.map((r) => r.email);
  }

  async _resolveNotificationSubscribers(flag) {
    const rows = await prisma.userSetting.findMany({
      where: { key: 'notification_preferences' },
      select: { value: true, user: { select: { email: true } } },
    });
    return rows
      .filter((r) => r.value && r.value[flag] === true && r.user?.email)
      .map((r) => r.user.email);
  }

  _resolveCustomList(criteria) {
    const raw = criteria?.emails ?? '';
    const parsed = String(raw)
      .split(/[\n;,]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    const valid = parsed.filter((e) => EMAIL_REGEX.test(e));
    if (valid.length === 0) {
      const err = new Error('No valid email addresses found in the custom list');
      err.statusCode = 400;
      throw err;
    }
    return valid;
  }

  /** Lowercase, validate, and deduplicate. */
  _normalize(emails) {
    const seen = new Set();
    for (const raw of emails) {
      const email = String(raw ?? '').trim().toLowerCase();
      if (EMAIL_REGEX.test(email)) seen.add(email);
    }
    return [...seen];
  }
}

export const broadcastSegmentService = new BroadcastSegmentService();
