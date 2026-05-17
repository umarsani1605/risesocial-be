import { midtransService } from '../shared/MidtransService.js';
import { academyPaymentRepository } from '../../repositories/user/academyPaymentRepository.js';
import { academyEnrollmentRepository } from '../../repositories/cohorts/academyEnrollmentRepository.js';
import { generateTransactionCode, TRANSACTION_CODE_CONFIG, mapMidtransStatus, mapPaymentMethod } from '../../constants/paymentHelpers.js';
import prisma from '../../config/database.js';
import { captureEvent } from '../../config/posthog.js';

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

  async createTransaction(userId, academyId, pricingId, formCustomerDetails = null) {

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

      // Step 4: Check for existing pending or active enrollment
      const existingEnrollment = await academyEnrollmentRepository.findActiveByUserAcademy(userId, academyId);
      if (existingEnrollment) {
        if (existingEnrollment.transaction?.status === 'paid') {
          throw new Error('You are already enrolled in this academy');
        }

        // transaction pending: check if snap token is still valid
        const tokenExpired =
          !existingEnrollment.transaction?.expired_at || existingEnrollment.transaction.expired_at < new Date();

        if (!tokenExpired) {
          // Reuse existing snap token. Backfill empty user fields if form provided values.
          if (backfillData) {
            await prisma.user.update({ where: { id: userId }, data: backfillData });
          }
          return {
            enrollment_id: existingEnrollment.id,
            transaction_code: existingEnrollment.transaction.transaction_code,
            amount: existingEnrollment.transaction.amount,
            currency: 'IDR',
            token: existingEnrollment.transaction.midtrans_data.snap_token,
            redirect_url: existingEnrollment.transaction.midtrans_data.redirect_url,
          };
        }

        // Token expired → cancel old transaction on Midtrans (fire and forget)
        await midtransService.cancelTransaction(existingEnrollment.transaction.transaction_code).catch(() => {});
        await prisma.transaction.update({
          where: { id: existingEnrollment.transaction.id },
          data: { status: 'cancelled', updated_at: new Date() },
        });
        // Fall through to create a new transaction and reset the enrollment below
      }

      // Step 5: Determine amount
      const amount = pricing.discount_price > 0 ? pricing.discount_price : pricing.original_price;

      // Step 6: Prepare customer details — form values override DB; empty DB fields will be backfilled below
      const customerDetails = this._mergeCustomerDetails(user, formCustomerDetails);
      const customerName = `${customerDetails.first_name} ${customerDetails.last_name}`.trim() || 'Customer';

      // Midtrans enforces a 50-character max on item_details.name
      const itemName = `${academy.title} - ${pricing.name}`.substring(0, 50);

      let enrollmentId;
      let transactionCode;
      let snapResult;

      if (existingEnrollment) {
        // Reset expired pending enrollment with new transaction
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
              product_type_id: existingEnrollment.id,
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

          await tx.academyEnrollment.update({
            where: { id: existingEnrollment.id },
            data: { transaction_id: newTransaction.id, updated_at: new Date() },
          });

          if (backfillData) {
            await tx.user.update({ where: { id: userId }, data: backfillData });
          }
        });

        enrollmentId = existingEnrollment.id;
      } else {
        // Create new enrollment with 3-layer payment
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


          // Layer 1: Transaction — product_type_id is a placeholder (0) updated below
          // after the enrollment is created (circular dependency: tx needs enrollment id)
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

          // Layer 2: Midtrans transaction
          await tx.midtransTransaction.create({
            data: {
              transaction_id: newTransaction.id,
              snap_token: snapResult.token,
              redirect_url: snapResult.redirectUrl,
              midtrans_order_id: transactionCode,
              create_response: snapResult,
            },
          });

          // Layer 3: Academy enrollment
          const enrollment = await tx.academyEnrollment.create({
            data: {
              user_id: userId,
              academy_id: academyId,
              transaction_id: newTransaction.id,
            },
          });

          enrollmentId = enrollment.id;

          // Update product_type_id with actual enrollment id
          await tx.transaction.update({
            where: { id: newTransaction.id },
            data: { product_type_id: enrollment.id },
          });

          if (backfillData) {
            await tx.user.update({ where: { id: userId }, data: backfillData });
          }
        });

        captureEvent(userId, 'enrollment.created', {
          enrollment_id: enrollmentId,
          academy_id: academyId,
          user_id: userId,
        });
      }

      return {
        enrollment_id: enrollmentId,
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

      const genericStatus = mapMidtransStatus(midtransData.transaction_status);
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
            settlement_time: midtransData.settlement_time ? new Date(midtransData.settlement_time) : null,
            last_notification: midtransData,
            notified_at: new Date(),
            updated_at: new Date(),
          },
        });

      });

      return { status: genericStatus, payment_method: paymentMethod };
    } catch (error) {
      throw error;
    }
  }

  async checkEnrollment(userId, academyId) {

    try {
      const enrollment = await academyEnrollmentRepository.findActiveByUserAcademy(userId, academyId);

      if (!enrollment) {
        return { enrolled: false };
      }

      const txStatus = enrollment.transaction?.status ?? null;
      const isPaid = txStatus === 'paid';
      const isPending = txStatus === 'pending';
      const enrollmentStatus = enrollment.completed_at ? 'completed' : isPaid ? 'active' : 'pending';
      const tokenExpired =
        !enrollment.transaction?.expired_at || enrollment.transaction.expired_at < new Date();

      return {
        enrolled: isPaid,
        hasPendingPayment: isPending,
        enrollment_id: enrollment.id,
        status: enrollmentStatus,
        payment_status: txStatus,
        snap_token: isPending && !tokenExpired ? enrollment.transaction?.midtrans_data?.snap_token : null,
        transaction_code: isPending && !tokenExpired ? enrollment.transaction?.transaction_code : null,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const academyPaymentService = new AcademyPaymentService();
