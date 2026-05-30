import { adminBroadcastRepository } from '../../repositories/admin/broadcastRepository.js';
import { broadcastSegmentService } from './broadcastSegmentService.js';
import { sendBroadcast as brevoSendBroadcast, getBroadcastStats } from '../../integrations/brevoClient.js';
import { broadcastEmail } from '../../templates/email/broadcastEmail.js';
import { BROADCAST_DAILY_LIMIT, broadcastTag } from '../../constants/broadcast.js';

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export class AdminBroadcastService {
  constructor() {
    this.repository = adminBroadcastRepository;
    this.segmentService = broadcastSegmentService;
  }

  /** Recipient counts for the fixed segments (for inline display in the picker). */
  async getSegmentCounts() {
    return this.segmentService.getAllSegmentCounts();
  }

  /** Resolve a segment and report the recipient count + guard, without persisting. */
  async previewRecipients(segment, segmentCriteria) {
    const emails = await this.segmentService.resolveSegment(segment, segmentCriteria);
    return {
      count: emails.length,
      blocked: emails.length > BROADCAST_DAILY_LIMIT,
      limit: BROADCAST_DAILY_LIMIT,
      sample: emails.slice(0, 5),
    };
  }

  /** Persist a broadcast in DRAFT state. */
  async createBroadcast(data, adminUserId) {
    return this.repository.create({
      subject: data.subject,
      body_text: data.body_text,
      sender_email: data.sender_email,
      sender_name: data.sender_name,
      segment: data.segment,
      segment_criteria: data.segment_criteria ?? null,
      status: 'DRAFT',
      created_by: adminUserId,
    });
  }

  /**
   * Core send orchestration (runs async, fire-and-forget from the controller).
   * DRAFT -> SENDING -> SENT, or -> FAILED with error_detail. Never leaves SENDING.
   */
  async sendBroadcast(broadcastId) {
    const broadcast = await this.repository.findById(broadcastId);
    if (!broadcast) throw httpError('Broadcast not found', 404);
    if (broadcast.status !== 'DRAFT') {
      throw httpError(`Broadcast cannot be sent from status ${broadcast.status}`, 400);
    }

    const tag = broadcastTag(broadcast.id, broadcast.subject);
    await this.repository.updateStatus(broadcast.id, 'SENDING', { brevo_tag: tag });

    try {
      const recipients = await this.segmentService.resolveSegment(
        broadcast.segment,
        broadcast.segment_criteria,
      );

      if (recipients.length === 0) {
        throw httpError('No recipients resolved for this segment', 400);
      }
      if (recipients.length > BROADCAST_DAILY_LIMIT) {
        throw httpError(
          `Recipient count (${recipients.length}) exceeds the daily limit of ${BROADCAST_DAILY_LIMIT}`,
          400,
        );
      }

      const htmlContent = broadcastEmail({ subject: broadcast.subject, bodyText: broadcast.body_text });

      const { messageIds } = await brevoSendBroadcast({
        recipients,
        sender: { email: broadcast.sender_email, name: broadcast.sender_name },
        subject: broadcast.subject,
        htmlContent,
        tag,
      });

      return this.repository.updateStatus(broadcast.id, 'SENT', {
        sent_at: new Date(),
        recipient_count: recipients.length,
        message_ids: messageIds,
      });
    } catch (error) {
      await this.repository.updateStatus(broadcast.id, 'FAILED', {
        error_detail: error.message,
      });
      throw error;
    }
  }

  /** Pull aggregate stats from Brevo by tag and store them on the broadcast row. */
  async refreshStats(broadcastId, log) {
    const broadcast = await this.repository.findById(broadcastId);
    if (!broadcast) throw httpError('Broadcast not found', 404);
    if (broadcast.status !== 'SENT' || !broadcast.brevo_tag) {
      throw httpError('Stats are only available for sent broadcasts', 400);
    }

    const stats = await getBroadcastStats(broadcast.brevo_tag, log);
    return this.repository.updateStats(broadcast.id, stats);
  }

  /** Return all broadcasts as-is. The client handles filtering and pagination. */
  async listBroadcasts() {
    return this.repository.findAll();
  }

  async getBroadcastById(id) {
    const broadcast = await this.repository.findByIdWithDetails(id);
    if (!broadcast) throw httpError('Broadcast not found', 404);
    return broadcast;
  }
}

export const adminBroadcastService = new AdminBroadcastService();
