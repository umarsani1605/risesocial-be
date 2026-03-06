import { rylsPaymentController } from '../../controllers/payments/rylsPaymentController.js';
import { createTransactionSchema, webhookNotificationSchema, getPaymentStatusSchema } from '../../schemas/user/rylsPaymentSchemas.js';

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
}

export default rylsPaymentRoutes;
