/**
 * Currency Converter Utility
 * Handles USD to IDR conversion with fixed rate
 * Future: Can be extended to support dynamic rates
 */

/**
 * Fixed exchange rate USD to IDR
 * @constant {number}
 */
const FIXED_USD_TO_IDR_RATE = 15000;

/**
 * Convert USD amount to IDR using fixed rate
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in IDR (integer)
 */
export const convertUsdToIdr = (usdAmount) => {
  if (typeof usdAmount !== 'number' || usdAmount < 0) {
    throw new Error('USD amount must be a positive number');
  }

  const idrAmount = Math.round(usdAmount * FIXED_USD_TO_IDR_RATE);

  console.log(
    `💱 [CurrencyConverter] ${usdAmount} USD → ${idrAmount.toLocaleString('id-ID')} IDR (rate: ${FIXED_USD_TO_IDR_RATE.toLocaleString('id-ID')})`
  );

  return idrAmount;
};

/**
 * Convert IDR amount to USD using fixed rate
 * @param {number} idrAmount - Amount in IDR
 * @returns {number} Amount in USD (rounded to 2 decimals)
 */
export const convertIdrToUsd = (idrAmount) => {
  if (typeof idrAmount !== 'number' || idrAmount < 0) {
    throw new Error('IDR amount must be a positive number');
  }

  const usdAmount = Math.round((idrAmount / FIXED_USD_TO_IDR_RATE) * 100) / 100;

  console.log(
    `💱 [CurrencyConverter] ${idrAmount.toLocaleString('id-ID')} IDR → ${usdAmount} USD (rate: ${FIXED_USD_TO_IDR_RATE.toLocaleString('id-ID')})`
  );

  return usdAmount;
};

/**
 * Get current exchange rate
 * @returns {number} Current USD to IDR rate
 */
export const getCurrentRate = () => FIXED_USD_TO_IDR_RATE;

/**
 * Format IDR amount for display
 * @param {number} idrAmount - Amount in IDR
 * @returns {string} Formatted IDR string
 */
export const formatIdr = (idrAmount) => {
  return `Rp ${idrAmount.toLocaleString('id-ID')}`;
};

/**
 * Format USD amount for display
 * @param {number} usdAmount - Amount in USD
 * @returns {string} Formatted USD string
 */
export const formatUsd = (usdAmount) => {
  return `$${usdAmount.toFixed(2)}`;
};

/**
 * Validate Midtrans minimum amount (IDR 1,000)
 * @param {number} idrAmount - Amount in IDR
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidMidtransAmount = (idrAmount) => {
  const MIDTRANS_MIN_AMOUNT = 1000; // IDR 1,000
  return idrAmount >= MIDTRANS_MIN_AMOUNT;
};

// Log current configuration
console.log(`💱 [CurrencyConverter] Fixed rate: 1 USD = ${FIXED_USD_TO_IDR_RATE.toLocaleString('id-ID')} IDR`);
console.log(`💱 [CurrencyConverter] Midtrans minimum: ${formatIdr(1000)}`);
