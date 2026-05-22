import { convertUsdToIdr } from '../integrations/currencyConverter.js';

export const RYLS_PAYMENT_AMOUNTS_USD = {
  FULLY_FUNDED: 0.1,
  SELF_FUNDED: 750,
};

export const ORDER_ID_CONFIG = {
  PREFIX: 'RYLS',
  PADDING: 2, 
  START_NUMBER: 1, 
};

export const PAYMENT_EXPIRY = {
  DURATION: 24, 
  UNIT: 'hour', 
};

export const PAYMENT_STATUS_MAPPING = {
  
  settlement: 'PAID',
  capture: 'PAID',

  pending: 'PENDING',
  challenge: 'PENDING',

  deny: 'FAILED',
  cancel: 'FAILED',
  expire: 'EXPIRED',

  refund: 'PAID', 
  chargeback: 'FAILED', 
};

export const FRAUD_STATUS_MAPPING = {
  accept: 'ACCEPTED',
  challenge: 'REVIEW_REQUIRED',
  deny: 'REJECTED',
};

export const PAYMENT_ITEM_TEMPLATES = {
  FULLY_FUNDED: {
    id: 'ryls-fully-funded-fee',
    name: 'RYLS Fully Funded',
    category: 'registration',
  },
  SELF_FUNDED: {
    id: 'ryls-self-funded-fee',
    name: 'RYLS Self Funded',
    category: 'registration',
  },
};

export const WEBHOOK_CONFIG = {
  TIMEOUT_MS: 30000, 
  RETRY_ATTEMPTS: 3, 
  SIGNATURE_ALGORITHM: 'sha512', 
};

export const VALIDATION_RULES = {
  MIN_AMOUNT_IDR: 1000, 
  MAX_AMOUNT_IDR: 999999999, 
  ORDER_ID_MAX_LENGTH: 50, 
  CUSTOMER_NAME_MAX_LENGTH: 100, 
};

export const generateOrderId = (sequenceNumber) => {
  const randomStr = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(36).toUpperCase())
    .join('')
    .replace(/[^A-Z]/g, '')
    .substring(0, 8);

  const paddedNumber = sequenceNumber.toString().padStart(ORDER_ID_CONFIG.PADDING, '0');
  return ORDER_ID_CONFIG.PREFIX + paddedNumber + randomStr;
};

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

export const mapTransactionStatus = (transactionStatus) => {
  return PAYMENT_STATUS_MAPPING[transactionStatus] || 'UNKNOWN';
};

export const getPaymentAmountIdr = async (scholarshipType, fastify) => {
  const usd = getPaymentAmountUsd(scholarshipType);
  const conv = await convertUsdToIdr(usd, fastify);
  if (!conv?.success) {
    throw new Error(conv?.error || 'Currency conversion failed');
  }
  return Math.round(conv.result);
};

export const mapFraudStatus = (fraudStatus) => {
  return FRAUD_STATUS_MAPPING[fraudStatus] || 'UNKNOWN';
};
