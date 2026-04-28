import { BaseRepository } from './shared/BaseRepository.js';
import prisma from '../config/database.js';
import { getLogger } from '../utils/loggerContext.js';

export class RylsDraftRepository extends BaseRepository {
  constructor() {
    super(prisma.rylsDraftRegistration);
  }

  get logger() {
    return getLogger();
  }

  async createDraft({ email, resumeToken, currentStep, formData, scholarshipType, expiresAt }) {
    this.logger.info('[RylsDraftRepository] createDraft start');
    try {
      const result = await prisma.rylsDraftRegistration.create({
        data: {
          email,
          resume_token: resumeToken,
          current_step: currentStep,
          form_data: formData,
          scholarship_type: scholarshipType ?? null,
          expires_at: expiresAt,
        },
      });
      this.logger.info({ id: result.id }, '[RylsDraftRepository] createDraft success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftRepository] createDraft error');
      throw error;
    }
  }

  async findByResumeToken(token) {
    this.logger.info('[RylsDraftRepository] findByResumeToken start');
    try {
      const result = await prisma.rylsDraftRegistration.findUnique({
        where: { resume_token: token },
      });
      this.logger.info('[RylsDraftRepository] findByResumeToken success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftRepository] findByResumeToken error');
      throw error;
    }
  }

  async findLatestByEmail(email) {
    this.logger.info('[RylsDraftRepository] findLatestByEmail start');
    try {
      const result = await prisma.rylsDraftRegistration.findFirst({
        where: { email },
        orderBy: { updated_at: 'desc' },
      });
      this.logger.info('[RylsDraftRepository] findLatestByEmail success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftRepository] findLatestByEmail error');
      throw error;
    }
  }

  async updateByToken(token, { currentStep, formData, scholarshipType }) {
    this.logger.info('[RylsDraftRepository] updateByToken start');
    try {
      const result = await prisma.rylsDraftRegistration.update({
        where: { resume_token: token },
        data: {
          current_step: currentStep,
          form_data: formData,
          scholarship_type: scholarshipType ?? null,
        },
      });
      this.logger.info('[RylsDraftRepository] updateByToken success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftRepository] updateByToken error');
      throw error;
    }
  }

  async deleteByToken(token) {
    this.logger.info('[RylsDraftRepository] deleteByToken start');
    try {
      const result = await prisma.rylsDraftRegistration.delete({
        where: { resume_token: token },
      });
      this.logger.info('[RylsDraftRepository] deleteByToken success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftRepository] deleteByToken error');
      throw error;
    }
  }

  async deleteExpired() {
    this.logger.info('[RylsDraftRepository] deleteExpired start');
    try {
      const result = await prisma.rylsDraftRegistration.deleteMany({
        where: { expires_at: { lt: new Date() } },
      });
      this.logger.info({ count: result.count }, '[RylsDraftRepository] deleteExpired success');
      return result.count;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftRepository] deleteExpired error');
      throw error;
    }
  }

  async getDrafts({ page = 1, limit = 20 } = {}) {
    this.logger.info('[RylsDraftRepository] getDrafts start');
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        prisma.rylsDraftRegistration.findMany({
          skip,
          take: limit,
          orderBy: { updated_at: 'desc' },
        }),
        prisma.rylsDraftRegistration.count(),
      ]);
      this.logger.info({ total }, '[RylsDraftRepository] getDrafts success');
      return { data, total };
    } catch (error) {
      this.logger.error({ err: error }, '[RylsDraftRepository] getDrafts error');
      throw error;
    }
  }
}

export const rylsDraftRepository = new RylsDraftRepository();
