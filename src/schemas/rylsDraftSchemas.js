import { createSuccessResponseSchema, createErrorResponseSchema } from './shared/baseSchemas.js';

const saveDraftBodySchema = {
  type: 'object',
  required: ['email', 'step', 'formData'],
  properties: {
    email: { type: 'string', format: 'email', description: 'Applicant email' },
    resumeToken: { type: 'string', minLength: 1, description: 'Existing draft token (optional)' },
    step: { type: 'integer', minimum: 1, maximum: 3, description: 'Current form step' },
    formData: { type: 'object', description: 'Form data for current step' },
    scholarshipType: {
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
      description: 'Scholarship type (optional)',
    },
  },
};

const draftResponseDataSchema = {
  type: 'object',
  properties: {
    resumeToken: { type: 'string' },
    currentStep: { type: 'integer' },
    formData: { type: 'object' },
    scholarshipType: { type: ['string', 'null'] },
    email: { type: 'string' },
  },
};

const saveDraftResponseDataSchema = {
  type: 'object',
  properties: {
    resumeToken: { type: 'string' },
    currentStep: { type: 'integer' },
    savedAt: { type: 'string', format: 'date-time' },
  },
};

const statsResponseDataSchema = {
  type: 'object',
  properties: {
    count: { type: 'integer' },
  },
};

const draftsListResponseDataSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: draftResponseDataSchema },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
  },
};

export const saveDraftSchema = {
  description: 'Save or update a RYLS draft registration',
  tags: ['RYLS Draft'],
  body: saveDraftBodySchema,
  response: {
    200: createSuccessResponseSchema(saveDraftResponseDataSchema, 'Draft saved', 200),
    400: createErrorResponseSchema(400, 'Validation failed'),
    500: createErrorResponseSchema(500, 'Internal server error'),
  },
};

export const getDraftSchema = {
  description: 'Get a RYLS draft by resume token',
  tags: ['RYLS Draft'],
  params: {
    type: 'object',
    properties: { token: { type: 'string', minLength: 1 } },
    required: ['token'],
  },
  response: {
    200: createSuccessResponseSchema(draftResponseDataSchema, 'Draft retrieved', 200),
    404: createErrorResponseSchema(404, 'Draft not found'),
    500: createErrorResponseSchema(500, 'Internal server error'),
  },
};

export const deleteDraftSchema = {
  description: 'Delete a RYLS draft by resume token',
  tags: ['RYLS Draft'],
  params: {
    type: 'object',
    properties: { token: { type: 'string', minLength: 1 } },
    required: ['token'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Draft deleted', 200),
    500: createErrorResponseSchema(500, 'Internal server error'),
  },
};

export const adminGetDraftsSchema = {
  description: 'Admin: list all draft registrations',
  tags: ['Admin RYLS Draft'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    },
  },
  response: {
    200: createSuccessResponseSchema(draftsListResponseDataSchema, 'Drafts retrieved', 200),
    500: createErrorResponseSchema(500, 'Internal server error'),
  },
};

export const adminGetDraftStatsSchema = {
  description: 'Admin: get draft registration statistics',
  tags: ['Admin RYLS Draft'],
  response: {
    200: createSuccessResponseSchema(statsResponseDataSchema, 'Stats retrieved', 200),
    500: createErrorResponseSchema(500, 'Internal server error'),
  },
};

export const adminCleanupDraftsSchema = {
  description: 'Admin: delete draft registrations',
  tags: ['Admin RYLS Draft'],
  response: {
    200: createSuccessResponseSchema(statsResponseDataSchema, 'Cleanup complete', 200),
    500: createErrorResponseSchema(500, 'Internal server error'),
  },
};
