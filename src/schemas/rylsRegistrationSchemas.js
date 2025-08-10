/**
 * RYLS Registration Validation Schemas
 * Fastify JSON schemas for RYLS registration endpoints
 */

// Common schemas
const personalInfoSchema = {
  type: 'object',
  properties: {
    fullName: { type: 'string' },
    email: { type: 'string' },
    residence: { type: 'string' },
    nationality: { type: 'string' },
    secondNationality: { type: 'string' },
    whatsapp: { type: 'string' },
    institution: { type: 'string' },
    dateOfBirth: { type: 'string', format: 'date-time' },
    age: { type: 'integer' },
    gender: { type: 'string', enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'] },
  },
  required: ['fullName', 'email', 'residence', 'nationality', 'whatsapp', 'institution', 'dateOfBirth', 'gender'],
};

const applicationInfoSchema = {
  type: 'object',
  properties: {
    discoverSource: { type: 'string', enum: ['RISE_INSTAGRAM', 'OTHER_INSTAGRAM', 'FRIENDS_COLLEAGUES', 'OTHER'] },
    discoverOtherText: { type: 'string' },
    scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
    status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
  },
  required: ['discoverSource', 'scholarshipType', 'status'],
};

const timestampsSchema = {
  type: 'object',
  properties: {
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['createdAt', 'updatedAt'],
};

// File info schema
const fileInfoSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    originalName: { type: 'string' },
    fileSize: { type: 'integer' },
    uploadDate: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'originalName', 'fileSize', 'uploadDate'],
};

// Submission details schemas
const fullyFundedSubmissionSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['FULLY_FUNDED'] },
    essayTopic: { type: 'string' },
    essayDescription: { type: 'string' },
    essayFile: fileInfoSchema,
  },
  required: ['type', 'essayTopic'],
};

const selfFundedSubmissionSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['SELF_FUNDED'] },
    passportNumber: { type: 'string' },
    needVisa: { type: 'boolean' },
    readPolicies: { type: 'boolean' },
    headshotFile: fileInfoSchema,
  },
  required: ['type', 'passportNumber', 'needVisa', 'readPolicies'],
};

// Complete registration response schema
const registrationResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    submissionId: { type: 'string' },
    personalInfo: personalInfoSchema,
    applicationInfo: applicationInfoSchema,
    timestamps: timestampsSchema,
    submissionDetails: {
      oneOf: [fullyFundedSubmissionSchema, selfFundedSubmissionSchema],
    },
  },
  required: ['id', 'submissionId', 'personalInfo', 'applicationInfo', 'timestamps'],
};

// Request body schemas
const step1DataSchema = {
  type: 'object',
  properties: {
    fullName: { type: 'string', minLength: 2, maxLength: 255 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    residence: { type: 'string', minLength: 2, maxLength: 255 },
    nationality: { type: 'string', minLength: 2, maxLength: 255 },
    secondNationality: { type: 'string', maxLength: 255 },
    whatsapp: { type: 'string', minLength: 5, maxLength: 50 },
    institution: { type: 'string', minLength: 2, maxLength: 255 },
    dateOfBirth: { type: 'string', format: 'date' },
    gender: { type: 'string', enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'] },
    discoverSource: { type: 'string', enum: ['RISE_INSTAGRAM', 'OTHER_INSTAGRAM', 'FRIENDS_COLLEAGUES', 'OTHER'] },
    discoverOtherText: { type: 'string', maxLength: 500 },
    scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
  },
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
};

const fullyFundedRequestSchema = {
  type: 'object',
  properties: {
    step1: step1DataSchema,
    essayTopic: {
      type: 'string',
      enum: [
        'Green Climate – Urban solutions to adapt and thrive in a changing climate',
        'Green Curriculum – Embedding climate literacy in education',
        'Green Innovation – Tech-driven tools for climate resilience',
        'Green Action – Youth-led movements for climate justice',
        'Green Transition – Shifting to low-carbon, renewable energy',
      ],
    },
    essayFileId: { type: 'integer', minimum: 1 },
    essayDescription: { type: 'string', maxLength: 1000 },
  },
  required: ['step1', 'essayTopic', 'essayFileId'],
};

const selfFundedRequestSchema = {
  type: 'object',
  properties: {
    step1: step1DataSchema,
    passportNumber: { type: 'string', minLength: 6, maxLength: 20 },
    needVisa: { type: 'string', enum: ['YES', 'NO'] },
    headshotFileId: { type: 'integer', minimum: 1 },
    readPolicies: { type: 'string', enum: ['YES', 'NO'] },
  },
  required: ['step1', 'passportNumber', 'needVisa', 'headshotFileId', 'readPolicies'],
};

// Response schemas
const submissionResponseSchema = {
  type: 'object',
  properties: {
    registrationId: { type: 'integer' },
    submissionId: { type: 'string' },
    email: { type: 'string' },
    fullName: { type: 'string' },
    scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
    status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
    createdAt: { type: 'string', format: 'date-time' },
    submission: { type: 'object' },
  },
  required: ['registrationId', 'submissionId', 'email', 'fullName', 'scholarshipType', 'status', 'createdAt'],
};

const registrationListResponseSchema = {
  type: 'object',
  properties: {
    registrations: {
      type: 'array',
      items: registrationResponseSchema,
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
      required: ['page', 'limit', 'total', 'totalPages'],
    },
  },
  required: ['registrations', 'pagination'],
};

const statisticsResponseSchema = {
  type: 'object',
  properties: {
    totalRegistrations: { type: 'integer' },
    statusBreakdown: {
      type: 'object',
      properties: {
        pending: { type: 'integer' },
        approved: { type: 'integer' },
        rejected: { type: 'integer' },
      },
      required: ['pending', 'approved', 'rejected'],
    },
    scholarshipBreakdown: {
      type: 'object',
      properties: {
        fullyFunded: { type: 'integer' },
        selfFunded: { type: 'integer' },
      },
      required: ['fullyFunded', 'selfFunded'],
    },
    recentRegistrations: { type: 'integer' },
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
    generatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['totalRegistrations', 'statusBreakdown', 'scholarshipBreakdown', 'recentRegistrations', 'generatedAt'],
};

// Parameter schemas
const registrationIdParamSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Registration ID (numeric)',
    },
  },
  required: ['id'],
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
  required: ['submissionId'],
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
  required: ['email'],
};

// Query parameter schemas
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
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      description: 'Filter by status',
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
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      description: 'Filter by status',
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
  required: ['startDate', 'endDate'],
};

const statusUpdateSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      description: 'New status for the registration',
    },
  },
  required: ['status'],
};

// Error response schema (matches errorResponse utility)
const errorResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [false] },
    message: { type: 'string' },
    statusCode: { type: 'number' },
    timestamp: { type: 'string', format: 'date-time' },
    details: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }, { type: 'object' }],
    },
  },
  required: ['success', 'message', 'statusCode', 'timestamp'],
};

// Success response wrapper (matches successResponse utility)
const createSuccessResponseSchema = (dataSchema) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    message: { type: 'string' },
    data: dataSchema,
    timestamp: { type: 'string', format: 'date-time' },
    meta: { type: 'object' },
  },
  required: ['success', 'message', 'data', 'timestamp'],
});

// Complete route schemas
export const rylsRegistrationSchemas = {
  // POST /api/registrations/fully-funded
  submitFullyFundedRegistration: {
    summary: 'Submit fully funded registration',
    description: 'Submit a complete fully funded scholarship registration',
    tags: ['RYLS Registration'],
    body: fullyFundedRequestSchema,
    response: {
      201: createSuccessResponseSchema(submissionResponseSchema),
      400: errorResponseSchema,
      409: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // POST /api/registrations/self-funded
  submitSelfFundedRegistration: {
    summary: 'Submit self funded registration',
    description: 'Submit a complete self funded registration',
    tags: ['RYLS Registration'],
    body: selfFundedRequestSchema,
    response: {
      201: createSuccessResponseSchema(submissionResponseSchema),
      400: errorResponseSchema,
      409: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/registrations/submission/:submissionId
  getRegistrationBySubmissionId: {
    summary: 'Get registration by submission ID',
    description: 'Retrieve registration details using submission ID',
    tags: ['RYLS Registration'],
    params: submissionIdParamSchema,
    response: {
      200: createSuccessResponseSchema(registrationResponseSchema),
      400: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/registrations/:id
  getRegistrationById: {
    summary: 'Get registration by ID',
    description: 'Retrieve registration details by registration ID',
    tags: ['RYLS Registration'],
    params: registrationIdParamSchema,
    response: {
      200: createSuccessResponseSchema(registrationResponseSchema),
      400: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/registrations
  getRegistrations: {
    summary: 'Get all registrations',
    description: 'Retrieve paginated list of registrations with optional filters',
    tags: ['RYLS Registration'],
    querystring: registrationQuerySchema,
    response: {
      200: createSuccessResponseSchema(registrationListResponseSchema),
      500: errorResponseSchema,
    },
  },

  // PATCH /api/registrations/:id/status
  updateRegistrationStatus: {
    summary: 'Update registration status',
    description: 'Update the status of a registration (admin only)',
    tags: ['RYLS Registration'],
    params: registrationIdParamSchema,
    body: statusUpdateSchema,
    response: {
      200: createSuccessResponseSchema(registrationResponseSchema),
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/registrations/stats
  getRegistrationStatistics: {
    summary: 'Get registration statistics',
    description: 'Retrieve comprehensive registration statistics',
    tags: ['RYLS Registration'],
    response: {
      200: createSuccessResponseSchema(statisticsResponseSchema),
      500: errorResponseSchema,
    },
  },

  // GET /api/registrations/date-range
  getRegistrationsByDateRange: {
    summary: 'Get registrations by date range',
    description: 'Retrieve registrations within specified date range',
    tags: ['RYLS Registration'],
    querystring: dateRangeQuerySchema,
    response: {
      200: createSuccessResponseSchema({
        type: 'object',
        properties: {
          registrations: {
            type: 'array',
            items: registrationResponseSchema,
          },
          dateRange: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
            },
          },
        },
      }),
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // DELETE /api/registrations/:id
  deleteRegistration: {
    summary: 'Delete registration',
    description: 'Delete a registration and all associated data (admin only)',
    tags: ['RYLS Registration'],
    params: registrationIdParamSchema,
    response: {
      200: createSuccessResponseSchema({
        type: 'object',
        properties: {
          deleted: { type: 'boolean' },
          registrationId: { type: 'integer' },
        },
      }),
      400: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/registrations/check-email/:email
  checkEmailExists: {
    summary: 'Check if email exists',
    description: 'Check if an email address is already registered',
    tags: ['RYLS Registration'],
    params: emailParamSchema,
    response: {
      200: createSuccessResponseSchema({
        type: 'object',
        properties: {
          emailExists: { type: 'boolean' },
          email: { type: 'string' },
        },
      }),
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/registrations/health
  healthCheck: {
    summary: 'Registration service health check',
    description: 'Check registration service health and connectivity',
    tags: ['RYLS Registration'],
    response: {
      200: createSuccessResponseSchema({
        type: 'object',
        properties: {
          status: { type: 'string' },
          service: { type: 'string' },
          database: { type: 'string' },
          totalRegistrations: { type: 'integer' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      }),
      503: errorResponseSchema,
    },
  },

  // GET /api/registrations/export
  exportRegistrations: {
    summary: 'Export registrations to CSV',
    description: 'Export registrations data in CSV format (admin only)',
    tags: ['RYLS Registration'],
    querystring: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'APPROVED', 'REJECTED'],
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
    },
    response: {
      200: {
        description: 'CSV file download',
        type: 'string',
        format: 'binary',
      },
      500: errorResponseSchema,
    },
  },
};
