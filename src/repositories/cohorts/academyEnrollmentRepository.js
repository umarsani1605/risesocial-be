import prisma from '../../config/database.js';

export class AcademyEnrollmentRepository {

  async createPendingEnrollment(userId, academyId, transactionId) {
    try {
      const enrollment = await prisma.academyEnrollment.create({
        data: {
          user_id: userId,
          academy_id: academyId,
          transaction_id: transactionId,
        },
      });
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  async findActiveByUserAcademy(userId, academyId) {
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
              items: { select: { product_code: true } },
            },
          },
        },
      });
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
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
      return enrollment;
    } catch (error) {
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

  async markCompleted(id, { notes } = {}) {
    try {
      const updated = await prisma.academyEnrollment.update({
        where: { id },
        data: {
          completed_at: new Date(),
          ...(notes !== undefined && { notes }),
        },
      });
      return updated;
    } catch (error) {
      throw error;
    }
  }
}

export const academyEnrollmentRepository = new AcademyEnrollmentRepository();
