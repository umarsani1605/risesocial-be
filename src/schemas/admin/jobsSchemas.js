import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  idParamSchema,
  paginationQuerySchema,
  timestampFieldsSchema,
} from '../shared/baseSchemas.js';

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE'];
const SENIORITY_LEVELS = ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR'];

const jobEntitySchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    slug: { type: 'string' },
    description: { type: 'string', nullable: true },
    employment_type: { type: 'string', nullable: true },
    seniority_level: { type: 'string', nullable: true },
    status: { type: 'string' },
    direct_apply: { type: 'boolean' },
    external_url: { type: 'string', nullable: true },
    posted_date: { type: 'string', format: 'date-time' },
    valid_until: { type: 'string', format: 'date-time', nullable: true },
    salary_raw: { type: 'string', nullable: true },
    company: { type: 'object', additionalProperties: true, nullable: true },
    location: { type: 'object', additionalProperties: true, nullable: true },
    _count: {
      type: 'object',
      properties: {
        applications: { type: 'integer' },
      },
    },
    ...timestampFieldsSchema,
  },
};

const jobCreateInputSchema = {
  type: 'object',
  required: ['title', 'description', 'company', 'location', 'employment_type'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 3, maxLength: 255 },
    description: { type: 'string', minLength: 50 },
    company: { type: 'string', minLength: 1 },
    location: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 3, maxLength: 100, pattern: '^[a-z0-9-]+$' },
    employment_type: { type: 'string', enum: JOB_TYPES },
    seniority_level: { type: 'string', enum: SENIORITY_LEVELS },
    is_remote: { type: 'boolean', default: false },
    valid_until: { type: 'string', format: 'date-time', nullable: true },
    external_url: { type: 'string', format: 'uri', nullable: true },
  },
};

const jobUpdateInputSchema = {
  type: 'object',
  required: ['title', 'description', 'company', 'location', 'employment_type'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 3, maxLength: 255 },
    description: { type: 'string', minLength: 50 },
    company: { type: 'string', minLength: 1 },
    location: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 3, maxLength: 100, pattern: '^[a-z0-9-]+$' },
    employment_type: { type: 'string', enum: JOB_TYPES },
    seniority_level: { type: 'string', enum: SENIORITY_LEVELS },
    is_remote: { type: 'boolean' },
    valid_until: { type: 'string', format: 'date-time', nullable: true },
    external_url: { type: 'string', format: 'uri', nullable: true },
    status: { type: 'string', enum: ['active', 'inactive'] },
  },
};

export const getAdminJobsSchema = {
  tags: ['Admin Jobs'],
  summary: 'Get all jobs for admin',
  description: 'Retrieve all jobs with optional pagination',
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
    },
  },
  response: {
    200: createPaginatedResponseSchema(jobEntitySchema, 'Jobs retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAdminJobByIdSchema = {
  tags: ['Admin Jobs'],
  summary: 'Get job by ID',
  description: 'Retrieve a specific job by its ID',
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(jobEntitySchema, 'Job retrieved successfully'),
    404: createErrorResponseSchema(404, 'Job not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const createJobSchema = {
  tags: ['Admin Jobs'],
  summary: 'Create new job',
  description: 'Create a new job posting (Admin only)',
  body: jobCreateInputSchema,
  response: {
    201: createSuccessResponseSchema(jobEntitySchema, 'Job created successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Admin access required'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateJobSchema = {
  tags: ['Admin Jobs'],
  summary: 'Update job',
  description: 'Update an existing job posting (Admin only)',
  params: idParamSchema,
  body: jobUpdateInputSchema,
  response: {
    200: createSuccessResponseSchema(jobEntitySchema, 'Job updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Admin access required'),
    404: createErrorResponseSchema(404, 'Job not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteJobSchema = {
  tags: ['Admin Jobs'],
  summary: 'Delete job',
  description: 'Delete a job posting (Admin only)',
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: 'object', additionalProperties: true }, 'Job deleted successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Admin access required'),
    404: createErrorResponseSchema(404, 'Job not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const syncLinkedInJobsSchema = {
  tags: ['Admin Jobs'],
  summary: 'Sync jobs from LinkedIn',
  description: 'Trigger LinkedIn job sync',
  body: {
    type: 'object',
    additionalProperties: true,
    properties: {
      filter: { type: 'object', additionalProperties: true },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        additionalProperties: true,
        properties: {
          synced: { type: 'integer' },
          skipped: { type: 'integer' },
          errors: { type: 'integer' },
        },
      },
      'LinkedIn jobs synced successfully',
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getJobStatisticsSchema = {
  tags: ['Admin Jobs'],
  summary: 'Get job statistics by ID',
  description: 'Get statistics for a specific job',
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(
      { type: 'object', additionalProperties: true },
      'Job statistics retrieved successfully',
    ),
    404: createErrorResponseSchema(404, 'Job not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAllJobsStatisticsSchema = {
  tags: ['Admin Jobs'],
  summary: 'Get all jobs statistics',
  description: 'Get aggregated statistics for all jobs',
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        additionalProperties: true,
        properties: {
          total: { type: 'integer' },
          active: { type: 'integer' },
          byEmploymentType: { type: 'object', additionalProperties: { type: 'integer' } },
          bySeniorityLevel: { type: 'object', additionalProperties: { type: 'integer' } },
          remote: { type: 'integer' },
        },
      },
      'Jobs statistics retrieved successfully',
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
