import { academyPaymentController } from '../../controllers/payments/academyPaymentController.js';
import { authMiddleware } from '../../middleware/auth.js';
import {
  createAcademyTransactionSchema,
  getAcademyPaymentStatusSchema,
  checkAcademyEnrollmentSchema,
  getUserTransactionsSchema,
  getUserTransactionDetailSchema,
} from '../../schemas/user/academyPaymentSchemas.js';

async function academyPaymentRoutes(fastify) {
  // Academy enrollment payment
  fastify.post('/academy/transactions', {
    schema: createAcademyTransactionSchema,
    preHandler: [authMiddleware],
    handler: academyPaymentController.createTransaction.bind(academyPaymentController),
  });

  fastify.post('/academy/transactions/:transactionCode/sync', {
    schema: {
      tags: ['Payments'],
      summary: 'Sync transaction status from Midtrans API',
      params: { type: 'object', properties: { transactionCode: { type: 'string' } }, required: ['transactionCode'] },
    },
    preHandler: [authMiddleware],
    handler: academyPaymentController.syncStatus.bind(academyPaymentController),
  });

  fastify.get('/academy/:enrollmentId/status', {
    schema: getAcademyPaymentStatusSchema,
    preHandler: [authMiddleware],
    handler: academyPaymentController.getPaymentStatus.bind(academyPaymentController),
  });

  fastify.get('/academy/check', {
    schema: checkAcademyEnrollmentSchema,
    preHandler: [authMiddleware],
    handler: academyPaymentController.checkEnrollment.bind(academyPaymentController),
  });

  // User transaction history (generic, not academy-specific)
  fastify.get('/transactions', {
    schema: getUserTransactionsSchema,
    preHandler: [authMiddleware],
    handler: academyPaymentController.getUserTransactions.bind(academyPaymentController),
  });

  fastify.get('/transactions/:transactionCode', {
    schema: getUserTransactionDetailSchema,
    preHandler: [authMiddleware],
    handler: academyPaymentController.getUserTransactionDetail.bind(academyPaymentController),
  });
}

export default academyPaymentRoutes;
