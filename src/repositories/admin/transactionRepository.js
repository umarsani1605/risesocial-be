import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AdminTransactionRepository {
  get logger() {
    return getLogger();
  }

  async findAll({ page = 1, limit = 10, search, status, product_type } = {}) {
    this.logger.info({ page, limit, search, status, product_type }, '[adminTransactionRepository] findAll called');

    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (product_type) where.product_type = product_type;
    if (search) {
      where.OR = [
        { transaction_code: { contains: search, mode: 'insensitive' } },
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [raw, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          transaction_code: true,
          customer_name: true,
          customer_email: true,
          customer_phone: true,
          product_type: true,
          amount: true,
          currency: true,
          status: true,
          provider: true,
          payment_method: true,
          created_at: true,
          items: {
            take: 1,
            select: { product_name: true },
            orderBy: { id: 'asc' },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const data = raw.map(({ items, ...tx }) => ({
      ...tx,
      product_name: items[0]?.product_name ?? null,
    }));

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id) {
    this.logger.info({ id }, '[adminTransactionRepository] findById called');

    return await prisma.transaction.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, first_name: true, last_name: true } },
        items: {
          select: {
            id: true,
            product_name: true,
            quantity: true,
            unit_price: true,
            total_price: true,
          },
          orderBy: { id: 'asc' },
        },
        cohort_enrollment: {
          select: {
            cohort: { select: { id: true, name: true } },
          },
        },
        ryls_payment: {
          select: {
            registration: { select: { id: true, full_name: true, scholarship_type: true } },
          },
        },
      },
    });
  }
}

export const adminTransactionRepository = new AdminTransactionRepository();
