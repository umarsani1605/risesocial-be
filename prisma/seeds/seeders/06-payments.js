/**
 * Payment seeder - seeds transactions with items and Midtrans data
 */

import { PrismaClient } from '@prisma/client';
import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { generateTransactions } from '../data/payments.js';

/**
 * Seed payment transactions
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Object>} Statistics object
 */
export async function seedPayments(prisma) {
  try {
    logSeedStart('Payments');

    // Clear existing data
    await prisma.rylsPayment.deleteMany({});
    await prisma.midtransTransaction.deleteMany({});
    await prisma.transactionItem.deleteMany({});
    await prisma.transaction.deleteMany({});

    // Fetch required IDs
    const users = await prisma.user.findMany({
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    const enrollments = await prisma.cohortEnrollment.findMany({
      select: { id: true },
    });
    const enrollmentIds = enrollments.map((e) => e.id);

    const rylsRegistrations = await prisma.rylsRegistration.findMany({
      select: { id: true },
    });
    const rylsRegistrationIds = rylsRegistrations.map((r) => r.id);

    // Generate transaction data
    const transactionsData = generateTransactions(userIds, enrollmentIds, rylsRegistrationIds);

    let transactionItemCount = 0;
    let midtransCount = 0;
    let rylsPaymentCount = 0;

    // Create transactions
    for (const txData of transactionsData) {
      const { items, midtrans_data, ...transactionFields } = txData;

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: transactionFields,
      });

      // Create transaction items
      for (const item of items) {
        await prisma.transactionItem.create({
          data: {
            transaction_id: transaction.id,
            ...item,
          },
        });
        transactionItemCount++;
      }

      // Create Midtrans transaction
      await prisma.midtransTransaction.create({
        data: {
          transaction_id: transaction.id,
          ...midtrans_data,
        },
      });
      midtransCount++;

      // Create RYLS payment link if applicable
      if (transaction.product_type === 'ryls_registration') {
        await prisma.rylsPayment.create({
          data: {
            registration_id: transaction.product_type_id,
            transaction_id: transaction.id,
            status: transaction.status,
            scholarship_type: 'SELF_FUNDED',
            payment_method: transaction.payment_method || 'bank_transfer',
          },
        });
        rylsPaymentCount++;
      }

      // Update enrollment with transaction_id if applicable
      if (transaction.product_type === 'academy_enrollment') {
        await prisma.cohortEnrollment.update({
          where: { id: transaction.product_type_id },
          data: { transaction_id: transaction.id },
        });
      }
    }

    const stats = {
      transactionCount: transactionsData.length,
      transactionItemCount,
      midtransCount,
      rylsPaymentCount,
    };

    logSeedSuccess('Payments', stats);
    return stats;
  } catch (error) {
    logSeedError('Payments', error);
    throw error;
  }
}
