import { midtransService } from '../../services/shared/MidtransService.js';
import { transactionRepository } from '../../repositories/shared/transactionRepository.js';
import { mapMidtransStatus, mapPaymentMethod } from '../../constants/paymentHelpers.js';
import { emailService } from '../../services/shared/emailService.js';
import prisma from '../../config/database.js';
import { captureEvent } from '../../config/posthog.js';

/**
 * WebhookController - Simplified webhook handler
 * Updates all 3 database layers directly (no service routing)
 */
export class WebhookController {

  /**
   * Handle Midtrans webhook notification
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async handleMidtransWebhook(request, reply) {

    try {
      const notificationData = request.body;

      // Step 1: Verify signature
      const isValid = midtransService.verifyWebhookSignature(notificationData);
      if (!isValid) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid signature',
        });
      }


      // Step 2: Extract webhook data
      const { order_id, transaction_status, transaction_id, payment_type, fraud_status, bank, store, settlement_time } = notificationData;

      // Step 3: Map status and payment method
      const genericStatus = mapMidtransStatus(transaction_status);
      const paymentMethod = mapPaymentMethod(notificationData);


      // Step 4: Update all 3 layers in single transaction
      await prisma.$transaction(async (tx) => {
        // Layer 1: Update transactions table
        const transaction = await tx.transaction.update({
          where: { transaction_code: order_id },
          data: {
            status: genericStatus,
            provider_reference: transaction_id,
            payment_method: paymentMethod,
            paid_at: genericStatus === 'paid' ? new Date() : undefined,
            expired_at: genericStatus === 'expired' ? new Date() : undefined,
            updated_at: new Date(),
          },
        });


        // Layer 2: Update midtrans_transactions table
        await tx.midtransTransaction.update({
          where: { transaction_id: transaction.id },
          data: {
            midtrans_transaction_id: transaction_id,
            transaction_status: transaction_status,
            fraud_status: fraud_status || null,
            payment_type: payment_type,
            bank: bank || null,
            settlement_time: settlement_time ? new Date(settlement_time) : null,
            last_notification: notificationData,
            notified_at: new Date(),
            updated_at: new Date(),
          },
        });


        // Layer 3: Update business-specific tables
        // Check if this is RYLS payment
        const rylsPayment = await tx.rylsPayment.findUnique({
          where: { transaction_id: transaction.id },
          include: { registration: true },
        });

        if (rylsPayment) {

          // Update RYLS payment status
          await tx.rylsPayment.update({
            where: { id: rylsPayment.id },
            data: {
              status: genericStatus,
              updated_at: new Date(),
            },
          });

          // Update registration payment_status if needed
          if (rylsPayment.registration) {
            const registrationStatus = genericStatus === 'paid' ? 'PAID' : 'PENDING';
            await tx.rylsRegistration.update({
              where: { id: rylsPayment.registration_id },
              data: {
                // Assuming there's a payment_status field
                // If not, this can be removed or adjusted
                updated_at: new Date(),
              },
            });

          }

        }

        // Log academy enrollment association (status is now derived from transaction)
        const academyEnrollment = await tx.academyEnrollment.findFirst({
          where: { transaction_id: transaction.id },
          select: { id: true },
        });

        if (academyEnrollment) {
        }
      });


      // Step 4b: Fire payment confirmation email (fire-and-forget) and PostHog event
      if (genericStatus === 'paid' || genericStatus === 'expired' || genericStatus === 'failed') {
        const transaction = await prisma.transaction.findUnique({
          where: { transaction_code: order_id },
          select: { user_id: true, customer_email: true, customer_name: true, amount: true, currency: true, product_type: true },
        });

        if (transaction) {
          const distinctId = transaction.user_id ?? `anon:${transaction.customer_email || order_id}`;

          if (genericStatus === 'paid') {
            captureEvent(distinctId, 'payment.completed', {
              transaction_code: order_id,
              amount: transaction.amount,
              product_type: transaction.product_type,
              payment_method: paymentMethod,
              user_id: transaction.user_id,
            });

            if (transaction.customer_email) {
              emailService
                .sendPaymentConfirmation({
                  to: transaction.customer_email,
                  name: transaction.customer_name,
                  transactionCode: order_id,
                  amount: transaction.amount,
                  currency: transaction.currency || 'IDR',
                })
                .catch(() => {});
            }
          } else {
            captureEvent(distinctId, 'payment.failed', {
              transaction_code: order_id,
              amount: transaction.amount,
              product_type: transaction.product_type,
              reason: genericStatus,
              user_id: transaction.user_id,
            });
          }
        }
      }

      // Step 5: Return success
      return reply.status(200).send({
        success: true,
        order_id: order_id,
        status: transaction_status,
      });
    } catch (error) {

      // Return 500 so Midtrans will retry
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const webhookController = new WebhookController();
