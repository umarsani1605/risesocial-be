/**
 * RYLS Registration Validation Schemas
 * Fastify JSON schemas for RYLS registration endpoints
 */

import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

/**
 * Common data schemas
 */

const fileInfoSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'File ID' },
    originalName: { type: 'string', description: 'Original filename' },
    fileSize: { type: 'integer', description: 'File size in bytes' },
    uploadDate: { type: 'string', format: 'date-time', description: 'Upload timestamp' },
  },
};

const personalInfoSchema = {
  type: 'object',
  properties: {
    fullName: { type: 'string', description: 'Full name' },
    email: { type: 'string', description: 'Email address' },
    residence: { type: 'string', description: 'Current residence' },
    nationality: { type: 'string', description: 'Primary nationality' },
    secondNationality: { type: 'string', description: 'Secondary nationality' },
    whatsapp: { type: 'string', description: 'WhatsApp number' },
    institution: { type: 'string', description: 'Educational institution' },
    dateOfBirth: { type: 'string', format: 'date', description: 'Date of birth' },
    age: { type: 'integer', description: 'Age in years' },
    gender: { type: 'string', enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'], description: 'Gender' },
  },
};

const applicationInfoSchema = {
  type: 'object',
  properties: {
    discoverSource: { 
      type: 'string',
      enum: ['RISE_INSTAGRAM', 'OTHER_INSTAGRAM', 'FRIENDS', 'OTHER'],
      description: 'How applicant discovered RYLS'
    },
    discoverOtherText: { type: 'string', description: 'Additional details if source is OTHER' },
    scholarshipType: { 
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
      description: 'Type of scholarship'
    },
    status: { 
      type: 'string',
      enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
      description: 'Payment status'
    },
  },
};

const fullyFundedSubmissionSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['FULLY_FUNDED'] },
    essayTopic: { type: 'string', description: 'Selected essay topic' },
    essayDescription: { type: 'string', description: 'Essay description' },
    essayFile: fileInfoSchema,
  },
};

const selfFundedSubmissionSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['SELF_FUNDED'] },
    passportNumber: { type: 'string', description: 'Passport number' },
    needVisa: { type: 'boolean', description: 'Requires visa' },
    readPolicies: { type: 'boolean', description: 'Accepted policies' },
    headshotFile: fileInfoSchema,
  },
};

const registrationDataSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'Registration ID' },
    submissionId: { type: 'string', description: 'Unique submission ID' },
    personalInfo: personalInfoSchema,
    applicationInfo: applicationInfoSchema,
    submissionDetails: {
      oneOf: [fullyFundedSubmissionSchema, selfFundedSubmissionSchema],
    },
    ...timestampFieldsSchema,
  },
};

/**
 * Request body schemas
 */

const step1DataSchema = {
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
      description: 'Full name of applicant'
    },
    email: { 
      type: 'string',
      format: 'email',
      maxLength: 255,
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
      maxLength: 255,
      description: 'Primary nationality'
    },
    secondNationality: { 
      type: 'string',
      maxLength: 255,
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
  },
  additionalProperties: false,
};

const createRegistrationBodySchema = {
  type: 'object',
  required: ['step1'],
  properties: {
    step1: step1DataSchema,
    // Fully funded fields
    essayTopic: { type: 'string', description: 'Essay topic (for fully funded)' },
    essayFile: { type: 'string', description: 'Essay file ID (for fully funded)' },
    essayDescription: { type: 'string', description: 'Essay description (for fully funded)' },
    // Self funded fields
    passportNumber: { type: 'string', description: 'Passport number (for self funded)' },
    needVisa: { type: 'string', enum: ['YES', 'NO', ''], description: 'Need visa (for self funded)' },
    headshotFile: { type: 'string', description: 'Headshot file ID (for self funded)' },
    readPolicies: { type: 'string', enum: ['YES', 'NO', ''], description: 'Read policies (for self funded)' },
    // Payment info
    payment: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Payment ID' },
        type: { type: 'string', enum: ['PAYPAL', 'MIDTRANS'], description: 'Payment type' },
        status: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'], description: 'Payment status' },
        proof: { type: 'string', description: 'Payment proof file ID' },
        transactionData: { type: 'object', description: 'Transaction data' },
      },
    },
  },
  additionalProperties: false,
};

const fullyFundedBodySchema = {
  type: 'object',
  required: ['step1', 'essayTopic', 'essayFileId'],
  properties: {
    step1: step1DataSchema,
    essayTopic: {
      type: 'string',
      enum: ['GREEN_CLIMATE', 'GREEN_CURRICULUM', 'GREEN_INNOVATION', 'GREEN_ACTION', 'GREEN_TRANSITION'],
      description: 'Selected essay topic'
    },
    essayFileId: { 
      type: 'integer',
      minimum: 1,
      description: 'Uploaded essay file ID'
    },
    essayDescription: { 
      type: 'string',
      maxLength: 1000,
      description: 'Essay description'
    },
  },
  additionalProperties: false,
};

const selfFundedBodySchema = {
  type: 'object',
  required: ['step1', 'passportNumber', 'needVisa', 'headshotFileId', 'readPolicies'],
  properties: {
    step1: step1DataSchema,
    passportNumber: { 
      type: 'string',
      minLength: 1,
      maxLength: 20,
      description: 'Passport number'
    },
    needVisa: { 
      type: 'string',
      enum: ['YES', 'NO'],
      description: 'Requires visa'
    },
    headshotFileId: { 
      type: 'integer',
      minimum: 1,
      description: 'Uploaded headshot file ID'
    },
    readPolicies: { 
      type: 'string',
      enum: ['YES', 'NO'],
      description: 'Accepted policies'
    },
  },
  additionalProperties: false,
};

const statusUpdateBodySchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
      description: 'New payment status'
    },
  },
  additionalProperties: false,
};

/**
 * Response data schemas
 */

const submissionDataSchema = {
  type: 'object',
  properties: {
    registrationId: { type: 'integer', description: 'Registration ID' },
    submissionId: { type: 'string', description: 'Unique submission ID' },
    email: { type: 'string', description: 'Email address' },
    fullName: { type: 'string', description: 'Full name' },
    scholarshipType: { 
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
      description: 'Scholarship type'
    },
    status: { 
      type: 'string',
      enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
      description: 'Payment status'
    },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    submission: { type: 'object', description: 'Submission details' },
  },
};

const statisticsDataSchema = {
  type: 'object',
  properties: {
    totalRegistrations: { type: 'integer', description: 'Total number of registrations' },
    statusBreakdown: {
      type: 'object',
      properties: {
        pending: { type: 'integer', description: 'Pending registrations' },
        paid: { type: 'integer', description: 'Paid registrations' },
        failed: { type: 'integer', description: 'Failed registrations' },
        expired: { type: 'integer', description: 'Expired registrations' },
      },
    },
    scholarshipBreakdown: {
      type: 'object',
      properties: {
        fullyFunded: { type: 'integer', description: 'Fully funded registrations' },
        selfFunded: { type: 'integer', description: 'Self funded registrations' },
      },
    },
    recentRegistrations: { type: 'integer', description: 'Recent registrations count' },
    demographicBreakdown: {
      type: 'object',
      properties: {
        byNationality: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nationality: { type: 'string' },
              count: { type: 'integer' },
            },
          },
        },
        byDiscoverSource: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              count: { type: 'integer' },
            },
          },
        },
      },
    },
    generatedAt: { type: 'string', format: 'date-time', description: 'Statistics generation timestamp' },
  },
};

const dateRangeDataSchema = {
  type: 'object',
  properties: {
    registrations: {
      type: 'array',
      items: registrationDataSchema,
    },
    dateRange: {
      type: 'object',
      properties: {
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
      },
    },
  },
};

const deleteDataSchema = {
  type: 'object',
  properties: {
    deleted: { type: 'boolean', description: 'Deletion success status' },
    registrationId: { type: 'integer', description: 'Deleted registration ID' },
  },
};

const emailCheckDataSchema = {
  type: 'object',
  properties: {
    emailExists: { type: 'boolean', description: 'Whether email exists' },
    email: { type: 'string', description: 'Checked email address' },
  },
};

const healthDataSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', description: 'Service status' },
    service: { type: 'string', description: 'Service name' },
    database: { type: 'string', description: 'Database status' },
    totalRegistrations: { type: 'integer', description: 'Total registrations count' },
    timestamp: { type: 'string', format: 'date-time', description: 'Health check timestamp' },
  },
};

/**
 * Query parameter schemas
 */

const registrationQuerySchema = {
  type: 'object',
  properties: {
    page: {
      type: 'string',
      pattern: '^[0-9]+$',
      default: '1',
      description: 'Page number',
    },
    limit: {
      type: 'string',
      pattern: '^[0-9]+$',
      default: '10',
      description: 'Items per page (max 100)',
    },
    status: {
      type: 'string',
      enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
      description: 'Filter by payment status',
    },
    scholarshipType: {
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
      description: 'Filter by scholarship type',
    },
    sortBy: {
      type: 'string',
      enum: ['created_at', 'updated_at', 'full_name', 'email'],
      default: 'created_at',
      description: 'Sort field',
    },
    sortOrder: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'desc',
      description: 'Sort order',
    },
    search: {
      type: 'string',
      description: 'Search by name or email',
    },
  },
  additionalProperties: false,
};

const dateRangeQuerySchema = {
  type: 'object',
  properties: {
    startDate: {
      type: 'string',
      format: 'date',
      description: 'Start date (YYYY-MM-DD)',
    },
    endDate: {
      type: 'string',
      format: 'date',
      description: 'End date (YYYY-MM-DD)',
    },
    status: {
      type: 'string',
      enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
      description: 'Filter by payment status',
    },
    scholarshipType: {
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
      description: 'Filter by scholarship type',
    },
    sortBy: {
      type: 'string',
      enum: ['created_at', 'updated_at', 'full_name', 'email'],
      default: 'created_at',
      description: 'Sort field',
    },
    sortOrder: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'desc',
      description: 'Sort order',
    },
  },
  additionalProperties: false,
};

const exportQuerySchema = {
  type: 'object',
  properties: {
    paymentStatus: {
      type: 'string',
      enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
      description: 'Filter by status',
    },
    scholarshipType: {
      type: 'string',
      enum: ['FULLY_FUNDED', 'SELF_FUNDED'],
      description: 'Filter by scholarship type',
    },
    startDate: {
      type: 'string',
      format: 'date',
      description: 'Start date filter (YYYY-MM-DD)',
    },
    endDate: {
      type: 'string',
      format: 'date',
      description: 'End date filter (YYYY-MM-DD)',
    },
  },
  additionalProperties: false,
};

const registrationIdParamSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Registration ID (numeric)',
    },
  },
};

const submissionIdParamSchema = {
  type: 'object',
  properties: {
    submissionId: {
      type: 'string',
      pattern: '^RYLS-[A-Z0-9]+-[A-Z0-9]+$',
      description: 'Submission ID (RYLS-XXXXX-XXXXX format)',
    },
  },
};

const emailParamSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'Email address to check',
    },
  },
};

/**
 * Complete route schemas
 */

export const createRegistrationSchema = {
  summary: 'Create registration',
  description: 'Create a new registration with all required information',
  tags: ['RYLS Registration'],
  body: createRegistrationBodySchema,
  response: {
    200: createSuccessResponseSchema(registrationDataSchema, 'Registration created successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const submitFullyFundedRegistrationSchema = {
  summary: 'Submit fully funded registration',
  description: 'Submit a complete fully funded scholarship registration',
  tags: ['RYLS Registration'],
  body: fullyFundedBodySchema,
  response: {
    200: createSuccessResponseSchema(submissionDataSchema, 'Fully funded registration submitted successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const submitSelfFundedRegistrationSchema = {
  summary: 'Submit self funded registration',
  description: 'Submit a complete self funded registration',
  tags: ['RYLS Registration'],
  body: selfFundedBodySchema,
  response: {
    200: createSuccessResponseSchema(submissionDataSchema, 'Self funded registration submitted successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getRegistrationBySubmissionIdSchema = {
  summary: 'Get registration by submission ID',
  description: 'Retrieve registration details using submission ID',
  tags: ['RYLS Registration'],
  params: submissionIdParamSchema,
  response: {
    200: createSuccessResponseSchema(registrationDataSchema, 'Registration retrieved successfully'),
    404: createErrorResponseSchema(404, 'Not Found - Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getRegistrationByIdSchema = {
  summary: 'Get registration by ID',
  description: 'Retrieve registration details by registration ID',
  tags: ['Admin RYLS Registration'],
  security: [{ bearerAuth: [] }],
  params: registrationIdParamSchema,
  response: {
    200: createSuccessResponseSchema(registrationDataSchema, 'Registration retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getRegistrationsSchema = {
  summary: 'Get all registrations',
  description: 'Retrieve paginated list of registrations with optional filters',
  tags: ['Admin RYLS Registration'],
  security: [{ bearerAuth: [] }],
  querystring: registrationQuerySchema,
  response: {
    200: createPaginatedResponseSchema(registrationDataSchema, 'Registrations retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateRegistrationStatusSchema = {
  summary: 'Update registration status',
  description: 'Update the status of a registration (admin only)',
  tags: ['Admin RYLS Registration'],
  security: [{ bearerAuth: [] }],
  params: registrationIdParamSchema,
  body: statusUpdateBodySchema,
  response: {
    200: createSuccessResponseSchema(registrationDataSchema, 'Registration status updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid status'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getRegistrationStatisticsSchema = {
  summary: 'Get registration statistics',
  description: 'Retrieve comprehensive registration statistics',
  tags: ['Admin RYLS Registration'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(statisticsDataSchema, 'Statistics retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getRegistrationsByDateRangeSchema = {
  summary: 'Get registrations by date range',
  description: 'Retrieve registrations within specified date range',
  tags: ['Admin RYLS Registration'],
  security: [{ bearerAuth: [] }],
  querystring: dateRangeQuerySchema,
  response: {
    200: createSuccessResponseSchema(dateRangeDataSchema, 'Registrations retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid date range'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteRegistrationSchema = {
  summary: 'Delete registration',
  description: 'Delete a registration and all associated data (admin only)',
  tags: ['Admin RYLS Registration'],
  security: [{ bearerAuth: [] }],
  params: registrationIdParamSchema,
  response: {
    200: createSuccessResponseSchema(deleteDataSchema, 'Registration deleted successfully'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const checkEmailExistsSchema = {
  summary: 'Check if email exists',
  description: 'Check if an email address is already registered',
  tags: ['RYLS Registration'],
  params: emailParamSchema,
  response: {
    200: createSuccessResponseSchema(emailCheckDataSchema, 'Email check completed'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid email'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const healthCheckSchema = {
  summary: 'Registration service health check',
  description: 'Check registration service health and connectivity',
  tags: ['RYLS Registration'],
  response: {
    200: createSuccessResponseSchema(healthDataSchema, 'Service is healthy'),
    503: createErrorResponseSchema(503, 'Service Unavailable'),
  },
};

export const exportRegistrationsSchema = {
  summary: 'Export registrations to CSV',
  description: 'Export registrations data in CSV format (admin only)',
  tags: ['Admin RYLS Registration'],
  security: [{ bearerAuth: [] }],
  querystring: exportQuerySchema,
  response: {
    200: {
      description: 'CSV file download',
      type: 'string',
      format: 'binary',
    },
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const exportRegistrationsExcelSchema = {
  summary: 'Export registrations to Excel',
  description: 'Export registrations data in Excel format with multiple sheets (admin only)',
  tags: ['Admin RYLS Registration'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: 'Excel file download (.xlsx)',
      type: 'string',
      format: 'binary',
    },
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
