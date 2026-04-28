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
      const last = await tx.academyEnrollment.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      const sequence = last ? last.id + 1 : 1;
      this.logger.info({ sequence }, '[AcademyPaymentRepository] sequence number');
      return sequence;
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyPaymentRepository] getNextSequenceNumber error');
      throw error;
    }
  }

  async findEnrollmentWithTransaction(enrollmentId, userId) {
    this.logger.info({ enrollmentId, userId }, '[AcademyPaymentRepository] findEnrollmentWithTransaction');
    try {
      const enrollment = await prisma.academyEnrollment.findFirst({
        where: { id: enrollmentId, user_id: userId },
        include: {
          transaction: {
            include: { items: true, midtrans_data: true },
          },
          academy: { select: { id: true, title: true, slug: true } },
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
