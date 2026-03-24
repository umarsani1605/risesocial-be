import { midtransService } from '../shared/MidtransService.js';
import { userCohortRepository } from '../../repositories/user/cohortRepository.js';
import { academyPaymentRepository } from '../../repositories/user/academyPaymentRepository.js';
import { generateTransactionCode, TRANSACTION_CODE_CONFIG, mapMidtransStatus, mapPaymentMethod } from '../../constants/paymentHelpers.js';
import { getLogger } from '../../utils/loggerContext.js';
import prisma from '../../config/database.js';

export class AcademyPaymentService {
  get logger() {
    return getLogger();
  }

  async createTransaction(userId, academyId, pricingId) {
    this.logger.info({ userId, academyId, pricingId }, '[AcademyPaymentService] createTransaction start');

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

      // Step 3: Find active cohort
      const cohort = await academyPaymentRepository.findActiveCohortByAcademyId(academyId);
      if (!cohort) {
        throw new Error('No active cohort available for this academy');
      }

      // Step 4: Check duplicate enrollment
      const existingEnrollment = await academyPaymentRepository.findExistingEnrollment(userId, academyId);
      if (existingEnrollment) {
        if (['active', 'completed'].includes(existingEnrollment.status)) {
          throw new Error('You are already enrolled in this academy');
        }

        // status === 'pending': check if snap token is still valid
        const tokenExpired = !existingEnrollment.transaction?.expired_at
          || existingEnrollment.transaction.expired_at < new Date();

        if (!tokenExpired) {
          // Return existing snap token — no new transaction needed
          this.logger.info('[AcademyPaymentService] returning existing snap token for pending enrollment');
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
        this.logger.info('[AcademyPaymentService] pending enrollment token expired, resetting');
        await midtransService.cancelTransaction(existingEnrollment.transaction.transaction_code).catch(() => {});
        await prisma.transaction.update({
          where: { id: existingEnrollment.transaction.id },
          data: { status: 'cancelled', updated_at: new Date() },
        });
        // Fall through to create a new transaction and reset the enrollment below
      }

      // Step 5: Get user data for customer details
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Step 6: Generate transaction code
      const sequence = await academyPaymentRepository.getNextSequenceNumber();
      const transactionCode = generateTransactionCode(TRANSACTION_CODE_CONFIG.ACADEMY_PREFIX, sequence);
      this.logger.info({ transactionCode }, '[AcademyPaymentService] transaction code generated');

      // Step 7: Determine amount (use discount_price if available, otherwise original_price)
      const amount = pricing.discount_price > 0 ? pricing.discount_price : pricing.original_price;

      // Step 8: Prepare customer details
      const customerName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer';
      const customerDetails = {
        first_name: user.first_name || 'Customer',
        last_name: user.last_name || '',
        email: user.email,
        phone: user.phone || '',
      };

      // Midtrans enforces a 50-character max on item_details.name
      const itemName = `${academy.title} - ${pricing.name}`.substring(0, 50)

      // Step 9: Create Snap transaction
      const snapResult = await midtransService.createSnapTransaction({
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

      this.logger.info('[AcademyPaymentService] Snap transaction created');

      let enrollmentId;

      if (existingEnrollment) {
        // Reset expired pending enrollment with new transaction
        await prisma.$transaction(async (tx) => {
          const newTransaction = await tx.transaction.create({
            data: {
              transaction_code: transactionCode,
              amount,
              currency: 'IDR',
              status: 'pending',
              provider: 'midtrans',
              customer_name: customerName,
              customer_email: user.email,
              customer_phone: user.phone || null,
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

          await tx.cohortEnrollment.update({
            where: { id: existingEnrollment.id },
            data: { transaction_id: newTransaction.id, status: 'pending', updated_at: new Date() },
          });
        });

        enrollmentId = existingEnrollment.id;
        this.logger.info('[AcademyPaymentService] expired enrollment reset with new transaction');
      } else {
        // Step 10: Save 3 layers using existing repository method
        const result = await userCohortRepository.createEnrollmentWithPayment(
          cohort.id,
          academyId,
          userId,
          {
            transactionCode,
            amount,
            customerName,
            customerEmail: user.email,
            customerPhone: user.phone || null,
            snapToken: snapResult.token,
            redirectUrl: snapResult.redirectUrl,
            snapResponse: snapResult,
            itemProductCode: `academy-${academy.id}-pricing-${pricing.id}`,
            itemProductName: itemName,
          },
        );
        enrollmentId = result.enrollment.id;
        this.logger.info('[AcademyPaymentService] all 3 layers saved');
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
      this.logger.error({ err: error }, '[AcademyPaymentService] createTransaction error');
      throw error;
    }
  }

  async getPaymentStatus(enrollmentId, userId) {
    this.logger.info({ enrollmentId, userId }, '[AcademyPaymentService] getPaymentStatus');

    try {
      const enrollment = await academyPaymentRepository.findEnrollmentWithTransaction(enrollmentId, userId);

      if (!enrollment) {
        return { hasPayment: false, status: null };
      }

      return {
        hasPayment: !!enrollment.transaction,
        status: enrollment.transaction?.status || enrollment.status,
        transaction_code: enrollment.transaction?.transaction_code || null,
        amount: enrollment.transaction?.amount || null,
        currency: enrollment.transaction?.currency || 'IDR',
        payment_method: enrollment.transaction?.payment_method || null,
        paid_at: enrollment.transaction?.paid_at || null,
        created_at: enrollment.created_at,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyPaymentService] getPaymentStatus error');
      throw error;
    }
  }

  async syncTransactionStatus(transactionCode, userId) {
    this.logger.info({ transactionCode, userId }, '[AcademyPaymentService] syncTransactionStatus start');

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

        const enrollment = await tx.cohortEnrollment.findFirst({
          where: { transaction_id: transaction.id },
        });
        if (enrollment) {
          const enrollmentStatus =
            genericStatus === 'paid' ? 'active'
            : genericStatus === 'failed' || genericStatus === 'expired' ? 'dropped'
            : enrollment.status;
          await tx.cohortEnrollment.update({
            where: { id: enrollment.id },
            data: {
              status: enrollmentStatus,
              ...(genericStatus === 'paid' ? { enrolled_at: new Date() } : {}),
              updated_at: new Date(),
            },
          });
        }
      });

      this.logger.info({ genericStatus }, '[AcademyPaymentService] syncTransactionStatus success');
      return { status: genericStatus, payment_method: paymentMethod };
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyPaymentService] syncTransactionStatus error');
      throw error;
    }
  }

  async checkEnrollment(userId, academyId) {
    this.logger.info({ userId, academyId }, '[AcademyPaymentService] checkEnrollment');

    try {
      const enrollment = await academyPaymentRepository.findExistingEnrollment(userId, academyId);

      if (!enrollment) {
        return { enrolled: false };
      }

      const isActiveOrCompleted = ['active', 'completed'].includes(enrollment.status);
      const isPending = enrollment.status === 'pending';
      const tokenExpired = !enrollment.transaction?.expired_at || enrollment.transaction.expired_at < new Date();

      return {
        enrolled: isActiveOrCompleted,
        hasPendingPayment: isPending,
        enrollment_id: enrollment.id,
        status: enrollment.status,
        payment_status: enrollment.transaction?.status || null,
        snap_token: (isPending && !tokenExpired) ? enrollment.transaction?.midtrans_data?.snap_token : null,
        transaction_code: (isPending && !tokenExpired) ? enrollment.transaction?.transaction_code : null,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[AcademyPaymentService] checkEnrollment error');
      throw error;
    }
  }
}

export const academyPaymentService = new AcademyPaymentService();
