import { createSuccessResponseSchema, createErrorResponseSchema } from '../shared/baseSchemas.js';

const paymentStatusDataSchema = {
  type: 'object',
  properties: {
    hasPayment: { type: 'boolean', description: 'Indicates if payment exists' },
    status: { type: ['string', 'null'], description: 'Payment status' },
    orderId: { type: ['string', 'null'], description: 'Order identifier' },
    amount: { type: ['number', 'null'], description: 'Payment amount' },
    currency: { type: 'string', default: 'IDR', description: 'Currency' },
    paymentType: { type: ['string', 'null'], description: 'Payment method type' },
    paidAt: { type: ['string', 'null'], format: 'date-time', description: 'Payment timestamp' },
    createdAt: { type: ['string', 'null'], format: 'date-time', description: 'Creation timestamp' },
  },
};

const transactionDataSchema = {
  type: 'object',
  properties: {
    payment_id: { type: 'integer', description: 'Payment record ID' },
    order_id: { type: 'string', description: 'Order identifier' },
    amount: { type: 'number', description: 'Payment amount' },
    currency: { type: 'string', description: 'Currency' },
    token: { type: ['string', 'null'], description: 'Midtrans snap token' },
    redirect_url: { type: ['string', 'null'], description: 'Payment page URL' },
  },
};

const registrationIdParamSchema = {
  type: 'object',
  properties: {
    registrationId: { type: 'string', pattern: '^[0-9]+$', description: 'Registration ID' },
  },
};

const createTransactionBodySchema = {
  type: 'object',
  required: ['type', 'data'],
  properties: {
    type: { type: 'string', enum: ['PAYPAL', 'MIDTRANS'], description: 'Payment method' },
    data: { type: 'object', description: 'Registration data' },
  },
};

const webhookNotificationBodySchema = {
  type: 'object',
  properties: {
    order_id: { type: 'string' },
    transaction_status: { type: 'string' },
    status_code: { type: 'string' },
    gross_amount: { type: 'string' },
    signature_key: { type: 'string' },
  },
  additionalProperties: true,
};

export const createTransactionSchema = {
  tags: ['RYLS Payments'],
  summary: 'Create payment transaction',
  body: createTransactionBodySchema,
  response: {
    200: createSuccessResponseSchema(transactionDataSchema, 'Transaction created'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const webhookNotificationSchema = {
  tags: ['RYLS Payments'],
  summary: 'Payment webhook notification',
  body: webhookNotificationBodySchema,
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Webhook processed'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getPaymentStatusSchema = {
  tags: ['RYLS Payments'],
  summary: 'Get payment status',
  params: registrationIdParamSchema,
  response: {
    200: createSuccessResponseSchema(paymentStatusDataSchema, 'Status retrieved'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export { registrationIdParamSchema };
