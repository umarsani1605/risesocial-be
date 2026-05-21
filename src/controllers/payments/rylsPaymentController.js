import { rylsPaymentService } from '../../services/user/rylsPaymentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { captureEvent, getPostHogRequestContext } from '../../config/posthog.js';

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

      const transactionData = await this.paymentService.createTransaction({
        ...data,
        posthogContext: getPostHogRequestContext(request),
      });

      const registrationData = data.data ?? {};
      const distinctId = registrationData.userId != null ? String(registrationData.userId) : null;
      captureEvent(distinctId, 'ryls.checkout_started', {
        source: 'backend',
        payment_id: transactionData.payment_id,
        transaction_code: transactionData.transaction_code,
        amount: transactionData.amount,
        currency: transactionData.currency,
        registration_id: registrationData.registrationId ?? null,
        scholarship_type: registrationData.scholarshipType ?? null,
        payment_method: data.type?.toLowerCase?.() ?? null,
      }, request);

      if (data.type === 'PAYPAL') {
        captureEvent(distinctId, 'ryls.payment_completed', {
          source: 'backend',
          payment_id: transactionData.payment_id,
          transaction_code: transactionData.transaction_code,
          amount: transactionData.amount,
          currency: transactionData.currency,
          registration_id: registrationData.registrationId ?? null,
          scholarship_type: registrationData.scholarshipType ?? null,
          payment_method: 'paypal',
        }, request);
      }

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

      throw error;
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
      throw error;
    }
  }
}

export const rylsPaymentController = new RylsPaymentController();
