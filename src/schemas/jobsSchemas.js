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
    description: {
      type: 'string',
      description: 'Detailed job description',
      nullable: true,
    },
    company: {
      type: 'string',
      description: 'Company name',
      nullable: true,
    },
    location: {
      type: 'string',
      description: 'Job location',
      nullable: true,
    },
    jobType: {
      type: 'string',
      description: 'Type of employment',
      nullable: true,
    },
    experienceLevel: {
      type: 'string',
      description: 'Required experience level',
      nullable: true,
    },
    minSalary: {
      type: 'integer',
      minimum: 0,
      nullable: true,
      description: 'Minimum salary range',
    },
    maxSalary: {
      type: 'integer',
      minimum: 0,
      nullable: true,
      description: 'Maximum salary range',
    },
    skills: {
      type: 'array',
      items: { type: 'string' },
      description: 'Required skills',
    },
    requirements: {
      type: 'array',
      items: { type: 'string' },
      description: 'Job requirements',
    },
    benefits: {
      type: 'array',
      items: { type: 'string' },
      description: 'Job benefits',
    },
    isRemote: {
      type: 'boolean',
      default: false,
      description: 'Whether the job is remote',
    },
    applicationDeadline: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      description: 'Application deadline',
    },
    applicationUrl: {
      type: 'string',
      format: 'uri',
      nullable: true,
      description: 'External application URL',
    },
    contactEmail: {
      type: 'string',
      format: 'email',
      nullable: true,
      description: 'Contact email for applications',
    },
    companyDescription: {
      type: 'string',
      nullable: true,
      description: 'Brief company description',
    },
    companyWebsite: {
      type: 'string',
      format: 'uri',
      nullable: true,
      description: 'Company website URL',
    },
    companySize: {
      type: 'string',
      nullable: true,
      description: 'Company size range',
    },
    isActive: {
      type: 'boolean',
      default: true,
      description: 'Whether the job is active',
    },
    ...timestampFieldsSchema,
  },
};

const jobCreateInputSchema = {
  type: 'object',
  required: ['title', 'description', 'company', 'location'],
  properties: {
    title: { type: 'string', minLength: 3, maxLength: 255, description: 'Job title' },
    description: { type: 'string', minLength: 50, description: 'Detailed job description' },
    company: { type: 'string', minLength: 1, description: 'Company name' },
    location: { type: 'string', minLength: 1, description: 'Job location' },
    slug: { type: 'string', minLength: 3, maxLength: 100, pattern: '^[a-z0-9-]+$', description: 'URL slug' },
    jobType: { type: 'string', enum: JOB_TYPES, description: 'Type of employment' },
    experienceLevel: { type: 'string', enum: EXPERIENCE_LEVELS, description: 'Required experience level' },
    salary_min: { type: 'integer', minimum: 0, description: 'Minimum salary range' },
    salary_max: { type: 'integer', minimum: 0, description: 'Maximum salary range' },
    skills: { type: 'array', items: { type: 'string' }, description: 'Required skills' },
    requirements: { type: 'array', items: { type: 'string' }, description: 'Job requirements' },
    benefits: { type: 'array', items: { type: 'string' }, description: 'Job benefits' },
    isRemote: { type: 'boolean', default: false, description: 'Whether the job is remote' },
    application_deadline: { type: 'string', format: 'date-time', description: 'Application deadline' },
    applicationUrl: { type: 'string', format: 'uri', description: 'External application URL' },
    contactEmail: { type: 'string', format: 'email', description: 'Contact email for applications' },
  },
  additionalProperties: false,
};

const jobUpdateInputSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 3, maxLength: 255, description: 'Job title' },
    description: { type: 'string', minLength: 50, description: 'Detailed job description' },
    company: { type: 'string', minLength: 1, description: 'Company name' },
    location: { type: 'string', minLength: 1, description: 'Job location' },
    slug: { type: 'string', minLength: 3, maxLength: 100, pattern: '^[a-z0-9-]+$', description: 'URL slug' },
    jobType: { type: 'string', enum: JOB_TYPES, description: 'Type of employment' },
    experienceLevel: { type: 'string', enum: EXPERIENCE_LEVELS, description: 'Required experience level' },
    salary_min: { type: 'integer', minimum: 0, description: 'Minimum salary range' },
    salary_max: { type: 'integer', minimum: 0, description: 'Maximum salary range' },
    skills: { type: 'array', items: { type: 'string' }, description: 'Required skills' },
    requirements: { type: 'array', items: { type: 'string' }, description: 'Job requirements' },
    benefits: { type: 'array', items: { type: 'string' }, description: 'Job benefits' },
    isRemote: { type: 'boolean', description: 'Whether the job is remote' },
    application_deadline: { type: 'string', format: 'date-time', description: 'Application deadline' },
    applicationUrl: { type: 'string', format: 'uri', description: 'External application URL' },
    contactEmail: { type: 'string', format: 'email', description: 'Contact email for applications' },
    isActive: { type: 'boolean', description: 'Whether the job is active' },
  },
  additionalProperties: false,
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
    minSalary: {
      type: 'integer',
      minimum: 0,
      description: 'Minimum salary filter',
    },
    maxSalary: {
      type: 'integer',
      minimum: 0,
      description: 'Maximum salary filter',
    },
    skills: {
      type: 'string',
      description: 'Comma-separated skills to filter by',
    },
    isActive: {
      type: 'boolean',
      default: true,
      description: 'Filter active jobs only',
    },
  },
};

export const getAllJobsSchema = {
  summary: 'Get all jobs with pagination and filtering',
  description: 'Retrieve a paginated list of jobs with optional filtering',
  querystring: jobsQuerySchema,
  response: {
    200: createPaginatedResponseSchema(jobEntitySchema, 'Jobs retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getJobByIdSchema = {
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
  summary: 'Delete job',
  description: 'Delete a job posting (Admin only)',
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema('Job deleted successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Admin access required'),
    404: createErrorResponseSchema(404, 'Job not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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

export const getJobStatsSchema = {
  summary: 'Get job statistics',
  description: 'Get aggregated statistics about jobs',
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          total: { type: 'integer', description: 'Total number of jobs' },
          active: { type: 'integer', description: 'Number of active jobs' },
          byType: {
            type: 'object',
            additionalProperties: { type: 'integer' },
            description: 'Jobs count by type',
          },
          byExperienceLevel: {
            type: 'object',
            additionalProperties: { type: 'integer' },
            description: 'Jobs count by experience level',
          },
          byLocation: {
            type: 'object',
            additionalProperties: { type: 'integer' },
            description: 'Jobs count by location',
          },
          remote: { type: 'integer', description: 'Number of remote jobs' },
        },
      },
      'Job statistics retrieved successfully'
    ),
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
            linkedin_specialties: { type: 'array', items: { type: 'string' } },
            linkedin_locations: { type: 'array', items: { type: 'string' } },
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
      'Companies retrieved successfully'
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// User Jobs Schemas
export const getUserJobsSchema = {
  summary: 'Get all jobs for users',
  description: 'Retrieve paginated list of active jobs for public users',
  tags: ['User Jobs'],
  querystring: jobsQuerySchema,
  response: {
    200: createPaginatedResponseSchema(jobEntitySchema, 'Jobs retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getFeaturedJobsSchema = {
  summary: 'Get featured jobs',
  description: 'Retrieve list of featured/highlighted jobs',
  tags: ['User Jobs'],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10, description: 'Number of jobs to return' },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: jobEntitySchema }, 'Featured jobs retrieved'),
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
      'Job categories retrieved'
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
