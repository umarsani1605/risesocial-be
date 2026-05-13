import prisma from '../../config/database.js';

/**
 * MidtransTransactionRepository - Layer 2 (Provider-Specific)
 * Midtrans-specific data management
 */
export class MidtransTransactionRepository {

  /**
   * Create Midtrans transaction record
   * @param {Object} data - Midtrans transaction data
   * @returns {Promise<Object>} - Created record
   */
  async create(data) {

    try {
      const midtransTransaction = await prisma.midtransTransaction.create({
        data: {
          transaction_id: data.transaction_id,
          snap_token: data.snap_token,
          redirect_url: data.redirect_url || null,
          midtrans_order_id: data.midtrans_order_id,
          midtrans_transaction_id: data.midtrans_transaction_id || null,
          transaction_status: data.transaction_status || null,
          fraud_status: data.fraud_status || null,
          payment_type: data.payment_type || null,
          bank: data.bank || null,
          va_numbers: data.va_numbers || null,
          masked_card: data.masked_card || null,
          status_code: data.status_code || null,
          status_message: data.status_message || null,
          approval_code: data.approval_code || null,
          create_response: data.create_response || null,
          last_notification: data.last_notification || null,
          status_response: data.status_response || null,
          settlement_time: data.settlement_time || null,
          notified_at: data.notified_at || null,
        },
      });

      return midtransTransaction;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find by transaction_id
   * @param {number} transactionId - Transaction ID (FK)
   * @returns {Promise<Object|null>}
   */
  async findByTransactionId(transactionId) {

    try {
      const record = await prisma.midtransTransaction.findUnique({
        where: { transaction_id: transactionId },
        include: {
          transaction: true,
        },
      });

      return record;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update from webhook notification
   * @param {number} transactionId - Transaction ID
   * @param {Object} webhookData - Webhook data
   * @returns {Promise<Object>}
   */
  async updateFromWebhook(transactionId, webhookData) {

    try {
      const updated = await prisma.midtransTransaction.update({
        where: { transaction_id: transactionId },
        data: {
          midtrans_transaction_id: webhookData.transaction_id || undefined,
          transaction_status: webhookData.transaction_status || undefined,
          fraud_status: webhookData.fraud_status || undefined,
          payment_type: webhookData.payment_type || undefined,
          bank: webhookData.bank || undefined,
          settlement_time: webhookData.settlement_time ? new Date(webhookData.settlement_time) : undefined,
          last_notification: webhookData.raw_notification || undefined,
          notified_at: new Date(),
          updated_at: new Date(),
        },
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find by Midtrans order_id
   * @param {string} midtransOrderId - Midtrans order_id (same as transaction_code)
   * @returns {Promise<Object|null>}
   */
  async findByMidtransOrderId(midtransOrderId) {

    try {
      const record = await prisma.midtransTransaction.findFirst({
        where: { midtrans_order_id: midtransOrderId },
        include: {
          transaction: true,
        },
      });

      return record;
    } catch (error) {
      throw error;
    }
  }
}

export const midtransTransactionRepository = new MidtransTransactionRepository();
