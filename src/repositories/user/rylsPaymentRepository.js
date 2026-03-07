import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

/**
 * RylsPaymentRepository - Layer 3 (Business-Specific)
 * RYLS-specific payment data management
 * Updated for 3-layer architecture
 */
export class RylsPaymentRepository {
  get logger() {
    return getLogger();
  }

  /**
   * Create RYLS payment record (links to transaction)
   * @param {Object} data - RYLS payment data
   * @returns {Promise<Object>}
   */
  async create(data) {
    this.logger.info('[RylsPaymentRepository] create start');

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

      this.logger.info({ id: rylsPayment.id }, '[RylsPaymentRepository] created');
      return rylsPayment;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentRepository] create error');
      throw error;
    }
  }

  /**
   * Find by transaction_id
   * @param {number} transactionId - Transaction ID
   * @returns {Promise<Object|null>}
   */
  async findByTransactionId(transactionId) {
    this.logger.info({ transactionId }, '[RylsPaymentRepository] findByTransactionId');

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

      this.logger.info({ found: !!payment }, '[RylsPaymentRepository] found');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentRepository] findByTransactionId error');
      throw error;
    }
  }

  /**
   * Find by registration_id
   * @param {number} registrationId - Registration ID
   * @returns {Promise<Array>}
   */
  async findByRegistrationId(registrationId) {
    this.logger.info({ registrationId }, '[RylsPaymentRepository] findByRegistrationId');

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

      this.logger.info({ count: payments.length }, '[RylsPaymentRepository] payments found');
      return payments;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentRepository] findByRegistrationId error');
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
    this.logger.info({ id, status }, '[RylsPaymentRepository] updateStatus');

    try {
      const updated = await prisma.rylsPayment.update({
        where: { id },
        data: {
          status,
          updated_at: new Date(),
        },
      });

      this.logger.info('[RylsPaymentRepository] status updated');
      return updated;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentRepository] updateStatus error');
      throw error;
    }
  }

  /**
   * Find by transaction code (via transaction relation)
   * @param {string} transactionCode - Transaction code
   * @returns {Promise<Object|null>}
   */
  async findByTransactionCode(transactionCode) {
    this.logger.info({ transactionCode }, '[RylsPaymentRepository] findByTransactionCode');

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

      this.logger.info({ found: !!payment }, '[RylsPaymentRepository] found');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentRepository] findByTransactionCode error');
      throw error;
    }
  }

  /**
   * Get next sequence number for transaction code generation
   * @returns {Promise<number>}
   */
  async getNextSequenceNumber() {
    this.logger.info('[RylsPaymentRepository] getNextSequenceNumber');

    try {
      const lastPayment = await prisma.rylsPayment.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });

      const sequence = lastPayment ? lastPayment.id + 1 : 1;
      this.logger.info({ sequence }, '[RylsPaymentRepository] sequence number');
      return sequence;
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentRepository] getNextSequenceNumber error');
      throw error;
    }
  }
}

export const rylsPaymentRepository = new RylsPaymentRepository();
