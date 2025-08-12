import { PrismaClient } from '@prisma/client';
import { ORDER_ID_CONFIG } from '../constants/payments.js';

const prisma = new PrismaClient();

/**
 * RYLS Payment Repository
 * Handles database operations for payment transactions with support for multiple payments per registration
 */
export class RylsPaymentRepository {
  /**
   * Create a new Midtrans payment record
   * @param {Object} paymentData - Midtrans payment data
   * @returns {Promise<Object>} Created Midtrans payment record
   */
  async createMidtransPayment(paymentData) {
    console.log('[PaymentRepository] createMidtransPayment called');

    try {
      const payment = await prisma.midtransPayment.create({
        data: {
          order_id: paymentData.order_id,
          snap_token: paymentData.snap_token,
          redirect_url: paymentData.redirect_url,
          gross_amount_idr: paymentData.gross_amount_idr,
          currency: paymentData.currency || 'IDR',
          transaction_status: paymentData.transaction_status || 'pending',
          payment_type: paymentData.payment_type,
          payment_details: paymentData.payment_details || {},
          last_notification: paymentData.last_notification || {},
          transaction_id: paymentData.transaction_id || null,
          fraud_status: paymentData.fraud_status || null,
          notified_at: paymentData.notified_at || null,
          paid_at: paymentData.paid_at || null,
        },
      });

      console.log('[PaymentRepository] Midtrans payment created successfully');
      console.log('[PaymentRepository] Order ID:', payment.order_id);

      return payment;
    } catch (error) {
      console.error('[PaymentRepository] Error creating Midtrans payment:', error);
      throw error;
    }
  }

  /**
   * Create a new Ryls payment record
   * @param {Object} paymentData - Payment data to create
   * @returns {Promise<Object>} Created Ryls payment record
   */
  async createRylsPayment(paymentData) {
    console.log('[PaymentRepository] createRylsPayment called');

    try {
      const payment = await prisma.rylsPayment.create({
        data: {
          type: paymentData.type,
          status: paymentData.status,
          amount: paymentData.amount,
          payment_proof_id: parseInt(paymentData.payment_proof_id) || null,
          midtrans_id: parseInt(paymentData.midtrans_id) || null,
          paid_at: paymentData.paid_at || null,
        },
      });

      console.log('[PaymentRepository] Ryls payment created successfully');
      console.log('[PaymentRepository] Payment ID:', payment.id);
      console.log('[PaymentRepository] Payment Type:', payment.type);
      console.log('[PaymentRepository] Amount:', payment.amount);

      return payment;
    } catch (error) {
      console.error('[PaymentRepository] Error creating Ryls payment:', error);
      throw error;
    }
  }

  /**
   * Find Midtrans payment by order ID
   * @param {string} orderId - Order ID to search for
   * @returns {Promise<Object|null>} Midtrans payment record or null
   */
  async findMidtransPaymentByOrderId(orderId) {
    console.log('[PaymentRepository] findMidtransPaymentByOrderId called');
    console.log('[PaymentRepository] Order ID:', orderId);

    try {
      const payment = await prisma.midtransPayment.findUnique({
        where: { order_id: orderId },
        include: {
          ryls_payment: {
            include: {
              registration: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                  scholarship_type: true,
                },
              },
            },
          },
        },
      });

      console.log('[PaymentRepository] Midtrans payment found:', payment ? 'Yes' : 'No');
      if (payment) {
        console.log('[PaymentRepository] Payment ID:', payment.id);
        console.log('[PaymentRepository] Status:', payment.transaction_status);
      }

      return payment;
    } catch (error) {
      console.error('[PaymentRepository] Error finding Midtrans payment by order ID:', error);
      throw error;
    }
  }

  /**
   * Find Ryls payment by ID
   * @param {number} paymentId - Payment ID to search for
   * @returns {Promise<Object|null>} Payment record or null
   */
  async findById(paymentId) {
    console.log('[PaymentRepository] findById called');
    console.log('[PaymentRepository] Payment ID:', paymentId);

    try {
      const payment = await prisma.rylsPayment.findUnique({
        where: { id: paymentId },
        include: {
          midtrans_payment: true,
          payment_proof: true,
          registration: {
            select: {
              id: true,
              full_name: true,
              email: true,
              scholarship_type: true,
            },
          },
        },
      });

      console.log('[PaymentRepository] Payment found:', payment ? 'Yes' : 'No');
      return payment;
    } catch (error) {
      console.error('[PaymentRepository] Error finding payment by ID:', error);
      throw error;
    }
  }

  /**
   * Find all payments for a registration
   * @param {number} registrationId - Registration ID to search for
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payment records
   */
  async findRegistrationPayments(registrationId, options = {}) {
    console.log('[PaymentRepository] findRegistrationPayments called');
    console.log('[PaymentRepository] Registration ID:', registrationId);
    console.log('[PaymentRepository] Options:', JSON.stringify(options, null, 2));

    try {
      const whereClause = {
        registration_id: registrationId,
        ...(options.status && { status: options.status }),
        ...(options.type && { type: options.type }),
      };

      if (options.minAmount) {
        whereClause.amount = {
          gte: options.minAmount,
        };
      }

      if (options.maxAmount) {
        whereClause.amount = {
          ...whereClause.amount,
          lte: options.maxAmount,
        };
      }

      const payments = await prisma.rylsPayment.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        ...(options.limit && { take: options.limit }),
        include: {
          midtrans_payment: true,
          payment_proof: true,
          registration: {
            select: {
              id: true,
              full_name: true,
              email: true,
              scholarship_type: true,
            },
          },
        },
      });

      console.log('[PaymentRepository] Payments found:', payments.length);
      return payments;
    } catch (error) {
      console.error('[PaymentRepository] Error finding registration payments:', error);
      throw error;
    }
  }

  /**
   * Link a payment to a registration
   * @param {number} paymentId - Payment ID to link
   * @param {number} registrationId - Registration ID to link to
   * @returns {Promise<Object>} Updated payment record
   */
  async linkPaymentToRegistration(paymentId, registrationId) {
    console.log('[PaymentRepository] linkPaymentToRegistration called');
    console.log('[PaymentRepository] Payment ID:', paymentId);
    console.log('[PaymentRepository] Registration ID:', registrationId);

    try {
      const payment = await prisma.rylsPayment.update({
        where: { id: paymentId },
        data: {
          registration: {
            connect: { id: registrationId },
          },
        },
        include: {
          midtrans_payment: true,
          payment_proof: true,
        },
      });

      console.log('[PaymentRepository] Payment linked to registration successfully');
      return payment;
    } catch (error) {
      console.error('[PaymentRepository] Error linking payment to registration:', error);
      throw error;
    }
  }

  /**
   * Find active pending payment for a registration
   * @param {number} registrationId - Registration ID to search for
   * @returns {Promise<Object|null>} Active pending payment or null
   */
  async findActivePendingPayment(registrationId) {
    console.log('[PaymentRepository] findActivePendingPayment called');
    console.log('[PaymentRepository] Registration ID:', registrationId);

    try {
      const payment = await prisma.rylsPayment.findFirst({
        where: {
          registration_id: registrationId,
          status: 'PENDING',
          expiry_time: {
            gt: new Date(),
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        include: {
          registration: {
            select: {
              id: true,
              full_name: true,
              email: true,
              scholarship_type: true,
              payment_status: true,
            },
          },
        },
      });

      if (payment) {
        console.log('[PaymentRepository] Found active pending payment');
        console.log('[PaymentRepository] Payment ID:', payment.id);
        console.log('[PaymentRepository] Order ID:', payment.order_id);
      } else {
        console.log('ℹ️ [PaymentRepository] No active pending payment found');
      }

      return payment;
    } catch (error) {
      console.error('[PaymentRepository] Error finding active pending payment:', error);
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
    console.log('[PaymentRepository] updateByOrderId called');
    console.log('[PaymentRepository] Order ID:', orderId);
    console.log('[PaymentRepository] Update data:', JSON.stringify(updateData, null, 2));

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
              payment_status: true,
            },
          },
        },
      });

      console.log('[PaymentRepository] Payment updated successfully');
      console.log('[PaymentRepository] Updated payment ID:', payment.id);
      console.log('[PaymentRepository] New status:', payment.transaction_status);

      return payment;
    } catch (error) {
      console.error('[PaymentRepository] Error updating payment:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Payment statistics
   */
  async getStatistics(filters = {}) {
    console.log('[PaymentRepository] getStatistics called');
    console.log('[PaymentRepository] Filters:', JSON.stringify(filters, null, 2));

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

      console.log('[PaymentRepository] Statistics:', JSON.stringify(statistics, null, 2));

      return statistics;
    } catch (error) {
      console.error('[PaymentRepository] Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Get next sequence number for order ID generation
   * @returns {Promise<number>} Next sequence number
   */
  async getNextSequenceNumber() {
    console.log('[PaymentRepository] getNextSequenceNumber called');

    try {
      const lastPayment = await prisma.rylsPayment.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });

      if (!lastPayment) {
        return ORDER_ID_CONFIG.START_NUMBER;
      } else {
        return lastPayment.id + 1;
      }
    } catch (error) {
      console.error('[PaymentRepository] Error getting next sequence number:', error);
      throw error;
    }
  }

  /**
   * Delete payment by ID (for cleanup/testing)
   * @param {number} paymentId - Payment ID to delete
   * @returns {Promise<void>}
   */
  async delete(paymentId) {
    console.log('[PaymentRepository] delete called');
    console.log('[PaymentRepository] Payment ID:', paymentId);

    try {
      await prisma.rylsPayment.delete({
        where: { id: paymentId },
      });

      console.log('[PaymentRepository] Payment deleted successfully');
    } catch (error) {
      console.error('[PaymentRepository] Error deleting payment:', error);
      throw error;
    }
  }
}

export default RylsPaymentRepository;
