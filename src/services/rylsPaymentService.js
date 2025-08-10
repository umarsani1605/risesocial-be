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
  PAYMENT_EXPIRY,
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
   * @param {number} registrationId - Registration ID
   * @returns {Promise<Object>} Payment transaction data
   */
  async createTransaction(registrationId) {
    console.log('🔵 [PaymentService] createTransaction called');
    console.log('📝 [PaymentService] Registration ID:', registrationId);

    try {
      // 1. Get registration data
      const registration = await this.registrationRepository.findById(registrationId);
      if (!registration) {
        throw new Error('Registration not found');
      }

      console.log('📊 [PaymentService] Registration found:', registration.full_name);
      console.log('📊 [PaymentService] Scholarship type:', registration.scholarship_type);
      console.log('📊 [PaymentService] Current status:', registration.status);

      // 2. Check if there's already an active pending payment
      const existingPendingPayment = await this.paymentRepository.findActivePendingPayment(registrationId);
      if (existingPendingPayment) {
        console.log('♻️ [PaymentService] Found existing pending payment, reusing token');
        console.log('📊 [PaymentService] Existing order ID:', existingPendingPayment.order_id);

        return {
          token: existingPendingPayment.snap_token,
          redirect_url: existingPendingPayment.redirect_url,
          orderId: existingPendingPayment.order_id,
          amount: existingPendingPayment.gross_amount_idr,
          currency: existingPendingPayment.currency,
        };
      }

      // 3. Generate order ID and get payment amount
      const sequenceNumber = await this.paymentRepository.getNextSequenceNumber();
      const orderId = generateOrderId(sequenceNumber);
      const amountIdr = getPaymentAmountIdr(registration.scholarship_type);
      const itemTemplate = getItemTemplate(registration.scholarship_type);

      console.log('🔢 [PaymentService] Generated order ID:', orderId);
      console.log('💰 [PaymentService] Payment amount:', amountIdr.toLocaleString('id-ID'), 'IDR');

      // 4. Prepare Midtrans transaction parameters
      const transactionParams = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amountIdr,
        },
        customer_details: {
          first_name: registration.full_name.split(' ')[0],
          last_name: registration.full_name.split(' ').slice(1).join(' ') || '',
          email: registration.email,
          phone: registration.whatsapp,
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
        custom_expiry: {
          expiry_duration: PAYMENT_EXPIRY.DURATION,
          unit: PAYMENT_EXPIRY.UNIT,
        },
      };

      console.log('📝 [PaymentService] Midtrans transaction params:', JSON.stringify(transactionParams, null, 2));

      // 5. Create transaction with Midtrans
      console.log('🔄 [PaymentService] Creating Midtrans transaction...');
      const snapTransaction = await snap.createTransaction(transactionParams);

      console.log('✅ [PaymentService] Midtrans transaction created successfully');
      console.log('🎫 [PaymentService] Snap token:', snapTransaction.token.substring(0, 20) + '...');
      console.log('🔗 [PaymentService] Redirect URL:', snapTransaction.redirect_url);

      // 6. Save payment record to database
      const paymentData = {
        registration_id: registrationId,
        order_id: orderId,
        snap_token: snapTransaction.token,
        redirect_url: snapTransaction.redirect_url,
        gross_amount_idr: amountIdr,
        currency: 'IDR',
        transaction_status: 'pending',
      };

      const savedPayment = await this.paymentRepository.create(paymentData);
      console.log('💾 [PaymentService] Payment record saved with ID:', savedPayment.id);

      // 7. Update registration status to PENDING
      await this.registrationRepository.updateStatus(registrationId, 'PENDING');
      console.log('📊 [PaymentService] Registration status updated to PENDING');

      return {
        token: snapTransaction.token,
        redirect_url: snapTransaction.redirect_url,
        orderId: orderId,
        amount: amountIdr,
        currency: 'IDR',
      };
    } catch (error) {
      console.error('❌ [PaymentService] Error creating transaction:', error);
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

      // 1. Verify notification authenticity
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
        console.log('📊 [PaymentService] Registration status updated to:', newRegistrationStatus);
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
