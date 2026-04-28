import crypto from 'crypto';
import { rylsDraftRepository } from '../repositories/rylsDraftRepository.js';
import { getLogger } from '../utils/loggerContext.js';

const DRAFT_EXPIRY_DAYS = 30;

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function expiresAt() {
  const date = new Date();
  date.setDate(date.getDate() + DRAFT_EXPIRY_DAYS);
  return date;
}

export class RylsDraftService {
  constructor() {
    this.repo = rylsDraftRepository;
  }

  get logger() {
    return getLogger();
  }

  async saveDraft({ email, resumeToken, step, formData, scholarshipType }) {
    this.logger.info('[RylsDraftService] saveDraft start');
    try {
      if (resumeToken) {
        const existing = await this.repo.findByResumeToken(resumeToken);
        if (existing) {
          const updated = await this.repo.updateByToken(resumeToken, {
            currentStep: step,
            formData,
            scholarshipType: scholarshipType ?? null,
          });
          this.logger.info('[RylsDraftService] saveDraft updated existing');
          return { resumeToken, currentStep: updated.current_step, savedAt: updated.updated_at };
        }
      }

      const token = generateToken();
      const created = await this.repo.createDraft({
        email,
        resumeToken: token,
        currentStep: step,
        formData,
        scholarshipType: scholarshipType ?? null,
        expiresAt: expiresAt(),
      });
      this.logger.info('[RylsDraftService] saveDraft created new');
      return { resumeToken: token, currentStep: created.current_step, savedAt: created.created_at };
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftService] saveDraft error');
      throw error;
    }
  }

  async getDraft(resumeToken) {
    this.logger.info('[RylsDraftService] getDraft start');
    try {
      const draft = await this.repo.findByResumeToken(resumeToken);
      if (!draft) return null;

      if (draft.expires_at < new Date()) {
        await this.repo.deleteByToken(resumeToken).catch(() => {});
        return null;
      }

      this.logger.info('[RylsDraftService] getDraft success');
      return {
        resumeToken: draft.resume_token,
        currentStep: draft.current_step,
        formData: draft.form_data,
        scholarshipType: draft.scholarship_type,
        expiresAt: draft.expires_at,
        email: draft.email,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftService] getDraft error');
      throw error;
    }
  }

  async deleteDraft(resumeToken) {
    this.logger.info('[RylsDraftService] deleteDraft start');
    try {
      await this.repo.deleteByToken(resumeToken);
      this.logger.info('[RylsDraftService] deleteDraft success');
    } catch (error) {
      if (error.code === 'P2025') return; // record not found — not an error
      this.logger.error({ err: error }, '[RylsDraftService] deleteDraft error');
      throw error;
    }
  }

  async cleanupExpired() {
    this.logger.info('[RylsDraftService] cleanupExpired start');
    try {
      const count = await this.repo.deleteExpired();
      this.logger.info({ count }, '[RylsDraftService] cleanupExpired success');
      return count;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftService] cleanupExpired error');
      throw error;
    }
  }

  async getDrafts(options) {
    this.logger.info('[RylsDraftService] getDrafts start');
    try {
      const result = await this.repo.getDrafts(options);
      this.logger.info('[RylsDraftService] getDrafts success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftService] getDrafts error');
      throw error;
    }
  }

  async getDraftStats() {
    this.logger.info('[RylsDraftService] getDraftStats start');
    try {
      const count = await this.repo.model.count({
        where: { expires_at: { gte: new Date() } },
      });
      this.logger.info({ count }, '[RylsDraftService] getDraftStats success');
      return { count };
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftService] getDraftStats error');
      throw error;
    }
  }
}

export const rylsDraftService = new RylsDraftService();
