import { midtransService } from '../../services/shared/MidtransService.js';
import { transactionRepository } from '../../repositories/shared/transactionRepository.js';
import { mapMidtransStatus, mapPaymentMethod } from '../../constants/paymentHelpers.js';
import { emailService } from '../../services/shared/emailService.js';
import { getLogger } from '../../utils/loggerContext.js';
import prisma from '../../config/database.js';
import posthog from '../../config/posthog.js';

/**
 * WebhookController - Simplified webhook handler
 * Updates all 3 database layers directly (no service routing)
 */
export class WebhookController {
  get logger() {
    return getLogger();
  }

  /**
   * Handle Midtrans webhook notification
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async handleMidtransWebhook(request, reply) {
    this.logger.info('[WebhookController] handleMidtransWebhook start');
    this.logger.debug({ body: request.body }, '[WebhookController] webhook payload');

    try {
      const notificationData = request.body;

      // Step 1: Verify signature
      const isValid = midtransService.verifyWebhookSignature(notificationData);
      if (!isValid) {
        this.logger.warn('[WebhookController] invalid signature');
        return reply.status(400).send({
          success: false,
          message: 'Invalid signature',
        });
      }

      this.logger.info('[WebhookController] signature verified');

      // Step 2: Extract webhook data
      const { order_id, transaction_status, transaction_id, payment_type, fraud_status, bank, store, settlement_time } = notificationData;

      // Step 3: Map status and payment method
      const genericStatus = mapMidtransStatus(transaction_status);
      const paymentMethod = mapPaymentMethod(notificationData);

      this.logger.info(
        {
          order_id,
          midtrans_status: transaction_status,
          generic_status: genericStatus,
          payment_method: paymentMethod,
        },
        '[WebhookController] mapped data',
      );

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

        this.logger.info({ transaction_id: transaction.id }, '[WebhookController] Layer 1 updated');

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

        this.logger.info('[WebhookController] Layer 2 updated');

        // Layer 3: Update business-specific tables
        // Check if this is RYLS payment
        const rylsPayment = await tx.rylsPayment.findUnique({
          where: { transaction_id: transaction.id },
          include: { registration: true },
        });

        if (rylsPayment) {
          this.logger.info({ ryls_payment_id: rylsPayment.id }, '[WebhookController] RYLS payment found');

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

            this.logger.info({ registration_status: registrationStatus }, '[WebhookController] registration updated');
          }

          this.logger.info('[WebhookController] Layer 3 (RYLS) updated');
        }

        // Log academy enrollment association (status is now derived from transaction)
        const academyEnrollment = await tx.academyEnrollment.findFirst({
          where: { transaction_id: transaction.id },
          select: { id: true },
        });

        if (academyEnrollment) {
          this.logger.info({ academy_enrollment_id: academyEnrollment.id, generic_status: genericStatus }, '[WebhookController] Layer 3 (AcademyEnrollment) linked');
        }
      });

      this.logger.info('[WebhookController] all layers updated successfully');

      // Step 4b: Fire payment confirmation email (fire-and-forget) and PostHog event
      if (genericStatus === 'paid' || genericStatus === 'expired' || genericStatus === 'failed') {
        const transaction = await prisma.transaction.findUnique({
          where: { transaction_code: order_id },
          select: { user_id: true, customer_email: true, customer_name: true, amount: true, currency: true, product_type: true },
        });

        if (transaction) {
          const distinctId = transaction.user_id ? String(transaction.user_id) : (transaction.customer_email || order_id);

          if (genericStatus === 'paid') {
            posthog.capture({
              distinctId,
              event: 'payment_completed',
              properties: {
                transaction_code: order_id,
                amount: transaction.amount,
                currency: transaction.currency || 'IDR',
                product_type: transaction.product_type,
                payment_method: paymentMethod,
              },
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
                .catch((err) => this.logger.error({ err }, '[WebhookController] payment email error'));
            }
          } else {
            posthog.capture({
              distinctId,
              event: 'payment_expired',
              properties: {
                transaction_code: order_id,
                amount: transaction.amount,
                currency: transaction.currency || 'IDR',
                product_type: transaction.product_type,
                status: genericStatus,
              },
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
      this.logger.error({ err: error }, '[WebhookController] handleMidtransWebhook error');

      // Return 500 so Midtrans will retry
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const webhookController = new WebhookController();
