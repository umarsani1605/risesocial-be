import { rylsPaymentController } from '../../controllers/payments/rylsPaymentController.js';
import { createTransactionSchema, getPaymentStatusSchema } from '../../schemas/user/rylsPaymentSchemas.js';

async function rylsPaymentRoutes(fastify) {
  fastify.post('/ryls/transactions', {
    schema: createTransactionSchema,
    handler: rylsPaymentController.createTransaction.bind(rylsPaymentController),
  });

  fastify.get('/ryls/:registrationId/status', {
    schema: getPaymentStatusSchema,
    handler: rylsPaymentController.getPaymentStatus.bind(rylsPaymentController),
  });
}

export default rylsPaymentRoutes;
