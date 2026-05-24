import prisma from '../../config/database.js';

function parseAcademyIdFromProductCode(productCode) {
  const match = productCode?.match(/^academy-(\d+)-pricing-\d+$/);
  return match ? Number(match[1]) : null;
}

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

  async findByTransactionId(transactionId, db = prisma) {
    try {
      return await db.academyEnrollment.findFirst({
        where: { transaction_id: transactionId },
        include: {
          transaction: true,
          placement: true,
          academy: { select: { id: true, title: true, slug: true } },
          user: { select: { id: true, first_name: true, last_name: true, email: true } },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async ensureForPaidTransaction(tx, transactionId) {
    try {
      const existing = await tx.academyEnrollment.findFirst({
        where: { transaction_id: transactionId },
      });
      if (existing) return existing;

      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        select: {
          id: true,
          user_id: true,
          status: true,
          product_type: true,
          product_type_id: true,
        },
      });

      if (!transaction || transaction.product_type !== 'academy_enrollment' || transaction.status !== 'paid') {
        return null;
      }

      const item = await tx.transactionItem.findFirst({
        where: { transaction_id: transactionId },
        select: { product_code: true },
      });

      const academyId = parseAcademyIdFromProductCode(item?.product_code);
      if (!academyId) {
        throw new Error(`Academy product_code missing or invalid for transaction ${transactionId}`);
      }

      const enrollment = await tx.academyEnrollment.create({
        data: {
          user_id: transaction.user_id,
          academy_id: academyId,
          transaction_id: transactionId,
        },
      });

      if (transaction.product_type_id !== enrollment.id) {
        await tx.transaction.update({
          where: { id: transactionId },
          data: { product_type_id: enrollment.id, updated_at: new Date() },
        });
      }

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
