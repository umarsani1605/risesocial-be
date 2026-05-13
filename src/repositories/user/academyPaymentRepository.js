import prisma from '../../config/database.js';

export class AcademyPaymentRepository {

  /**
   * Get next sequence number atomically within a transaction.
   * This method must be called within a Prisma transaction context.
   * @param {Object} tx - Prisma transaction client
   * @returns {Promise<number>} Next sequence number
   */
  async getNextSequenceNumber(tx) {
    try {
      const last = await tx.academyEnrollment.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      const sequence = last ? last.id + 1 : 1;
      return sequence;
    } catch (error) {
      throw error;
    }
  }

  async findEnrollmentWithTransaction(enrollmentId, userId) {
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
      return enrollment;
    } catch (error) {
      throw error;
    }
  }
}

export const academyPaymentRepository = new AcademyPaymentRepository();
