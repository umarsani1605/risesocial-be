import { rylsPaymentService } from '../../services/user/rylsPaymentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { captureEvent } from '../../config/posthog.js';

/**
 * RylsPaymentController - Updated for 3-layer architecture
 * Handles RYLS payment creation and status queries
 * Note: Webhook handling moved to WebhookController
 */
export class RylsPaymentController {
  constructor() {
    this.paymentService = rylsPaymentService;
  }

  async createTransaction(request, reply) {

    try {
      const data = request.body;

      const transactionData = await this.paymentService.createTransaction(data);

      const distinctId = data.registration_id ?? `anon:${data.email || 'unknown'}`;
      captureEvent(distinctId, 'payment.transaction_created', {
        product_type: 'ryls',
        payment_id: transactionData.payment_id,
        transaction_code: transactionData.transaction_code,
        amount: transactionData.amount,
        registration_id: data.registration_id,
      });

      return reply.status(200).send(
        successResponse(
          {
            payment_id: transactionData.payment_id,
            transaction_code: transactionData.transaction_code, // Updated from order_id
            amount: transactionData.amount,
            currency: transactionData.currency,
            token: transactionData.token,
            redirect_url: transactionData.redirect_url,
          },
          'Payment transaction created successfully',
        ),
      );
    } catch (error) {

      if (error.message.includes('Registration not found')) {
        return reply.status(404).send(errorResponse('Registration not found', 404, error.message));
      }

      if (error.message.includes('Invalid scholarship type')) {
        return reply.status(400).send(errorResponse('Invalid registration data', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to create payment transaction', 500, error.message));
    }
  }

  async getPaymentStatus(request, reply) {

    try {
      const registrationId = Number(request.params.registrationId);
      const paymentStatus = await this.paymentService.getPaymentStatus(registrationId);

      return reply.status(200).send(
        successResponse(
          {
            hasPayment: paymentStatus.hasPayment,
            status: paymentStatus.status,
            transaction_code: paymentStatus.transactionCode, // Updated from order_id
            amount: paymentStatus.amount,
            currency: paymentStatus.currency,
            payment_method: paymentStatus.paymentMethod,
            paid_at: paymentStatus.paidAt,
            created_at: paymentStatus.createdAt,
          },
          'Payment status retrieved successfully',
        ),
      );
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to get payment status', 500, error.message));
    }
  }
}

export const rylsPaymentController = new RylsPaymentController();
