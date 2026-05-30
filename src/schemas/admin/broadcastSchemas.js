import { createSuccessResponseSchema, createErrorResponseSchema } from '../shared/baseSchemas.js';
import { BROADCAST_SEGMENT_VALUES } from '../../constants/broadcast.js';

const createdByUserSchema = {
  type: ['object', 'null'],
  properties: {
    id: { type: 'integer' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string' },
  },
};

const broadcastEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    subject: { type: 'string' },
    body_text: { type: 'string' },
    sender_email: { type: 'string' },
    sender_name: { type: 'string' },
    segment: { type: 'string' },
    segment_criteria: { type: ['object', 'null'], additionalProperties: true },
    recipient_count: { type: 'integer' },
    brevo_tag: { type: ['string', 'null'] },
    message_ids: { type: 'array', items: { type: 'string' } },
    status: { type: 'string' },
    error_detail: { type: ['string', 'null'] },
    created_by: { type: 'integer' },
    requests: { type: 'integer' },
    delivered: { type: 'integer' },
    opens: { type: 'integer' },
    unique_opens: { type: 'integer' },
    clicks: { type: 'integer' },
    unique_clicks: { type: 'integer' },
    hard_bounces: { type: 'integer' },
    soft_bounces: { type: 'integer' },
    spam_reports: { type: 'integer' },
    blocked: { type: 'integer' },
    invalid: { type: 'integer' },
    unsubscribed: { type: 'integer' },
    sent_at: { type: ['string', 'null'], format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    created_by_user: createdByUserSchema,
  },
};

const senderSchema = {
  type: 'object',
  properties: {
    id: { type: ['integer', 'null'] },
    name: { type: 'string' },
    email: { type: 'string' },
    active: { type: 'boolean' },
  },
};

const segmentCriteriaSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    emails: { type: 'string', description: 'Newline/comma/semicolon separated list for custom_list segment' },
  },
};

export const getSendersSchema = {
  tags: ['Admin - Broadcasts'],
  summary: 'List verified Brevo senders',
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: senderSchema }, 'List of senders'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getSegmentCountsSchema = {
  tags: ['Admin - Broadcasts'],
  summary: 'Recipient counts for the fixed (DB-backed) segments',
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          all_users: { type: 'integer' },
          program_subscribers: { type: 'integer' },
          job_subscribers: { type: 'integer' },
          ryls_submitted: { type: 'integer' },
        },
      },
      'Segment recipient counts',
    ),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
  },
};

export const previewRecipientsSchema = {
  tags: ['Admin - Broadcasts'],
  summary: 'Resolve a segment and return the recipient count (no send)',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['segment'],
    properties: {
      segment: { type: 'string', enum: BROADCAST_SEGMENT_VALUES },
      segment_criteria: segmentCriteriaSchema,
    },
  },
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          count: { type: 'integer' },
          blocked: { type: 'boolean' },
          limit: { type: 'integer' },
          sample: { type: 'array', items: { type: 'string' } },
        },
      },
      'Recipient preview',
    ),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
  },
};

export const createBroadcastSchema = {
  tags: ['Admin - Broadcasts'],
  summary: 'Create and send a broadcast',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['subject', 'body_text', 'sender_email', 'sender_name', 'segment'],
    properties: {
      subject: { type: 'string', minLength: 1, maxLength: 255 },
      body_text: { type: 'string', minLength: 1, maxLength: 200000 },
      sender_email: { type: 'string', format: 'email' },
      sender_name: { type: 'string', minLength: 1, maxLength: 255 },
      segment: { type: 'string', enum: BROADCAST_SEGMENT_VALUES },
      segment_criteria: segmentCriteriaSchema,
    },
  },
  response: {
    202: createSuccessResponseSchema(broadcastEntitySchema, 'Broadcast accepted for sending'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
  },
};

export const listBroadcastsSchema = {
  tags: ['Admin - Broadcasts'],
  summary: 'List all broadcasts',
  description: 'Returns every broadcast. The client handles filtering and pagination.',
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(
      { type: 'array', items: broadcastEntitySchema },
      'List of broadcasts',
    ),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
  },
};

export const getBroadcastByIdSchema = {
  tags: ['Admin - Broadcasts'],
  summary: 'Get a broadcast by id',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema(broadcastEntitySchema, 'Broadcast detail'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
  },
};

export const uploadBroadcastImageSchema = {
  tags: ['Admin - Broadcasts'],
  summary: 'Upload an image for use in a broadcast body',
  security: [{ bearerAuth: [] }],
  consumes: ['multipart/form-data'],
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: { url: { type: 'string' } },
      },
      'Uploaded image URL',
    ),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
  },
};

export const refreshStatsSchema = {
  tags: ['Admin - Broadcasts'],
  summary: 'Refresh aggregate stats from Brevo by tag',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema(broadcastEntitySchema, 'Updated broadcast with refreshed stats'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
  },
};
