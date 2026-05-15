import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE'];
const EXPERIENCE_LEVELS = ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR'];

const jobEntitySchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    id: {
      type: 'integer',
      description: 'Unique job identifier',
    },
    title: {
      type: 'string',
      description: 'Job title',
    },
    slug: {
      type: 'string',
      description: 'Job slug',
    },
    description: {
      type: 'string',
      description: 'Detailed job description',
      nullable: true,
    },
    company: {
      type: 'object',
      additionalProperties: true,
      description: 'Company information',
      nullable: true,
    },
    location: {
      type: 'object',
      additionalProperties: true,
      description: 'Job location information',
      nullable: true,
    },
    employment_type: {
      type: 'string',
      description: 'Type of employment',
      nullable: true,
    },
    seniority_level: {
      type: 'string',
      description: 'Required experience level',
      nullable: true,
    },
    status: {
      type: 'string',
      description: 'Job status',
    },
    direct_apply: {
      type: 'boolean',
      description: 'Whether the job supports direct apply',
    },
    external_url: {
      type: 'string',
      format: 'uri',
      nullable: true,
      description: 'External application URL',
    },
    salary_raw: {
      type: 'string',
      nullable: true,
      description: 'Raw salary text',
    },
    posted_date: {
      type: 'string',
      format: 'date-time',
      description: 'Posted date',
    },
    valid_until: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      description: 'Application deadline',
    },
    ...timestampFieldsSchema,
  },
};

const jobsQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    ...searchQuerySchema.properties,
    jobType: {
      type: 'string',
      enum: JOB_TYPES,
      description: 'Filter by job type',
    },
    experienceLevel: {
      type: 'string',
      enum: EXPERIENCE_LEVELS,
      description: 'Filter by experience level',
    },
    location: {
      type: 'string',
      description: 'Filter by location (partial match)',
    },
    company: {
      type: 'string',
      description: 'Filter by company (partial match)',
    },
    companyName: {
      type: 'string',
      description: 'Filter by company name (partial match)',
    },
    companySlug: {
      type: 'string',
      description: 'Filter by company slug (exact match)',
    },
    jobSlug: {
      type: 'string',
      description: 'Filter by job slug (exact match)',
    },
    isRemote: {
      type: 'boolean',
      description: 'Filter remote jobs only',
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive'],
      description: 'Filter by job status',
    },
  },
};

export const searchJobsSchema = {
  summary: 'Search jobs',
  description: 'Search jobs with advanced filtering and full-text search',
  querystring: {
    type: 'object',
    properties: {
      ...jobsQuerySchema.properties,
      q: {
        type: 'string',
        minLength: 1,
        description: 'Search query (searches in title, description, company)',
      },
    },
  },
  response: {
    200: createPaginatedResponseSchema(jobEntitySchema, 'Jobs search completed'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid search parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getCompaniesSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1, description: 'Page number' },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20, description: 'Items per page' },
      slug: { type: 'string', description: 'Filter by company slug (exact match)' },
      name: { type: 'string', description: 'Filter by company name (partial match)' },
      headquarters: { type: 'string', description: 'Filter by headquarters location' },
      industry: { type: 'string', description: 'Filter by industry' },
      linkedinSize: { type: 'string', description: 'Filter by LinkedIn company size' },
      search: { type: 'string', description: 'Search across company name, industry, and headquarters' },
      sortBy: {
        type: 'string',
        enum: ['name', 'created_at', 'linkedin_employees', 'linkedin_followers'],
        default: 'name',
        description: 'Sort field',
      },
      sortOrder: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc',
        description: 'Sort order',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: true,
          properties: {
            id: { type: 'integer', description: 'Company ID' },
            name: { type: 'string', description: 'Company name' },
            slug: { type: 'string', description: 'Company slug' },
            logo_url: { type: 'string', description: 'Company logo URL' },
            website_url: { type: 'string', description: 'Company website URL' },
            industry: { type: 'string', description: 'Company industry' },
            headquarters: { type: 'string', description: 'Company headquarters' },
            description: { type: 'string', description: 'Company description' },
            linkedin_url: { type: 'string', description: 'LinkedIn URL' },
            linkedin_slug: { type: 'string', description: 'LinkedIn slug' },
            linkedin_employees: { type: 'integer', description: 'LinkedIn employee count' },
            linkedin_size: { type: 'string', description: 'LinkedIn company size' },
            linkedin_slogan: { type: 'string', description: 'LinkedIn slogan' },
            linkedin_followers: { type: 'integer', description: 'LinkedIn followers count' },
            linkedin_type: { type: 'string', description: 'LinkedIn company type' },
            linkedin_founded_date: { type: 'string', description: 'Founded date' },
            linkedin_specialties: { type: 'string', nullable: true },
            linkedin_locations: { type: 'string', nullable: true },
            linkedin_is_recruitment_agency: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            _count: {
              type: 'object',
              properties: {
                jobs: { type: 'integer', description: 'Number of active jobs' },
              },
            },
          },
        },
      },
      'Companies retrieved successfully',
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// User Jobs Schemas
export const getUserJobsSchema = {
  summary: 'Get all jobs for users',
  description: 'Retrieve paginated list of active jobs for public users.',
  tags: ['User Jobs'],
  querystring: {
    type: 'object',
    properties: {
      ...jobsQuerySchema.properties,
      page: {
        type: 'integer',
        minimum: 1,
        description: 'Page number (optional - omit for all results)',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        description: 'Items per page (optional - omit for all results)',
      },
      search: {
        type: 'string',
        maxLength: 255,
        description: 'Search query (searches in title, description, company)',
      },
    },
  },
  response: {
    200: createPaginatedResponseSchema(jobEntitySchema, 'Jobs retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getJobCategoriesSchema = {
  summary: 'Get job categories',
  description: 'Retrieve available job categories/types',
  tags: ['User Jobs'],
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'array',
        items: { type: 'string' },
      },
      'Job categories retrieved',
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserJobByIdSchema = {
  summary: 'Get job by ID',
  description: 'Retrieve a specific job by its ID',
  tags: ['User Jobs'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(jobEntitySchema, 'Job retrieved successfully'),
    404: createErrorResponseSchema(404, 'Job not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getJobRecommendationsSchema = {
  summary: 'Get job recommendations',
  description: 'Get recommended jobs based on a specific job',
  tags: ['User Jobs'],
  params: idParamSchema,
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 20, default: 5, description: 'Number of recommendations' },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: jobEntitySchema }, 'Recommendations retrieved'),
    404: createErrorResponseSchema(404, 'Job not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserSearchJobsSchema = {
  summary: 'Search jobs',
  description: 'Search jobs with filters',
  tags: ['User Jobs'],
  querystring: {
    type: 'object',
    properties: {
      ...jobsQuerySchema.properties,
      q: { type: 'string', minLength: 1, description: 'Search query' },
    },
  },
  response: {
    200: createPaginatedResponseSchema(jobEntitySchema, 'Search results'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserCompaniesSchema = {
  summary: 'Get companies',
  description: 'Retrieve list of companies with job postings',
  tags: ['User Jobs'],
  querystring: getCompaniesSchema.querystring,
  response: {
    200: getCompaniesSchema.response[200],
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
