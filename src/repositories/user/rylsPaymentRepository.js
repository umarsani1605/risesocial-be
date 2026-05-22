import prisma from '../../config/database.js';

/**
 * RylsPaymentRepository - Layer 3 (Business-Specific)
 * RYLS-specific payment data management
 * Updated for 3-layer architecture
 */
export class RylsPaymentRepository {

  /**
   * Create RYLS payment record (links to transaction)
   * @param {Object} data - RYLS payment data
   * @returns {Promise<Object>}
   */
  async create(data) {

    try {
      const rylsPayment = await prisma.rylsPayment.create({
        data: {
          transaction_id: data.transaction_id,
          registration_id: data.registration_id,
          scholarship_type: data.scholarship_type,
          payment_method: data.payment_method,
          payment_proof_id: data.payment_proof_id || null,
          status: data.status || 'pending',
        },
        include: {
          transaction: true,
          registration: true,
        },
      });

      return rylsPayment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find by transaction_id
   * @param {number} transactionId - Transaction ID
   * @returns {Promise<Object|null>}
   */
  async findByTransactionId(transactionId) {

    try {
      const payment = await prisma.rylsPayment.findUnique({
        where: { transaction_id: transactionId },
        include: {
          transaction: {
            include: {
              items: true,
              midtrans_data: true,
            },
          },
          registration: true,
          payment_proof: true,
        },
      });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find by registration_id
   * @param {number} registrationId - Registration ID
   * @returns {Promise<Array>}
   */
  async findByRegistrationId(registrationId) {

    try {
      const payments = await prisma.rylsPayment.findMany({
        where: { registration_id: registrationId },
        orderBy: { created_at: 'desc' },
        include: {
          transaction: {
            include: {
              items: true,
              midtrans_data: true,
            },
          },
          payment_proof: true,
        },
      });

      return payments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update status
   * @param {number} id - RYLS payment ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status) {

    try {
      const updated = await prisma.rylsPayment.update({
        where: { id },
        data: {
          status,
          updated_at: new Date(),
        },
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find by transaction code (via transaction relation)
   * @param {string} transactionCode - Transaction code
   * @returns {Promise<Object|null>}
   */
  async findByTransactionCode(transactionCode) {

    try {
      const payment = await prisma.rylsPayment.findFirst({
        where: {
          transaction: {
            transaction_code: transactionCode,
          },
        },
        include: {
          transaction: {
            include: {
              items: true,
              midtrans_data: true,
            },
          },
          registration: true,
          payment_proof: true,
        },
      });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get next sequence number for transaction code generation atomically within a transaction.
   * This method must be called within a Prisma transaction context.
   * @param {Object} tx - Prisma transaction client
   * @returns {Promise<number>} Next sequence number
   */
  async getNextSequenceNumber(tx) {
    const rows = await tx.$queryRaw`SELECT nextval('ryls_transaction_code_seq') AS seq`;
    return Number(rows[0].seq);
  }
}

export const rylsPaymentRepository = new RylsPaymentRepository();
