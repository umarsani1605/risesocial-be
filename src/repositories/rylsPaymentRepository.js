import { PrismaClient } from '@prisma/client';
import { ORDER_ID_CONFIG } from '../constants/payments.js';
import { getLogger } from '../lib/loggerContext.js';

const prisma = new PrismaClient();

/**
 * RYLS Payment Repository
 * Handles database operations for payment transactions with support for multiple payments per registration
 */
export class RylsPaymentRepository {
  get logger() {
    return getLogger();
  }

  /**
   * Create a new Midtrans payment record
   */
  async createMidtransPayment(paymentData) {
    this.logger.info('[rylsPaymentRepository] createMidtransPayment called');

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

      this.logger.info({ order_id: payment.order_id }, '[rylsPaymentRepository] midtrans payment created');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] createMidtransPayment error');
      throw error;
    }
  }

  /**
   * Create a new Ryls payment record
   */
  async createRylsPayment(paymentData) {
    this.logger.info('[rylsPaymentRepository] createRylsPayment called');

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

      this.logger.info({ paymentId: payment.id, type: payment.type }, '[rylsPaymentRepository] ryls payment created');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] createRylsPayment error');
      throw error;
    }
  }

  /**
   * Find Midtrans payment by order ID
   */
  async findMidtransPaymentByOrderId(orderId) {
    this.logger.info({ orderId }, '[rylsPaymentRepository] findMidtransPaymentByOrderId called');

    try {
      const payment = await prisma.midtransPayment.findUnique({
        where: { order_id: orderId },
        include: {
          ryls_payment: {
            include: {
              registration: { select: { id: true, full_name: true, email: true, scholarship_type: true } },
            },
          },
        },
      });

      this.logger.info({ found: !!payment }, '[rylsPaymentRepository] midtrans payment found');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] findMidtransPaymentByOrderId error');
      throw error;
    }
  }

  /**
   * Find Ryls payment by ID
   */
  async findById(paymentId) {
    this.logger.info({ paymentId }, '[rylsPaymentRepository] findById called');

    try {
      const payment = await prisma.rylsPayment.findUnique({
        where: { id: paymentId },
        include: {
          midtrans_payment: true,
          payment_proof: true,
          registration: { select: { id: true, full_name: true, email: true, scholarship_type: true } },
        },
      });

      this.logger.info({ found: !!payment }, '[rylsPaymentRepository] payment found');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] findById error');
      throw error;
    }
  }

  /**
   * Find all payments for a registration
   */
  async findRegistrationPayments(registrationId, options = {}) {
    this.logger.info({ registrationId, options }, '[rylsPaymentRepository] findRegistrationPayments called');

    try {
      const whereClause = {
        registration_id: registrationId,
        ...(options.status && { status: options.status }),
        ...(options.type && { type: options.type }),
      };

      if (options.minAmount) {
        whereClause.amount = { gte: options.minAmount };
      }
      if (options.maxAmount) {
        whereClause.amount = { ...whereClause.amount, lte: options.maxAmount };
      }

      const payments = await prisma.rylsPayment.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        ...(options.limit && { take: options.limit }),
        include: {
          midtrans_payment: true,
          payment_proof: true,
          registration: { select: { id: true, full_name: true, email: true, scholarship_type: true } },
        },
      });

      this.logger.info({ count: payments.length }, '[rylsPaymentRepository] payments found');
      return payments;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] findRegistrationPayments error');
      throw error;
    }
  }

  /**
   * Link a payment to a registration
   */
  async linkPaymentToRegistration(paymentId, registrationId) {
    this.logger.info({ paymentId, registrationId }, '[rylsPaymentRepository] linkPaymentToRegistration called');

    try {
      const payment = await prisma.rylsPayment.update({
        where: { id: paymentId },
        data: { registration: { connect: { id: registrationId } } },
        include: { midtrans_payment: true, payment_proof: true },
      });

      this.logger.info('[rylsPaymentRepository] payment linked to registration');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] linkPaymentToRegistration error');
      throw error;
    }
  }

  /**
   * Find active pending payment for a registration
   */
  async findActivePendingPayment(registrationId) {
    this.logger.info({ registrationId }, '[rylsPaymentRepository] findActivePendingPayment called');

    try {
      const payment = await prisma.rylsPayment.findFirst({
        where: { registration_id: registrationId, status: 'PENDING', expiry_time: { gt: new Date() } },
        orderBy: { created_at: 'desc' },
        include: { registration: { select: { id: true, full_name: true, email: true, scholarship_type: true, payment_status: true } } },
      });

      this.logger.info({ found: !!payment, order_id: payment?.order_id }, '[rylsPaymentRepository] active payment check');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] findActivePendingPayment error');
      throw error;
    }
  }

  /**
   * Update payment by order ID
   */
  async updateByOrderId(orderId, updateData) {
    this.logger.info({ orderId }, '[rylsPaymentRepository] updateByOrderId called');
    this.logger.debug({ updateData }, '[rylsPaymentRepository] update payload');

    try {
      const payment = await prisma.rylsPayment.update({
        where: { order_id: orderId },
        data: { ...updateData, updated_at: new Date() },
        include: {
          registration: { select: { id: true, full_name: true, email: true, scholarship_type: true, payment_status: true } },
        },
      });

      this.logger.info({ paymentId: payment.id, status: payment.transaction_status }, '[rylsPaymentRepository] payment updated');
      return payment;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] updateByOrderId error');
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getStatistics(filters = {}) {
    this.logger.info({ filters }, '[rylsPaymentRepository] getStatistics called');

    try {
      const whereClause = {
        ...(filters.dateFrom && { created_at: { gte: new Date(filters.dateFrom) } }),
        ...(filters.dateTo && { created_at: { lte: new Date(filters.dateTo) } }),
        ...(filters.scholarshipType && { registration: { scholarship_type: filters.scholarshipType } }),
      };

      const [totalPayments, pendingPayments, successfulPayments, failedPayments, totalAmount] = await Promise.all([
        prisma.rylsPayment.count({ where: whereClause }),
        prisma.rylsPayment.count({ where: { ...whereClause, transaction_status: 'pending' } }),
        prisma.rylsPayment.count({ where: { ...whereClause, transaction_status: { in: ['settlement', 'capture'] } } }),
        prisma.rylsPayment.count({ where: { ...whereClause, transaction_status: { in: ['deny', 'cancel', 'expire'] } } }),
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

      this.logger.info('[rylsPaymentRepository] getStatistics success');
      return statistics;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] getStatistics error');
      throw error;
    }
  }

  /**
   * Get next sequence number for order ID generation
   */
  async getNextSequenceNumber() {
    this.logger.info('[rylsPaymentRepository] getNextSequenceNumber called');

    try {
      const lastPayment = await prisma.rylsPayment.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
      if (!lastPayment) {
        return ORDER_ID_CONFIG.START_NUMBER;
      } else {
        return lastPayment.id + 1;
      }
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] getNextSequenceNumber error');
      throw error;
    }
  }

  /**
   * Delete payment by ID (for cleanup/testing)
   */
  async delete(paymentId) {
    this.logger.info({ paymentId }, '[rylsPaymentRepository] delete called');

    try {
      await prisma.rylsPayment.delete({ where: { id: paymentId } });
      this.logger.info('[rylsPaymentRepository] payment deleted');
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentRepository] delete error');
      throw error;
    }
  }
}

export default RylsPaymentRepository;
