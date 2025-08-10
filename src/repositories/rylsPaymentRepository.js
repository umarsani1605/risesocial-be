import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * RYLS Payment Repository
 * Handles database operations for payment transactions
 * Follows the same pattern as rylsRegistrationRepository.js
 */
export class RylsPaymentRepository {
  /**
   * Create a new payment record
   * @param {Object} paymentData - Payment data to create
   * @returns {Promise<Object>} Created payment record
   */
  async create(paymentData) {
    console.log('🔵 [PaymentRepository] create called');
    console.log('📝 [PaymentRepository] Payment data:', JSON.stringify(paymentData, null, 2));

    try {
      const payment = await prisma.rylsPayment.create({
        data: paymentData,
        include: {
          registration: {
            select: {
              id: true,
              full_name: true,
              email: true,
              scholarship_type: true,
              status: true,
            },
          },
        },
      });

      console.log('✅ [PaymentRepository] Payment created successfully');
      console.log('📊 [PaymentRepository] Created payment ID:', payment.id);
      console.log('🔢 [PaymentRepository] Order ID:', payment.order_id);

      return payment;
    } catch (error) {
      console.error('❌ [PaymentRepository] Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Find payment by order ID
   * @param {string} orderId - Order ID to search for
   * @returns {Promise<Object|null>} Payment record or null
   */
  async findByOrderId(orderId) {
    console.log('🔵 [PaymentRepository] findByOrderId called');
    console.log('🔍 [PaymentRepository] Order ID:', orderId);

    try {
      const payment = await prisma.rylsPayment.findUnique({
        where: { order_id: orderId },
        include: {
          registration: {
            select: {
              id: true,
              full_name: true,
              email: true,
              scholarship_type: true,
              status: true,
            },
          },
        },
      });

      console.log('📊 [PaymentRepository] Payment found:', payment ? 'Yes' : 'No');
      if (payment) {
        console.log('📊 [PaymentRepository] Payment ID:', payment.id);
        console.log('📊 [PaymentRepository] Status:', payment.transaction_status);
      }

      return payment;
    } catch (error) {
      console.error('❌ [PaymentRepository] Error finding payment by order ID:', error);
      throw error;
    }
  }

  /**
   * Find payment by registration ID
   * @param {number} registrationId - Registration ID to search for
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payment records
   */
  async findByRegistrationId(registrationId, options = {}) {
    console.log('🔵 [PaymentRepository] findByRegistrationId called');
    console.log('🔍 [PaymentRepository] Registration ID:', registrationId);
    console.log('⚙️ [PaymentRepository] Options:', JSON.stringify(options, null, 2));

    try {
      const whereClause = {
        registration_id: registrationId,
        ...(options.status && { transaction_status: options.status }),
      };

      const payments = await prisma.rylsPayment.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        ...(options.limit && { take: options.limit }),
        include: {
          registration: {
            select: {
              id: true,
              full_name: true,
              email: true,
              scholarship_type: true,
              status: true,
            },
          },
        },
      });

      console.log('📊 [PaymentRepository] Payments found:', payments.length);

      return payments;
    } catch (error) {
      console.error('❌ [PaymentRepository] Error finding payments by registration ID:', error);
      throw error;
    }
  }

  /**
   * Find active pending payment for registration
   * @param {number} registrationId - Registration ID
   * @returns {Promise<Object|null>} Active pending payment or null
   */
  async findActivePendingPayment(registrationId) {
    console.log('🔵 [PaymentRepository] findActivePendingPayment called');
    console.log('🔍 [PaymentRepository] Registration ID:', registrationId);

    try {
      const payment = await prisma.rylsPayment.findFirst({
        where: {
          registration_id: registrationId,
          transaction_status: 'pending',
        },
        orderBy: { created_at: 'desc' },
        include: {
          registration: {
            select: {
              id: true,
              full_name: true,
              email: true,
              scholarship_type: true,
              status: true,
            },
          },
        },
      });

      console.log('📊 [PaymentRepository] Active pending payment found:', payment ? 'Yes' : 'No');
      if (payment) {
        console.log('📊 [PaymentRepository] Order ID:', payment.order_id);
        console.log('📊 [PaymentRepository] Created at:', payment.created_at);
      }

      return payment;
    } catch (error) {
      console.error('❌ [PaymentRepository] Error finding active pending payment:', error);
      throw error;
    }
  }

  /**
   * Update payment by order ID
   * @param {string} orderId - Order ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated payment record
   */
  async updateByOrderId(orderId, updateData) {
    console.log('🔵 [PaymentRepository] updateByOrderId called');
    console.log('🔍 [PaymentRepository] Order ID:', orderId);
    console.log('📝 [PaymentRepository] Update data:', JSON.stringify(updateData, null, 2));

    try {
      const payment = await prisma.rylsPayment.update({
        where: { order_id: orderId },
        data: {
          ...updateData,
          updated_at: new Date(),
        },
        include: {
          registration: {
            select: {
              id: true,
              full_name: true,
              email: true,
              scholarship_type: true,
              status: true,
            },
          },
        },
      });

      console.log('✅ [PaymentRepository] Payment updated successfully');
      console.log('📊 [PaymentRepository] Updated payment ID:', payment.id);
      console.log('📊 [PaymentRepository] New status:', payment.transaction_status);

      return payment;
    } catch (error) {
      console.error('❌ [PaymentRepository] Error updating payment:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Payment statistics
   */
  async getStatistics(filters = {}) {
    console.log('🔵 [PaymentRepository] getStatistics called');
    console.log('📝 [PaymentRepository] Filters:', JSON.stringify(filters, null, 2));

    try {
      const whereClause = {
        ...(filters.dateFrom && { created_at: { gte: new Date(filters.dateFrom) } }),
        ...(filters.dateTo && { created_at: { lte: new Date(filters.dateTo) } }),
        ...(filters.scholarshipType && {
          registration: { scholarship_type: filters.scholarshipType },
        }),
      };

      const [totalPayments, pendingPayments, successfulPayments, failedPayments, totalAmount] = await Promise.all([
        prisma.rylsPayment.count({ where: whereClause }),
        prisma.rylsPayment.count({
          where: { ...whereClause, transaction_status: 'pending' },
        }),
        prisma.rylsPayment.count({
          where: { ...whereClause, transaction_status: { in: ['settlement', 'capture'] } },
        }),
        prisma.rylsPayment.count({
          where: { ...whereClause, transaction_status: { in: ['deny', 'cancel', 'expire'] } },
        }),
        prisma.rylsPayment.aggregate({
          where: { ...whereClause, transaction_status: { in: ['settlement', 'capture'] } },
          _sum: { gross_amount_idr: true },
        }),
      ]);

      const statistics = {
        totalPayments,
        pendingPayments,
        successfulPayments,
        failedPayments,
        totalAmountIdr: totalAmount._sum.gross_amount_idr || 0,
        successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
      };

      console.log('📊 [PaymentRepository] Statistics:', JSON.stringify(statistics, null, 2));

      return statistics;
    } catch (error) {
      console.error('❌ [PaymentRepository] Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Get next sequence number for order ID generation
   * @returns {Promise<number>} Next sequence number
   */
  async getNextSequenceNumber() {
    console.log('🔵 [PaymentRepository] getNextSequenceNumber called');

    try {
      const lastPayment = await prisma.rylsPayment.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true, order_id: true },
      });

      let nextSequence = 1;

      if (lastPayment) {
        // Extract number from order_id (e.g., RYLS0001 -> 1)
        const match = lastPayment.order_id.match(/RYLS(\d+)/);
        if (match) {
          nextSequence = parseInt(match[1]) + 1;
        } else {
          // Fallback to using ID + 1
          nextSequence = lastPayment.id + 1;
        }
      }

      console.log('📊 [PaymentRepository] Next sequence number:', nextSequence);
      console.log('📊 [PaymentRepository] Last payment order_id:', lastPayment?.order_id || 'None');

      return nextSequence;
    } catch (error) {
      console.error('❌ [PaymentRepository] Error getting next sequence number:', error);
      throw error;
    }
  }

  /**
   * Delete payment by ID (for cleanup/testing)
   * @param {number} paymentId - Payment ID to delete
   * @returns {Promise<void>}
   */
  async delete(paymentId) {
    console.log('🔵 [PaymentRepository] delete called');
    console.log('🔍 [PaymentRepository] Payment ID:', paymentId);

    try {
      await prisma.rylsPayment.delete({
        where: { id: paymentId },
      });

      console.log('✅ [PaymentRepository] Payment deleted successfully');
    } catch (error) {
      console.error('❌ [PaymentRepository] Error deleting payment:', error);
      throw error;
    }
  }
}

export default RylsPaymentRepository;
