import { rylsPaymentService } from '../../services/user/rylsPaymentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

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

      request.log.info('[rylsPaymentController] createTransaction success');
      return reply.status(200).send(successResponse(transactionData, 'Payment transaction created successfully'));
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

  async handleWebhookNotification(request, reply) {
    request.log.info('[rylsPaymentController] handleWebhookNotification start');
    request.log.debug({ body: request.body }, '[rylsPaymentController] webhookPayload');

    try {
      const notificationData = request.body;

      const { order_id, transaction_status, signature_key } = notificationData;
      if (!order_id || !transaction_status || !signature_key) {
        request.log.error('[rylsPaymentController] Missing required webhook fields');
        return errorResponse(reply, 'Invalid webhook payload', 400, 'Missing required fields');
      }

      request.log.info({ order_id, transaction_status }, '[rylsPaymentController] processing webhook');

      const processingResult = await this.paymentService.handleWebhookNotification(notificationData);

      request.log.info('[rylsPaymentController] handleWebhookNotification success');
      return reply.status(200).send(successResponse({ ...processingResult }, 'Webhook processed successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[rylsPaymentController] handleWebhookNotification error');

      if (error.message.includes('Invalid notification signature')) {
        return reply.status(400).send(errorResponse('Invalid signature', 400, error.message));
      }

      if (error.message.includes('Payment not found')) {
        return reply.status(404).send(errorResponse('Payment not found', 404, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to process webhook notification', 500, error.message));
    }
  }

  async getPaymentStatus(request, reply) {
    request.log.info('[rylsPaymentController] getPaymentStatus start');
    request.log.debug({ params: request.params }, '[rylsPaymentController] rawParams');

    try {
      const registrationId = Number(request.params.registrationId);
      const paymentStatus = await this.paymentService.getPaymentStatus(registrationId);

      request.log.info('[rylsPaymentController] getPaymentStatus success');
      return reply.status(200).send(successResponse(paymentStatus, 'Payment status retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[rylsPaymentController] getPaymentStatus error');
      return reply.status(500).send(errorResponse('Failed to get payment status', 500, error.message));
    }
  }
}

export const rylsPaymentController = new RylsPaymentController();
