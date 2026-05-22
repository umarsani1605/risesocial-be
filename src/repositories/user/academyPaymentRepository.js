import prisma from '../../config/database.js';

export class AcademyPaymentRepository {

  /**
   * Get next sequence number atomically within a transaction.
   * This method must be called within a Prisma transaction context.
   * @param {Object} tx - Prisma transaction client
   * @returns {Promise<number>} Next sequence number
   */
  async getNextSequenceNumber(tx) {
    const rows = await tx.$queryRaw`SELECT nextval('academy_transaction_code_seq') AS seq`;
    return Number(rows[0].seq);
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
