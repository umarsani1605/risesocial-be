/**
 * RYLS Payment Schemas for Fastify Validation
 * Defines request/response schemas for payment endpoints
 */

/**
 * Common response schemas
 */
const baseResponseSchema = {
  type: 'object',
  required: ['success', 'message', 'timestamp'],
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

const errorResponseSchema = {
  ...baseResponseSchema,
  properties: {
    ...baseResponseSchema.properties,
    details: { type: 'string' },
  },
};

const createSuccessResponseSchema = (dataSchema) => ({
  ...baseResponseSchema,
  properties: {
    ...baseResponseSchema.properties,
    data: dataSchema,
  },
});

/**
 * Payment-specific schemas
 */

const paymentStatusDataSchema = {
  type: 'object',
  required: ['hasPayment', 'status', 'orderId', 'amount'],
  properties: {
    hasPayment: { type: 'boolean' },
    status: {
      type: ['string', 'null'],
      enum: ['pending', 'capture', 'settlement', 'deny', 'cancel', 'expire', 'refund', 'chargeback', null],
    },
    orderId: { type: ['string', 'null'] },
    amount: { type: ['number', 'null'] },
    currency: { type: 'string', default: 'IDR' },
    paymentType: { type: ['string', 'null'] },
    paidAt: { type: ['string', 'null'], format: 'date-time' },
    createdAt: { type: ['string', 'null'], format: 'date-time' },
  },
};

const paymentStatisticsDataSchema = {
  type: 'object',
  required: ['totalPayments', 'pendingPayments', 'successfulPayments', 'failedPayments', 'totalAmountIdr', 'successRate'],
  properties: {
    totalPayments: { type: 'number' },
    pendingPayments: { type: 'number' },
    successfulPayments: { type: 'number' },
    failedPayments: { type: 'number' },
    totalAmountIdr: { type: 'number' },
    successRate: { type: 'number' },
  },
};

const webhookProcessingDataSchema = {
  type: 'object',
  required: ['success', 'orderId', 'transactionStatus', 'registrationStatus', 'paymentId'],
  properties: {
    success: { type: 'boolean' },
    orderId: { type: 'string' },
    transactionStatus: { type: 'string' },
    registrationStatus: { type: 'string' },
    paymentId: { type: 'number' },
  },
};

export const webhookNotificationRequestSchema = {
  type: 'object',
  required: ['order_id', 'transaction_status', 'status_code', 'gross_amount', 'signature_key'],
  properties: {
    order_id: { type: 'string' },
    transaction_status: {
      type: 'string',
      enum: ['pending', 'capture', 'settlement', 'deny', 'cancel', 'expire', 'refund', 'chargeback'],
    },
    status_code: { type: 'string' },
    gross_amount: { type: 'string' },
    signature_key: { type: 'string' },
    transaction_id: { type: 'string' },
    payment_type: { type: 'string' },
    fraud_status: {
      type: 'string',
      enum: ['accept', 'challenge', 'deny'],
    },
    transaction_time: { type: 'string' },
    settlement_time: { type: 'string' },
    // Additional fields that might come from different payment methods
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

export const paymentStatisticsRequestSchema = {
  type: 'object',
  properties: {
    dateFrom: { type: 'string', format: 'date' },
    dateTo: { type: 'string', format: 'date' },
    scholarshipType: {
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
    },
  },
  additionalProperties: false,
};

/**
 * Response schemas
 */

export const paymentStatusResponseSchema = createSuccessResponseSchema(paymentStatusDataSchema);

export const paymentStatisticsResponseSchema = createSuccessResponseSchema(paymentStatisticsDataSchema);

export const webhookNotificationResponseSchema = {
  type: 'object',
  required: ['success'],
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: webhookProcessingDataSchema,
  },
};

export const paymentErrorResponseSchema = errorResponseSchema;

/**
 * Route parameter schemas
 */
export const registrationIdParamSchema = {
  type: 'object',
  required: ['registrationId'],
  properties: {
    registrationId: { type: 'string', pattern: '^[0-9]+$' },
  },
};

export const orderIdParamSchema = {
  type: 'object',
  required: ['orderId'],
  properties: {
    orderId: { type: 'string', pattern: '^RYLS[0-9]+$' },
  },
};

/**
 * Query parameter schemas
 */
export const paymentStatusQuerySchema = {
  type: 'object',
  properties: {
    includeDetails: { type: 'string', enum: ['true', 'false'] },
  },
  additionalProperties: false,
};

/**
 * Complete route schemas for Fastify
 */
export const createTransactionSchema = {
  body: {
    type: 'object',
    required: ['type', 'data'],
    properties: {
      type: {
        type: 'string',
        enum: ['PAYPAL', 'MIDTRANS'],
        description: 'The type of payment method being used',
      },
      data: {
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
          fullName: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          residence: { type: 'string', minLength: 1 },
          nationality: { type: 'string', minLength: 1 },
          secondNationality: { type: 'string' },
          whatsapp: { type: 'string', minLength: 1 },
          institution: { type: 'string', minLength: 1 },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'] },
          discoverSource: { type: 'string', enum: ['RISE_INSTAGRAM', 'OTHER_INSTAGRAM', 'FRIENDS', 'OTHER'] },
          discoverOtherText: { type: 'string' },
          scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
          paymentProof: {
            type: 'string',
            description: 'Required for PAYPAL payments',
          },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
};

export const webhookNotificationSchema = {
  body: webhookNotificationRequestSchema,
  response: {
    200: webhookNotificationResponseSchema,
    400: paymentErrorResponseSchema,
    500: paymentErrorResponseSchema,
  },
};

export const paymentStatusSchema = {
  params: registrationIdParamSchema,
  querystring: paymentStatusQuerySchema,
  response: {
    200: paymentStatusResponseSchema,
    404: paymentErrorResponseSchema,
    500: paymentErrorResponseSchema,
  },
};

export const paymentStatisticsSchema = {
  querystring: paymentStatisticsRequestSchema,
  response: {
    200: paymentStatisticsResponseSchema,
    500: paymentErrorResponseSchema,
  },
};

export const cancelPaymentSchema = {
  params: orderIdParamSchema,
  response: {
    200: createSuccessResponseSchema({
      type: 'object',
      required: ['success', 'orderId', 'previousStatus', 'newStatus'],
      properties: {
        success: { type: 'boolean' },
        orderId: { type: 'string' },
        previousStatus: { type: 'string' },
        newStatus: { type: 'string' },
      },
    }),
    400: paymentErrorResponseSchema,
    404: paymentErrorResponseSchema,
    500: paymentErrorResponseSchema,
  },
};

// Log schema configuration
console.log('[PaymentSchemas] Payment validation schemas loaded');
console.log('[PaymentSchemas] Available schemas: createTransaction, webhookNotification, paymentStatus, paymentStatistics, cancelPayment');
console.log('[PaymentSchemas] Webhook accepts additional Midtrans fields for flexibility');
