import { adminTransactionRepository } from '../../repositories/admin/transactionRepository.js';

export class AdminTransactionService {
  constructor() {
    this.repository = adminTransactionRepository;
  }


  async getTransactions(params) {
    return await this.repository.findAll(params);
  }

  async exportAllForExcel(params = {}) {
    return await this.repository.findAll({ ...params, page: 1, limit: 10000 });
  }

  async generateExcelFile(transactions) {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      const sheetData = this._prepareSheetData(transactions);
      const sheet = XLSX.utils.aoa_to_sheet(sheetData);
      sheet['!cols'] = this._calculateColumnWidths(sheetData);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Transactions');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return buffer;
    } catch (error) {
      throw new Error('Failed to generate Excel file');
    }
  }

  _formatProduct(productType, productName) {
    const type = (productType || '').toLowerCase();
    if (type === 'academy_enrollment') {
      return productName ? `Academy Enrollment - ${productName}` : 'Academy Enrollment';
    }
    if (type === 'ryls_registration' || type === 'ryls') {
      return 'RYLS Registration';
    }
    return productName || productType || '';
  }

  _prepareSheetData(transactions) {
    const headers = ['ID', 'Transaction Code', 'Customer Name', 'Customer Email', 'Customer Phone', 'Product', 'Amount', 'Currency', 'Status', 'Provider', 'Payment Method', 'Created At'];
    const rows = [headers];
    transactions.forEach((tx) => {
      rows.push([
        tx.id,
        tx.transaction_code || '',
        tx.customer_name || '',
        tx.customer_email || '',
        tx.customer_phone || '',
        this._formatProduct(tx.product_type, tx.product_name),
        tx.amount ?? '',
        tx.currency || '',
        tx.status || '',
        tx.provider || '',
        tx.payment_method || '',
        tx.created_at ? new Date(tx.created_at).toLocaleString() : '',
      ]);
    });
    return rows;
  }

  _calculateColumnWidths(sheetData) {
    if (!sheetData?.length) return [];
    const numColumns = sheetData[0].length;
    const columnWidths = [];
    for (let col = 0; col < numColumns; col++) {
      let maxWidth = 0;
      for (const row of sheetData) {
        if (row?.[col]) maxWidth = Math.max(maxWidth, String(row[col]).length);
      }
      const optimalWidth = Math.min(Math.max(maxWidth + 2, 8), 50);
      columnWidths.push({ width: optimalWidth, wch: optimalWidth });
    }
    return columnWidths;
  }

  async getTransactionById(id) {

    const tx = await this.repository.findById(id);
    if (!tx) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }

    // Reshape flat Prisma result into nested API structure
    const { user, items, cohort_enrollment, ryls_payment, ...base } = tx;

    return {
      id: base.id,
      transaction_code: base.transaction_code,
      amount: base.amount,
      currency: base.currency,
      status: base.status,
      provider: base.provider,
      payment_method: base.payment_method,
      created_at: base.created_at,
      paid_at: base.paid_at,
      expired_at: base.expired_at,

      customer_details: {
        user_id: base.user_id,
        user_name: user ? `${user.first_name} ${user.last_name}` : null,
        name: base.customer_name,
        email: base.customer_email,
        phone: base.customer_phone ?? null,
        address: base.customer_address ?? null,
        city: base.customer_city ?? null,
        postal_code: base.customer_postal_code ?? null,
        country_code: base.customer_country_code ?? null,
      },

      product_details: {
        type: base.product_type,
        items,
        enrollment: cohort_enrollment?.cohort
          ? { cohort_id: cohort_enrollment.cohort.id, cohort_name: cohort_enrollment.cohort.name }
          : null,
        ryls_registration: ryls_payment?.registration ?? null,
      },
    };
  }
}

export const adminTransactionService = new AdminTransactionService();
