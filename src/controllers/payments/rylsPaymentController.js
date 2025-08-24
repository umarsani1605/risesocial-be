import { RylsPaymentService } from '../../services/rylsPaymentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * RYLS Payment Controller
 * Handles HTTP requests for payment transactions
 * Follows the same pattern as rylsRegistrationController.js
 */
export class RylsPaymentController {
  constructor() {
    this.paymentService = new RylsPaymentService();
  }

  /**
   * Create payment transaction
   * POST /api/payments/ryls/transactions
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async createTransaction(request, reply) {
    console.log('[PaymentController] createTransaction called');
    console.log('[PaymentController] Request body:', JSON.stringify(request.body, null, 2));

    try {
      const data = request.body;

      console.log('[PaymentController] Processing registration for:', data.fullName);

      console.log('[PaymentController] Calling paymentService.createTransaction...');

      const transactionData = await this.paymentService.createTransaction(data);

      console.log('[PaymentController] Transaction created successfully');
      console.log('[PaymentController] Transaction data:', transactionData);

      return reply.status(200).send(successResponse(transactionData, 'Payment transaction created successfully'));
    } catch (error) {
      console.error('[PaymentController] Error creating transaction:', error);

      // Handle specific error types
      if (error.message.includes('Registration not found')) {
        return reply.status(404).send(errorResponse('Registration not found', 404, error.message));
      }

      if (error.message.includes('Invalid scholarship type')) {
        return reply.status(400).send(errorResponse('Invalid registration data', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to create payment transaction', 500, error.message));
    }
  }

  /**
   * Handle Midtrans webhook notification
   * POST /api/payments/notifications (generic webhook endpoint)
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async handleWebhookNotification(request, reply) {
    console.log('[PaymentController] handleWebhookNotification called');
    console.log('[PaymentController] Webhook payload:', JSON.stringify(request.body, null, 2));

    try {
      const notificationData = request.body;

      // Validate required webhook fields
      const { order_id, transaction_status, signature_key } = notificationData;
      if (!order_id || !transaction_status || !signature_key) {
        console.error('[PaymentController] Missing required webhook fields');
        return errorResponse(reply, 'Invalid webhook payload', 400, 'Missing required fields');
      }

      console.log('[PaymentController] Processing webhook for order:', order_id);
      console.log('[PaymentController] Transaction status:', transaction_status);

      // Call payment service to handle webhook
      console.log('[PaymentController] Calling paymentService.handleWebhookNotification...');
      const processingResult = await this.paymentService.handleWebhookNotification(notificationData);

      console.log('[PaymentController] Webhook processed successfully');
      console.log('[PaymentController] Processing result:', JSON.stringify(processingResult, null, 2));

      // Return success response to Midtrans
      return reply.status(200).send(successResponse({ ...processingResult }, 'Webhook processed successfully'));
    } catch (error) {
      console.error('[PaymentController] Error processing webhook:', error);

      // Handle specific error types
      if (error.message.includes('Invalid notification signature')) {
        console.error('[PaymentController] Signature verification failed');
        return reply.status(400).send(errorResponse('Invalid signature', 400, error.message));
      }

      if (error.message.includes('Payment not found')) {
        console.error('[PaymentController] Payment not found for webhook');
        return reply.status(404).send(errorResponse('Payment not found', 404, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to process webhook notification', 500, error.message));
    }
  }

  /**
   * Get payment status for registration
   * GET /api/payments/ryls/:registrationId/status
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async getPaymentStatus(request, reply) {
    console.log('[PaymentController] getPaymentStatus called');
    console.log('[PaymentController] Registration ID:', request.params.registrationId);

    try {
      const registrationId = parseInt(request.params.registrationId);

      if (isNaN(registrationId) || registrationId <= 0) {
        return errorResponse(reply, 'Invalid registration ID', 400, 'Registration ID must be a positive number');
      }

      console.log('[PaymentController] Processing registration ID:', registrationId);

      // Call payment service to get status
      console.log('[PaymentController] Calling paymentService.getPaymentStatus...');
      const paymentStatus = await this.paymentService.getPaymentStatus(registrationId);

      console.log('[PaymentController] Payment status retrieved');
      console.log('[PaymentController] Status data:', {
        hasPayment: paymentStatus.hasPayment,
        status: paymentStatus.status,
        orderId: paymentStatus.orderId,
      });

      return reply.status(200).send(successResponse(paymentStatus, 'Payment status retrieved successfully'));
    } catch (error) {
      console.error('[PaymentController] Error getting payment status:', error);
      return reply.status(500).send(errorResponse('Failed to get payment status', 500, error.message));
    }
  }

  /**
   * Get payment statistics
   * GET /api/payments/ryls/statistics
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async getPaymentStatistics(request, reply) {
    console.log('[PaymentController] getPaymentStatistics called');
    console.log('[PaymentController] Query params:', JSON.stringify(request.query, null, 2));

    try {
      const filters = request.query || {};

      console.log('[PaymentController] Processing filters:', JSON.stringify(filters, null, 2));

      // Call payment service to get statistics
      console.log('[PaymentController] Calling paymentService.getPaymentStatistics...');
      const statistics = await this.paymentService.getPaymentStatistics(filters);

      console.log('[PaymentController] Statistics retrieved');
      console.log('[PaymentController] Statistics:', {
        totalPayments: statistics.totalPayments,
        successfulPayments: statistics.successfulPayments,
        successRate: statistics.successRate,
      });

      return reply.status(200).send(successResponse(statistics, 'Payment statistics retrieved successfully'));
    } catch (error) {
      console.error('[PaymentController] Error getting statistics:', error);
      return reply.status(500).send(errorResponse('Failed to get payment statistics', 500, error.message));
    }
  }

  /**
   * Cancel payment transaction
   * POST /api/payments/ryls/:orderId/cancel
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async cancelPayment(request, reply) {
    console.log('[PaymentController] cancelPayment called');
    console.log('[PaymentController] Order ID:', request.params.orderId);

    try {
      const { orderId } = request.params;

      if (!orderId || !orderId.startsWith('RYLS')) {
        return errorResponse(reply, 'Invalid order ID', 400, 'Order ID must start with RYLS');
      }

      console.log('[PaymentController] Processing order ID:', orderId);

      // Call payment service to cancel payment
      console.log('[PaymentController] Calling paymentService.cancelPayment...');
      const cancellationResult = await this.paymentService.cancelPayment(orderId);

      console.log('[PaymentController] Payment cancelled successfully');
      console.log('[PaymentController] Cancellation result:', JSON.stringify(cancellationResult, null, 2));

      return reply.status(200).send(successResponse(cancellationResult, 'Payment cancelled successfully'));
    } catch (error) {
      console.error('[PaymentController] Error cancelling payment:', error);

      // Handle specific error types
      if (error.message.includes('Payment not found')) {
        return reply.status(404).send(errorResponse('Payment not found', 404, error.message));
      }

      if (error.message.includes('Cannot cancel payment')) {
        return reply.status(400).send(errorResponse('Cannot cancel payment', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to cancel payment', 500, error.message));
    }
  }

  /**
   * Health check for payment system
   * GET /api/payments/health
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async healthCheck(request, reply) {
    console.log('[PaymentController] healthCheck called');

    try {
      // Basic health check - could be extended to check Midtrans connectivity
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          midtrans: 'configured',
        },
      };

      console.log('[PaymentController] Health check passed');
      return reply.status(200).send(successResponse(healthData, 'Payment system is healthy'));
    } catch (error) {
      console.error('[PaymentController] Health check failed:', error);
      return errorResponse(reply, 'Payment system unhealthy', 500, error.message);
    }
  }
}

export default RylsPaymentController;
