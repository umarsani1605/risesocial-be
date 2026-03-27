import { RylsDraftRepository } from '../repositories/rylsDraftRepository.js';
import crypto from 'crypto';
import { getLogger } from '../lib/loggerContext.js';

const DRAFT_EXPIRY_DAYS = 30;

/**
 * RYLS Draft Service
 * Business logic for draft registration system
 */
export class RylsDraftService {
  constructor() {
    this.draftRepository = new RylsDraftRepository();
  }

  get logger() {
    return getLogger();
  }

  /**
   * Save or update a draft registration
   * @param {{ email: string, resumeToken?: string, step: number, formData: object }} params
   * @returns {Promise<{ resumeToken: string, currentStep: number, savedAt: string }>}
   */
  async saveDraft({ email, resumeToken, step, formData }) {
    this.logger.info('[rylsDraftService] saveDraft start');
    try {
      const expiresAt = new Date(Date.now() + DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      const scholarshipType = formData?.step1?.scholarshipType || null;

      let draft;

      if (resumeToken) {
        const existing = await this.draftRepository.findByResumeToken(resumeToken);
        if (existing) {
          draft = await this.draftRepository.updateByToken(resumeToken, {
            currentStep: step,
            formData,
            scholarshipType,
          });
          this.logger.info('[rylsDraftService] draft updated');
        } else {
          // Token doesn't exist, create new
          resumeToken = null;
        }
      }

      if (!resumeToken) {
        const newToken = crypto.randomBytes(32).toString('hex');
        draft = await this.draftRepository.createDraft({
          email,
          resumeToken: newToken,
          currentStep: step,
          formData,
          scholarshipType,
          expiresAt,
        });
        resumeToken = newToken;
        this.logger.info('[rylsDraftService] draft created');
      }

      this.logger.info('[rylsDraftService] saveDraft success');
      return {
        resumeToken,
        currentStep: step,
        savedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftService] saveDraft error');
      throw error;
    }
  }

  /**
   * Get a draft by resume token
   * @param {string} resumeToken
   * @returns {Promise<{ formData: object, currentStep: number } | null>}
   */
  async getDraft(resumeToken) {
    this.logger.info('[rylsDraftService] getDraft start');
    try {
      const draft = await this.draftRepository.findByResumeToken(resumeToken);

      if (!draft) {
        this.logger.info('[rylsDraftService] draft not found');
        return null;
      }

      if (new Date(draft.expires_at) < new Date()) {
        this.logger.info('[rylsDraftService] draft expired, deleting');
        await this.draftRepository.deleteByToken(resumeToken).catch(() => {});
        return null;
      }

      this.logger.info('[rylsDraftService] getDraft success');
      return {
        formData: draft.form_data,
        currentStep: draft.current_step,
        scholarshipType: draft.scholarship_type,
        email: draft.email,
        createdAt: draft.created_at,
        updatedAt: draft.updated_at,
        expiresAt: draft.expires_at,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftService] getDraft error');
      throw new Error('Failed to retrieve draft');
    }
  }

  /**
   * Delete a draft by resume token
   * @param {string} resumeToken
   */
  async deleteDraft(resumeToken) {
    this.logger.info('[rylsDraftService] deleteDraft start');
    try {
      await this.draftRepository.deleteByToken(resumeToken);
      this.logger.info('[rylsDraftService] deleteDraft success');
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftService] deleteDraft error');
      // Non-fatal — token may not exist
    }
  }

  /**
   * Cleanup expired drafts
   * @returns {Promise<number>} Number of deleted drafts
   */
  async cleanupExpired() {
    this.logger.info('[rylsDraftService] cleanupExpired start');
    try {
      const count = await this.draftRepository.deleteExpired();
      this.logger.info({ count }, '[rylsDraftService] cleanupExpired success');
      return count;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftService] cleanupExpired error');
      throw new Error('Failed to cleanup expired drafts');
    }
  }

  /**
   * Get all drafts with pagination (admin)
   */
  async getDrafts(options = {}) {
    this.logger.info('[rylsDraftService] getDrafts start');
    try {
      const result = await this.draftRepository.getDrafts(options);
      this.logger.info('[rylsDraftService] getDrafts success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftService] getDrafts error');
      throw new Error('Failed to retrieve drafts');
    }
  }

  /**
   * Get draft count (admin stats)
   */
  async getDraftStats() {
    this.logger.info('[rylsDraftService] getDraftStats start');
    try {
      const total = await this.draftRepository.countDrafts();
      this.logger.info('[rylsDraftService] getDraftStats success');
      return { total };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftService] getDraftStats error');
      throw new Error('Failed to retrieve draft stats');
    }
  }
}

export const rylsDraftService = new RylsDraftService();
