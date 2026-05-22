import prisma from '../../config/database.js';

export class AdminTransactionRepository {

  async findAll() {
    const raw = await prisma.transaction.findMany({
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
    });

    return raw.map(({ items, ...tx }) => ({
      ...tx,
      product_name: items[0]?.product_name ?? null,
    }));
  }

  async findById(id) {

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
        academy_enrollment: {
          select: {
            id: true,
            academy: { select: { id: true, title: true } },
            placement: {
              select: {
                id: true,
                cohort: { select: { id: true, name: true } },
              },
            },
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
