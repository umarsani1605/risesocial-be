/**
 * Validation utility for data validation
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export function validatePhone(phone) {
  // Accepts formats like: +1234567890, +12-345-678-90, +1 234 567 890
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that a value is within a range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if value is within range
 */
export function validateRange(value, min, max) {
  return value >= min && value <= max;
}

/**
 * Validate that discount price is less than or equal to original price
 * @param {number} discountPrice - Discount price
 * @param {number} originalPrice - Original price
 * @returns {boolean} True if discount price is valid
 */
export function validatePricing(discountPrice, originalPrice) {
  return discountPrice <= originalPrice;
}

/**
 * Validate that end date is after start date
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} True if date range is valid
 */
export function validateDateRange(startDate, endDate) {
  return endDate >= startDate;
}

/**
 * Validate that a string is not empty
 * @param {string} value - String to validate
 * @returns {boolean} True if string is not empty
 */
export function validateNotEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that a value is one of the allowed enum values
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @returns {boolean} True if value is in allowed values
 */
export function validateEnum(value, allowedValues) {
  return allowedValues.includes(value);
}

/**
 * Validate required fields are present in an object
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} Object with isValid boolean and missing array
 */
export function validateRequiredFields(obj, requiredFields) {
  const missing = requiredFields.filter((field) => {
    const value = obj[field];
    return value === undefined || value === null || value === '';
  });

  return {
    isValid: missing.length === 0,
    missing,
  };
}
