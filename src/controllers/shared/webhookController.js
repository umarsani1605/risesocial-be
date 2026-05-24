import { midtransService } from '../../services/shared/MidtransService.js';
import { transactionRepository } from '../../repositories/shared/transactionRepository.js';
import {
  mapMidtransStatus,
  mapPaymentMethod,
  isAllowedTransition,
  parseMidtransTimestamp,
} from '../../constants/paymentHelpers.js';
import prisma from '../../config/database.js';
import posthog, { captureEvent } from '../../config/posthog.js';
import { academyEnrollmentRepository } from '../../repositories/cohorts/academyEnrollmentRepository.js';

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
      const { order_id, transaction_status, transaction_id, payment_type, fraud_status, bank, store, settlement_time, status_code } = notificationData;

      // Step 3: Map status and payment method
      // Pass fraud_status so credit-card `capture` doesn't become `paid`
      // while FDS still has it on `challenge`.
      let genericStatus = mapMidtransStatus(transaction_status, fraud_status);
      const paymentMethod = mapPaymentMethod(notificationData);

      // Step 3b: Defensive — per docs, success requires status_code='200' AS WELL AS
      // settlement/capture + fraud=accept. Demote to pending if status_code says
      // otherwise so we don't accidentally mark a non-200 notification as paid.
      if (genericStatus === 'paid' && status_code && String(status_code) !== '200') {
        genericStatus = 'pending';
      }

      // Step 3c: Pre-check existence so unknown order_id returns 200 (stop retries)
      // instead of throwing P2025 → 500 → wasted Midtrans retry budget.
      const existing = await prisma.transaction.findUnique({
        where: { transaction_code: order_id },
        select: { id: true, status: true },
      });
      if (!existing) {
        return reply.status(200).send({
          success: true,
          skipped: true,
          reason: 'unknown_order_id',
          order_id,
        });
      }

      // Step 3d: Out-of-order guard — skip Layer 1 downgrade if existing status
      // already at a higher rank. Layer 2 still updates so raw notification is
      // preserved for audit.
      const allowL1Update = isAllowedTransition(existing.status, genericStatus);

      // Step 4: Update layers in single transaction
      await prisma.$transaction(async (tx) => {
        // Layer 1: Update transactions table (only when transition is forward)
        if (allowL1Update) {
          await tx.transaction.update({
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
        }
        const transaction = existing;


        // Layer 2: Update midtrans_transactions table
        await tx.midtransTransaction.update({
          where: { transaction_id: transaction.id },
          data: {
            midtrans_transaction_id: transaction_id,
            transaction_status: transaction_status,
            fraud_status: fraud_status || null,
            payment_type: payment_type,
            bank: bank || null,
            settlement_time: parseMidtransTimestamp(settlement_time),
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

        // Skip L3 status cascade if L1 was blocked by rank guard — out-of-order
        // pending after settlement must not downgrade the business layer either.
        if (rylsPayment && allowL1Update) {

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

        if (allowL1Update && genericStatus === 'paid') {
          await academyEnrollmentRepository.ensureForPaidTransaction(tx, transaction.id);
        }
      });

      // Step 4b: Fire PostHog event — only when L1 actually transitioned.
      // Skip if out-of-order downgrade was rejected (otherwise we'd emit a
      // spurious payment_failed/payment_completed event with no DB change).
      if (allowL1Update && (genericStatus === 'paid' || genericStatus === 'expired' || genericStatus === 'failed')) {
        const transaction = await prisma.transaction.findUnique({
          where: { transaction_code: order_id },
          select: { user_id: true, customer_email: true, customer_name: true, amount: true, currency: true, product_type: true, metadata: true },
        });

        if (transaction) {
          const metadata = transaction.metadata && typeof transaction.metadata === 'object'
            ? transaction.metadata
            : {};
          const storedDistinctId = typeof metadata.posthog_distinct_id === 'string'
            ? metadata.posthog_distinct_id
            : null;
          const storedSessionId = typeof metadata.posthog_session_id === 'string'
            ? metadata.posthog_session_id
            : null;
          const distinctId = transaction.user_id
            ? String(transaction.user_id)
            : storedDistinctId ?? `anon:${transaction.customer_email || order_id}`;
          const eventPrefix = transaction.product_type === 'academy_enrollment' ? 'academy' : 'ryls';

          if (genericStatus === 'paid') {
            captureEvent(distinctId, `${eventPrefix}.payment_completed`, {
              source: 'backend',
              transaction_code: order_id,
              amount: transaction.amount,
              currency: transaction.currency,
              product_type: transaction.product_type,
              payment_method: paymentMethod,
              user_id: transaction.user_id,
              posthog_distinct_id: storedDistinctId,
              posthog_session_id: storedSessionId,
            }, request);
          } else {
            captureEvent(distinctId, `${eventPrefix}.payment_failed`, {
              source: 'backend',
              transaction_code: order_id,
              amount: transaction.amount,
              currency: transaction.currency,
              product_type: transaction.product_type,
              reason: genericStatus,
              user_id: transaction.user_id,
              posthog_distinct_id: storedDistinctId,
              posthog_session_id: storedSessionId,
            }, request);
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
      // Intentional deviation from the throw-on-500 convention: Midtrans retries
      // on 5xx responses, and expects a specific body shape (not the standard
      // errorResponse() output produced by errorHandler). Capture manually here
      // so the exception still reaches PostHog.
      if (process.env.NODE_ENV === 'production') {
        posthog.captureException(error, undefined, {
          path: '/webhooks/midtrans',
          method: 'POST',
          status_code: 500,
          order_id: request.body?.order_id,
        });
      }

      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const webhookController = new WebhookController();
