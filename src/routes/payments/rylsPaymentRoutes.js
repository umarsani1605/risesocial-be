import { rylsPaymentController } from '../../controllers/payments/rylsPaymentController.js';
import {
  createTransactionSchema,
  webhookNotificationSchema,
  getPaymentStatusSchema,
  getPaymentStatisticsSchema,
  cancelPaymentSchema,
  healthCheckSchema,
} from '../../schemas/rylsPaymentSchemas.js';

async function rylsPaymentRoutes(fastify, options) {
  fastify.post('/ryls/transactions', {
    schema: createTransactionSchema,
    handler: rylsPaymentController.createTransaction,
  });

  fastify.post('/notifications', {
    schema: webhookNotificationSchema,
    handler: rylsPaymentController.handleWebhookNotification,
  });

  fastify.get('/ryls/:registrationId/status', {
    schema: getPaymentStatusSchema,
    handler: rylsPaymentController.getPaymentStatus,
  });

  fastify.get('/ryls/statistics', {
    schema: getPaymentStatisticsSchema,
    handler: rylsPaymentController.getPaymentStatistics,
  });

  fastify.post('/ryls/:orderId/cancel', {
    schema: cancelPaymentSchema,
    handler: rylsPaymentController.cancelPayment,
  });

  fastify.get('/health', {
    schema: healthCheckSchema,
    handler: rylsPaymentController.healthCheck,
  });
}

export default rylsPaymentRoutes;
