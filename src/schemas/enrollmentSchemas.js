/**
 * Enrollment Schemas for Fastify Validation
 * Defines request/response schemas for enrollment endpoints
 */

import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  paginationQuerySchema,
  idParamSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

/**
 * Data schemas
 */

const enrollmentDataSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'Enrollment ID' },
    user_id: { type: 'integer', description: 'User ID' },
    academy_id: { type: 'integer', description: 'Academy ID' },
    status: {
      type: 'string',
      enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
      description: 'Enrollment status',
    },
    progress_percentage: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      description: 'Course completion progress',
    },
    enrolled_at: { type: 'string', format: 'date-time', description: 'Enrollment date' },
    completed_at: { type: ['string', 'null'], format: 'date-time', description: 'Completion date' },
    ...timestampFieldsSchema,
  },
};

const enrollmentStatsDataSchema = {
  type: 'object',
  properties: {
    totalEnrollments: { type: 'integer', description: 'Total number of enrollments' },
    statusBreakdown: {
      type: 'object',
      properties: {
        enrolled: { type: 'integer', description: 'Active enrollments' },
        completed: { type: 'integer', description: 'Completed enrollments' },
        cancelled: { type: 'integer', description: 'Cancelled enrollments' },
        suspended: { type: 'integer', description: 'Suspended enrollments' },
      },
    },
    averageProgress: { type: 'number', description: 'Average completion progress' },
    completionRate: { type: 'number', description: 'Completion rate percentage' },
  },
};

/**
 * Request body schemas
 */

const createEnrollmentBodySchema = {
  type: 'object',
  required: ['user_id', 'academy_id'],
  properties: {
    user_id: {
      type: 'integer',
      minimum: 1,
      description: 'User ID',
    },
    academy_id: {
      type: 'integer',
      minimum: 1,
      description: 'Academy ID',
    },
    status: {
      type: 'string',
      enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
      default: 'ENROLLED',
      description: 'Initial enrollment status',
    },
  },
  additionalProperties: false,
};

const updateEnrollmentBodySchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
      description: 'Enrollment status',
    },
    progress_percentage: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      description: 'Course completion progress',
    },
  },
  additionalProperties: false,
};

const updateStatusBodySchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
      description: 'New enrollment status',
    },
  },
  additionalProperties: false,
};

const updateProgressBodySchema = {
  type: 'object',
  required: ['progress_percentage'],
  properties: {
    progress_percentage: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      description: 'Course completion progress',
    },
  },
  additionalProperties: false,
};

/**
 * Parameter schemas
 */

const enrollmentIdParamSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Enrollment ID',
    },
  },
};

const userIdParamSchema = {
  type: 'object',
  properties: {
    userId: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'User ID',
    },
  },
};

const academyIdParamSchema = {
  type: 'object',
  properties: {
    academyId: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Academy ID',
    },
  },
};

const userAcademyParamSchema = {
  type: 'object',
  properties: {
    userId: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'User ID',
    },
    academyId: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Academy ID',
    },
  },
};

/**
 * Query parameter schemas
 */

const enrollmentQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    status: {
      type: 'string',
      enum: ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
      description: 'Filter by status',
    },
    academy_id: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Filter by academy ID',
    },
    user_id: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Filter by user ID',
    },
  },
  additionalProperties: false,
};

/**
 * Complete route schemas
 */

export const getAllEnrollmentsSchema = {
  summary: 'Get all enrollments',
  description: 'Retrieve paginated list of enrollments with optional filters',
  tags: ['Admin Enrollments'],
  security: [{ bearerAuth: [] }],
  querystring: enrollmentQuerySchema,
  response: {
    200: createPaginatedResponseSchema(enrollmentDataSchema, 'Enrollments retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getEnrollmentStatsSchema = {
  summary: 'Get enrollment statistics',
  description: 'Retrieve enrollment statistics and metrics',
  tags: ['Admin Enrollments'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(enrollmentStatsDataSchema, 'Statistics retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAcademyEnrollmentsSchema = {
  summary: 'Get academy enrollments',
  description: 'Retrieve all enrollments for a specific academy',
  tags: ['Admin Enrollments'],
  security: [{ bearerAuth: [] }],
  params: academyIdParamSchema,
  querystring: paginationQuerySchema,
  response: {
    200: createPaginatedResponseSchema(enrollmentDataSchema, 'Academy enrollments retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const createEnrollmentSchema = {
  summary: 'Create enrollment',
  description: 'Create a new enrollment for a user in an academy',
  tags: ['Admin Enrollments'],
  security: [{ bearerAuth: [] }],
  body: createEnrollmentBodySchema,
  response: {
    200: createSuccessResponseSchema(enrollmentDataSchema, 'Enrollment created successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input or duplicate enrollment'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateEnrollmentSchema = {
  summary: 'Update enrollment',
  description: 'Update enrollment details',
  tags: ['Admin Enrollments'],
  security: [{ bearerAuth: [] }],
  params: enrollmentIdParamSchema,
  body: updateEnrollmentBodySchema,
  response: {
    200: createSuccessResponseSchema(enrollmentDataSchema, 'Enrollment updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Enrollment not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateStatusSchema = {
  summary: 'Update enrollment status',
  description: 'Update the status of an enrollment',
  tags: ['Admin Enrollments'],
  security: [{ bearerAuth: [] }],
  params: enrollmentIdParamSchema,
  body: updateStatusBodySchema,
  response: {
    200: createSuccessResponseSchema(enrollmentDataSchema, 'Status updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid status'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Enrollment not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteEnrollmentSchema = {
  summary: 'Delete enrollment',
  description: 'Delete an enrollment',
  tags: ['Admin Enrollments'],
  security: [{ bearerAuth: [] }],
  params: enrollmentIdParamSchema,
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          deleted: { type: 'boolean', description: 'Deletion success status' },
          enrollmentId: { type: 'integer', description: 'Deleted enrollment ID' },
        },
      },
      'Enrollment deleted successfully'
    ),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Enrollment not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getEnrollmentByIdSchema = {
  summary: 'Get enrollment by ID',
  description: 'Retrieve enrollment details by ID',
  tags: ['Enrollments'],
  params: enrollmentIdParamSchema,
  response: {
    200: createSuccessResponseSchema(enrollmentDataSchema, 'Enrollment retrieved successfully'),
    404: createErrorResponseSchema(404, 'Not Found - Enrollment not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserEnrollmentsSchema = {
  summary: 'Get user enrollments',
  description: 'Retrieve all enrollments for a specific user',
  tags: ['Enrollments'],
  params: userIdParamSchema,
  querystring: paginationQuerySchema,
  response: {
    200: createPaginatedResponseSchema(enrollmentDataSchema, 'User enrollments retrieved successfully'),
    404: createErrorResponseSchema(404, 'Not Found - User not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getEnrollmentByUserAndAcademySchema = {
  summary: 'Get enrollment by user and academy',
  description: 'Retrieve enrollment for a specific user in a specific academy',
  tags: ['Enrollments'],
  params: userAcademyParamSchema,
  response: {
    200: createSuccessResponseSchema(enrollmentDataSchema, 'Enrollment retrieved successfully'),
    404: createErrorResponseSchema(404, 'Not Found - Enrollment not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateProgressSchema = {
  summary: 'Update enrollment progress',
  description: 'Update the progress percentage of an enrollment',
  tags: ['Enrollments'],
  params: enrollmentIdParamSchema,
  body: updateProgressBodySchema,
  response: {
    200: createSuccessResponseSchema(enrollmentDataSchema, 'Progress updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid progress value'),
    404: createErrorResponseSchema(404, 'Not Found - Enrollment not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
