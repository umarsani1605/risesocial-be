/**
 * Payment Data Migration Script
 *
 * Migrates data from old payment structure to new 3-layer architecture:
 * - Layer 1: Generic Transaction (provider-agnostic)
 * - Layer 2: Provider-Specific (Midtrans)
 * - Layer 3: Business-Specific (RYLS)
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('  PAYMENT DATA MIGRATION');
  console.log('========================================\n');

  try {
    // Step 1: Get all old midtrans_payments
    console.log('📊 Step 1: Fetching old payment data...');
    const oldPayments = await prisma.midtransPayment.findMany({
      orderBy: { created_at: 'asc' },
    });
    console.log(`   Found ${oldPayments.length} payments to migrate\n`);

    if (oldPayments.length === 0) {
      console.log('✅ No data to migrate. Exiting.\n');
      return;
    }

    // Step 2: Migrate each payment
    console.log('🔄 Step 2: Migrating payments...');
    let successCount = 0;
    let errorCount = 0;

    for (const oldPayment of oldPayments) {
      try {
        // Get associated RYLS payment
        const rylsPayment = await prisma.rylsPayment.findFirst({
          where: { midtrans_id: oldPayment.id },
        });

        if (!rylsPayment) {
          console.log(`   ⚠️  Skipping payment ${oldPayment.order_id}: No associated RYLS payment`);
          continue;
        }

        // Create new Transaction (Layer 1)
        const transaction = await prisma.transaction.create({
          data: {
            transaction_code: oldPayment.order_id,
            provider_reference: oldPayment.transaction_id,
            amount: oldPayment.gross_amount_idr,
            currency: oldPayment.currency,
            status: mapTransactionStatus(oldPayment.transaction_status),
            provider: 'midtrans',
            payment_method: oldPayment.payment_type,
            payment_token: oldPayment.snap_token,
            payment_url: oldPayment.redirect_url,
            customer_name: 'RYLS Participant',
            customer_email: rylsPayment.registration?.email || 'unknown@email.com',
            customer_phone: rylsPayment.registration?.whatsapp || null,
            customer_address: null,
            customer_city: null,
            customer_postal_code: null,
            customer_country_code: null,
            user_id: null,
            product_type: 'ryls_registration',
            product_type_id: rylsPayment.registration_id || 0,
            metadata: oldPayment.payment_details,
            paid_at: oldPayment.paid_at,
            expired_at: null,
            created_at: oldPayment.created_at,
            updated_at: oldPayment.updated_at,
          },
        });

        // Create MidtransTransaction (Layer 2)
        await prisma.midtransTransaction.create({
          data: {
            transaction_id: transaction.id,
            snap_token: oldPayment.snap_token,
            redirect_url: oldPayment.redirect_url,
            midtrans_order_id: oldPayment.order_id,
            midtrans_transaction_id: oldPayment.transaction_id,
            transaction_status: oldPayment.transaction_status?.toString(),
            fraud_status: oldPayment.fraud_status?.toString(),
            payment_type: oldPayment.payment_type,
            bank: null,
            va_numbers: null,
            masked_card: null,
            status_code: null,
            status_message: null,
            approval_code: null,
            create_response: null,
            last_notification: oldPayment.last_notification,
            status_response: null,
            settlement_time: oldPayment.paid_at,
            notified_at: oldPayment.notified_at,
            created_at: oldPayment.created_at,
            updated_at: oldPayment.updated_at,
          },
        });

        // Create TransactionItem (Layer 1)
        const itemDetails = oldPayment.payment_details;
        if (itemDetails && Array.isArray(itemDetails)) {
          for (const item of itemDetails) {
            await prisma.transactionItem.create({
              data: {
                transaction_id: transaction.id,
                product_code: item.id || 'RYLS',
                product_name: item.name || 'RYLS Registration',
                product_category: item.category || 'registration',
                quantity: item.quantity || 1,
                unit_price: item.price || oldPayment.gross_amount_idr,
                total_price: item.price || oldPayment.gross_amount_idr,
                metadata: item,
              },
            });
          }
        } else {
          // Create default item if no payment_details
          await prisma.transactionItem.create({
            data: {
              transaction_id: transaction.id,
              product_code: 'RYLS',
              product_name: 'RYLS Registration',
              product_category: 'registration',
              quantity: 1,
              unit_price: oldPayment.gross_amount_idr,
              total_price: oldPayment.gross_amount_idr,
            },
          });
        }

        // Update RylsPayment (Layer 3) with new columns
        await prisma.rylsPayment.update({
          where: { id: rylsPayment.id },
          data: {
            transaction_id: transaction.id,
            scholarship_type: rylsPayment.type || 'SELF_FUNDED',
            payment_method: oldPayment.payment_type || 'midtrans',
          },
        });

        successCount++;
        console.log(`   ✅ Migrated: ${oldPayment.order_id}`);
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error migrating ${oldPayment.order_id}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total: ${oldPayments.length}`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}\n`);

    if (errorCount > 0) {
      throw new Error(`Migration completed with ${errorCount} errors`);
    }

    console.log('✅ Data migration completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  }
}

/**
 * Map old transaction status to new generic status
 */
function mapTransactionStatus(oldStatus) {
  if (!oldStatus) return 'pending';

  const statusMap = {
    pending: 'pending',
    capture: 'paid',
    settlement: 'paid',
    deny: 'failed',
    cancel: 'cancelled',
    expire: 'expired',
    failure: 'failed',
    refund: 'refunded',
    partial_refund: 'refunded',
    authorize: 'pending',
  };

  return statusMap[oldStatus.toString().toLowerCase()] || 'pending';
}

// Run migration
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
