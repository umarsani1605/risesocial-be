import { adminTransactionService } from '../../services/admin/transactionService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminTransactionController {
  getTransactions = async (request, reply) => {
    try {
      const transactions = await adminTransactionService.getTransactions();
      return reply.send(successResponse(transactions, 'Transactions retrieved successfully'));
    } catch (error) {
      throw error;
    }
  };

  exportTransactionsExcel = async (request, reply) => {
    try {
      const transactions = await adminTransactionService.exportAllForExcel();
      const buffer = await adminTransactionService.generateExcelFile(transactions);
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

  checkStatus = async (request, reply) => {
    try {
      const { id } = request.params;
      const detail = await adminTransactionService.checkStatus(Number(id));
      return reply.send(successResponse(detail, 'Transaction status checked'));
    } catch (error) {
      if (error.statusCode) {
        return reply.status(error.statusCode).send(errorResponse(error.message, error.statusCode));
      }
      throw error;
    }
  };

  updateStatusManually = async (request, reply) => {
    try {
      const { id } = request.params;
      const { status } = request.body;
      const detail = await adminTransactionService.updateStatusManually(Number(id), status);
      return reply.send(successResponse(detail, 'Transaction status updated'));
    } catch (error) {
      if (error.statusCode) {
        return reply.status(error.statusCode).send(errorResponse(error.message, error.statusCode));
      }
      throw error;
    }
  };
}

export const adminTransactionController = new AdminTransactionController();
