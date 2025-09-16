import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

// ========================
// INSTRUCTOR SCHEMAS - DOCUMENTATION ONLY
// ========================

/**
 * Instructor Entity Schema - Documentation Only
 */
const instructorEntitySchema = {
  type: 'object',
  // No required fields - documentation only
  properties: {
    id: {
      type: 'integer',
      description: 'Unique instructor identifier',
    },
    name: {
      type: 'string',
      description: 'Instructor full name',
      nullable: true,
    },
    job_title: {
      type: 'string',
      description: 'Instructor job title',
      nullable: true,
    },
    avatar_url: {
      type: 'string',
      format: 'uri',
      description: 'Instructor avatar/photo URL',
      nullable: true,
    },
    description: {
      type: 'string',
      description: 'Instructor bio/description',
      nullable: true,
    },
    expertise: {
      type: 'array',
      items: { type: 'string' },
      description: 'Areas of expertise',
      nullable: true,
    },
    experience_years: {
      type: 'integer',
      description: 'Years of experience',
      nullable: true,
    },
    rating: {
      type: 'number',
      description: 'Average rating',
      nullable: true,
    },
    total_students: {
      type: 'integer',
      description: 'Total students taught',
      nullable: true,
    },
    is_active: {
      type: 'boolean',
      description: 'Whether instructor is active',
      nullable: true,
    },
    ...timestampFieldsSchema,
  },
};

/**
 * Instructor Input Schema - Documentation Only
 */
const instructorInputSchema = {
  type: 'object',
  // No required fields - let backend handle validation
  properties: {
    name: instructorEntitySchema.properties.name,
    job_title: instructorEntitySchema.properties.job_title,
    avatar_url: instructorEntitySchema.properties.avatar_url,
    description: instructorEntitySchema.properties.description,
    expertise: instructorEntitySchema.properties.expertise,
    experience_years: instructorEntitySchema.properties.experience_years,
    is_active: instructorEntitySchema.properties.is_active,
  },
};

/**
 * Instructor Query Parameters Schema
 */
const instructorQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    ...searchQuerySchema.properties,
    job_title: {
      type: 'string',
      description: 'Filter by job title',
    },
    is_active: {
      type: 'boolean',
      description: 'Filter active instructors only',
    },
    min_rating: {
      type: 'number',
      description: 'Minimum rating filter',
    },
    expertise: {
      type: 'string',
      description: 'Filter by expertise area',
    },
  },
};

// ========================
// API ENDPOINT SCHEMAS
// ========================

/**
 * GET /api/instructors - Get all instructors
 */
export const getAllInstructorsSchema = {
  summary: 'Get all instructors with pagination and filtering',
  description: 'Retrieve a paginated list of instructors with optional filtering',
  querystring: instructorQuerySchema,
  response: {
    200: createPaginatedResponseSchema(instructorEntitySchema, 'Instructors retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/instructors/:id - Get instructor by ID
 */
export const getInstructorByIdSchema = {
  summary: 'Get instructor by ID',
  description: 'Retrieve a specific instructor by their ID',
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(instructorEntitySchema, 'Instructor retrieved successfully'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * POST /api/admin/instructors - Create new instructor (Admin only)
 */
export const createInstructorSchema = {
  summary: 'Create new instructor',
  description: 'Create a new instructor (Admin only)',
  body: instructorInputSchema,
  response: {
    201: createSuccessResponseSchema(instructorEntitySchema, 'Instructor created successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Admin access required'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * PUT /api/admin/instructors/:id - Update instructor (Admin only)
 */
export const updateInstructorSchema = {
  summary: 'Update instructor',
  description: 'Update an existing instructor (Admin only)',
  params: idParamSchema,
  body: instructorInputSchema,
  response: {
    200: createSuccessResponseSchema(instructorEntitySchema, 'Instructor updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Admin access required'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * DELETE /api/admin/instructors/:id - Delete instructor (Admin only)
 */
export const deleteInstructorSchema = {
  summary: 'Delete instructor',
  description: 'Delete an instructor (Admin only)',
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema('Instructor deleted successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Admin access required'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/instructors/popular - Get popular instructors
 */
export const getPopularInstructorsSchema = {
  summary: 'Get popular instructors',
  description: 'Get list of popular instructors based on ratings and student count',
  querystring: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Number of instructors to return',
      },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'array',
        items: instructorEntitySchema,
      },
      'Popular instructors retrieved successfully'
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
