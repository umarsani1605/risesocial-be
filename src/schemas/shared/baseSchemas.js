export const successResponseSchema = {
  type: 'object',

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

export const errorResponseSchema = {
  type: 'object',
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

export const idParamSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      description: 'Resource ID',
    },
  },
};

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

export function createSuccessResponseSchema(dataSchema, description = 'Successful response') {
  return {
    description,
    type: 'object',

    properties: {
      ...successResponseSchema.properties,
      data: dataSchema,
    },
  };
}

export function createPaginatedResponseSchema(itemSchema, description = 'Paginated response') {
  return {
    description,
    type: 'object',

    properties: {
      ...successResponseSchema.properties,
      data: {
        type: 'array',
        items: itemSchema,
      },
      meta: {
        type: 'object',

        properties: successResponseSchema.properties.meta.properties,
      },
    },
  };
}

export function createErrorResponseSchema(statusCode, description = 'Error response') {
  return {
    description,
    type: 'object',

    properties: {
      ...errorResponseSchema.properties,
      statusCode: {
        type: 'integer',
      },
    },
  };
}
