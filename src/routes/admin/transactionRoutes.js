import { adminTransactionController } from '../../controllers/admin/transactionController.js';
import { getAdminTransactionsSchema, getAdminTransactionByIdSchema } from '../../schemas/admin/transactionSchemas.js';
import { authMiddleware } from '../../middleware/auth.js';

export default async function adminTransactionRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', { schema: getAdminTransactionsSchema, handler: adminTransactionController.getTransactions });
  fastify.get('/:id', { schema: getAdminTransactionByIdSchema, handler: adminTransactionController.getTransactionById });
}
