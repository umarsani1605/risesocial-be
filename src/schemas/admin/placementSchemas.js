import { createSuccessResponseSchema, createPaginatedResponseSchema, createErrorResponseSchema } from '../shared/baseSchemas.js';

const placementSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_enrollment_id: { type: 'integer' },
    cohort_id: { type: 'integer' },
    user_id: { type: 'integer' },
    academy_id: { type: 'integer' },
    notes: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
  },
};

const enrollmentItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    user_id: { type: 'integer' },
    academy_id: { type: 'integer' },
    status: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    user: {
      type: ['object', 'null'],
      properties: {
        id: { type: 'integer' },
        first_name: { type: ['string', 'null'] },
        last_name: { type: ['string', 'null'] },
        email: { type: 'string' },
      },
    },
    academy: {
      type: ['object', 'null'],
      properties: {
        id: { type: 'integer' },
        title: { type: 'string' },
      },
    },
    placement: { type: ['object', 'null'] },
  },
};

export const listEnrollmentsSchema = {
  tags: ['Admin - Placements'],
  summary: 'List academy enrollments',
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      status: { type: 'string', enum: ['pending', 'active', 'completed', 'cancelled'] },
      placed: { type: 'boolean' },
      academy_id: { type: 'integer' },
      user_id: { type: 'integer' },
    },
    additionalProperties: false,
  },
  response: {
    200: createPaginatedResponseSchema(enrollmentItemSchema, 'List of enrollments'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getEnrollmentSchema = {
  tags: ['Admin - Placements'],
  summary: 'Get enrollment detail',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(enrollmentItemSchema, 'Enrollment detail'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const assignToCohortSchema = {
  tags: ['Admin - Placements'],
  summary: 'Assign enrollment to cohort',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
    additionalProperties: false,
  },
  body: {
    type: 'object',
    required: ['cohort_id'],
    properties: {
      cohort_id: { type: 'integer' },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(placementSchema, 'Placement created'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
    404: createErrorResponseSchema(404, 'Not Found'),
    409: createErrorResponseSchema(409, 'Conflict'),
    422: createErrorResponseSchema(422, 'Unprocessable Entity'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const cancelEnrollmentSchema = {
  tags: ['Admin - Placements'],
  summary: 'Cancel enrollment',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
    additionalProperties: false,
  },
  body: {
    type: 'object',
    properties: {
      reason: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Enrollment cancelled'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const transferPlacementSchema = {
  tags: ['Admin - Placements'],
  summary: 'Transfer placement to new cohort',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
    additionalProperties: false,
  },
  body: {
    type: 'object',
    required: ['cohort_id'],
    properties: {
      cohort_id: { type: 'integer' },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(placementSchema, 'Placement transferred'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
    404: createErrorResponseSchema(404, 'Not Found'),
    409: createErrorResponseSchema(409, 'Conflict'),
    422: createErrorResponseSchema(422, 'Unprocessable Entity'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const dropPlacementSchema = {
  tags: ['Admin - Placements'],
  summary: 'Drop placement (enrollment stays active)',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
    additionalProperties: false,
  },
  body: {
    type: 'object',
    properties: {
      reason: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Placement dropped'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
