import crypto from 'crypto';
import { snap, getServerKey } from '../../integrations/midtransClient.js';
import { getLogger } from '../../utils/loggerContext.js';

/**
 * MidtransService - Generic Midtrans payment gateway operations
 * Provider-agnostic, no business logic
 */
export class MidtransService {
  get logger() {
    return getLogger();
  }

  /**
   * Create a Snap transaction with Midtrans
   * @param {Object} params - Transaction parameters
   * @param {string} params.orderId - Unique order identifier (transaction_code)
   * @param {number} params.grossAmount - Total amount in IDR
   * @param {Object} params.customerDetails - Customer information
   * @param {Array} params.itemDetails - Line items
   * @returns {Promise<{token: string, redirectUrl: string}>}
   */
  async createSnapTransaction(params) {
    this.logger.info('[MidtransService] createSnapTransaction start');
    this.logger.debug({ params }, '[MidtransService] transaction params');

    try {
      // Validate parameters
      this.validateTransactionParams(params);

      const transactionParams = {
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.grossAmount,
        },
        customer_details: params.customerDetails,
        item_details: params.itemDetails,
        credit_card: { secure: true },
      };

      this.logger.debug({ transactionParams }, '[MidtransService] calling Midtrans API');

      const response = await snap.createTransaction(transactionParams);

      this.logger.info('[MidtransService] Snap transaction created successfully');
      this.logger.debug({ token: response.token }, '[MidtransService] response');

      return {
        token: response.token,
        redirectUrl: response.redirect_url,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[MidtransService] createSnapTransaction error');
      throw new Error(`Midtrans API error: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature from Midtrans
   * @param {Object} notificationData - Webhook payload
   * @returns {boolean} - True if signature is valid
   */
  verifyWebhookSignature(notificationData) {
    this.logger.info('[MidtransService] verifyWebhookSignature start');

    try {
      const { order_id, status_code, gross_amount, signature_key } = notificationData;

      if (!order_id || !status_code || !gross_amount || !signature_key) {
        this.logger.warn('[MidtransService] missing required fields for signature verification');
        return false;
      }

      const serverKey = getServerKey();
      const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const calculatedSignature = crypto.createHash('sha512').update(signatureString).digest('hex');

      const isValid = calculatedSignature === signature_key;

      this.logger.info({ isValid }, '[MidtransService] signature verification result');

      if (!isValid) {
        this.logger.warn(
          {
            expected: calculatedSignature.substring(0, 20) + '...',
            received: signature_key.substring(0, 20) + '...',
          },
          '[MidtransService] signature mismatch',
        );
      }

      return isValid;
    } catch (error) {
      this.logger.error({ err: error }, '[MidtransService] verifyWebhookSignature error');
      return false;
    }
  }

  /**
   * Get transaction status from Midtrans API
   * @param {string} orderId - Order identifier
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransactionStatus(orderId) {
    this.logger.info({ orderId }, '[MidtransService] getTransactionStatus start');

    try {
      const response = await snap.transaction.status(orderId);

      this.logger.info('[MidtransService] transaction status retrieved');
      this.logger.debug({ status: response.transaction_status }, '[MidtransService] status');

      return response;
    } catch (error) {
      this.logger.error({ err: error }, '[MidtransService] getTransactionStatus error');
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Cancel a pending transaction
   * @param {string} orderId - Order identifier
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelTransaction(orderId) {
    this.logger.info({ orderId }, '[MidtransService] cancelTransaction start');

    try {
      const response = await snap.transaction.cancel(orderId);

      this.logger.info('[MidtransService] transaction cancelled');
      return response;
    } catch (error) {
      this.logger.error({ err: error }, '[MidtransService] cancelTransaction error');
      throw new Error(`Failed to cancel transaction: ${error.message}`);
    }
  }

  /**
   * Validate transaction parameters
   * @private
   */
  validateTransactionParams(params) {
    const { orderId, grossAmount, customerDetails, itemDetails } = params;

    if (!orderId || orderId.length > 100) {
      throw new Error('Invalid order_id: must be non-empty and max 100 characters');
    }

    if (!grossAmount || grossAmount < 1000 || grossAmount > 999999999) {
      throw new Error('Invalid gross_amount: must be between 1,000 and 999,999,999 IDR');
    }

    if (!customerDetails || !customerDetails.email) {
      throw new Error('Invalid customer_details: email is required');
    }

    if (!itemDetails || !Array.isArray(itemDetails) || itemDetails.length === 0) {
      throw new Error('Invalid item_details: must be non-empty array');
    }

    this.logger.debug('[MidtransService] parameters validated');
  }
}

export const midtransService = new MidtransService();
