/**
 * Standardized API Response Utilities
 * Following KISS principle for consistent responses
 */

/**
 * Standard success response format
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {Object} meta - Additional metadata (pagination, etc.)
 * @returns {Object} Standardized success response
 */
export function successResponse(data, message = 'Success', meta = {}) {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  // Only add meta if it has content
  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return response;
}

/**
 * Standard error response format
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} details - Additional error details
 * @returns {Object} Standardized error response
 */
export function errorResponse(message, statusCode = 500, details = null) {
  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  // Only add details if provided (for security)
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  return response;
}

/**
 * Pagination metadata helper
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
export function paginationMeta(page, limit, total) {
  return {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}
