import { BaseRepository } from './shared/BaseRepository.js';
import prisma from '../config/database.js';

export class RylsDraftRepository extends BaseRepository {
  constructor() {
    super(prisma.rylsDraftRegistration);
  }


  async createDraft({ email, resumeToken, currentStep, formData, scholarshipType, expiresAt }) {
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
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findByResumeToken(token) {
    try {
      const result = await prisma.rylsDraftRegistration.findUnique({
        where: { resume_token: token },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findLatestByEmail(email) {
    try {
      const result = await prisma.rylsDraftRegistration.findFirst({
        where: { email },
        orderBy: { updated_at: 'desc' },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateByToken(token, { currentStep, formData, scholarshipType }) {
    try {
      const result = await prisma.rylsDraftRegistration.update({
        where: { resume_token: token },
        data: {
          current_step: currentStep,
          form_data: formData,
          scholarship_type: scholarshipType ?? null,
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteByToken(token) {
    try {
      const result = await prisma.rylsDraftRegistration.delete({
        where: { resume_token: token },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteExpired() {
    try {
      const result = await prisma.rylsDraftRegistration.deleteMany({
        where: { expires_at: { lt: new Date() } },
      });
      return result.count;
    } catch (error) {
      throw error;
    }
  }

  async getDrafts({ page = 1, limit = 20 } = {}) {
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
      return { data, total };
    } catch (error) {
      throw error;
    }
  }
}

export const rylsDraftRepository = new RylsDraftRepository();
