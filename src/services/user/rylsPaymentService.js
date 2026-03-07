import { midtransService } from '../shared/MidtransService.js';
import { transactionRepository } from '../../repositories/shared/transactionRepository.js';
import { midtransTransactionRepository } from '../../repositories/shared/midtransTransactionRepository.js';
import { transactionItemRepository } from '../../repositories/shared/transactionItemRepository.js';
import { rylsPaymentRepository } from '../../repositories/user/rylsPaymentRepository.js';
import { rylsRegistrationRepository } from '../../repositories/user/rylsRegistrationRepository.js';
import { generateTransactionCode, TRANSACTION_CODE_CONFIG, PAYMENT_PROVIDER, PRODUCT_TYPE, PAYMENT_STATUS } from '../../constants/paymentHelpers.js';
import { getPaymentAmountIdr, getItemTemplate } from '../../constants/payments.js';
import { getLogger } from '../../utils/loggerContext.js';
import prisma from '../../config/database.js';

/**
 * RylsPaymentService - RYLS business logic with 3-layer architecture
 * Orchestrates generic services and repositories
 */
export class RylsPaymentService {
  get logger() {
    return getLogger();
  }

  /**
   * Create RYLS payment transaction (Midtrans or PayPal)
   * @param {Object} data - Payment data
   * @param {string} data.type - MIDTRANS or PAYPAL
   * @param {Object} data.data - Registration data
   * @returns {Promise<Object>}
   */
  async createTransaction(data) {
    this.logger.info('[RylsPaymentService] createTransaction start');
    this.logger.debug({ type: data.type }, '[RylsPaymentService] payment type');

    try {
      const { type, data: registrationData } = data;

      if (type === 'MIDTRANS') {
        return await this.createMidtransTransaction(registrationData);
      } else if (type === 'PAYPAL') {
        return await this.createPayPalTransaction(registrationData);
      } else {
        throw new Error(`Invalid payment type: ${type}`);
      }
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentService] createTransaction error');
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Create Midtrans payment transaction (3-layer)
   * @private
   */
  async createMidtransTransaction(registrationData) {
    this.logger.info('[RylsPaymentService] createMidtransTransaction start');

    try {
      // Step 1: Generate transaction code
      const sequence = await rylsPaymentRepository.getNextSequenceNumber();
      const transactionCode = generateTransactionCode(TRANSACTION_CODE_CONFIG.RYLS_PREFIX, sequence);

      this.logger.info({ transactionCode }, '[RylsPaymentService] transaction code generated');

      // Step 2: Get amount and item details
      const amountIdr = await getPaymentAmountIdr(registrationData.scholarshipType);
      const itemTemplate = getItemTemplate(registrationData.scholarshipType);

      this.logger.debug({ amountIdr, itemTemplate }, '[RylsPaymentService] payment details');

      // Step 3: Prepare customer details for Midtrans
      const customerDetails = {
        first_name: registrationData.fullName?.split(' ')[0] || 'Customer',
        last_name: registrationData.fullName?.split(' ').slice(1).join(' ') || '',
        email: registrationData.email,
        phone: registrationData.whatsapp || '',
        billing_address: {
          first_name: registrationData.fullName?.split(' ')[0] || 'Customer',
          last_name: registrationData.fullName?.split(' ').slice(1).join(' ') || '',
          email: registrationData.email,
          phone: registrationData.whatsapp || '',
          address: registrationData.residence || '',
          city: registrationData.residence || '',
          postal_code: '',
          country_code: 'IDN',
        },
      };

      // Step 4: Create Snap transaction via MidtransService
      const snapResult = await midtransService.createSnapTransaction({
        orderId: transactionCode,
        grossAmount: amountIdr,
        customerDetails,
        itemDetails: [
          {
            id: itemTemplate.id,
            name: itemTemplate.name,
            price: amountIdr,
            quantity: 1,
            category: itemTemplate.category,
          },
        ],
      });

      this.logger.info('[RylsPaymentService] Snap transaction created');

      // Step 5: Save to database (3 layers in transaction)
      const result = await prisma.$transaction(async (tx) => {
        // Layer 1: Create transaction
        const transaction = await tx.transaction.create({
          data: {
            transaction_code: transactionCode,
            amount: amountIdr,
            currency: 'IDR',
            status: PAYMENT_STATUS.PENDING,
            provider: PAYMENT_PROVIDER.MIDTRANS,
            payment_token: snapResult.token,
            payment_url: snapResult.redirectUrl,
            customer_name: registrationData.fullName,
            customer_email: registrationData.email,
            customer_phone: registrationData.whatsapp,
            customer_address: registrationData.residence,
            product_type: PRODUCT_TYPE.RYLS_SCHOLARSHIP,
            product_type_id: registrationData.registrationId || 0,
          },
        });

        // Layer 1b: Create transaction items
        await tx.transactionItem.create({
          data: {
            transaction_id: transaction.id,
            product_code: itemTemplate.id,
            product_name: itemTemplate.name,
            product_category: itemTemplate.category,
            quantity: 1,
            unit_price: amountIdr,
            total_price: amountIdr,
          },
        });

        // Layer 2: Create Midtrans transaction
        await tx.midtransTransaction.create({
          data: {
            transaction_id: transaction.id,
            snap_token: snapResult.token,
            redirect_url: snapResult.redirectUrl,
            midtrans_order_id: transactionCode,
            create_response: snapResult,
          },
        });

        // Layer 3: Create RYLS payment
        const rylsPayment = await tx.rylsPayment.create({
          data: {
            transaction_id: transaction.id,
            registration_id: registrationData.registrationId,
            scholarship_type: registrationData.scholarshipType,
            payment_method: 'midtrans',
            status: PAYMENT_STATUS.PENDING,
          },
        });

        return { transaction, rylsPayment };
      });

      this.logger.info('[RylsPaymentService] all 3 layers saved');

      return {
        payment_id: result.rylsPayment.id,
        transaction_code: transactionCode,
        amount: amountIdr,
        currency: 'IDR',
        token: snapResult.token,
        redirect_url: snapResult.redirectUrl,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentService] createMidtransTransaction error');
      throw error;
    }
  }

  /**
   * Create PayPal manual payment transaction
   * @private
   */
  async createPayPalTransaction(registrationData) {
    this.logger.info('[RylsPaymentService] createPayPalTransaction start');

    try {
      const sequence = await rylsPaymentRepository.getNextSequenceNumber();
      const transactionCode = generateTransactionCode(TRANSACTION_CODE_CONFIG.RYLS_PREFIX, sequence);
      const amountIdr = await getPaymentAmountIdr(registrationData.scholarshipType);
      const itemTemplate = getItemTemplate(registrationData.scholarshipType);

      const result = await prisma.$transaction(async (tx) => {
        // Layer 1: Create transaction
        const transaction = await tx.transaction.create({
          data: {
            transaction_code: transactionCode,
            amount: amountIdr,
            currency: 'IDR',
            status: PAYMENT_STATUS.PAID,
            provider: PAYMENT_PROVIDER.PAYPAL_MANUAL,
            customer_name: registrationData.fullName,
            customer_email: registrationData.email,
            customer_phone: registrationData.whatsapp,
            product_type: PRODUCT_TYPE.RYLS_SCHOLARSHIP,
            product_type_id: registrationData.registrationId || 0,
            paid_at: new Date(),
          },
        });

        // Layer 1b: Create transaction items
        await tx.transactionItem.create({
          data: {
            transaction_id: transaction.id,
            product_code: itemTemplate.id,
            product_name: itemTemplate.name,
            product_category: itemTemplate.category,
            quantity: 1,
            unit_price: amountIdr,
            total_price: amountIdr,
          },
        });

        // Layer 3: Create RYLS payment
        const rylsPayment = await tx.rylsPayment.create({
          data: {
            transaction_id: transaction.id,
            registration_id: registrationData.registrationId,
            scholarship_type: registrationData.scholarshipType,
            payment_method: 'paypal',
            payment_proof_id: registrationData.paymentProof,
            status: PAYMENT_STATUS.PAID,
          },
        });

        return { transaction, rylsPayment };
      });

      this.logger.info('[RylsPaymentService] PayPal payment created');

      return {
        payment_id: result.rylsPayment.id,
        transaction_code: transactionCode,
        amount: amountIdr,
        currency: 'IDR',
        token: null,
        redirect_url: null,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentService] createPayPalTransaction error');
      throw error;
    }
  }

  /**
   * Get payment status by registration ID
   * @param {number} registrationId - Registration ID
   * @returns {Promise<Object>}
   */
  async getPaymentStatus(registrationId) {
    this.logger.info({ registrationId }, '[RylsPaymentService] getPaymentStatus');

    try {
      const payments = await rylsPaymentRepository.findByRegistrationId(registrationId);

      if (payments.length === 0) {
        return {
          hasPayment: false,
          status: null,
          transactionCode: null,
          amount: null,
        };
      }

      const latestPayment = payments[0];

      return {
        hasPayment: true,
        status: latestPayment.transaction.status,
        transactionCode: latestPayment.transaction.transaction_code,
        amount: latestPayment.transaction.amount,
        currency: latestPayment.transaction.currency,
        paymentMethod: latestPayment.transaction.payment_method,
        paidAt: latestPayment.transaction.paid_at,
        createdAt: latestPayment.transaction.created_at,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[RylsPaymentService] getPaymentStatus error');
      throw error;
    }
  }
}

export const rylsPaymentService = new RylsPaymentService();
