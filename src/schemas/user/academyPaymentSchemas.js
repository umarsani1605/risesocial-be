import { createSuccessResponseSchema, createErrorResponseSchema, createPaginatedResponseSchema } from '../shared/baseSchemas.js';

const createTransactionBodySchema = {
  type: 'object',
  required: ['academy_id', 'pricing_id'],
  properties: {
    academy_id: { type: 'integer', description: 'Academy ID' },
    pricing_id: { type: 'integer', description: 'Pricing tier ID' },
    customer_details: {
      type: 'object',
      description: 'Optional customer details from checkout form. Used for Midtrans payload and to backfill empty User fields.',
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

const transactionDataSchema = {
  type: 'object',
  properties: {
    enrollment_id: { type: 'integer', description: 'Enrollment record ID' },
    transaction_code: { type: 'string', description: 'Transaction code' },
    amount: { type: 'number', description: 'Payment amount in IDR' },
    currency: { type: 'string', description: 'Currency' },
    token: { type: ['string', 'null'], description: 'Midtrans snap token' },
    redirect_url: { type: ['string', 'null'], description: 'Payment page URL' },
  },
};

const enrollmentIdParamSchema = {
  type: 'object',
  properties: {
    enrollmentId: { type: 'string', pattern: '^[0-9]+$', description: 'Enrollment ID' },
  },
};

const paymentStatusDataSchema = {
  type: 'object',
  properties: {
    hasPayment: { type: 'boolean', description: 'Indicates if payment exists' },
    status: { type: ['string', 'null'], description: 'Payment status' },
    transaction_code: { type: ['string', 'null'], description: 'Transaction code' },
    amount: { type: ['number', 'null'], description: 'Payment amount' },
    currency: { type: 'string', default: 'IDR', description: 'Currency' },
    payment_method: { type: ['string', 'null'], description: 'Payment method' },
    paid_at: { type: ['string', 'null'], format: 'date-time', description: 'Payment timestamp' },
    created_at: { type: ['string', 'null'], format: 'date-time', description: 'Creation timestamp' },
  },
};

const checkEnrollmentQuerySchema = {
  type: 'object',
  required: ['academy_id'],
  properties: {
    academy_id: { type: 'integer', description: 'Academy ID' },
  },
};

const checkEnrollmentDataSchema = {
  type: 'object',
  properties: {
    enrolled: { type: 'boolean', description: 'Whether user is enrolled (active or completed)' },
    hasPendingPayment: { type: 'boolean', description: 'Whether user has an incomplete pending payment' },
    enrollment_id: { type: 'integer', description: 'Enrollment ID' },
    status: { type: ['string', 'null'], description: 'Enrollment status' },
    payment_status: { type: ['string', 'null'], description: 'Payment status' },
    snap_token: { type: ['string', 'null'], description: 'Existing Midtrans snap token if still valid' },
    transaction_code: { type: ['string', 'null'], description: 'Existing transaction code if still valid' },
  },
};

const transactionCodeParamSchema = {
  type: 'object',
  properties: {
    transactionCode: { type: 'string', description: 'Transaction code' },
  },
};

const transactionListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1, description: 'Page number' },
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 10, description: 'Items per page' },
    status: { type: 'string', enum: ['pending', 'paid', 'failed', 'expired'], description: 'Filter by status' },
  },
};

const transactionListItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    transaction_code: { type: 'string' },
    product_type: { type: 'string' },
    amount: { type: 'number' },
    currency: { type: 'string' },
    status: { type: 'string' },
    payment_method: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    paid_at: { type: ['string', 'null'], format: 'date-time' },
    expired_at: { type: ['string', 'null'], format: 'date-time' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          product_name: { type: 'string' },
          quantity: { type: 'integer' },
          unit_price: { type: 'number' },
          total_price: { type: 'number' },
        },
      },
    },
  },
};

const transactionDetailSchema = {
  type: 'object',
  properties: {
    ...transactionListItemSchema.properties,
    customer_name: { type: 'string' },
    customer_email: { type: 'string' },
    provider: { type: 'string' },
    provider_reference: { type: ['string', 'null'] },
  },
};

export const createAcademyTransactionSchema = {
  tags: ['Academy Payments'],
  summary: 'Create academy enrollment payment',
  body: createTransactionBodySchema,
  response: {
    200: createSuccessResponseSchema(transactionDataSchema, 'Transaction created'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    404: createErrorResponseSchema(404, 'Not Found'),
    409: createErrorResponseSchema(409, 'Conflict'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAcademyPaymentStatusSchema = {
  tags: ['Academy Payments'],
  summary: 'Get academy enrollment payment status',
  params: enrollmentIdParamSchema,
  response: {
    200: createSuccessResponseSchema(paymentStatusDataSchema, 'Status retrieved'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const checkAcademyEnrollmentSchema = {
  tags: ['Academy Payments'],
  summary: 'Check if user is enrolled in academy',
  querystring: checkEnrollmentQuerySchema,
  response: {
    200: createSuccessResponseSchema(checkEnrollmentDataSchema, 'Enrollment status retrieved'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserTransactionsSchema = {
  tags: ['User Transactions'],
  summary: 'Get user transaction history',
  querystring: transactionListQuerySchema,
  response: {
    200: createPaginatedResponseSchema(transactionListItemSchema, 'Transactions retrieved'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserTransactionDetailSchema = {
  tags: ['User Transactions'],
  summary: 'Get transaction detail',
  params: transactionCodeParamSchema,
  response: {
    200: createSuccessResponseSchema(transactionDetailSchema, 'Transaction detail retrieved'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
