import { midtransService } from '../shared/MidtransService.js';
import { academyPaymentRepository } from '../../repositories/user/academyPaymentRepository.js';
import { academyEnrollmentRepository } from '../../repositories/cohorts/academyEnrollmentRepository.js';
import { generateTransactionCode, TRANSACTION_CODE_CONFIG, mapMidtransStatus, mapPaymentMethod, parseMidtransTimestamp } from '../../constants/paymentHelpers.js';
import prisma from '../../config/database.js';
import { captureEvent } from '../../config/posthog.js';

function extractPricingIdFromProductCode(productCode) {
  const m = productCode?.match(/pricing-(\d+)/);
  return m ? Number(m[1]) : null;
}

async function cancelPendingTransaction(transaction) {
  await midtransService.cancelTransaction(transaction.transaction_code).catch(() => {});
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'cancelled', updated_at: new Date() },
  });
}

async function findPendingTransaction(userId, academyId) {
  return prisma.transaction.findFirst({
    where: {
      user_id: userId,
      product_type: 'academy_enrollment',
      status: 'pending',
      items: {
        some: {
          product_code: {
            startsWith: `academy-${academyId}-pricing-`,
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
    include: {
      midtrans_data: { select: { snap_token: true, redirect_url: true } },
      items: { select: { product_code: true } },
    },
  });
}

export class AcademyPaymentService {

  _mergeCustomerDetails(user, formCustomerDetails) {
    const form = formCustomerDetails || {};
    const firstName = form.first_name ?? user.first_name ?? '';
    return {
      first_name: firstName || 'Customer',
      last_name: form.last_name ?? user.last_name ?? '',
      email: form.email ?? user.email,
      phone: form.phone ?? user.phone ?? '',
    };
  }

  _computeBackfillData(user, formCustomerDetails) {
    if (!formCustomerDetails) return null;
    const updateData = {};
    for (const field of ['first_name', 'last_name', 'email', 'phone']) {
      const formValue = formCustomerDetails[field];
      if (formValue && !user[field]) {
        updateData[field] = formValue;
      }
    }
    return Object.keys(updateData).length ? updateData : null;
  }

  _buildPostHogMetadata(posthogContext = {}) {
    return {
      posthog_distinct_id: posthogContext.distinctId ?? null,
      posthog_session_id: posthogContext.sessionId ?? null,
    };
  }

  async createTransaction(userId, academyId, pricingId, formCustomerDetails = null, posthogContext = {}) {

    try {
      // Step 1: Validate academy exists and is active
      const academy = await prisma.academy.findFirst({
        where: { id: academyId, status: 'ACTIVE' },
        include: { pricing: true },
      });
      if (!academy) {
        throw new Error('Academy not found or not active');
      }

      // Step 2: Validate pricing tier exists
      const pricing = academy.pricing.find((p) => p.id === pricingId);
      if (!pricing) {
        throw new Error('Pricing tier not found');
      }

      // Step 3: Fetch user (needed for both existing-enrollment backfill and new transaction)
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      const backfillData = this._computeBackfillData(user, formCustomerDetails);

      // Step 4: Check for existing active enrollment
      const existingEnrollment = await academyEnrollmentRepository.findActiveByUserAcademy(userId, academyId);
      if (existingEnrollment?.transaction?.status === 'paid') {
        throw new Error('You are already enrolled in this academy');
      }

      // Step 5: Check for pending transaction directly because enrollment is now
      // created only after payment succeeds.
      const pendingTransaction = await findPendingTransaction(userId, academyId);
      if (pendingTransaction) {
        const tokenExpired =
          !pendingTransaction.expired_at || pendingTransaction.expired_at < new Date();

        const existingPricingId = extractPricingIdFromProductCode(
          pendingTransaction.items?.[0]?.product_code,
        );
        const tierChanged = existingPricingId !== null && existingPricingId !== pricingId;

        if (!tokenExpired && !tierChanged) {
          if (backfillData) {
            await prisma.user.update({ where: { id: userId }, data: backfillData });
          }
          return {
            enrollment_id: null,
            transaction_code: pendingTransaction.transaction_code,
            amount: pendingTransaction.amount,
            currency: 'IDR',
            token: pendingTransaction.midtrans_data?.snap_token ?? null,
            redirect_url: pendingTransaction.midtrans_data?.redirect_url ?? null,
          };
        }

        await cancelPendingTransaction(pendingTransaction);
      }

      // Step 6: Determine amount
      const amount = pricing.discount_price > 0 ? pricing.discount_price : pricing.original_price;

      // Step 7: Prepare customer details — form values override DB; empty DB fields will be backfilled below
      const customerDetails = this._mergeCustomerDetails(user, formCustomerDetails);
      const customerName = `${customerDetails.first_name} ${customerDetails.last_name}`.trim() || 'Customer';

      // Midtrans enforces a 50-character max on item_details.name
      const itemName = `${academy.title} - ${pricing.name}`.substring(0, 50);

      let transactionCode;
      let snapResult;
      await prisma.$transaction(async (tx) => {
        const sequence = await academyPaymentRepository.getNextSequenceNumber(tx);
        transactionCode = generateTransactionCode(TRANSACTION_CODE_CONFIG.ACADEMY_PREFIX, sequence);

        snapResult = await midtransService.createSnapTransaction({
          orderId: transactionCode,
          grossAmount: amount,
          customerDetails,
          itemDetails: [
            {
              id: `academy-${academy.id}-pricing-${pricing.id}`,
              name: itemName,
              price: amount,
              quantity: 1,
              category: 'academy_course',
            },
          ],
        });

        const newTransaction = await tx.transaction.create({
          data: {
            transaction_code: transactionCode,
            amount,
            currency: 'IDR',
            status: 'pending',
            provider: 'midtrans',
            customer_name: customerName,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone || null,
            user_id: userId,
            product_type: 'academy_enrollment',
            product_type_id: 0,
            metadata: this._buildPostHogMetadata(posthogContext),
            expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });

        await tx.transactionItem.create({
          data: {
            transaction_id: newTransaction.id,
            product_code: `academy-${academy.id}-pricing-${pricing.id}`,
            product_name: itemName,
            product_category: 'academy_enrollment',
            quantity: 1,
            unit_price: amount,
            total_price: amount,
          },
        });

        await tx.midtransTransaction.create({
          data: {
            transaction_id: newTransaction.id,
            snap_token: snapResult.token,
            redirect_url: snapResult.redirectUrl,
            midtrans_order_id: transactionCode,
            create_response: snapResult,
          },
        });

        if (backfillData) {
          await tx.user.update({ where: { id: userId }, data: backfillData });
        }
      });

      return {
        enrollment_id: null,
        transaction_code: transactionCode,
        amount,
        currency: 'IDR',
        token: snapResult.token,
        redirect_url: snapResult.redirectUrl,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPaymentStatus(enrollmentId, userId) {

    try {
      const enrollment = await academyPaymentRepository.findEnrollmentWithTransaction(enrollmentId, userId);

      if (!enrollment) {
        return { hasPayment: false, status: null };
      }

      return {
        hasPayment: !!enrollment.transaction,
        status: enrollment.transaction?.status || null,
        transaction_code: enrollment.transaction?.transaction_code || null,
        amount: enrollment.transaction?.amount || null,
        currency: enrollment.transaction?.currency || 'IDR',
        payment_method: enrollment.transaction?.payment_method || null,
        paid_at: enrollment.transaction?.paid_at || null,
        created_at: enrollment.created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  async syncTransactionStatus(transactionCode, userId) {

    try {
      const transaction = await prisma.transaction.findFirst({
        where: { transaction_code: transactionCode, user_id: userId },
      });
      if (!transaction) throw new Error('Transaction not found');

      const midtransData = await midtransService.getTransactionStatus(transactionCode);

      const genericStatus = mapMidtransStatus(
        midtransData.transaction_status,
        midtransData.fraud_status,
      );
      const paymentMethod = mapPaymentMethod(midtransData);

      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: genericStatus,
            provider_reference: midtransData.transaction_id,
            payment_method: paymentMethod,
            paid_at: genericStatus === 'paid' ? new Date() : undefined,
            updated_at: new Date(),
          },
        });

        await tx.midtransTransaction.update({
          where: { transaction_id: transaction.id },
          data: {
            midtrans_transaction_id: midtransData.transaction_id,
            transaction_status: midtransData.transaction_status,
            fraud_status: midtransData.fraud_status || null,
            payment_type: midtransData.payment_type,
            bank: midtransData.bank || null,
            settlement_time: parseMidtransTimestamp(midtransData.settlement_time),
            last_notification: midtransData,
            notified_at: new Date(),
            updated_at: new Date(),
          },
        });

        if (genericStatus === 'paid') {
          await academyEnrollmentRepository.ensureForPaidTransaction(tx, transaction.id);
        }

      });

      return { status: genericStatus, payment_method: paymentMethod };
    } catch (error) {
      throw error;
    }
  }

  async checkEnrollment(userId, academyId) {

    try {
      const enrollment = await academyEnrollmentRepository.findActiveByUserAcademy(userId, academyId);
      const pendingTransaction = await findPendingTransaction(userId, academyId);

      if (!enrollment && !pendingTransaction) {
        return { enrolled: false };
      }

      const txStatus = enrollment?.transaction?.status ?? pendingTransaction?.status ?? null;
      const isPaid = txStatus === 'paid';
      const isPending = txStatus === 'pending';
      const enrollmentStatus = enrollment?.completed_at ? 'completed' : isPaid ? 'active' : 'pending';
      const tokenExpired =
        !(pendingTransaction?.expired_at) || pendingTransaction.expired_at < new Date();

      const pendingPricingId = isPending
        ? extractPricingIdFromProductCode(pendingTransaction?.items?.[0]?.product_code)
        : null;

      return {
        enrolled: isPaid,
        hasPendingPayment: isPending,
        pending_pricing_id: pendingPricingId,
        enrollment_id: enrollment?.id,
        status: enrollmentStatus,
        payment_status: txStatus,
        snap_token: isPending && !tokenExpired ? pendingTransaction?.midtrans_data?.snap_token ?? null : null,
        transaction_code: isPending && !tokenExpired ? pendingTransaction?.transaction_code ?? null : null,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const academyPaymentService = new AcademyPaymentService();
