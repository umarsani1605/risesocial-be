import crypto from 'crypto';
import { snap, getServerKey } from '../../integrations/midtransClient.js';

/**
 * MidtransService - Generic Midtrans payment gateway operations
 * Provider-agnostic, no business logic
 */
export class MidtransService {

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


      const response = await snap.createTransaction(transactionParams);


      return {
        token: response.token,
        redirectUrl: response.redirect_url,
      };
    } catch (error) {
      throw new Error(`Midtrans API error: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature from Midtrans
   * @param {Object} notificationData - Webhook payload
   * @returns {boolean} - True if signature is valid
   */
  verifyWebhookSignature(notificationData) {

    try {
      const { order_id, status_code, gross_amount, signature_key } = notificationData;

      if (!order_id || !status_code || !gross_amount || !signature_key) {
        return false;
      }

      const serverKey = getServerKey();
      const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const calculatedSignature = crypto.createHash('sha512').update(signatureString).digest('hex');

      const isValid = calculatedSignature === signature_key;


      if (!isValid) {
      }

      return isValid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get transaction status from Midtrans API
   * @param {string} orderId - Order identifier
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransactionStatus(orderId) {

    try {
      const response = await snap.transaction.status(orderId);


      return response;
    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Cancel a pending transaction
   * @param {string} orderId - Order identifier
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelTransaction(orderId) {

    try {
      const response = await snap.transaction.cancel(orderId);

      return response;
    } catch (error) {
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

  }
}

export const midtransService = new MidtransService();
