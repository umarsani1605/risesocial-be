import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

/**
 * Instructor Entity Schema
 */
const instructorEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'Unique instructor identifier' },
    name: { type: 'string', description: 'Instructor full name' },
    job_title: { type: 'string', description: 'Instructor job title', nullable: true },
    avatar_url: { type: 'string', format: 'uri', description: 'Instructor avatar/photo URL', nullable: true },
    description: { type: 'string', description: 'Instructor bio/description', nullable: true },
    expertise: { type: 'array', items: { type: 'string' }, description: 'Areas of expertise', nullable: true },
    experience_years: { type: 'integer', description: 'Years of experience', nullable: true },
    rating: { type: 'number', description: 'Average rating', nullable: true },
    total_students: { type: 'integer', description: 'Total students taught', nullable: true },
    is_active: { type: 'boolean', description: 'Whether instructor is active' },
    ...timestampFieldsSchema,
  },
};

/**
 * Instructor with Academies Schema
 */
const instructorWithAcademiesSchema = {
  type: 'object',
  properties: {
    ...instructorEntitySchema.properties,
    academies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          path_slug: { type: 'string' },
          image_url: { type: 'string' },
          category: { type: 'string' },
        },
      },
    },
    _count: {
      type: 'object',
      properties: {
        academies: { type: 'integer' },
      },
    },
  },
};

/**
 * Instructor Input Schema
 */
const instructorInputSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 255, description: 'Instructor full name' },
    job_title: { type: 'string', maxLength: 255, description: 'Instructor job title' },
    avatar_url: { type: 'string', format: 'uri', maxLength: 500, description: 'Instructor avatar/photo URL' },
    description: { type: 'string', maxLength: 2000, description: 'Instructor bio/description' },
    expertise: { type: 'array', items: { type: 'string', maxLength: 100 }, description: 'Areas of expertise' },
    experience_years: { type: 'integer', minimum: 0, maximum: 100, description: 'Years of experience' },
    is_active: { type: 'boolean', default: true, description: 'Whether instructor is active' },
  },
  additionalProperties: false,
};

/**
 * Instructor Update Schema
 */
const instructorUpdateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 255, description: 'Instructor full name' },
    job_title: { type: 'string', maxLength: 255, description: 'Instructor job title' },
    avatar_url: { type: 'string', format: 'uri', maxLength: 500, description: 'Instructor avatar/photo URL' },
    description: { type: 'string', maxLength: 2000, description: 'Instructor bio/description' },
    expertise: { type: 'array', items: { type: 'string', maxLength: 100 }, description: 'Areas of expertise' },
    experience_years: { type: 'integer', minimum: 0, maximum: 100, description: 'Years of experience' },
    is_active: { type: 'boolean', description: 'Whether instructor is active' },
  },
  additionalProperties: false,
};

/**
 * Instructor Query Parameters Schema
 */
const instructorQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    ...searchQuerySchema.properties,
    job_title: { type: 'string', description: 'Filter by job title' },
    is_active: { type: 'boolean', description: 'Filter active instructors only' },
    min_rating: { type: 'number', minimum: 0, maximum: 5, description: 'Minimum rating filter' },
    expertise: { type: 'string', description: 'Filter by expertise area' },
  },
};

/**
 * GET /api/instructors - Get all instructors
 */
export const getAllInstructorsSchema = {
  summary: 'Get all instructors with pagination and filtering',
  description: 'Retrieve a paginated list of instructors with optional filtering',
  tags: ['Instructors'],
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
  tags: ['Instructors'],
  params: idParamSchema,
  querystring: {
    type: 'object',
    properties: {
      includeAcademies: { type: 'boolean', default: false, description: 'Include related academies' },
    },
  },
  response: {
    200: createSuccessResponseSchema(instructorWithAcademiesSchema, 'Instructor retrieved successfully'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/instructors/search - Search instructors by name
 */
export const searchInstructorByNameSchema = {
  summary: 'Search instructors by name',
  description: 'Search for instructors by name',
  tags: ['Instructors'],
  querystring: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, description: 'Search term for instructor name' },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      { type: 'array', items: instructorEntitySchema },
      'Instructors found successfully'
    ),
    400: createErrorResponseSchema(400, 'Bad Request - Name is required'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/instructors/popular - Get popular instructors
 */
export const getPopularInstructorsSchema = {
  summary: 'Get popular instructors',
  description: 'Get list of popular instructors based on ratings and student count',
  tags: ['Instructors'],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10, description: 'Number of instructors to return' },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      { type: 'array', items: instructorEntitySchema },
      'Popular instructors retrieved successfully'
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/instructors/by-job-title - Get instructors by job title
 */
export const getInstructorsByJobTitleSchema = {
  summary: 'Get instructors by job title',
  description: 'Retrieve instructors filtered by job title',
  tags: ['Instructors'],
  querystring: {
    type: 'object',
    required: ['jobTitle'],
    properties: {
      jobTitle: { type: 'string', minLength: 1, description: 'Job title to filter by' },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      { type: 'array', items: instructorEntitySchema },
      'Instructors retrieved successfully'
    ),
    400: createErrorResponseSchema(400, 'Bad Request - Job title is required'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/instructors/academy/:academyId - Get instructors by academy
 */
export const getInstructorsByAcademyIdSchema = {
  summary: 'Get instructors by academy',
  description: 'Retrieve all instructors teaching a specific academy',
  tags: ['Instructors'],
  params: {
    type: 'object',
    properties: {
      academyId: { type: 'string', minLength: 1, description: 'Academy ID' },
    },
    required: ['academyId'],
  },
  response: {
    200: createSuccessResponseSchema(
      { type: 'array', items: instructorEntitySchema },
      'Instructors retrieved successfully'
    ),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/instructors/:instructorId/academies - Get academies by instructor
 */
export const getAcademiesByInstructorIdSchema = {
  summary: 'Get academies by instructor',
  description: 'Retrieve all academies taught by a specific instructor',
  tags: ['Instructors'],
  params: {
    type: 'object',
    properties: {
      instructorId: { type: 'string', minLength: 1, description: 'Instructor ID' },
    },
    required: ['instructorId'],
  },
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            path_slug: { type: 'string' },
            image_url: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
      'Academies retrieved successfully'
    ),
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
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
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
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: instructorUpdateSchema,
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
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }, 'Instructor deleted successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Admin access required'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/admin/instructors/statistics - Get instructor statistics
 */
export const getInstructorStatsSchema = {
  summary: 'Get instructor statistics',
  description: 'Get overall instructor statistics (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          active: { type: 'integer' },
          inactive: { type: 'integer' },
          totalAcademies: { type: 'integer' },
          averageRating: { type: 'number' },
          totalStudents: { type: 'integer' },
        },
      },
      'Statistics retrieved successfully'
    ),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/admin/instructors/available/:academyId - Get available instructors for academy
 */
export const getAvailableInstructorsForAcademySchema = {
  summary: 'Get available instructors for academy',
  description: 'Get list of instructors not yet assigned to a specific academy (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      academyId: { type: 'string', minLength: 1, description: 'Academy ID' },
    },
    required: ['academyId'],
  },
  response: {
    200: createSuccessResponseSchema(
      { type: 'array', items: instructorEntitySchema },
      'Available instructors retrieved successfully'
    ),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * POST /api/admin/instructors/assign/:academyId - Assign instructor to academy
 */
export const assignInstructorToAcademySchema = {
  summary: 'Assign instructor to academy',
  description: 'Assign an instructor to a specific academy (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      academyId: { type: 'string', minLength: 1, description: 'Academy ID' },
    },
    required: ['academyId'],
  },
  body: {
    type: 'object',
    required: ['instructorId'],
    properties: {
      instructorId: { type: 'integer', minimum: 1, description: 'Instructor ID' },
      instructorOrder: { type: 'integer', minimum: 1, description: 'Display order' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }, 'Instructor assigned successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy or Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * DELETE /api/admin/instructors/remove/:academyId/:instructorId - Remove instructor from academy
 */
export const removeInstructorFromAcademySchema = {
  summary: 'Remove instructor from academy',
  description: 'Remove an instructor assignment from a specific academy (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      academyId: { type: 'string', minLength: 1, description: 'Academy ID' },
      instructorId: { type: 'string', minLength: 1, description: 'Instructor ID' },
    },
    required: ['academyId', 'instructorId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }, 'Instructor removed successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Assignment not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * POST /api/admin/instructors/:id/avatar - Upload instructor avatar
 */
export const uploadInstructorAvatarSchema = {
  summary: 'Upload instructor avatar',
  description: 'Upload avatar image for an instructor (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          avatar_url: { type: 'string' },
        },
      },
      'Avatar uploaded successfully'
    ),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid file'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
