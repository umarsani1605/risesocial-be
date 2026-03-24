import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
} from '../shared/baseSchemas.js';

const transactionListItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    transaction_code: { type: 'string' },
    customer_name: { type: 'string' },
    customer_email: { type: 'string' },
    customer_phone: { type: ['string', 'null'] },
    product_type: { type: 'string' },
    amount: { type: 'integer' },
    currency: { type: 'string' },
    status: { type: 'string' },
    provider: { type: 'string' },
    payment_method: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
  },
};

const transactionItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    product_name: { type: 'string' },
    quantity: { type: 'integer' },
    unit_price: { type: 'integer' },
    total_price: { type: 'integer' },
  },
};

const transactionDetailSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    transaction_code: { type: 'string' },
    amount: { type: 'integer' },
    currency: { type: 'string' },
    status: { type: 'string' },
    provider: { type: 'string' },
    payment_method: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    paid_at: { type: ['string', 'null'], format: 'date-time' },
    expired_at: { type: ['string', 'null'], format: 'date-time' },
    customer_details: {
      type: 'object',
      properties: {
        user_id: { type: ['integer', 'null'] },
        user_name: { type: ['string', 'null'] },
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: ['string', 'null'] },
        address: { type: ['string', 'null'] },
        city: { type: ['string', 'null'] },
        postal_code: { type: ['string', 'null'] },
        country_code: { type: ['string', 'null'] },
      },
    },
    product_details: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        items: {
          type: 'array',
          items: transactionItemSchema,
        },
        enrollment: {
          type: ['object', 'null'],
          properties: {
            cohort_id: { type: 'integer' },
            cohort_name: { type: 'string' },
          },
        },
        ryls_registration: {
          type: ['object', 'null'],
          properties: {
            id: { type: 'integer' },
            full_name: { type: 'string' },
            scholarship_type: { type: 'string' },
          },
        },
      },
    },
  },
};

export const getAdminTransactionsSchema = {
  tags: ['Admin - Transactions'],
  summary: 'List all transactions',
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      status: { type: 'string', enum: ['pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded'] },
      product_type: { type: 'string' },
    },
  },
  response: {
    200: createPaginatedResponseSchema(transactionListItemSchema, 'List of transactions'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAdminTransactionByIdSchema = {
  tags: ['Admin - Transactions'],
  summary: 'Get transaction detail',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema(transactionDetailSchema, 'Transaction detail'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
