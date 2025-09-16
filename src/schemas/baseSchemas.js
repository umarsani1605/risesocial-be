/**
 * Base Schemas untuk Response Standardization
 * Mengikuti format dari utils/response.js
 */

// ========================
// BASE RESPONSE SCHEMAS
// ========================

/**
 * Standard Success Response Schema
 */
export const successResponseSchema = {
  type: 'object',
  // Minimal required - for documentation only
  properties: {
    success: {
      type: 'boolean',
      description: 'Indicates if the request was successful',
    },
    message: {
      type: 'string',
      description: 'Human-readable success message',
    },
    data: {
      type: 'object',
      description: 'Response data payload',
    },
    meta: {
      type: 'object',
      description: 'Additional metadata (pagination, etc.)',
      properties: {
        page: { type: 'integer', minimum: 1 },
        limit: { type: 'integer', minimum: 1 },
        total: { type: 'integer', minimum: 0 },
        totalPages: { type: 'integer', minimum: 0 },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' },
      },
    },
  },
};

/**
 * Standard Error Response Schema
 */
export const errorResponseSchema = {
  type: 'object',
  // Minimal required - for documentation only
  properties: {
    success: {
      type: 'boolean',
      description: 'Always false for error responses',
    },
    message: {
      type: 'string',
      description: 'Human-readable error message',
    },
    statusCode: {
      type: 'integer',
      description: 'HTTP status code',
    },
    details: {
      type: 'object',
      description: 'Additional error details (development only)',
    },
  },
};

// ========================
// PAGINATION SCHEMAS
// ========================

/**
 * Pagination Query Parameters Schema
 */
export const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: {
      type: 'integer',
      minimum: 1,
      default: 1,
      description: 'Page number (starts from 1)',
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 10,
      description: 'Number of items per page',
    },
  },
};

/**
 * Search Query Parameters Schema
 */
export const searchQuerySchema = {
  type: 'object',
  properties: {
    search: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      description: 'Search term',
    },
    sortBy: {
      type: 'string',
      description: 'Field to sort by',
    },
    sortOrder: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'desc',
      description: 'Sort order',
    },
  },
};

// ========================
// COMMON FIELD SCHEMAS
// ========================

/**
 * ID Parameter Schema
 */
export const idParamSchema = {
  type: 'object',
  // No required fields - documentation only
  properties: {
    id: {
      type: 'integer',
      description: 'Resource ID',
    },
  },
};

/**
 * Timestamp Fields Schema
 */
export const timestampFieldsSchema = {
  created_at: {
    type: 'string',
    format: 'date-time',
    description: 'Creation timestamp',
  },
  updated_at: {
    type: 'string',
    format: 'date-time',
    description: 'Last update timestamp',
  },
};

// ========================
// HELPER FUNCTIONS
// ========================

/**
 * Create success response schema with specific data type
 * @param {Object} dataSchema - Schema for the data field
 * @param {string} description - Description for the response
 * @returns {Object} Complete success response schema
 */
export function createSuccessResponseSchema(dataSchema, description = 'Successful response') {
  return {
    description,
    type: 'object',
    // No required fields - documentation only
    properties: {
      ...successResponseSchema.properties,
      data: dataSchema,
    },
  };
}

/**
 * Create paginated response schema
 * @param {Object} itemSchema - Schema for individual items
 * @param {string} description - Description for the response
 * @returns {Object} Complete paginated response schema
 */
export function createPaginatedResponseSchema(itemSchema, description = 'Paginated response') {
  return {
    description,
    type: 'object',
    // No required fields - documentation only
    properties: {
      ...successResponseSchema.properties,
      data: {
        type: 'array',
        items: itemSchema,
      },
      meta: {
        type: 'object',
        // No required fields - documentation only
        properties: successResponseSchema.properties.meta.properties,
      },
    },
  };
}

/**
 * Create error response schema with specific status code
 * @param {number} statusCode - HTTP status code
 * @param {string} description - Description for the error
 * @returns {Object} Complete error response schema
 */
export function createErrorResponseSchema(statusCode, description = 'Error response') {
  return {
    description,
    type: 'object',
    // No required fields - documentation only
    properties: {
      ...errorResponseSchema.properties,
      statusCode: {
        type: 'integer',
      },
    },
  };
}
