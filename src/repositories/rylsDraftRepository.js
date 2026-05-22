import { BaseRepository } from './shared/BaseRepository.js';
import prisma from '../config/database.js';

export class RylsDraftRepository extends BaseRepository {
  constructor() {
    super(prisma.rylsDraftRegistration);
  }


  async createDraft({ email, resumeToken, currentStep, formData, scholarshipType }) {
    try {
      const result = await prisma.rylsDraftRegistration.create({
        data: {
          email,
          resume_token: resumeToken,
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

  async updateByToken(token, { email, currentStep, formData, scholarshipType }) {
    try {
      const result = await prisma.rylsDraftRegistration.update({
        where: { resume_token: token },
        data: {
          email,
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

  async getDrafts({ page = 1, limit } = {}) {
    try {
      const numericLimit = limit ? Number(limit) : undefined;
      const skip = numericLimit ? (page - 1) * numericLimit : undefined;
      const [data, total] = await Promise.all([
        prisma.rylsDraftRegistration.findMany({
          ...(skip !== undefined ? { skip } : {}),
          ...(numericLimit !== undefined ? { take: numericLimit } : {}),
          orderBy: { updated_at: 'desc' },
        }),
        prisma.rylsDraftRegistration.count(),
      ]);
      return { data, total };
    } catch (error) {
      throw error;
    }
  }

  async getDraftsForExport() {
    try {
      return await prisma.rylsDraftRegistration.findMany({
        select: {
          email: true,
          current_step: true,
          form_data: true,
          scholarship_type: true,
          updated_at: true,
        },
        orderBy: {
          updated_at: 'desc',
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

export const rylsDraftRepository = new RylsDraftRepository();
