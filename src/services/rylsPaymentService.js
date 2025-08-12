import crypto from 'crypto';
import { snap, getServerKey } from '../integrations/midtransClient.js';
import { RylsPaymentRepository } from '../repositories/rylsPaymentRepository.js';
import { RylsRegistrationRepository } from '../repositories/rylsRegistrationRepository.js';
import {
  generateOrderId,
  getPaymentAmountIdr,
  getItemTemplate,
  mapTransactionStatus,
  mapFraudStatus,
  WEBHOOK_CONFIG,
} from '../constants/payments.js';

/**
 * RYLS Payment Service
 * Handles business logic for payment transactions and Midtrans integration
 * Follows the same pattern as rylsRegistrationService.js
 */
export class RylsPaymentService {
  constructor() {
    this.paymentRepository = new RylsPaymentRepository();
    this.registrationRepository = new RylsRegistrationRepository();
  }

  /**
   * Create payment transaction for registration
   * @param {Object} registrationData - Basic registration data needed for payment
   * @returns {Promise<Object>} Payment transaction data
   */
  async createTransaction(data) {
    console.log('[PaymentService] createTransaction called');

    const type = data.type;
    const registrationData = data.data;

    console.log('[PaymentService] Payment type:', type);
    console.log('[PaymentService] Registration data:', registrationData);

    try {
      const sequenceNumber = await this.paymentRepository.getNextSequenceNumber();
      const orderId = generateOrderId(sequenceNumber);
      const amountIdr = await getPaymentAmountIdr(registrationData.scholarshipType);
      const itemTemplate = getItemTemplate(registrationData.scholarshipType);

      console.log('[PaymentService] Generated order ID:', orderId);
      console.log('[PaymentService] Payment amount:', amountIdr.toLocaleString('id-ID'), 'IDR');

      let rylsPayment;
      let snapTransaction;

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
              city: registrationData.residence,
              country_code: 'IDN',
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
        };

        console.log('[PaymentService] Midtrans transaction params:', JSON.stringify(transactionParams, null, 2));

        console.log('[PaymentService] Creating Midtrans transaction...');

        snapTransaction = await snap.createTransaction(transactionParams);

        console.log('[PaymentService] Midtrans transaction created successfully');
        console.log('[PaymentService] Midtrans response:', snapTransaction);

        const midtransPaymentData = {
          order_id: orderId,
          snap_token: snapTransaction.token,
          redirect_url: snapTransaction.redirect_url,
          gross_amount_idr: amountIdr,
          currency: 'IDR',
          transaction_status: 'pending',
        };

        const savedMidtransPayment = await this.paymentRepository.createMidtransPayment(midtransPaymentData);

        console.log('[PaymentService] Midtrans payment record:', savedMidtransPayment);

        const rylsPaymentData = {
          type: 'MIDTRANS',
          status: 'PENDING',
          amount: amountIdr,
          midtrans_id: savedMidtransPayment.id,
        };

        rylsPayment = await this.paymentRepository.createRylsPayment(rylsPaymentData);

        console.log('[PaymentService] Ryls payment record:', rylsPayment);
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

        console.log('[PaymentService] Ryls payment record:', rylsPayment);
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
      console.error('[PaymentService] Error creating transaction:', error);
      throw new Error(`Failed to create payment transaction: ${error.message}`);
    }
  }

  /**
   * Handle Midtrans webhook notification
   * @param {Object} notificationData - Webhook notification data
   * @returns {Promise<Object>} Processing result
   */
  async handleWebhookNotification(notificationData) {
    console.log('🔵 [PaymentService] handleWebhookNotification called');
    console.log('📝 [PaymentService] Notification data:', JSON.stringify(notificationData, null, 2));

    try {
      const { order_id, transaction_status, fraud_status, transaction_id, payment_type } = notificationData;

      const isValidSignature = this.verifyNotificationSignature(notificationData);
      if (!isValidSignature) {
        throw new Error('Invalid notification signature');
      }

      console.log('✅ [PaymentService] Notification signature verified');

      // 2. Find payment record
      const payment = await this.paymentRepository.findByOrderId(order_id);
      if (!payment) {
        throw new Error(`Payment not found for order_id: ${order_id}`);
      }

      console.log('📊 [PaymentService] Payment found:', payment.id);
      console.log('📊 [PaymentService] Current status:', payment.transaction_status);
      console.log('📊 [PaymentService] New status:', transaction_status);

      // 3. Update payment record
      const updateData = {
        transaction_status,
        transaction_id,
        payment_type,
        fraud_status: fraud_status || null,
        last_notification: notificationData,
        notified_at: new Date(),
      };

      // Set paid_at for successful payments
      if (['settlement', 'capture'].includes(transaction_status)) {
        updateData.paid_at = new Date();
        console.log('💰 [PaymentService] Payment marked as paid');
      }

      const updatedPayment = await this.paymentRepository.updateByOrderId(order_id, updateData);

      // 4. Update registration status based on payment status
      const newRegistrationStatus = mapTransactionStatus(transaction_status);
      if (newRegistrationStatus !== 'UNKNOWN') {
        await this.registrationRepository.updateStatus(payment.registration_id, newRegistrationStatus);
        console.log('📊 [PaymentService] Registration payment_status updated to:', newRegistrationStatus);
      }

      // 5. Handle fraud status for credit card payments
      if (payment_type === 'credit_card' && fraud_status) {
        const fraudDecision = mapFraudStatus(fraud_status);
        console.log('🔒 [PaymentService] Fraud status:', fraud_status, '→', fraudDecision);

        // Additional fraud handling logic can be added here
      }

      console.log('✅ [PaymentService] Webhook notification processed successfully');

      return {
        success: true,
        orderId: order_id,
        transactionStatus: transaction_status,
        registrationStatus: newRegistrationStatus,
        paymentId: updatedPayment.id,
      };
    } catch (error) {
      console.error('❌ [PaymentService] Error handling webhook notification:', error);
      throw new Error(`Failed to process webhook notification: ${error.message}`);
    }
  }

  /**
   * Verify Midtrans notification signature
   * @param {Object} notificationData - Notification data from Midtrans
   * @returns {boolean} True if signature is valid
   */
  verifyNotificationSignature(notificationData) {
    console.log('🔵 [PaymentService] verifyNotificationSignature called');

    try {
      const { order_id, status_code, gross_amount, signature_key } = notificationData;
      const serverKey = getServerKey();

      // Create signature string: order_id + status_code + gross_amount + server_key
      const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;

      // Generate SHA512 hash
      const calculatedSignature = crypto.createHash(WEBHOOK_CONFIG.SIGNATURE_ALGORITHM).update(signatureString).digest('hex');

      const isValid = calculatedSignature === signature_key;

      console.log('🔐 [PaymentService] Signature verification:', isValid ? 'VALID' : 'INVALID');
      if (!isValid) {
        console.log('🔐 [PaymentService] Expected signature:', calculatedSignature);
        console.log('🔐 [PaymentService] Received signature:', signature_key);
      }

      return isValid;
    } catch (error) {
      console.error('❌ [PaymentService] Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Get payment status for registration
   * @param {number} registrationId - Registration ID
   * @returns {Promise<Object>} Payment status information
   */
  async getPaymentStatus(registrationId) {
    console.log('🔵 [PaymentService] getPaymentStatus called');
    console.log('📝 [PaymentService] Registration ID:', registrationId);

    try {
      const payments = await this.paymentRepository.findByRegistrationId(registrationId, { limit: 1 });

      if (payments.length === 0) {
        return {
          hasPayment: false,
          status: null,
          orderId: null,
          amount: null,
        };
      }

      const latestPayment = payments[0];

      console.log('📊 [PaymentService] Latest payment status:', latestPayment.transaction_status);
      console.log('📊 [PaymentService] Order ID:', latestPayment.order_id);

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
      console.error('❌ [PaymentService] Error getting payment status:', error);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Get payment statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Payment statistics
   */
  async getPaymentStatistics(filters = {}) {
    console.log('🔵 [PaymentService] getPaymentStatistics called');
    console.log('📝 [PaymentService] Filters:', JSON.stringify(filters, null, 2));

    try {
      const statistics = await this.paymentRepository.getStatistics(filters);

      console.log('📊 [PaymentService] Statistics retrieved:', JSON.stringify(statistics, null, 2));

      return statistics;
    } catch (error) {
      console.error('❌ [PaymentService] Error getting statistics:', error);
      throw new Error(`Failed to get payment statistics: ${error.message}`);
    }
  }

  /**
   * Cancel pending payment (if allowed)
   * @param {string} orderId - Order ID to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelPayment(orderId) {
    console.log('🔵 [PaymentService] cancelPayment called');
    console.log('📝 [PaymentService] Order ID:', orderId);

    try {
      const payment = await this.paymentRepository.findByOrderId(orderId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.transaction_status !== 'pending') {
        throw new Error(`Cannot cancel payment with status: ${payment.transaction_status}`);
      }

      // Update payment status to cancelled
      const updatedPayment = await this.paymentRepository.updateByOrderId(orderId, {
        transaction_status: 'cancel',
        last_notification: {
          cancelled_by: 'system',
          cancelled_at: new Date().toISOString(),
          reason: 'Manual cancellation',
        },
        notified_at: new Date(),
      });

      // Update registration status
      await this.registrationRepository.updateStatus(payment.registration_id, 'FAILED');

      console.log('✅ [PaymentService] Payment cancelled successfully');

      return {
        success: true,
        orderId: orderId,
        previousStatus: payment.transaction_status,
        newStatus: 'cancel',
      };
    } catch (error) {
      console.error('❌ [PaymentService] Error cancelling payment:', error);
      throw new Error(`Failed to cancel payment: ${error.message}`);
    }
  }
}

export default RylsPaymentService;
