import { adminTransactionService } from '../../services/admin/transactionService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminTransactionController {
  getTransactions = async (request, reply) => {
    try {
      request.log.info('[adminTransactionController] getTransactions start');
      const result = await adminTransactionService.getTransactions(request.query);
      return reply.send(successResponse(result.data, 'Transactions retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[adminTransactionController] getTransactions error');
      return reply.status(500).send(errorResponse('Failed to fetch transactions', 500, error.message));
    }
  };

  getTransactionById = async (request, reply) => {
    try {
      request.log.info('[adminTransactionController] getTransactionById start');
      const { id } = request.params;
      const transaction = await adminTransactionService.getTransactionById(Number(id));
      return reply.send(successResponse(transaction, 'Transaction retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTransactionController] getTransactionById error');
      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      return reply.status(500).send(errorResponse('Failed to fetch transaction', 500, error.message));
    }
  };
}

export const adminTransactionController = new AdminTransactionController();
