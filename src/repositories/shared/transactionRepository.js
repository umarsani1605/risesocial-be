import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

/**
 * TransactionRepository - Layer 1 (Generic Transaction)
 * Provider-agnostic transaction management
 */
export class TransactionRepository {
  get logger() {
    return getLogger();
  }

  /**
   * Create a new transaction record
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} - Created transaction
   */
  async create(data) {
    this.logger.info('[TransactionRepository] create start');
    this.logger.debug({ transaction_code: data.transaction_code }, '[TransactionRepository] creating');

    try {
      const transaction = await prisma.transaction.create({
        data: {
          transaction_code: data.transaction_code,
          provider_reference: data.provider_reference || null,
          amount: data.amount,
          currency: data.currency || 'IDR',
          status: data.status || 'pending',
          provider: data.provider,
          payment_method: data.payment_method || null,
          payment_token: data.payment_token || null,
          payment_url: data.payment_url || null,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone || null,
          customer_address: data.customer_address || null,
          customer_city: data.customer_city || null,
          customer_postal_code: data.customer_postal_code || null,
          customer_country_code: data.customer_country_code || null,
          user_id: data.user_id || null,
          product_type: data.product_type,
          product_type_id: data.product_type_id,
          metadata: data.metadata || null,
        },
      });

      this.logger.info({ id: transaction.id }, '[TransactionRepository] transaction created');
      return transaction;
    } catch (error) {
      this.logger.error({ err: error }, '[TransactionRepository] create error');
      throw error;
    }
  }

  /**
   * Find transaction by transaction_code
   * @param {string} transactionCode - Unique transaction code
   * @returns {Promise<Object|null>} - Transaction or null
   */
  async findByTransactionCode(transactionCode) {
    this.logger.info({ transactionCode }, '[TransactionRepository] findByTransactionCode');

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { transaction_code: transactionCode },
        include: {
          items: true,
          midtrans_data: true,
          ryls_payment: true,
        },
      });

      this.logger.info({ found: !!transaction }, '[TransactionRepository] transaction found');
      return transaction;
    } catch (error) {
      this.logger.error({ err: error }, '[TransactionRepository] findByTransactionCode error');
      throw error;
    }
  }

  /**
   * Update transaction status
   * @param {string} transactionCode - Transaction code
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated transaction
   */
  async updateStatus(transactionCode, updateData) {
    this.logger.info({ transactionCode }, '[TransactionRepository] updateStatus');
    this.logger.debug({ updateData }, '[TransactionRepository] update data');

    try {
      const transaction = await prisma.transaction.update({
        where: { transaction_code: transactionCode },
        data: {
          ...updateData,
          updated_at: new Date(),
        },
      });

      this.logger.info({ id: transaction.id, status: transaction.status }, '[TransactionRepository] status updated');
      return transaction;
    } catch (error) {
      this.logger.error({ err: error }, '[TransactionRepository] updateStatus error');
      throw error;
    }
  }

  /**
   * Find transactions by product type
   * @param {string} productType - Product type
   * @param {number} productTypeId - Product type ID
   * @returns {Promise<Array>} - Transactions
   */
  async findByProductType(productType, productTypeId) {
    this.logger.info({ productType, productTypeId }, '[TransactionRepository] findByProductType');

    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          product_type: productType,
          product_type_id: productTypeId,
        },
        orderBy: { created_at: 'desc' },
        include: {
          items: true,
          midtrans_data: true,
        },
      });

      this.logger.info({ count: transactions.length }, '[TransactionRepository] transactions found');
      return transactions;
    } catch (error) {
      this.logger.error({ err: error }, '[TransactionRepository] findByProductType error');
      throw error;
    }
  }
}

export const transactionRepository = new TransactionRepository();
