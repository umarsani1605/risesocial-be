import crypto from 'crypto';
import { rylsDraftRepository } from '../repositories/rylsDraftRepository.js';

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


  async saveDraft({ email, resumeToken, step, formData, scholarshipType }) {
    try {
      if (resumeToken) {
        const existing = await this.repo.findByResumeToken(resumeToken);
        if (existing) {
          const updated = await this.repo.updateByToken(resumeToken, {
            currentStep: step,
            formData,
            scholarshipType: scholarshipType ?? null,
          });
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
      return { resumeToken: token, currentStep: created.current_step, savedAt: created.created_at };
    } catch (error) {
      throw error;
    }
  }

  async getDraft(resumeToken) {
    try {
      const draft = await this.repo.findByResumeToken(resumeToken);
      if (!draft) return null;

      if (draft.expires_at < new Date()) {
        await this.repo.deleteByToken(resumeToken).catch(() => {});
        return null;
      }

      return {
        resumeToken: draft.resume_token,
        currentStep: draft.current_step,
        formData: draft.form_data,
        scholarshipType: draft.scholarship_type,
        expiresAt: draft.expires_at,
        email: draft.email,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteDraft(resumeToken) {
    try {
      await this.repo.deleteByToken(resumeToken);
    } catch (error) {
      if (error.code === 'P2025') return; // record not found — not an error
      throw error;
    }
  }

  async cleanupExpired() {
    try {
      const count = await this.repo.deleteExpired();
      return count;
    } catch (error) {
      throw error;
    }
  }

  async getDrafts(options) {
    try {
      const result = await this.repo.getDrafts(options);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getDraftStats() {
    try {
      const count = await this.repo.model.count({
        where: { expires_at: { gte: new Date() } },
      });
      return { count };
    } catch (error) {
      throw error;
    }
  }
}

export const rylsDraftService = new RylsDraftService();
