import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AcademyEnrollmentRepository {
  get logger() {
    return getLogger();
  }

  async createPendingEnrollment(userId, academyId, transactionId) {
    this.logger.info({ userId, academyId, transactionId }, '[AcademyEnrollmentRepository] createPendingEnrollment start');
    try {
      const enrollment = await prisma.academyEnrollment.create({
        data: {
          user_id: userId,
          academy_id: academyId,
          transaction_id: transactionId,
          status: 'pending',
        },
      });
      this.logger.info({ id: enrollment.id }, '[AcademyEnrollmentRepository] createPendingEnrollment success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyEnrollmentRepository] createPendingEnrollment error');
      throw error;
    }
  }

  async findActiveByUserAcademy(userId, academyId) {
    this.logger.info({ userId, academyId }, '[AcademyEnrollmentRepository] findActiveByUserAcademy start');
    try {
      const enrollment = await prisma.academyEnrollment.findFirst({
        where: {
          user_id: userId,
          academy_id: academyId,
          status: { in: ['pending', 'active'] },
        },
        orderBy: { created_at: 'desc' },
        include: {
          transaction: {
            select: {
              id: true,
              status: true,
              transaction_code: true,
              amount: true,
              expired_at: true,
              midtrans_data: { select: { snap_token: true, redirect_url: true } },
            },
          },
        },
      });
      this.logger.info({ found: !!enrollment }, '[AcademyEnrollmentRepository] findActiveByUserAcademy success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyEnrollmentRepository] findActiveByUserAcademy error');
      throw error;
    }
  }

  async findById(id) {
    this.logger.info({ id }, '[AcademyEnrollmentRepository] findById start');
    try {
      const enrollment = await prisma.academyEnrollment.findUnique({
        where: { id },
        include: {
          transaction: true,
          placement: true,
          academy: { select: { id: true, title: true, slug: true } },
          user: { select: { id: true, first_name: true, last_name: true, email: true } },
        },
      });
      this.logger.info({ found: !!enrollment }, '[AcademyEnrollmentRepository] findById success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyEnrollmentRepository] findById error');
      throw error;
    }
  }

  async getNextSequenceNumber() {
    this.logger.info('[AcademyEnrollmentRepository] getNextSequenceNumber start');
    try {
      const last = await prisma.academyEnrollment.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      const sequence = last ? last.id + 1 : 1;
      this.logger.info({ sequence }, '[AcademyEnrollmentRepository] getNextSequenceNumber success');
      return sequence;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyEnrollmentRepository] getNextSequenceNumber error');
      throw error;
    }
  }

  async updateStatus(id, status, extra = {}) {
    this.logger.info({ id, status }, '[AcademyEnrollmentRepository] updateStatus start');
    try {
      const data = { status, ...extra };
      if (status === 'completed' && !data.completed_at) {
        data.completed_at = new Date();
      }
      const updated = await prisma.academyEnrollment.update({
        where: { id },
        data,
      });
      this.logger.info({ id: updated.id, status: updated.status }, '[AcademyEnrollmentRepository] updateStatus success');
      return updated;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyEnrollmentRepository] updateStatus error');
      throw error;
    }
  }
}

export const academyEnrollmentRepository = new AcademyEnrollmentRepository();
