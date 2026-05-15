import { academyPaymentService } from '../../services/user/academyPaymentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import prisma from '../../config/database.js';
import { captureEvent } from '../../config/posthog.js';

export class AcademyPaymentController {
  constructor() {
    this.paymentService = academyPaymentService;
  }

  async createTransaction(request, reply) {

    try {
      const userId = request.user.userId;
      const { academy_id, pricing_id } = request.body;

      const result = await this.paymentService.createTransaction(userId, academy_id, pricing_id);

      captureEvent(userId, 'payment.transaction_created', {
        product_type: 'academy',
        academy_id,
        pricing_id,
        transaction_code: result.transaction_code,
        amount: result.amount,
        user_id: userId,
      });

      return reply.status(200).send(
        successResponse(result, 'Payment transaction created successfully'),
      );
    } catch (error) {

      if (error.message.includes('not found') || error.message.includes('not active')) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      if (error.message.includes('already enrolled')) {
        return reply.status(409).send(errorResponse(error.message, 409));
      }

      throw error;
    }
  }

  async getPaymentStatus(request, reply) {

    try {
      const userId = request.user.userId;
      const enrollmentId = Number(request.params.enrollmentId);

      const status = await this.paymentService.getPaymentStatus(enrollmentId, userId);

      return reply.status(200).send(
        successResponse(status, 'Payment status retrieved successfully'),
      );
    } catch (error) {
      throw error;
    }
  }

  async syncStatus(request, reply) {

    try {
      const userId = request.user.userId;
      const { transactionCode } = request.params;

      const result = await this.paymentService.syncTransactionStatus(transactionCode, userId);

      return reply.status(200).send(successResponse(result, 'Transaction status synced'));
    } catch (error) {
      if (error.message.includes('not found')) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      throw error;
    }
  }

  async checkEnrollment(request, reply) {

    try {
      const userId = request.user.userId;
      const academyId = Number(request.query.academy_id);

      const result = await this.paymentService.checkEnrollment(userId, academyId);

      return reply.status(200).send(
        successResponse(result, 'Enrollment status retrieved'),
      );
    } catch (error) {
      throw error;
    }
  }

  async getUserTransactions(request, reply) {

    try {
      const userId = request.user.userId;
      const { page = 1, limit = 10, status } = request.query;

      const skip = (page - 1) * limit;
      const where = { user_id: userId };
      if (status) where.status = status;

      const [data, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { created_at: 'desc' },
          include: { items: true },
        }),
        prisma.transaction.count({ where }),
      ]);

      const transactions = data.map((t) => ({
        id: t.id,
        transaction_code: t.transaction_code,
        product_type: t.product_type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        payment_method: t.payment_method,
        created_at: t.created_at,
        paid_at: t.paid_at,
        expired_at: t.expired_at,
        items: t.items.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      }));

      return reply.status(200).send({
        success: true,
        message: 'Transactions retrieved',
        data: transactions,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserTransactionDetail(request, reply) {

    try {
      const userId = request.user.userId;
      const { transactionCode } = request.params;

      const transaction = await prisma.transaction.findFirst({
        where: { transaction_code: transactionCode, user_id: userId },
        include: {
          items: true,
          midtrans_data: { select: { midtrans_transaction_id: true, payment_type: true, bank: true } },
        },
      });

      if (!transaction) {
        return reply.status(404).send(errorResponse('Transaction not found', 404));
      }

      const detail = {
        id: transaction.id,
        transaction_code: transaction.transaction_code,
        product_type: transaction.product_type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        payment_method: transaction.payment_method,
        created_at: transaction.created_at,
        paid_at: transaction.paid_at,
        expired_at: transaction.expired_at,
        customer_name: transaction.customer_name,
        customer_email: transaction.customer_email,
        provider: transaction.provider,
        provider_reference: transaction.provider_reference,
        items: transaction.items.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      };

      return reply.status(200).send(
        successResponse(detail, 'Transaction detail retrieved'),
      );
    } catch (error) {
      throw error;
    }
  }
}

export const academyPaymentController = new AcademyPaymentController();
