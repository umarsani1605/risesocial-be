import { adminTransactionRepository } from '../../repositories/admin/transactionRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AdminTransactionService {
  constructor() {
    this.repository = adminTransactionRepository;
  }

  get logger() {
    return getLogger();
  }

  async getTransactions(params) {
    this.logger.info('[adminTransactionService] getTransactions start');
    return await this.repository.findAll(params);
  }

  async getTransactionById(id) {
    this.logger.info({ id }, '[adminTransactionService] getTransactionById start');

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
