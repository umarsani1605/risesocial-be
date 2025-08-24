import { RylsPaymentController } from '../../controllers/payments/rylsPaymentController.js';
import {
  createTransactionSchema,
  webhookNotificationSchema,
  paymentStatusSchema,
  paymentStatisticsSchema,
  cancelPaymentSchema,
} from '../../schemas/rylsPaymentSchemas.js';

/**
 * RYLS Payment Routes
 * Defines API endpoints for payment transactions
 * Follows the same pattern as rylsRegistrationRoutes.js
 */

/**
 * Register payment routes
 * @param {Object} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function rylsPaymentRoutes(fastify, options) {
  const paymentController = new RylsPaymentController();

  console.log('[PaymentRoutes] Registering RYLS payment routes...');

  /**
   * Create Payment Transaction
   * POST /api/payments/ryls/transactions
   * Creates a new Snap transaction for RYLS registration
   */
  fastify.post('/ryls/transactions', {
    schema: createTransactionSchema,
    handler: async (request, reply) => {
      console.log('[PaymentRoutes] POST /api/payments/ryls/transactions called');
      console.log('[PaymentRoutes] Request body:', JSON.stringify(request.body, null, 2));

      try {
        return await paymentController.createTransaction(request, reply);
      } catch (error) {
        console.error('[PaymentRoutes] Error in createTransaction route:', error);
        throw error;
      }
    },
  });

  /**
   * Webhook Notification Handler
   * POST /api/payments/notifications
   * Generic webhook endpoint for all payment notifications from Midtrans
   */
  fastify.post('/notifications', {
    schema: webhookNotificationSchema,
    handler: async (request, reply) => {
      console.log('[PaymentRoutes] POST /api/payments/notifications called');
      console.log('[PaymentRoutes] Webhook payload received');
      // Don't log full payload in routes for security, controller will handle it

      try {
        return await paymentController.handleWebhookNotification(request, reply);
      } catch (error) {
        console.error('[PaymentRoutes] Error in webhook route:', error);
        throw error;
      }
    },
  });

  /**
   * Get Payment Status
   * GET /api/payments/ryls/:registrationId/status
   * Retrieves current payment status for a registration
   */
  fastify.get('/ryls/:registrationId/status', {
    schema: paymentStatusSchema,
    handler: async (request, reply) => {
      console.log('[PaymentRoutes] GET /api/payments/ryls/:registrationId/status called');
      console.log('[PaymentRoutes] Registration ID:', request.params.registrationId);

      try {
        return await paymentController.getPaymentStatus(request, reply);
      } catch (error) {
        console.error('[PaymentRoutes] Error in getPaymentStatus route:', error);
        throw error;
      }
    },
  });

  /**
   * Get Payment Statistics
   * GET /api/payments/ryls/statistics
   * Retrieves payment statistics with optional filters
   */
  fastify.get('/ryls/statistics', {
    schema: paymentStatisticsSchema,
    handler: async (request, reply) => {
      console.log('[PaymentRoutes] GET /api/payments/ryls/statistics called');
      console.log('[PaymentRoutes] Query params:', JSON.stringify(request.query, null, 2));

      try {
        return await paymentController.getPaymentStatistics(request, reply);
      } catch (error) {
        console.error('[PaymentRoutes] Error in getPaymentStatistics route:', error);
        throw error;
      }
    },
  });

  /**
   * Cancel Payment
   * POST /api/payments/ryls/:orderId/cancel
   * Cancels a pending payment transaction
   */
  fastify.post('/ryls/:orderId/cancel', {
    schema: cancelPaymentSchema,
    handler: async (request, reply) => {
      console.log('[PaymentRoutes] POST /api/payments/ryls/:orderId/cancel called');
      console.log('[PaymentRoutes] Order ID:', request.params.orderId);

      try {
        return await paymentController.cancelPayment(request, reply);
      } catch (error) {
        console.error('[PaymentRoutes] Error in cancelPayment route:', error);
        throw error;
      }
    },
  });

  /**
   * Health Check
   * GET /api/payments/health
   * Basic health check for payment system
   */
  fastify.get('/health', {
    handler: async (request, reply) => {
      console.log('[PaymentRoutes] GET /api/payments/health called');

      try {
        return await paymentController.healthCheck(request, reply);
      } catch (error) {
        console.error('[PaymentRoutes] Error in health check route:', error);
        throw error;
      }
    },
  });

  console.log('[PaymentRoutes] RYLS payment routes registered successfully');
  console.log('[PaymentRoutes] Available endpoints:');
  console.log('   POST /api/payments/ryls/transactions - Create payment transaction');
  console.log('   POST /api/payments/notifications - Webhook handler (generic)');
  console.log('   GET /api/payments/ryls/:registrationId/status - Get payment status');
  console.log('   GET /api/payments/ryls/statistics - Get payment statistics');
  console.log('   POST /api/payments/ryls/:orderId/cancel - Cancel payment');
  console.log('   GET /api/payments/health - Health check');
}

export default rylsPaymentRoutes;
