import crypto from 'crypto';
import { snap, getServerKey } from '../../integrations/midtransClient.js';
import { rylsPaymentRepository } from '../../repositories/user/rylsPaymentRepository.js';
import { rylsRegistrationRepository } from '../../repositories/user/rylsRegistrationRepository.js';
import {
  generateOrderId,
  getPaymentAmountIdr,
  getItemTemplate,
  mapTransactionStatus,
  mapFraudStatus,
  WEBHOOK_CONFIG,
} from '../../constants/payments.js';

export class RylsPaymentService {
  constructor() {
    this.paymentRepository = rylsPaymentRepository;
    this.registrationRepository = rylsRegistrationRepository;
  }


  async createTransaction(data) {

    const type = data.type;
    const registrationData = data.data;


    try {
      const sequenceNumber = await this.paymentRepository.getNextSequenceNumber();
      const orderId = generateOrderId(sequenceNumber);
      const amountIdr = await getPaymentAmountIdr(registrationData.scholarshipType);
      const itemTemplate = getItemTemplate(registrationData.scholarshipType);


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


        snapTransaction = await snap.createTransaction(transactionParams);


        const midtransPaymentData = {
          order_id: orderId,
          snap_token: snapTransaction.token,
          redirect_url: snapTransaction.redirect_url,
          gross_amount_idr: amountIdr,
          currency: 'IDR',
          transaction_status: 'pending',
        };

        const savedMidtransPayment = await this.paymentRepository.createMidtransPayment(midtransPaymentData);

        const rylsPaymentData = {
          type: 'MIDTRANS',
          status: 'PENDING',
          amount: amountIdr,
          midtrans_id: savedMidtransPayment.id,
        };

        rylsPayment = await this.paymentRepository.createRylsPayment(rylsPaymentData);
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
      }

      return {
        payment_id: rylsPayment.id,
        order_id: orderId,
        amount: amountIdr,
        currency: 'IDR',
        token: snapTransaction?.token || null,
        redirect_url: snapTransaction?.redirect_url || null,
      };
    } catch (error) {
      throw new Error(`Failed to create payment transaction: ${error.message}`);
    }
  }

  async handleWebhookNotification(notificationData) {

    try {
      const { order_id, transaction_status, fraud_status, transaction_id, payment_type } = notificationData;

      const isValidSignature = this.verifyNotificationSignature(notificationData);
      if (!isValidSignature) {
        throw new Error('Invalid notification signature');
      }


      const payment = await this.paymentRepository.findByOrderId(order_id);
      if (!payment) {
        throw new Error(`Payment not found for order_id: ${order_id}`);
      }


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
      }

      const updatedPayment = await this.paymentRepository.updateByOrderId(order_id, updateData);

      const newRegistrationStatus = mapTransactionStatus(transaction_status);
      if (newRegistrationStatus !== 'UNKNOWN') {
        await this.registrationRepository.updateStatus(payment.registration_id, newRegistrationStatus);
      }

      if (payment_type === 'credit_card' && fraud_status) {
        const fraudDecision = mapFraudStatus(fraud_status);
      }


      return {
        success: true,
        orderId: order_id,
        transactionStatus: transaction_status,
        registrationStatus: newRegistrationStatus,
        paymentId: updatedPayment.id,
      };
    } catch (error) {
      throw new Error(`Failed to process webhook notification: ${error.message}`);
    }
  }

  verifyNotificationSignature(notificationData) {

    try {
      const { order_id, status_code, gross_amount, signature_key } = notificationData;
      const serverKey = getServerKey();

      const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const calculatedSignature = crypto.createHash(WEBHOOK_CONFIG.SIGNATURE_ALGORITHM).update(signatureString).digest('hex');

      const isValid = calculatedSignature === signature_key;

      if (!isValid) {
      }

      return isValid;
    } catch (error) {
      return false;
    }
  }

  async getPaymentStatus(registrationId) {

    try {
      const payments = await this.paymentRepository.findByRegistrationId(registrationId, { limit: 1 });

      if (payments.length === 0) {
        return { hasPayment: false, status: null, orderId: null, amount: null };
      }

      const latestPayment = payments[0];

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
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }
}

export const rylsPaymentService = new RylsPaymentService();
