import { adminTransactionService } from '../../services/admin/transactionService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminTransactionController {
  getTransactions = async (request, reply) => {
    try {
      const result = await adminTransactionService.getTransactions(request.query);
      return reply.send(successResponse(result.data, 'Transactions retrieved successfully', result.meta));
    } catch (error) {
      throw error;
    }
  };

  exportTransactionsExcel = async (request, reply) => {
    try {
      const result = await adminTransactionService.exportAllForExcel(request.query);
      const buffer = await adminTransactionService.generateExcelFile(result.data);
      const filename = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Length', buffer.length);
      return reply.send(buffer);
    } catch (error) {
      throw error;
    }
  };

  getTransactionById = async (request, reply) => {
    try {
      const { id } = request.params;
      const transaction = await adminTransactionService.getTransactionById(Number(id));
      return reply.send(successResponse(transaction, 'Transaction retrieved successfully'));
    } catch (error) {
      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      throw error;
    }
  };
}

export const adminTransactionController = new AdminTransactionController();
