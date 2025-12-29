import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

const instructorEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'Unique instructor identifier' },
    name: { type: 'string', description: 'Instructor full name' },
    job_title: { type: 'string', description: 'Instructor job title', nullable: true },
    avatar_url: { type: 'string', format: 'uri', description: 'Instructor avatar URL', nullable: true },
    description: { type: 'string', description: 'Instructor bio', nullable: true },
    ...timestampFieldsSchema,
  },
};

const instructorInputSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 255, description: 'Instructor full name' },
    job_title: { type: 'string', maxLength: 255, description: 'Instructor job title' },
    avatar_url: { type: 'string', format: 'uri', maxLength: 500, description: 'Avatar URL' },
    description: { type: 'string', maxLength: 2000, description: 'Instructor bio' },
  },
  additionalProperties: false,
};

const instructorUpdateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 255, description: 'Instructor full name' },
    job_title: { type: 'string', maxLength: 255, description: 'Instructor job title' },
    avatar_url: { type: 'string', format: 'uri', maxLength: 500, description: 'Avatar URL' },
    description: { type: 'string', maxLength: 2000, description: 'Instructor bio' },
  },
  additionalProperties: false,
};

const instructorsQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    ...searchQuerySchema.properties,
  },
};

export const getAllInstructorsSchema = {
  summary: 'Get all instructors',
  description: 'Retrieve paginated list of instructors',
  tags: ['Instructors'],
  querystring: instructorsQuerySchema,
  response: {
    200: createPaginatedResponseSchema(instructorEntitySchema, 'Instructors retrieved'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getInstructorByIdSchema = {
  summary: 'Get instructor by ID',
  description: 'Retrieve a specific instructor by ID',
  tags: ['Instructors'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(instructorEntitySchema, 'Instructor retrieved'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const createInstructorSchema = {
  summary: 'Create instructor',
  description: 'Create a new instructor (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  body: instructorInputSchema,
  response: {
    201: createSuccessResponseSchema(instructorEntitySchema, 'Instructor created'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateInstructorSchema = {
  summary: 'Update instructor',
  description: 'Update an existing instructor (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: instructorUpdateSchema,
  response: {
    200: createSuccessResponseSchema(instructorEntitySchema, 'Instructor updated'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteInstructorSchema = {
  summary: 'Delete instructor',
  description: 'Delete an instructor (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Instructor deleted'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const searchInstructorByNameSchema = {
  summary: 'Search instructors by name',
  description: 'Search instructors by name',
  tags: ['Instructors'],
  querystring: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, description: 'Search query' },
    },
    required: ['name'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: instructorEntitySchema }, 'Search results'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getPopularInstructorsSchema = {
  summary: 'Get popular instructors',
  description: 'Get list of popular instructors',
  tags: ['Instructors'],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10, description: 'Number to return' },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: instructorEntitySchema }, 'Popular instructors'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getInstructorStatsSchema = {
  summary: 'Get instructor statistics',
  description: 'Get overall instructor statistics (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Statistics retrieved'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// User Instructor Schemas
export const getUserAllInstructorsSchema = {
  summary: 'Get all instructors',
  description: 'Retrieve paginated list of instructors with optional filtering',
  tags: ['User Instructors'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      search: { type: 'string' },
      include_academies: { type: 'boolean', default: false },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Instructors retrieved'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserSearchInstructorByNameSchema = {
  summary: 'Search instructors by name',
  description: 'Search instructors by name',
  tags: ['User Instructors'],
  querystring: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Search results'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserPopularInstructorsSchema = {
  summary: 'Get popular instructors',
  description: 'Get list of popular instructors',
  tags: ['User Instructors'],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Popular instructors'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserInstructorsByJobTitleSchema = {
  summary: 'Get instructors by job title',
  description: 'Get instructors filtered by job title',
  tags: ['User Instructors'],
  querystring: {
    type: 'object',
    required: ['job_title'],
    properties: {
      job_title: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Instructors by job title'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserInstructorsByAcademyIdSchema = {
  summary: 'Get instructors by academy ID',
  description: 'Get instructors for a specific academy',
  tags: ['User Instructors'],
  params: {
    type: 'object',
    properties: {
      academyId: { type: 'integer', minimum: 1 },
    },
    required: ['academyId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Academy instructors'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserInstructorByIdSchema = {
  summary: 'Get instructor by ID',
  description: 'Get instructor details by ID',
  tags: ['User Instructors'],
  params: idParamSchema,
  querystring: {
    type: 'object',
    properties: {
      include_academies: { type: 'boolean', default: false },
    },
  },
  response: {
    200: createSuccessResponseSchema(instructorEntitySchema, 'Instructor retrieved'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserAcademiesByInstructorIdSchema = {
  summary: 'Get academies by instructor ID',
  description: 'Get academies taught by a specific instructor',
  tags: ['User Instructors'],
  params: {
    type: 'object',
    properties: {
      instructorId: { type: 'integer', minimum: 1 },
    },
    required: ['instructorId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Instructor academies'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// Admin Instructor Schemas
export const adminCreateInstructorSchema = {
  summary: 'Create instructor',
  description: 'Create a new instructor (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'job_title'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 255 },
      job_title: { type: 'string', minLength: 2, maxLength: 255 },
      avatar_url: { type: 'string', format: 'uri' },
      description: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(instructorEntitySchema, 'Instructor created'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const adminUpdateInstructorSchema = {
  summary: 'Update instructor',
  description: 'Update an existing instructor (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 255 },
      job_title: { type: 'string', minLength: 2, maxLength: 255 },
      avatar_url: { type: 'string', format: 'uri' },
      description: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(instructorEntitySchema, 'Instructor updated'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const adminDeleteInstructorSchema = {
  summary: 'Delete instructor',
  description: 'Delete an instructor (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: 'null' }, 'Instructor deleted'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAvailableInstructorsForAcademySchema = {
  summary: 'Get available instructors for academy',
  description: 'Get instructors not yet assigned to a specific academy (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      academyId: { type: 'integer', minimum: 1 },
    },
    required: ['academyId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Available instructors'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const assignInstructorToAcademySchema = {
  summary: 'Assign instructor to academy',
  description: 'Assign an instructor to an academy (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      academyId: { type: 'integer', minimum: 1 },
    },
    required: ['academyId'],
  },
  body: {
    type: 'object',
    required: ['instructor_id'],
    properties: {
      instructor_id: { type: 'integer', minimum: 1 },
      instructor_order: { type: 'integer', minimum: 1, default: 1 },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Instructor assigned'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const removeInstructorFromAcademySchema = {
  summary: 'Remove instructor from academy',
  description: 'Remove an instructor from an academy (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      academyId: { type: 'integer', minimum: 1 },
      instructorId: { type: 'integer', minimum: 1 },
    },
    required: ['academyId', 'instructorId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'null' }, 'Instructor removed'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const uploadInstructorAvatarSchema = {
  summary: 'Upload instructor avatar',
  description: 'Upload avatar image for an instructor (Admin only)',
  tags: ['Admin Instructors'],
  security: [{ bearerAuth: [] }],
  consumes: ['multipart/form-data'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          avatar_url: { type: 'string' },
        },
      },
      'Avatar uploaded'
    ),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
