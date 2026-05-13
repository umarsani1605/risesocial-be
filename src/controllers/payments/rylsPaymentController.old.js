import { rylsPaymentService } from '../../services/user/rylsPaymentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class RylsPaymentController {
  constructor() {
    this.paymentService = rylsPaymentService;
  }

  async createTransaction(request, reply) {

    try {
      const data = request.body;

      const transactionData = await this.paymentService.createTransaction(data);

      return reply.status(200).send(successResponse(transactionData, 'Payment transaction created successfully'));
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

  async handleWebhookNotification(request, reply) {

    try {
      const notificationData = request.body;

      const { order_id, transaction_status, signature_key } = notificationData;
      if (!order_id || !transaction_status || !signature_key) {
        return errorResponse(reply, 'Invalid webhook payload', 400, 'Missing required fields');
      }


      const processingResult = await this.paymentService.handleWebhookNotification(notificationData);

      return reply.status(200).send(successResponse({ ...processingResult }, 'Webhook processed successfully'));
    } catch (error) {

      if (error.message.includes('Invalid notification signature')) {
        return reply.status(400).send(errorResponse('Invalid signature', 400, error.message));
      }

      if (error.message.includes('Payment not found')) {
        return reply.status(404).send(errorResponse('Payment not found', 404, error.message));
      }

      throw error;
    }
  }

  async getPaymentStatus(request, reply) {

    try {
      const registrationId = Number(request.params.registrationId);
      const paymentStatus = await this.paymentService.getPaymentStatus(registrationId);

      return reply.status(200).send(successResponse(paymentStatus, 'Payment status retrieved successfully'));
    } catch (error) {
      throw error;
    }
  }
}

export const rylsPaymentController = new RylsPaymentController();
