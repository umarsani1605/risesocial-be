/**
 * Payment Helper Functions
 * Status and payment method mapping utilities
 */

/**
 * Map Midtrans transaction status to generic status
 * @param {string} midtransStatus - Midtrans transaction_status
 * @returns {string} - Generic status (pending, paid, failed, expired, refunded)
 */
export function mapMidtransStatus(midtransStatus) {
  const statusMap = {
    settlement: 'paid',
    capture: 'paid',
    pending: 'pending',
    challenge: 'pending',
    deny: 'failed',
    cancel: 'failed',
    expire: 'expired',
    refund: 'refunded',
  };

  return statusMap[midtransStatus] || 'pending';
}

/**
 * Map Midtrans payment details to detailed payment method
 * @param {Object} notification - Webhook notification data
 * @param {string} notification.payment_type - Midtrans payment_type
 * @param {string} notification.bank - Bank code (for bank_transfer)
 * @param {string} notification.store - Store code (for cstore)
 * @returns {string} - Detailed payment method (bca_va, gopay, qris, etc.)
 */
export function mapPaymentMethod(notification) {
  const { payment_type, store } = notification;

  // Extract bank: va_numbers array (BCA/BNI/BRI/CIMB) → permata_va_number (Permata) → top-level bank (legacy)
  const bank =
    notification.va_numbers?.[0]?.bank ??
    (notification.permata_va_number ? 'permata' : undefined) ??
    notification.bank;

  if (payment_type === 'bank_transfer') {
    if (bank === 'bca')     return 'BCA Virtual Account';
    if (bank === 'bni')     return 'BNI Virtual Account';
    if (bank === 'bri')     return 'BRI Virtual Account';
    if (bank === 'permata') return 'Permata Virtual Account';
    if (bank === 'cimb')    return 'CIMB Virtual Account';
    return 'Bank Transfer';
  }

  if (payment_type === 'echannel') return 'Mandiri Bill';

  if (payment_type === 'gopay')     return 'GoPay';
  if (payment_type === 'shopeepay') return 'ShopeePay';
  if (payment_type === 'qris')      return 'QRIS';

  if (payment_type === 'cstore') {
    if (store === 'indomaret') return 'Indomaret';
    if (store === 'alfamart')  return 'Alfamart';
    return 'Convenient Store';
  }

  if (payment_type === 'credit_card') return 'Credit Card';
  if (payment_type === 'akulaku')     return 'Akulaku';
  if (payment_type === 'kredivo')     return 'Kredivo';

  return payment_type;
}

/**
 * Generate transaction code with fixed 14 character format
 * PREFIX(4) + SEQUENCE(2) + RANDOM(8)
 * @param {string} prefix - 4 character prefix (RYLS, ACAD, etc)
 * @param {number} sequence - Sequence number
 * @returns {string} - Transaction code (e.g., RYLS01A1B2C3D4)
 */
export function generateTransactionCode(prefix, sequence) {
  // Ensure prefix is exactly 4 characters
  const normalizedPrefix = prefix.toUpperCase().padEnd(4, 'X').substring(0, 4);

  // Format sequence as 2 digits (01-99, then wraps to 00)
  const sequenceStr = (sequence % 100).toString().padStart(2, '0');

  // Generate 8 random hex characters
  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
    .join('');

  return `${normalizedPrefix}${sequenceStr}${randomHex}`;
}

/**
 * Transaction code configuration
 */
export const TRANSACTION_CODE_CONFIG = {
  RYLS_PREFIX: 'RYLS',
  ACADEMY_PREFIX: 'ACAD',
  EVENT_PREFIX: 'EVNT',
  LENGTH: 14, // Fixed length
};

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
};

/**
 * Provider constants
 */
export const PAYMENT_PROVIDER = {
  MIDTRANS: 'midtrans',
  XENDIT: 'xendit',
  STRIPE: 'stripe',
  PAYPAL_MANUAL: 'paypal_manual',
};

/**
 * Product type constants
 */
export const PRODUCT_TYPE = {
  RYLS_SCHOLARSHIP: 'Rise Young Leaders Scholarship',
  ACADEMY_COURSE: 'Academy Course',
  EVENT_REGISTRATION: 'Event Registration',
};
