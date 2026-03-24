/**
 * Clean Data Migration Script: Old Payment Schema → New 3-Layer Architecture
 *
 * Migrates data WITHOUT any prefix/suffix modifications
 * Preserves all original data exactly as-is
 */

import { PrismaClient } from '@prisma/client';
import { PRODUCT_TYPE, PAYMENT_PROVIDER } from '../src/constants/paymentHelpers.js';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('=== Starting Clean Payment Data Migration ===\n');

  try {
    // Step 1: Check old table
    console.log('Step 1: Checking old midtrans_payments table...');
    const oldPaymentsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM midtrans_payments
    `;
    const totalRecords = Number(oldPaymentsCount[0].count);
    console.log(`Found ${totalRecords} records in midtrans_payments\n`);

    if (totalRecords === 0) {
      console.log('No data to migrate. Exiting.');
      return;
    }

    // Step 2: Fetch all old midtrans_payments
    console.log('Step 2: Fetching old payment data...');
    const oldMidtransPayments = await prisma.$queryRaw`
      SELECT * FROM midtrans_payments ORDER BY id ASC
    `;
    console.log(`Fetched ${oldMidtransPayments.length} payment records\n`);

    // Step 3: Migrate each payment
    console.log('Step 3: Migrating to new 3-layer architecture...');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const oldPayment of oldMidtransPayments) {
      try {
        await prisma.$transaction(async (tx) => {
          // Layer 1: Create transaction (generic)
          const transaction = await tx.transaction.create({
            data: {
              transaction_code: oldPayment.order_id,
              provider_reference: oldPayment.transaction_id,
              amount: oldPayment.gross_amount_idr,
              currency: oldPayment.currency || 'IDR',
              status: mapMidtransStatusToGeneric(oldPayment.transaction_status),
              provider: PAYMENT_PROVIDER.MIDTRANS,
              payment_method: oldPayment.payment_type,
              payment_token: oldPayment.snap_token,
              payment_url: oldPayment.redirect_url,
              customer_name: 'Legacy Data',
              customer_email: 'legacy@risesocial.id',
              customer_phone: null,
              customer_address: null,
              customer_city: null,
              customer_postal_code: null,
              customer_country_code: 'IDN',
              user_id: null,
              product_type: PRODUCT_TYPE.RYLS_SCHOLARSHIP,
              product_type_id: 0,
              metadata: null,
              paid_at: oldPayment.paid_at,
              expired_at: null,
              created_at: oldPayment.created_at,
              updated_at: oldPayment.updated_at,
            },
          });

          // Layer 1b: Create transaction item
          await tx.transactionItem.create({
            data: {
              transaction_id: transaction.id,
              product_code: 'RYLS',
              product_name: 'Rise Young Leaders Scholarship',
              product_category: 'scholarship',
              quantity: 1,
              unit_price: oldPayment.gross_amount_idr,
              total_price: oldPayment.gross_amount_idr,
              metadata: null,
              created_at: oldPayment.created_at,
            },
          });

          // Layer 2: Create midtrans_transaction (provider-specific)
          await tx.midtransTransaction.create({
            data: {
              transaction_id: transaction.id,
              snap_token: oldPayment.snap_token,
              redirect_url: oldPayment.redirect_url,
              midtrans_order_id: oldPayment.order_id,
              midtrans_transaction_id: oldPayment.transaction_id,
              transaction_status: oldPayment.transaction_status,
              fraud_status: oldPayment.fraud_status,
              payment_type: oldPayment.payment_type,
              bank: null,
              va_numbers: null,
              masked_card: null,
              status_code: null,
              status_message: null,
              approval_code: null,
              create_response: oldPayment.payment_details,
              last_notification: oldPayment.last_notification,
              status_response: null,
              settlement_time: null,
              notified_at: oldPayment.notified_at,
              created_at: oldPayment.created_at,
              updated_at: oldPayment.updated_at,
            },
          });
        });

        successCount++;
        if (successCount % 100 === 0) {
          console.log(`  Migrated ${successCount}/${totalRecords} payments...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          order_id: oldPayment.order_id,
          error: error.message,
        });
        if (errorCount <= 5) {
          console.error(`  ❌ Error migrating ${oldPayment.order_id}: ${error.message}`);
        }
      }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`✅ Success: ${successCount}/${totalRecords}`);
    console.log(`❌ Errors: ${errorCount}/${totalRecords}\n`);

    if (errorCount > 0 && errorCount <= 10) {
      console.log('Error details:');
      errors.forEach((err) => {
        console.log(`  - ${err.order_id}: ${err.error}`);
      });
      console.log('');
    }

    // Step 4: Verify migration
    console.log('Step 4: Verifying migration...');
    const newTransactions = await prisma.transaction.count();
    const newMidtransTransactions = await prisma.midtransTransaction.count();
    const newTransactionItems = await prisma.transactionItem.count();

    console.log(`  Transactions: ${newTransactions}`);
    console.log(`  Midtrans Transactions: ${newMidtransTransactions}`);
    console.log(`  Transaction Items: ${newTransactionItems}`);
    console.log('');

    if (newTransactions === totalRecords && newMidtransTransactions === totalRecords) {
      console.log('✅ Migration verification PASSED');
    } else {
      console.log('⚠️  Migration verification WARNING: Count mismatch');
    }

    console.log('');
    console.log('=== Next Steps ===');
    console.log('1. Verify sample data in database');
    console.log('2. Test payment creation flow');
    console.log('3. Test webhook processing');
    console.log('4. If everything works, old midtrans_payments table can be dropped');
    console.log('');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Map Midtrans transaction status to generic status
 */
function mapMidtransStatusToGeneric(midtransStatus) {
  const statusMap = {
    settlement: 'paid',
    capture: 'paid',
    pending: 'pending',
    challenge: 'pending',
    deny: 'failed',
    cancel: 'failed',
    expire: 'expired',
    refund: 'refunded',
  };
  return statusMap[midtransStatus] || 'pending';
}

// Execute migration
migrateData()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
