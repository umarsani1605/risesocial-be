import crypto from 'crypto';
import { snap, getServerKey } from '../integrations/midtransClient.js';
import { rylsPaymentRepository } from '../repositories/rylsPaymentRepository.js';
import { rylsRegistrationRepository } from '../repositories/rylsRegistrationRepository.js';
import {
  generateOrderId,
  getPaymentAmountIdr,
  getItemTemplate,
  mapTransactionStatus,
  mapFraudStatus,
  WEBHOOK_CONFIG,
} from '../constants/payments.js';
import { getLogger } from '../lib/loggerContext.js';

export class RylsPaymentService {
  constructor() {
    this.paymentRepository = rylsPaymentRepository;
    this.registrationRepository = rylsRegistrationRepository;
  }

  get logger() {
    return getLogger();
  }

  async createTransaction(data) {
    this.logger.info('[rylsPaymentService] createTransaction start');

    const type = data.type;
    const registrationData = data.data;

    this.logger.debug({ type, registrationData }, '[rylsPaymentService] rawInput');

    try {
      const sequenceNumber = await this.paymentRepository.getNextSequenceNumber();
      const orderId = generateOrderId(sequenceNumber);
      const amountIdr = await getPaymentAmountIdr(registrationData.scholarshipType);
      const itemTemplate = getItemTemplate(registrationData.scholarshipType);

      this.logger.info({ orderId, amountIdr }, '[rylsPaymentService] order prepared');

      let rylsPayment;
      let snapTransaction;
      const serverKey = getServerKey();

      if (type == 'MIDTRANS') {
        const transactionParams = {
          transaction_details: {
            order_id: orderId,
            gross_amount: amountIdr,
          },
          customer_details: {
            first_name: registrationData.fullName?.split(' ')[0] || 'Customer',
            last_name: registrationData.fullName?.split(' ').slice(1).join(' ') || '',
            email: registrationData.email,
            phone: registrationData.whatsapp || '',
            billing_address: {
              first_name: registrationData.fullName?.split(' ')[0] || 'Customer',
              last_name: registrationData.fullName?.split(' ').slice(1).join(' ') || '',
              email: registrationData.email,
              phone: registrationData.whatsapp || '',
              address: registrationData.residence,
            },
          },
          item_details: [
            {
              id: itemTemplate.id,
              price: amountIdr,
              quantity: 1,
              name: itemTemplate.name,
              category: itemTemplate.category,
            },
          ],
          credit_card: { secure: true },
        };

        this.logger.debug({ transactionParams }, '[rylsPaymentService] midtrans params');

        snapTransaction = await snap.createTransaction(transactionParams);

        this.logger.info('[rylsPaymentService] midtrans transaction created');
        this.logger.debug({ snapTransaction }, '[rylsPaymentService] midtrans response');

        const midtransPaymentData = {
          order_id: orderId,
          snap_token: snapTransaction.token,
          redirect_url: snapTransaction.redirect_url,
          gross_amount_idr: amountIdr,
          currency: 'IDR',
          transaction_status: 'pending',
        };

        const savedMidtransPayment = await this.paymentRepository.createMidtransPayment(midtransPaymentData);
        this.logger.debug({ savedMidtransPaymentId: savedMidtransPayment.id }, '[rylsPaymentService] midtrans saved');

        const rylsPaymentData = {
          type: 'MIDTRANS',
          status: 'PENDING',
          amount: amountIdr,
          midtrans_id: savedMidtransPayment.id,
        };

        rylsPayment = await this.paymentRepository.createRylsPayment(rylsPaymentData);
        this.logger.debug({ rylsPaymentId: rylsPayment.id }, '[rylsPaymentService] ryls payment saved');
      }

      if (type == 'PAYPAL') {
        const rylsPaymentData = {
          type: 'PAYPAL',
          status: 'PAID',
          amount: amountIdr,
          payment_proof_id: registrationData.paymentProof,
          paid_at: new Date(),
        };

        rylsPayment = await this.paymentRepository.createRylsPayment(rylsPaymentData);
        this.logger.debug({ rylsPaymentId: rylsPayment.id }, '[rylsPaymentService] ryls payment saved');
      }

      this.logger.info('[rylsPaymentService] createTransaction success');
      return {
        payment_id: rylsPayment.id,
        order_id: orderId,
        amount: amountIdr,
        currency: 'IDR',
        token: snapTransaction?.token || null,
        redirect_url: snapTransaction?.redirect_url || null,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentService] createTransaction error');
      throw new Error(`Failed to create payment transaction: ${error.message}`);
    }
  }

  async handleWebhookNotification(notificationData) {
    this.logger.info('[rylsPaymentService] handleWebhookNotification start');
    this.logger.debug({ notificationData }, '[rylsPaymentService] webhook payload');

    try {
      const { order_id, transaction_status, fraud_status, transaction_id, payment_type } = notificationData;

      const isValidSignature = this.verifyNotificationSignature(notificationData);
      if (!isValidSignature) {
        throw new Error('Invalid notification signature');
      }

      this.logger.info('[rylsPaymentService] signature verified');

      const payment = await this.paymentRepository.findByOrderId(order_id);
      if (!payment) {
        throw new Error(`Payment not found for order_id: ${order_id}`);
      }

      this.logger.debug(
        { paymentId: payment.id, current: payment.transaction_status, next: transaction_status },
        '[rylsPaymentService] status update'
      );

      const updateData = {
        transaction_status,
        transaction_id,
        payment_type,
        fraud_status: fraud_status || null,
        last_notification: notificationData,
        notified_at: new Date(),
      };

      if (['settlement', 'capture'].includes(transaction_status)) {
        updateData.paid_at = new Date();
        this.logger.info('[rylsPaymentService] payment marked as paid');
      }

      const updatedPayment = await this.paymentRepository.updateByOrderId(order_id, updateData);

      const newRegistrationStatus = mapTransactionStatus(transaction_status);
      if (newRegistrationStatus !== 'UNKNOWN') {
        await this.registrationRepository.updateStatus(payment.registration_id, newRegistrationStatus);
        this.logger.info({ newRegistrationStatus }, '[rylsPaymentService] registration status updated');
      }

      if (payment_type === 'credit_card' && fraud_status) {
        const fraudDecision = mapFraudStatus(fraud_status);
        this.logger.info({ fraud_status, fraudDecision }, '[rylsPaymentService] fraud status');
      }

      this.logger.info('[rylsPaymentService] handleWebhookNotification success');

      return {
        success: true,
        orderId: order_id,
        transactionStatus: transaction_status,
        registrationStatus: newRegistrationStatus,
        paymentId: updatedPayment.id,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentService] handleWebhookNotification error');
      throw new Error(`Failed to process webhook notification: ${error.message}`);
    }
  }

  verifyNotificationSignature(notificationData) {
    this.logger.info('[rylsPaymentService] verifyNotificationSignature start');

    try {
      const { order_id, status_code, gross_amount, signature_key } = notificationData;
      const serverKey = getServerKey();

      const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const calculatedSignature = crypto.createHash(WEBHOOK_CONFIG.SIGNATURE_ALGORITHM).update(signatureString).digest('hex');

      const isValid = calculatedSignature === signature_key;

      this.logger.info({ isValid }, '[rylsPaymentService] signature verification');
      if (!isValid) {
        this.logger.debug({ expected: calculatedSignature, received: signature_key }, '[rylsPaymentService] signature mismatch');
      }

      return isValid;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentService] verifyNotificationSignature error');
      return false;
    }
  }

  async getPaymentStatus(registrationId) {
    this.logger.info({ registrationId }, '[rylsPaymentService] getPaymentStatus start');

    try {
      const payments = await this.paymentRepository.findByRegistrationId(registrationId, { limit: 1 });

      if (payments.length === 0) {
        this.logger.info('[rylsPaymentService] no payment found');
        return { hasPayment: false, status: null, orderId: null, amount: null };
      }

      const latestPayment = payments[0];
      this.logger.debug({ status: latestPayment.transaction_status, orderId: latestPayment.order_id }, '[rylsPaymentService] latest payment');

      this.logger.info('[rylsPaymentService] getPaymentStatus success');
      return {
        hasPayment: true,
        status: latestPayment.transaction_status,
        orderId: latestPayment.order_id,
        amount: latestPayment.gross_amount_idr,
        currency: latestPayment.currency,
        paymentType: latestPayment.payment_type,
        paidAt: latestPayment.paid_at,
        createdAt: latestPayment.created_at,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentService] getPaymentStatus error');
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  async getPaymentStatistics(filters = {}) {
    this.logger.info('[rylsPaymentService] getPaymentStatistics start');
    this.logger.debug({ filters }, '[rylsPaymentService] rawFilters');

    try {
      const statistics = await this.paymentRepository.getStatistics(filters);
      this.logger.info('[rylsPaymentService] getPaymentStatistics success');
      return statistics;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentService] getPaymentStatistics error');
      throw new Error(`Failed to get payment statistics: ${error.message}`);
    }
  }

  async cancelPayment(orderId) {
    this.logger.info({ orderId }, '[rylsPaymentService] cancelPayment start');

    try {
      const payment = await this.paymentRepository.findByOrderId(orderId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.transaction_status !== 'pending') {
        throw new Error(`Cannot cancel payment with status: ${payment.transaction_status}`);
      }

      const updatedPayment = await this.paymentRepository.updateByOrderId(orderId, {
        transaction_status: 'cancel',
        last_notification: { cancelled_by: 'system', cancelled_at: new Date().toISOString(), reason: 'Manual cancellation' },
        notified_at: new Date(),
      });

      await this.registrationRepository.updateStatus(payment.registration_id, 'FAILED');

      this.logger.info('[rylsPaymentService] cancelPayment success');
      return { success: true, orderId: orderId, previousStatus: payment.transaction_status, newStatus: 'cancel' };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsPaymentService] cancelPayment error');
      throw new Error(`Failed to cancel payment: ${error.message}`);
    }
  }
}

export const rylsPaymentService = new RylsPaymentService();
