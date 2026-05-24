import { adminTransactionRepository } from '../../repositories/admin/transactionRepository.js';
import { midtransService } from '../shared/MidtransService.js';
import {
  mapMidtransStatus,
  mapPaymentMethod,
  reverseMapToMidtransStatus,
  parseMidtransTimestamp,
  PAYMENT_PROVIDER,
} from '../../constants/paymentHelpers.js';
import prisma from '../../config/database.js';
import { academyEnrollmentRepository } from '../../repositories/cohorts/academyEnrollmentRepository.js';

const ALLOWED_STATUSES = ['pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded'];

export class AdminTransactionService {
  constructor() {
    this.repository = adminTransactionRepository;
  }


  async getTransactions() {
    return await this.repository.findAll();
  }

  async exportAllForExcel() {
    return await this.repository.findAll();
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
    const { user, items, academy_enrollment, ryls_payment, ...base } = tx;

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
        enrollment: academy_enrollment
          ? {
              academy_enrollment_id: academy_enrollment.id,
              academy_id: academy_enrollment.academy?.id ?? null,
              academy_title: academy_enrollment.academy?.title ?? null,
              placement_id: academy_enrollment.placement?.id ?? null,
              cohort_id: academy_enrollment.placement?.cohort?.id ?? null,
              cohort_name: academy_enrollment.placement?.cohort?.name ?? null,
            }
          : null,
        ryls_registration: ryls_payment?.registration ?? null,
      },
    };
  }

  /**
   * Check transaction status against the underlying payment provider and
   * cascade update Transaction + provider layer + business layer.
   * Provider-agnostic: dispatches to the right provider helper based on
   * `Transaction.provider`.
   */
  async checkStatus(transactionId) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }

    switch (transaction.provider) {
      case PAYMENT_PROVIDER.MIDTRANS:
        await this._checkMidtransStatus(transaction);
        break;
      default: {
        const err = new Error(
          `Check status is not supported for provider "${transaction.provider}"`,
        );
        err.statusCode = 400;
        throw err;
      }
    }

    return this.getTransactionById(transaction.id);
  }

  /**
   * Midtrans-specific status check + cascade.
   * @private
   */
  async _checkMidtransStatus(transaction) {
    let midtransData;
    try {
      midtransData = await midtransService.getTransactionStatus(transaction.transaction_code);
    } catch (error) {
      const rawMessage = error?.message ?? 'unknown error';
      // Midtrans returns 404 when the order_id was never charged (e.g. user
      // opened the Snap popup but closed before picking a payment method).
      // Translate to a friendlier message; surface raw text for other errors
      // so genuine auth/network failures stay debuggable.
      const isNotFound = /404|Transaction doesn'?t exist/i.test(rawMessage);
      const err = new Error(
        isNotFound
          ? 'Transaction not found or user likely did not pick a payment method.'
          : `Failed to check status from Midtrans: ${rawMessage}`,
      );
      err.statusCode = 422;
      err.cause = error;
      throw err;
    }

    const genericStatus = mapMidtransStatus(
      midtransData.transaction_status,
      midtransData.fraud_status,
    );
    const paymentMethod = mapPaymentMethod(midtransData);

    await prisma.$transaction(async (tx) => {
      // Layer 1
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: genericStatus,
          provider_reference: midtransData.transaction_id ?? transaction.provider_reference,
          payment_method: paymentMethod,
          paid_at: genericStatus === 'paid' ? new Date() : undefined,
          expired_at: genericStatus === 'expired' ? new Date() : undefined,
          updated_at: new Date(),
        },
      });

      // Layer 2 — Midtrans-specific record
      const midtransRow = await tx.midtransTransaction.findUnique({
        where: { transaction_id: transaction.id },
        select: { id: true },
      });
      if (midtransRow) {
        await tx.midtransTransaction.update({
          where: { transaction_id: transaction.id },
          data: {
            midtrans_transaction_id: midtransData.transaction_id ?? undefined,
            transaction_status: midtransData.transaction_status,
            fraud_status: midtransData.fraud_status ?? null,
            payment_type: midtransData.payment_type ?? null,
            bank: midtransData.bank ?? null,
            settlement_time: parseMidtransTimestamp(midtransData.settlement_time),
            last_notification: midtransData,
            notified_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      if (genericStatus === 'paid') {
        await academyEnrollmentRepository.ensureForPaidTransaction(tx, transaction.id);
      }

      // Layer 3 — business-specific cascade
      await this._cascadeRylsStatus(tx, transaction.id, genericStatus);
    });
  }

  /**
   * Manually override transaction status from admin UI.
   * Cascades to Layer 2 (if MidtransTransaction exists) and Layer 3 (RYLS).
   */
  async updateStatusManually(transactionId, newStatus) {
    if (!ALLOWED_STATUSES.includes(newStatus)) {
      const err = new Error(`Invalid status: ${newStatus}`);
      err.statusCode = 400;
      throw err;
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }

    await prisma.$transaction(async (tx) => {
      // Layer 1 — explicitly clear paid_at/expired_at when leaving those states
      // so admin overrides don't leave stale timestamps (e.g. paid → pending must
      // not keep a paid_at value, otherwise financial reports lie).
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date() : null,
          expired_at: newStatus === 'expired' ? new Date() : null,
          updated_at: new Date(),
        },
      });

      // Layer 2 — only if record exists (PayPal-only transactions don't have one)
      const midtransRow = await tx.midtransTransaction.findUnique({
        where: { transaction_id: transaction.id },
        select: { id: true },
      });
      if (midtransRow) {
        await tx.midtransTransaction.update({
          where: { transaction_id: transaction.id },
          data: {
            transaction_status: reverseMapToMidtransStatus(newStatus),
            updated_at: new Date(),
          },
        });
      }

      if (newStatus === 'paid') {
        await academyEnrollmentRepository.ensureForPaidTransaction(tx, transaction.id);
      }

      // Layer 3 — RYLS cascade
      await this._cascadeRylsStatus(tx, transaction.id, newStatus);
    });

    return this.getTransactionById(transaction.id);
  }

  /**
   * Mirror generic status into RYLS layer (RylsPayment + RylsRegistration)
   * if the transaction has a RYLS payment record. No-op for Academy
   * transactions (status is derived from Transaction.status).
   * @private
   */
  async _cascadeRylsStatus(tx, transactionId, genericStatus) {
    const rylsPayment = await tx.rylsPayment.findUnique({
      where: { transaction_id: transactionId },
      include: { registration: true },
    });
    if (!rylsPayment) return;

    await tx.rylsPayment.update({
      where: { id: rylsPayment.id },
      data: { status: genericStatus, updated_at: new Date() },
    });

    if (rylsPayment.registration) {
      await tx.rylsRegistration.update({
        where: { id: rylsPayment.registration_id },
        data: { updated_at: new Date() },
      });
    }
  }
}

export const adminTransactionService = new AdminTransactionService();
