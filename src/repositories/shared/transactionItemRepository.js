import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

/**
 * TransactionItemRepository - Transaction line items
 */
export class TransactionItemRepository {
  get logger() {
    return getLogger();
  }

  /**
   * Create transaction items
   * @param {number} transactionId - Transaction ID
   * @param {Array} items - Array of item data
   * @returns {Promise<Array>} - Created items
   */
  async createMany(transactionId, items) {
    this.logger.info({ transactionId, count: items.length }, '[TransactionItemRepository] createMany');

    try {
      const itemsData = items.map((item) => ({
        transaction_id: transactionId,
        product_code: item.product_code,
        product_name: item.product_name,
        product_category: item.product_category || null,
        quantity: item.quantity || 1,
        unit_price: item.unit_price,
        total_price: item.total_price,
        metadata: item.metadata || null,
      }));

      const result = await prisma.transactionItem.createMany({
        data: itemsData,
      });

      this.logger.info({ count: result.count }, '[TransactionItemRepository] items created');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[TransactionItemRepository] createMany error');
      throw error;
    }
  }

  /**
   * Find items by transaction ID
   * @param {number} transactionId - Transaction ID
   * @returns {Promise<Array>}
   */
  async findByTransactionId(transactionId) {
    this.logger.info({ transactionId }, '[TransactionItemRepository] findByTransactionId');

    try {
      const items = await prisma.transactionItem.findMany({
        where: { transaction_id: transactionId },
        orderBy: { id: 'asc' },
      });

      this.logger.info({ count: items.length }, '[TransactionItemRepository] items found');
      return items;
    } catch (error) {
      this.logger.error({ err: error }, '[TransactionItemRepository] findByTransactionId error');
      throw error;
    }
  }
}

export const transactionItemRepository = new TransactionItemRepository();
