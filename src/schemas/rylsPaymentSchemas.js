/**
 * RYLS Payment Schemas for Fastify Validation
 * Defines request/response schemas for payment endpoints
 */

import {
  createSuccessResponseSchema,
  createErrorResponseSchema,
  idParamSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

/**
 * Payment-specific data schemas
 */

const paymentStatusDataSchema = {
  type: 'object',
  properties: {
    hasPayment: { 
      type: 'boolean',
      description: 'Indicates if payment exists for this registration'
    },
    status: {
      type: ['string', 'null'],
      enum: ['pending', 'capture', 'settlement', 'deny', 'cancel', 'expire', 'refund', 'chargeback', null],
      description: 'Current payment transaction status'
    },
    orderId: { 
      type: ['string', 'null'],
      description: 'Unique order identifier'
    },
    amount: { 
      type: ['number', 'null'],
      description: 'Payment amount in IDR'
    },
    currency: { 
      type: 'string',
      default: 'IDR',
      description: 'Payment currency'
    },
    paymentType: { 
      type: ['string', 'null'],
      description: 'Payment method type (e.g., credit_card, bank_transfer)'
    },
    paidAt: { 
      type: ['string', 'null'],
      format: 'date-time',
      description: 'Payment completion timestamp'
    },
    createdAt: { 
      type: ['string', 'null'],
      format: 'date-time',
      description: 'Payment creation timestamp'
    },
  },
};

const paymentStatisticsDataSchema = {
  type: 'object',
  properties: {
    totalPayments: { 
      type: 'number',
      description: 'Total number of payments'
    },
    pendingPayments: { 
      type: 'number',
      description: 'Number of pending payments'
    },
    successfulPayments: { 
      type: 'number',
      description: 'Number of successful payments'
    },
    failedPayments: { 
      type: 'number',
      description: 'Number of failed payments'
    },
    totalAmountIdr: { 
      type: 'number',
      description: 'Total payment amount in IDR'
    },
    successRate: { 
      type: 'number',
      description: 'Payment success rate percentage'
    },
  },
};

const transactionDataSchema = {
  type: 'object',
  properties: {
    payment_id: {
      type: 'integer',
      description: 'Payment record ID'
    },
    order_id: {
      type: 'string',
      description: 'Unique order identifier'
    },
    amount: {
      type: 'number',
      description: 'Payment amount in IDR'
    },
    currency: {
      type: 'string',
      description: 'Payment currency'
    },
    token: {
      type: ['string', 'null'],
      description: 'Midtrans snap token for payment page'
    },
    redirect_url: {
      type: ['string', 'null'],
      description: 'Midtrans payment page URL'
    },
  },
};

const cancelPaymentDataSchema = {
  type: 'object',
  properties: {
    success: { 
      type: 'boolean',
      description: 'Cancellation success status'
    },
    orderId: { 
      type: 'string',
      description: 'Cancelled order ID'
    },
    previousStatus: { 
      type: 'string',
      description: 'Payment status before cancellation'
    },
    newStatus: { 
      type: 'string',
      description: 'Payment status after cancellation'
    },
  },
};

const webhookProcessingDataSchema = {
  type: 'object',
  properties: {
    success: { 
      type: 'boolean',
      description: 'Webhook processing success status'
    },
    orderId: { 
      type: 'string',
      description: 'Order ID from webhook'
    },
    transactionStatus: { 
      type: 'string',
      description: 'Transaction status from Midtrans'
    },
    registrationStatus: { 
      type: 'string',
      description: 'Updated registration status'
    },
    paymentId: { 
      type: 'number',
      description: 'Payment record ID'
    },
  },
};

/**
 * Request body schemas
 */

const registrationDataSchema = {
  type: 'object',
  required: [
    'fullName',
    'email',
    'residence',
    'nationality',
    'whatsapp',
    'institution',
    'dateOfBirth',
    'gender',
    'discoverSource',
    'scholarshipType',
  ],
  properties: {
    fullName: { 
      type: 'string',
      minLength: 1,
      maxLength: 255,
      description: 'Full name of the applicant'
    },
    email: { 
      type: 'string',
      format: 'email',
      description: 'Email address'
    },
    residence: { 
      type: 'string',
      minLength: 1,
      maxLength: 255,
      description: 'Current residence/address'
    },
    nationality: { 
      type: 'string',
      minLength: 1,
      maxLength: 100,
      description: 'Primary nationality'
    },
    secondNationality: { 
      type: 'string',
      maxLength: 100,
      description: 'Secondary nationality (optional)'
    },
    whatsapp: { 
      type: 'string',
      minLength: 1,
      maxLength: 50,
      description: 'WhatsApp number'
    },
    institution: { 
      type: 'string',
      minLength: 1,
      maxLength: 255,
      description: 'Educational institution'
    },
    dateOfBirth: { 
      type: 'string',
      format: 'date',
      description: 'Date of birth (YYYY-MM-DD)'
    },
    gender: { 
      type: 'string',
      enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'],
      description: 'Gender'
    },
    discoverSource: { 
      type: 'string',
      enum: ['RISE_INSTAGRAM', 'OTHER_INSTAGRAM', 'FRIENDS', 'OTHER'],
      description: 'How did you discover RYLS'
    },
    discoverOtherText: { 
      type: 'string',
      maxLength: 500,
      description: 'Additional details if discoverSource is OTHER'
    },
    scholarshipType: { 
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
      description: 'Type of scholarship'
    },
    paymentProof: {
      type: 'string',
      description: 'Payment proof file ID (required for PAYPAL payments)'
    },
  },
  additionalProperties: false,
};

const createTransactionBodySchema = {
  type: 'object',
  required: ['type', 'data'],
  properties: {
    type: {
      type: 'string',
      enum: ['PAYPAL', 'MIDTRANS'],
      description: 'Payment method type'
    },
    data: registrationDataSchema,
  },
  additionalProperties: false,
};

const webhookNotificationBodySchema = {
  type: 'object',
  properties: {
    order_id: { 
      type: 'string',
      description: 'Order ID from Midtrans'
    },
    transaction_status: {
      type: 'string',
      enum: ['pending', 'capture', 'settlement', 'deny', 'cancel', 'expire', 'refund', 'chargeback'],
      description: 'Transaction status from Midtrans'
    },
    status_code: { 
      type: 'string',
      description: 'Status code from Midtrans'
    },
    gross_amount: { 
      type: 'string',
      description: 'Transaction amount'
    },
    signature_key: { 
      type: 'string',
      description: 'Signature for verification'
    },
    transaction_id: { 
      type: 'string',
      description: 'Transaction ID from Midtrans'
    },
    payment_type: { 
      type: 'string',
      description: 'Payment method used'
    },
    fraud_status: {
      type: 'string',
      enum: ['accept', 'challenge', 'deny'],
      description: 'Fraud detection status'
    },
    transaction_time: { 
      type: 'string',
      description: 'Transaction timestamp'
    },
    settlement_time: { 
      type: 'string',
      description: 'Settlement timestamp'
    },
    // Additional fields from different payment methods
    va_numbers: { type: 'array' },
    bill_key: { type: 'string' },
    biller_code: { type: 'string' },
    permata_va_number: { type: 'string' },
    store: { type: 'string' },
    payment_code: { type: 'string' },
    masked_card: { type: 'string' },
    bank: { type: 'string' },
    eci: { type: 'string' },
    approval_code: { type: 'string' },
    card_type: { type: 'string' },
    channel_response_code: { type: 'string' },
    channel_response_message: { type: 'string' },
  },
  additionalProperties: true, // Allow additional fields from Midtrans
};

/**
 * Parameter schemas
 */

const registrationIdParamSchema = {
  type: 'object',
  properties: {
    registrationId: { 
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Registration ID'
    },
  },
};

const orderIdParamSchema = {
  type: 'object',
  properties: {
    orderId: { 
      type: 'string',
      pattern: '^RYLS[0-9]+$',
      description: 'Order ID (format: RYLS followed by numbers)'
    },
  },
};

/**
 * Query parameter schemas
 */

const paymentStatusQuerySchema = {
  type: 'object',
  properties: {
    includeDetails: { 
      type: 'string',
      enum: ['true', 'false'],
      description: 'Include detailed payment information'
    },
  },
  additionalProperties: false,
};

const paymentStatisticsQuerySchema = {
  type: 'object',
  properties: {
    dateFrom: { 
      type: 'string',
      format: 'date',
      description: 'Start date for statistics (YYYY-MM-DD)'
    },
    dateTo: { 
      type: 'string',
      format: 'date',
      description: 'End date for statistics (YYYY-MM-DD)'
    },
    scholarshipType: {
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
      description: 'Filter by scholarship type'
    },
  },
  additionalProperties: false,
};

/**
 * Complete route schemas for Fastify
 */

export const createTransactionSchema = {
  tags: ['RYLS Payments'],
  summary: 'Create payment transaction',
  description: 'Creates a new payment transaction for RYLS registration',
  body: createTransactionBodySchema,
  response: {
    200: createSuccessResponseSchema(transactionDataSchema, 'Transaction created successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const webhookNotificationSchema = {
  tags: ['RYLS Payments'],
  summary: 'Payment webhook notification',
  description: 'Handles payment webhook notifications from Midtrans',
  body: webhookNotificationBodySchema,
  response: {
    200: createSuccessResponseSchema(webhookProcessingDataSchema, 'Webhook processed successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid webhook data'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getPaymentStatusSchema = {
  tags: ['RYLS Payments'],
  summary: 'Get payment status',
  description: 'Retrieves payment status for a specific RYLS registration',
  params: registrationIdParamSchema,
  querystring: paymentStatusQuerySchema,
  response: {
    200: createSuccessResponseSchema(paymentStatusDataSchema, 'Payment status retrieved successfully'),
    404: createErrorResponseSchema(404, 'Not Found - Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getPaymentStatisticsSchema = {
  tags: ['RYLS Payments'],
  summary: 'Get payment statistics',
  description: 'Retrieves payment statistics for RYLS registrations',
  querystring: paymentStatisticsQuerySchema,
  response: {
    200: createSuccessResponseSchema(paymentStatisticsDataSchema, 'Statistics retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const cancelPaymentSchema = {
  tags: ['RYLS Payments'],
  summary: 'Cancel payment',
  description: 'Cancels a payment transaction by order ID',
  params: orderIdParamSchema,
  response: {
    200: createSuccessResponseSchema(cancelPaymentDataSchema, 'Payment cancelled successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Cannot cancel payment'),
    404: createErrorResponseSchema(404, 'Not Found - Payment not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const healthCheckSchema = {
  tags: ['RYLS Payments'],
  summary: 'Health check',
  description: 'Check payment service health status',
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Service status' },
          services: {
            type: 'object',
            properties: {
              database: { type: 'string', description: 'Database connection status' },
              midtrans: { type: 'string', description: 'Midtrans configuration status' },
            },
          },
        },
      },
      'Service is healthy'
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
