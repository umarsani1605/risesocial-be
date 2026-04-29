import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  paginationQuerySchema,
  idParamSchema,
  timestampFieldsSchema,
} from '../shared/baseSchemas.js';

const registrationEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'Registration ID' },
    full_name: { type: 'string', description: 'Full name' },
    email: { type: 'string', format: 'email', description: 'Email address' },
    residence: { type: 'string', description: 'Current residence' },
    nationality: { type: 'string', description: 'Primary nationality' },
    second_nationality: { type: ['string', 'null'], description: 'Secondary nationality' },
    whatsapp: { type: 'string', description: 'WhatsApp number' },
    institution: { type: 'string', description: 'Educational institution' },
    date_of_birth: { type: 'string', format: 'date', description: 'Date of birth' },
    gender: { type: 'string', enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'], description: 'Gender' },
    discover_source: { type: 'string', description: 'How discovered RYLS' },
    scholarship_type: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'], description: 'Scholarship type' },
    payment_status: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'], description: 'Payment status' },
    ...timestampFieldsSchema,
  },
};

// Response schema for submission endpoint (camelCase format)
const submissionResponseSchema = {
  type: 'object',
  properties: {
    registrationId: { type: 'integer', description: 'Registration ID' },
    submissionId: { type: 'integer', description: 'Submission ID' },
    email: { type: 'string', format: 'email', description: 'Email address' },
    fullName: { type: 'string', description: 'Full name' },
    scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'], description: 'Scholarship type' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    submission: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Submission ID' },
        essayTopic: { type: ['string', 'null'], description: 'Essay topic (FULLY_FUNDED)' },
        essayDescription: { type: ['string', 'null'], description: 'Essay description (FULLY_FUNDED)' },
        passportNumber: { type: ['string', 'null'], description: 'Passport number (SELF_FUNDED)' },
        needVisa: { type: ['boolean', 'null'], description: 'Need visa (SELF_FUNDED)' },
        readPolicies: { type: ['boolean', 'null'], description: 'Read policies (SELF_FUNDED)' },
      },
    },
  },
};

// Unified submission schema for both FULLY_FUNDED and SELF_FUNDED
export const submitRegistrationBodySchema = {
  type: 'object',
  required: ['step1'],
  properties: {
    step1: {
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
        fullName: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', format: 'email' },
        residence: { type: 'string', minLength: 1, maxLength: 255 },
        nationality: { type: 'string', minLength: 1, maxLength: 100 },
        secondNationality: { type: 'string', maxLength: 100 },
        whatsapp: { type: 'string', minLength: 1, maxLength: 50 },
        institution: { type: 'string', minLength: 1, maxLength: 255 },
        dateOfBirth: { type: 'string', format: 'date' },
        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'] },
        discoverSource: { type: 'string', enum: ['RISE_INSTAGRAM', 'OTHER_INSTAGRAM', 'FRIENDS', 'OTHER'] },
        discoverOtherText: { type: 'string', maxLength: 500 },
        scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
      },
      additionalProperties: false,
    },
    // FULLY_FUNDED optional fields
    essayTopic: { type: 'string', minLength: 1, maxLength: 255 },
    essayFileId: { type: 'integer', minimum: 1 },
    essayDescription: { type: 'string', maxLength: 2000 },
    // SELF_FUNDED optional fields
    passportNumber: { type: 'string', minLength: 1, maxLength: 20 },
    needVisa: { type: 'string', enum: ['YES', 'NO'] },
    headshotFileId: { type: 'integer', minimum: 1 },
    readPolicies: { type: 'string', enum: ['YES', 'NO'] },
    // Draft cleanup optional field
    resumeToken: { type: 'string', minLength: 1, maxLength: 64, description: 'Draft resume token to delete on successful submit' },
  },
  additionalProperties: false,
};

const registrationsQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
    status: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'] },
  },
};

export const getRegistrationByIdSchema = {
  tags: ['RYLS Registration'],
  summary: 'Get registration by ID',
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(registrationEntitySchema, 'Registration retrieved'),
    404: createErrorResponseSchema(404, 'Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAllRegistrationsSchema = {
  tags: ['Admin RYLS Registration'],
  summary: 'Get all registrations',
  security: [{ bearerAuth: [] }],
  querystring: registrationsQuerySchema,
  response: {
    200: createPaginatedResponseSchema(registrationEntitySchema, 'Registrations retrieved'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateRegistrationStatusSchema = {
  tags: ['Admin RYLS Registration'],
  summary: 'Update registration status',
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'] },
    },
  },
  response: {
    200: createSuccessResponseSchema(registrationEntitySchema, 'Status updated'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteRegistrationSchema = {
  tags: ['Admin RYLS Registration'],
  summary: 'Delete registration',
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Registration deleted'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getRegistrationStatisticsSchema = {
  tags: ['Admin RYLS Registration'],
  summary: 'Get registration statistics',
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Statistics retrieved'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const exportRegistrationsSchema = {
  tags: ['Admin RYLS Registration'],
  summary: 'Export registrations to Excel',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: 'Excel file',
      type: 'string',
      format: 'binary',
    },
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// User RYLS Registration Schemas
export const getRegistrationBySubmissionIdSchema = {
  tags: ['User RYLS Registration'],
  summary: 'Get registration by submission ID',
  description: 'Get registration details by submission ID',
  params: {
    type: 'object',
    properties: {
      submissionId: { type: 'string' },
    },
    required: ['submissionId'],
  },
  response: {
    200: createSuccessResponseSchema(registrationEntitySchema, 'Registration retrieved'),
    404: createErrorResponseSchema(404, 'Registration not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const checkEmailExistsSchema = {
  tags: ['User RYLS Registration'],
  summary: 'Check if email exists',
  description: 'Check if an email is already registered',
  params: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
    },
    required: ['email'],
  },
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          exists: { type: 'boolean' },
        },
      },
      'Email check completed',
    ),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const userRegistrationHealthCheckSchema = {
  tags: ['User RYLS Registration'],
  summary: 'Health check for registration service',
  description: 'Check registration service health',
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      'Health check successful',
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const submitRegistrationSchema = {
  tags: ['RYLS Registration'],
  summary: 'Submit RYLS registration',
  body: submitRegistrationBodySchema,
  response: {
    201: createSuccessResponseSchema(submissionResponseSchema, 'Registration submitted'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
