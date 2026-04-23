import { adminTransactionController } from '../../controllers/admin/transactionController.js';
import { getAdminTransactionsSchema, getAdminTransactionByIdSchema } from '../../schemas/admin/transactionSchemas.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';

export default async function adminTransactionRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);

  fastify.get('/', {
    schema: getAdminTransactionsSchema,
    preHandler: requirePermission('admin.transactions'),
    handler: adminTransactionController.getTransactions,
  });
  fastify.get('/export-excel', {
    schema: { tags: ['Admin Transactions'], description: 'Export transactions to Excel (Admin only)' },
    preHandler: requirePermission('admin.transactions'),
    handler: adminTransactionController.exportTransactionsExcel,
  });
  fastify.get('/:id', {
    schema: getAdminTransactionByIdSchema,
    preHandler: requirePermission('admin.transactions'),
    handler: adminTransactionController.getTransactionById,
  });
}
