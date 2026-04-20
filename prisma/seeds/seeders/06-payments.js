/**
 * Payment seeder — seeds academy enrollment transactions only.
 * RYLS transactions are managed by 05-ryls.js and are NOT touched here.
 */

import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { generateTransactions } from '../data/payments.js';

export async function seedPayments(prisma) {
  try {
    logSeedStart('Payments');

    // Delete only academy_enrollment transactions to avoid overwriting RYLS payments.
    // Must delete in FK order: midtransTransaction → transactionItem → transaction
    const academyTxRecords = await prisma.transaction.findMany({
      where: { product_type: 'academy_enrollment' },
      select: { id: true },
    });
    const academyTxIds = academyTxRecords.map((t) => t.id);

    if (academyTxIds.length > 0) {
      await prisma.midtransTransaction.deleteMany({
        where: { transaction_id: { in: academyTxIds } },
      });
      await prisma.transactionItem.deleteMany({
        where: { transaction_id: { in: academyTxIds } },
      });
      await prisma.transaction.deleteMany({
        where: { id: { in: academyTxIds } },
      });
    }

    // Also clear enrollment transaction_id links so updates below work cleanly
    await prisma.cohortEnrollment.updateMany({
      where: { transaction_id: { not: null } },
      data: { transaction_id: null },
    });

    // Fetch enrollments with everything generateTransactions() needs
    const enrollments = await prisma.cohortEnrollment.findMany({
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true } },
        cohort: {
          include: {
            academy: {
              select: {
                title: true,
                pricing: { orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
    });

    const transactionsData = generateTransactions(enrollments);

    let transactionItemCount = 0;
    let midtransCount = 0;

    for (const txData of transactionsData) {
      const { items, midtrans_data, ...transactionFields } = txData;

      const transaction = await prisma.transaction.create({ data: transactionFields });

      for (const item of items) {
        await prisma.transactionItem.create({
          data: { transaction_id: transaction.id, ...item },
        });
        transactionItemCount++;
      }

      await prisma.midtransTransaction.create({
        data: { transaction_id: transaction.id, ...midtrans_data },
      });
      midtransCount++;

      // Link enrollment to its transaction
      await prisma.cohortEnrollment.update({
        where: { id: transaction.product_type_id },
        data: { transaction_id: transaction.id },
      });
    }

    const stats = {
      transactionCount: transactionsData.length,
      transactionItemCount,
      midtransCount,
    };

    logSeedSuccess('Payments', stats);
    return stats;
  } catch (error) {
    logSeedError('Payments', error);
    throw error;
  }
}
