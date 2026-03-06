/**
 * System Settings Schemas for Fastify Validation
 * Defines request/response schemas for system settings endpoints
 */

import {
  createSuccessResponseSchema,
  createErrorResponseSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

/**
 * Data schemas
 */

const settingDataSchema = {
  type: 'object',
  properties: {
    key: { type: 'string', description: 'Setting key' },
    value: { description: 'Setting value (can be any type)' },
    description: { type: ['string', 'null'], description: 'Setting description' },
    ...timestampFieldsSchema,
  },
};

const linkedInRateLimitDataSchema = {
  type: 'object',
  properties: {
    jobs: {
      type: 'object',
      properties: {
        remaining: { type: 'integer', description: 'Remaining job API calls' },
        limit: { type: 'integer', description: 'Total job API limit' },
        reset: { type: 'string', format: 'date-time', description: 'Reset timestamp' },
      },
    },
    requests: {
      type: 'object',
      properties: {
        remaining: { type: 'integer', description: 'Remaining general API calls' },
        limit: { type: 'integer', description: 'Total general API limit' },
        reset: { type: 'string', format: 'date-time', description: 'Reset timestamp' },
      },
    },
    last_updated: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
  },
};

/**
 * Request body schemas
 */

const setSettingBodySchema = {
  type: 'object',
  required: ['value'],
  properties: {
    value: {
      description: 'Setting value (can be any type: string, number, boolean, object, array)',
    },
    description: {
      type: 'string',
      maxLength: 500,
      description: 'Optional description of the setting',
    },
  },
  additionalProperties: false,
};

/**
 * Parameter schemas
 */

const settingKeyParamSchema = {
  type: 'object',
  properties: {
    key: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      description: 'Setting key',
    },
  },
};

/**
 * Complete route schemas
 */

export const getAllSettingsSchema = {
  summary: 'Get all settings',
  description: 'Retrieve all system settings',
  tags: ['Admin System Settings'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'array',
        items: settingDataSchema,
      },
      'Settings retrieved successfully'
    ),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getLinkedInRateLimitSchema = {
  summary: 'Get LinkedIn rate limit',
  description: 'Retrieve LinkedIn API rate limit information',
  tags: ['Admin System Settings'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(linkedInRateLimitDataSchema, 'Rate limit retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Rate limit data not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getSettingSchema = {
  summary: 'Get setting by key',
  description: 'Retrieve a specific system setting by key',
  tags: ['Admin System Settings'],
  security: [{ bearerAuth: [] }],
  params: settingKeyParamSchema,
  response: {
    200: createSuccessResponseSchema(settingDataSchema, 'Setting retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Setting not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const setSettingSchema = {
  summary: 'Set setting',
  description: 'Create or update a system setting',
  tags: ['Admin System Settings'],
  security: [{ bearerAuth: [] }],
  params: settingKeyParamSchema,
  body: setSettingBodySchema,
  response: {
    200: createSuccessResponseSchema(settingDataSchema, 'Setting updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteSettingSchema = {
  summary: 'Delete setting',
  description: 'Delete a system setting by key',
  tags: ['Admin System Settings'],
  security: [{ bearerAuth: [] }],
  params: settingKeyParamSchema,
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          deleted: { type: 'boolean', description: 'Deletion success status' },
          key: { type: 'string', description: 'Deleted setting key' },
        },
      },
      'Setting deleted successfully'
    ),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Setting not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
