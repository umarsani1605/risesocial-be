import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

const TESTIMONIAL_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING'];

const testimonialEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'Unique testimonial identifier' },
    name: { type: 'string', description: 'Author name' },
    country: { type: 'string', description: 'Author country' },
    text: { type: 'string', description: 'Testimonial content' },
    rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
    status: { type: 'string', enum: TESTIMONIAL_STATUSES, description: 'Testimonial status' },
    featured: { type: 'boolean', description: 'Is featured' },
    avatar_url: { type: 'string', description: 'Avatar URL', nullable: true },
    ...timestampFieldsSchema,
  },
};

const testimonialInputSchema = {
  type: 'object',
  required: ['name', 'country', 'text', 'rating'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 255, description: 'Author name' },
    country: { type: 'string', minLength: 2, maxLength: 100, description: 'Author country' },
    text: { type: 'string', minLength: 10, maxLength: 1000, description: 'Testimonial content' },
    rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
    status: { type: 'string', enum: TESTIMONIAL_STATUSES, default: 'ACTIVE', description: 'Testimonial status' },
    featured: { type: 'boolean', default: false, description: 'Is featured' },
    avatar_url: { type: 'string', maxLength: 500, description: 'Avatar URL' },
  },
  additionalProperties: false,
};

const testimonialUpdateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 255, description: 'Author name' },
    country: { type: 'string', minLength: 2, maxLength: 100, description: 'Author country' },
    text: { type: 'string', minLength: 10, maxLength: 1000, description: 'Testimonial content' },
    rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
    status: { type: 'string', enum: TESTIMONIAL_STATUSES, description: 'Testimonial status' },
    featured: { type: 'boolean', description: 'Is featured' },
    avatar_url: { type: 'string', maxLength: 500, description: 'Avatar URL' },
  },
  additionalProperties: false,
};

const testimonialsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, description: 'Page number (optional, starts from 1)' },
    limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of items per page (optional)' },
    ...searchQuerySchema.properties,
    country: { type: 'string', description: 'Filter by country' },
    rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Filter by minimum rating' },
    status: { type: 'string', enum: TESTIMONIAL_STATUSES, description: 'Filter by status' },
    featured: { type: 'boolean', description: 'Filter featured testimonials' },
  },
};

export const getAllTestimonialsSchema = {
  summary: 'Get all testimonials',
  description: 'Retrieve paginated list of testimonials with optional filtering',
  tags: ['Testimonials'],
  querystring: testimonialsQuerySchema,
  response: {
    200: createPaginatedResponseSchema(testimonialEntitySchema, 'Testimonials retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getTestimonialByIdSchema = {
  summary: 'Get testimonial by ID',
  description: 'Retrieve a specific testimonial by ID',
  tags: ['Testimonials'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, 'Testimonial retrieved successfully'),
    404: createErrorResponseSchema(404, 'Testimonial not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getFeaturedTestimonialsSchema = {
  summary: 'Get featured testimonials',
  description: 'Retrieve featured testimonials',
  tags: ['Testimonials'],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 6, description: 'Number of testimonials to return' },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: testimonialEntitySchema }, 'Featured testimonials retrieved successfully'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const createTestimonialSchema = {
  summary: 'Create testimonial',
  description: 'Create a new testimonial (Admin only)',
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  body: testimonialInputSchema,
  response: {
    201: createSuccessResponseSchema(testimonialEntitySchema, 'Testimonial created successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateTestimonialSchema = {
  summary: 'Update testimonial',
  description: 'Update an existing testimonial (Admin only)',
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: testimonialUpdateSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, 'Testimonial updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Testimonial not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteTestimonialSchema = {
  summary: 'Delete testimonial',
  description: 'Delete a testimonial (Admin only)',
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: 'null' }, 'Testimonial deleted successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Testimonial not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// User Testimonials Schemas
export const getUserTestimonialsSchema = {
  summary: 'Get all testimonials',
  description:
    'Get all active testimonials with search and filtering. Pagination is optional - if page/limit not provided, returns all testimonials.',
  tags: ['User Testimonials'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, description: 'Page number (optional, starts from 1)' },
      limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of items per page (optional)' },
      search: { type: 'string', description: 'Search across name, text, and country' },
      country: { type: 'string', description: 'Filter by country' },
      minRating: { type: 'integer', minimum: 1, maximum: 5, description: 'Filter by minimum rating' },
      featured: { type: 'boolean', description: 'Filter featured testimonials' },
      sortBy: { type: 'string', enum: ['createdAt', 'name', 'rating', 'country'], default: 'createdAt', description: 'Sort field' },
      sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Sort order' },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          testimonials: {
            type: 'array',
            items: testimonialEntitySchema,
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', minimum: 1 },
              limit: { type: 'integer', minimum: 1 },
              total: { type: 'integer', minimum: 0 },
              totalPages: { type: 'integer', minimum: 0 },
              hasNext: { type: 'boolean' },
              hasPrev: { type: 'boolean' },
            },
          },
        },
        required: ['testimonials'],
      },
      'Testimonials retrieved',
    ),
    400: createErrorResponseSchema(400, 'Bad Request'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserTestimonialByIdSchema = {
  summary: 'Get testimonial by ID',
  description: 'Get testimonial by ID',
  tags: ['User Testimonials'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, 'Testimonial retrieved'),
    404: createErrorResponseSchema(404, 'Testimonial not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// Admin Testimonials Schemas
export const getAdminTestimonialsSchema = {
  summary: 'Get all testimonials (Admin)',
  description: 'Get all testimonials with any status. Pagination is optional - if page/limit not provided, returns all testimonials.',
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, description: 'Page number (optional, starts from 1)' },
      limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of items per page (optional)' },
      search: { type: 'string', description: 'Search across name, text, and country' },
      country: { type: 'string', description: 'Filter by country' },
      minRating: { type: 'integer', minimum: 1, maximum: 5, description: 'Filter by minimum rating' },
      featured: { type: 'boolean', description: 'Filter featured testimonials' },
      status: { type: 'string', enum: TESTIMONIAL_STATUSES, description: 'Filter by status' },
      sortBy: {
        type: 'string',
        enum: ['createdAt', 'name', 'rating', 'country', 'status', 'featured'],
        default: 'createdAt',
        description: 'Sort field',
      },
      sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Sort order' },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          testimonials: {
            type: 'array',
            items: testimonialEntitySchema,
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', minimum: 1 },
              limit: { type: 'integer', minimum: 1 },
              total: { type: 'integer', minimum: 0 },
              totalPages: { type: 'integer', minimum: 0 },
              hasNext: { type: 'boolean' },
              hasPrev: { type: 'boolean' },
            },
          },
        },
        required: ['testimonials'],
      },
      'Testimonials retrieved',
    ),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAdminTestimonialByIdSchema = {
  summary: 'Get testimonial by ID (Admin)',
  description: 'Retrieve a single testimonial by ID with any status (Admin only)',
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, 'Testimonial retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Testimonial not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
