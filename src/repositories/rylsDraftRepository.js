import { BaseRepository } from './base/BaseRepository.js';
import prisma from '../lib/prisma.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * RYLS Draft Registration Repository
 * Handles database operations for draft registrations
 */
export class RylsDraftRepository extends BaseRepository {
  constructor() {
    super(prisma.rylsDraftRegistration);
  }

  get logger() {
    return getLogger();
  }

  async createDraft({ email, resumeToken, currentStep, formData, scholarshipType, expiresAt }) {
    this.logger.info('[rylsDraftRepository] createDraft called');
    try {
      const draft = await this.model.create({
        data: {
          email: email.toLowerCase(),
          resume_token: resumeToken,
          current_step: currentStep,
          form_data: formData,
          scholarship_type: scholarshipType || null,
          expires_at: expiresAt,
        },
      });
      this.logger.info({ id: draft.id }, '[rylsDraftRepository] draft created');
      return draft;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftRepository] createDraft error');
      throw new Error('Failed to create draft');
    }
  }

  async findByResumeToken(token) {
    this.logger.info('[rylsDraftRepository] findByResumeToken called');
    try {
      return await this.model.findUnique({ where: { resume_token: token } });
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftRepository] findByResumeToken error');
      throw new Error('Failed to find draft by token');
    }
  }

  async updateByToken(token, { currentStep, formData, scholarshipType }) {
    this.logger.info('[rylsDraftRepository] updateByToken called');
    try {
      const data = { updated_at: new Date() };
      if (currentStep !== undefined) data.current_step = currentStep;
      if (formData !== undefined) data.form_data = formData;
      if (scholarshipType !== undefined) data.scholarship_type = scholarshipType;

      return await this.model.update({ where: { resume_token: token }, data });
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftRepository] updateByToken error');
      throw new Error('Failed to update draft');
    }
  }

  async deleteByToken(token) {
    this.logger.info('[rylsDraftRepository] deleteByToken called');
    try {
      return await this.model.delete({ where: { resume_token: token } });
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftRepository] deleteByToken error');
      throw new Error('Failed to delete draft');
    }
  }

  async deleteExpired() {
    this.logger.info('[rylsDraftRepository] deleteExpired called');
    try {
      const result = await this.model.deleteMany({ where: { expires_at: { lt: new Date() } } });
      this.logger.info({ count: result.count }, '[rylsDraftRepository] expired drafts deleted');
      return result.count;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftRepository] deleteExpired error');
      throw new Error('Failed to delete expired drafts');
    }
  }

  async getDrafts(options = {}) {
    this.logger.info({ options }, '[rylsDraftRepository] getDrafts called');
    try {
      const { page = 1, limit = 50, search } = options;
      const skip = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause.OR = [
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [drafts, total] = await Promise.all([
        this.model.findMany({
          where: whereClause,
          orderBy: { updated_at: 'desc' },
          skip,
          take: limit,
        }),
        this.model.count({ where: whereClause }),
      ]);

      return { drafts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftRepository] getDrafts error');
      throw new Error('Failed to get drafts');
    }
  }

  async countDrafts() {
    this.logger.info('[rylsDraftRepository] countDrafts called');
    try {
      return await this.model.count();
    } catch (error) {
      this.logger.error({ err: error }, '[rylsDraftRepository] countDrafts error');
      throw new Error('Failed to count drafts');
    }
  }
}
