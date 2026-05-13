import prisma from '../../config/database.js';
import { ORDER_ID_CONFIG } from '../../constants/payments.js';

export class RylsPaymentRepository {

  async createMidtransPayment(paymentData) {

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

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async createRylsPayment(paymentData) {

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

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async findMidtransPaymentByOrderId(orderId) {

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

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async findById(paymentId) {

    try {
      const payment = await prisma.rylsPayment.findUnique({
        where: { id: paymentId },
        include: {
          midtrans_payment: true,
          payment_proof: true,
          registration: { select: { id: true, full_name: true, email: true, scholarship_type: true } },
        },
      });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async findRegistrationPayments(registrationId, options = {}) {

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

      return payments;
    } catch (error) {
      throw error;
    }
  }

  async linkPaymentToRegistration(paymentId, registrationId) {

    try {
      const payment = await prisma.rylsPayment.update({
        where: { id: paymentId },
        data: { registration: { connect: { id: registrationId } } },
        include: { midtrans_payment: true, payment_proof: true },
      });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async findActivePendingPayment(registrationId) {

    try {
      const payment = await prisma.rylsPayment.findFirst({
        where: { registration_id: registrationId, status: 'PENDING', expiry_time: { gt: new Date() } },
        orderBy: { created_at: 'desc' },
        include: { registration: { select: { id: true, full_name: true, email: true, scholarship_type: true, payment_status: true } } },
      });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async updateByOrderId(orderId, updateData) {

    try {
      const payment = await prisma.rylsPayment.update({
        where: { order_id: orderId },
        data: { ...updateData, updated_at: new Date() },
        include: {
          registration: { select: { id: true, full_name: true, email: true, scholarship_type: true, payment_status: true } },
        },
      });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async getStatistics(filters = {}) {

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

      return statistics;
    } catch (error) {
      throw error;
    }
  }

  async getNextSequenceNumber() {

    try {
      const lastPayment = await prisma.rylsPayment.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
      if (!lastPayment) {
        return ORDER_ID_CONFIG.START_NUMBER;
      } else {
        return lastPayment.id + 1;
      }
    } catch (error) {
      throw error;
    }
  }

  async delete(paymentId) {

    try {
      await prisma.rylsPayment.delete({ where: { id: paymentId } });
    } catch (error) {
      throw error;
    }
  }
}

export const rylsPaymentRepository = new RylsPaymentRepository();
