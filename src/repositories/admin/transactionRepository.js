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
        midtrans_data: {
          select: { midtrans_order_id: true },
        },
        ryls_payment: {
          select: {
            payment_proof: { select: { file_path: true } },
          },
        },
      },
    });

    return raw.map(({ items, midtrans_data, ryls_payment, ...tx }) => ({
      ...tx,
      product_name: items[0]?.product_name ?? null,
      midtrans_order_id: midtrans_data?.midtrans_order_id ?? null,
      payment_proof_path: ryls_payment?.payment_proof?.file_path ?? null,
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
