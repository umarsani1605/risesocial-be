import { rylsPaymentService } from '../../services/user/rylsPaymentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import posthog from '../../config/posthog.js';

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
    request.log.info('[rylsPaymentController] createTransaction start');
    request.log.debug({ body: request.body }, '[rylsPaymentController] rawBody');

    try {
      const data = request.body;

      const transactionData = await this.paymentService.createTransaction(data);

      const distinctId = data.registration_id ? String(data.registration_id) : (data.email || 'anonymous');
      posthog.capture({
        distinctId,
        event: 'ryls_checkout_started',
        properties: {
          payment_id: transactionData.payment_id,
          transaction_code: transactionData.transaction_code,
          amount: transactionData.amount,
          currency: transactionData.currency,
        },
      });

      request.log.info('[rylsPaymentController] createTransaction success');
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
      request.log.error({ err: error }, '[rylsPaymentController] createTransaction error');

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
    request.log.info('[rylsPaymentController] getPaymentStatus start');
    request.log.debug({ params: request.params }, '[rylsPaymentController] rawParams');

    try {
      const registrationId = Number(request.params.registrationId);
      const paymentStatus = await this.paymentService.getPaymentStatus(registrationId);

      request.log.info('[rylsPaymentController] getPaymentStatus success');
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
      request.log.error({ err: error }, '[rylsPaymentController] getPaymentStatus error');
      return reply.status(500).send(errorResponse('Failed to get payment status', 500, error.message));
    }
  }
}

export const rylsPaymentController = new RylsPaymentController();
