import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AcademyPaymentRepository {
  get logger() {
    return getLogger();
  }

  /**
   * Get next sequence number atomically within a transaction.
   * This method must be called within a Prisma transaction context.
   * @param {Object} tx - Prisma transaction client
   * @returns {Promise<number>} Next sequence number
   */
  async getNextSequenceNumber(tx) {
    this.logger.info('[AcademyPaymentRepository] getNextSequenceNumber');
    try {
      const lastEnrollment = await tx.cohortEnrollment.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      const sequence = lastEnrollment ? lastEnrollment.id + 1 : 1;
      this.logger.info({ sequence }, '[AcademyPaymentRepository] sequence number');
      return sequence;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyPaymentRepository] getNextSequenceNumber error');
      throw error;
    }
  }

  /** Cohort target untuk enrollment pembayaran academy: hanya status `not_started`, yang paling baru dibuat (by `created_at`, lalu `id`). */
  async findLatestCohortByAcademyId(academyId) {
    this.logger.info({ academyId }, '[AcademyPaymentRepository] findLatestCohortByAcademyId');
    try {
      const cohort = await prisma.cohort.findFirst({
        where: { academy_id: academyId, status: 'not_started' },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      });
      this.logger.info({ found: !!cohort }, '[AcademyPaymentRepository] cohort found');
      return cohort;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyPaymentRepository] findLatestCohortByAcademyId error');
      throw error;
    }
  }

  async findExistingEnrollment(userId, academyId) {
    this.logger.info({ userId, academyId }, '[AcademyPaymentRepository] findExistingEnrollment');
    try {
      const enrollment = await prisma.cohortEnrollment.findFirst({
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
      this.logger.info({ found: !!enrollment }, '[AcademyPaymentRepository] enrollment found');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyPaymentRepository] findExistingEnrollment error');
      throw error;
    }
  }

  async findEnrollmentWithTransaction(enrollmentId, userId) {
    this.logger.info({ enrollmentId, userId }, '[AcademyPaymentRepository] findEnrollmentWithTransaction');
    try {
      const enrollment = await prisma.cohortEnrollment.findFirst({
        where: { id: enrollmentId, user_id: userId },
        include: {
          transaction: {
            include: { items: true, midtrans_data: true },
          },
          cohort: {
            select: {
              id: true,
              name: true,
              academy: { select: { id: true, title: true } },
            },
          },
        },
      });
      this.logger.info({ found: !!enrollment }, '[AcademyPaymentRepository] enrollment found');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyPaymentRepository] findEnrollmentWithTransaction error');
      throw error;
    }
  }
}

export const academyPaymentRepository = new AcademyPaymentRepository();
