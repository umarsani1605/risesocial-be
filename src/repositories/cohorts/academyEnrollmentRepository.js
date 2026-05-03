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
          completed_at: null,
          transaction: { status: { notIn: ['failed', 'expired', 'cancelled'] } },
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

  /**
   * Get next sequence number atomically within a transaction.
   * This method must be called within a Prisma transaction context.
   * @param {Object} tx - Prisma transaction client
   * @returns {Promise<number>} Next sequence number
   */
  async getNextSequenceNumber(tx) {
    this.logger.info('[AcademyEnrollmentRepository] getNextSequenceNumber start');
    try {
      const last = await tx.academyEnrollment.findFirst({
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

  async markCompleted(id, { notes } = {}) {
    this.logger.info({ id }, '[AcademyEnrollmentRepository] markCompleted start');
    try {
      const updated = await prisma.academyEnrollment.update({
        where: { id },
        data: {
          completed_at: new Date(),
          ...(notes !== undefined && { notes }),
        },
      });
      this.logger.info({ id: updated.id }, '[AcademyEnrollmentRepository] markCompleted success');
      return updated;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyEnrollmentRepository] markCompleted error');
      throw error;
    }
  }
}

export const academyEnrollmentRepository = new AcademyEnrollmentRepository();
