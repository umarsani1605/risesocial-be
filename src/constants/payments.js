import { convertUsdToIdr } from '../integrations/currencyConverter.js';

/**
 * Payment Constants for RYLS Registration
 * Centralized configuration for payment amounts, settings, and validation
 */

/**
 * RYLS Payment Amounts in USD
 * @constant {Object}
 */
export const RYLS_PAYMENT_AMOUNTS_USD = {
  FULLY_FUNDED: 15,
  SELF_FUNDED: 750,
};

/**
 * Order ID Configuration
 * @constant {Object}
 */
export const ORDER_ID_CONFIG = {
  PREFIX: 'RYLS',
  PADDING: 2, // RYLS0001, RYLS0002, etc.
  START_NUMBER: 1, // Start from 1
};

/**
 * Payment Expiry Configuration
 * @constant {Object}
 */
export const PAYMENT_EXPIRY = {
  DURATION: 24, // 24 hours
  UNIT: 'hour', // Midtrans expiry unit
};

/**
 * Payment Status Mapping
 * Maps Midtrans transaction_status to RYLS registration status
 * @constant {Object}
 */
export const PAYMENT_STATUS_MAPPING = {
  // Success states
  settlement: 'PAID',
  capture: 'PAID',

  // Pending states
  pending: 'PENDING',
  challenge: 'PENDING',

  // Failed states
  deny: 'FAILED',
  cancel: 'FAILED',
  expire: 'EXPIRED',

  // Other states (not mapped to registration enum)
  refund: 'PAID', // keep as PAID (refund handling can be added later)
  chargeback: 'FAILED', // treat as failed for now
};

/**
 * Fraud Status Mapping
 * Maps Midtrans fraud_status to payment processing decisions
 * @constant {Object}
 */
export const FRAUD_STATUS_MAPPING = {
  accept: 'ACCEPTED',
  challenge: 'REVIEW_REQUIRED',
  deny: 'REJECTED',
};

/**
 * Payment Item Details Templates
 * @constant {Object}
 */
export const PAYMENT_ITEM_TEMPLATES = {
  FULLY_FUNDED: {
    id: 'ryls-fully-funded-fee',
    name: 'Rise Young Leaders Scholarship Fully Funded',
    category: 'registration',
  },
  SELF_FUNDED: {
    id: 'ryls-self-funded-fee',
    name: 'Rise Young Leaders Scholarship Self Funded',
    category: 'registration',
  },
};

/**
 * Webhook Configuration
 * @constant {Object}
 */
export const WEBHOOK_CONFIG = {
  TIMEOUT_MS: 30000, // 30 seconds timeout
  RETRY_ATTEMPTS: 3, // Retry attempts for failed webhooks
  SIGNATURE_ALGORITHM: 'sha512', // SHA512 for signature verification
};

/**
 * Validation Rules
 * @constant {Object}
 */
export const VALIDATION_RULES = {
  MIN_AMOUNT_IDR: 1000, // Midtrans minimum amount
  MAX_AMOUNT_IDR: 999999999, // Midtrans maximum amount
  ORDER_ID_MAX_LENGTH: 50, // Midtrans order_id max length
  CUSTOMER_NAME_MAX_LENGTH: 100, // Customer name max length
};

/**
 * Generate order ID for RYLS payment
 * @param {number} sequenceNumber - Sequential number for order
 * @returns {string} Formatted order ID (e.g., RYLS0001)
 */
export const generateOrderId = (sequenceNumber) => {
  const randomStr = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(36).toUpperCase())
    .join('')
    .replace(/[^A-Z]/g, '')
    .substring(0, 8);

  const paddedNumber = sequenceNumber.toString().padStart(ORDER_ID_CONFIG.PADDING, '0');
  return ORDER_ID_CONFIG.PREFIX + paddedNumber + randomStr;
};

/**
 * Get payment amount in USD based on scholarship type
 * @param {string} scholarshipType - FULLY_FUNDED or SELF_FUNDED
 * @returns {number} Amount in USD
 */
export const getPaymentAmountUsd = (scholarshipType) => {
  switch (scholarshipType) {
    case 'FULLY_FUNDED':
      return RYLS_PAYMENT_AMOUNTS_USD.FULLY_FUNDED;
    case 'SELF_FUNDED':
      return RYLS_PAYMENT_AMOUNTS_USD.SELF_FUNDED;
    default:
      throw new Error(`Invalid scholarship type: ${scholarshipType}`);
  }
};

/**
 * Get item details template based on scholarship type
 * @param {string} scholarshipType - FULLY_FUNDED or SELF_FUNDED
 * @returns {Object} Item details template
 */
export const getItemTemplate = (scholarshipType) => {
  switch (scholarshipType) {
    case 'FULLY_FUNDED':
      return PAYMENT_ITEM_TEMPLATES.FULLY_FUNDED;
    case 'SELF_FUNDED':
      return PAYMENT_ITEM_TEMPLATES.SELF_FUNDED;
    default:
      throw new Error(`Invalid scholarship type: ${scholarshipType}`);
  }
};

/**
 * Map Midtrans transaction status to RYLS registration status
 * @param {string} transactionStatus - Midtrans transaction_status
 * @returns {string} RYLS registration status
 */
export const mapTransactionStatus = (transactionStatus) => {
  return PAYMENT_STATUS_MAPPING[transactionStatus] || 'UNKNOWN';
};

// New async helper to get IDR amount using currency API
export const getPaymentAmountIdr = async (scholarshipType) => {
  console.log('[Payments] getPaymentAmountIdr called');
  console.log('[Payments] Scholarship type:', scholarshipType);
  const usd = getPaymentAmountUsd(scholarshipType);
  console.log('[Payments] USD amount:', usd);
  const conv = await convertUsdToIdr(usd);
  if (!conv?.success) {
    console.error('[Payments] Currency conversion failed:', conv?.error);
    throw new Error(conv?.error || 'Currency conversion failed');
  }
  console.log('[Payments] Conversion rate:', conv.rate);
  console.log('[Payments] Conversion result (IDR):', conv.result);
  return Math.round(conv.result);
};

/**
 * Map Midtrans fraud status to payment decision
 * @param {string} fraudStatus - Midtrans fraud_status
 * @returns {string} Payment decision
 */
export const mapFraudStatus = (fraudStatus) => {
  return FRAUD_STATUS_MAPPING[fraudStatus] || 'UNKNOWN';
};

// Log configuration on startup
console.log(`💰 [PaymentConstants] RYLS Payment Amounts (USD):`);
console.log(`   💰 Fully Funded: $${RYLS_PAYMENT_AMOUNTS_USD.FULLY_FUNDED}`);
console.log(`   💰 Self Funded: $${RYLS_PAYMENT_AMOUNTS_USD.SELF_FUNDED}`);
console.log(
  `🔢 [PaymentConstants] Order ID Format: ${ORDER_ID_CONFIG.PREFIX}${ORDER_ID_CONFIG.START_NUMBER.toString().padStart(ORDER_ID_CONFIG.PADDING, '0')}`
);
console.log(`⏰ [PaymentConstants] Payment Expiry: ${PAYMENT_EXPIRY.DURATION} ${PAYMENT_EXPIRY.UNIT}`);
