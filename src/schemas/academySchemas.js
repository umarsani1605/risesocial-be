import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  timestampFieldsSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
} from './baseSchemas.js';

/**
 * Base Academy Entity Schema
 */
export const academyEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    path_slug: { type: 'string' },
    description: { type: 'string' },
    duration: { type: 'string' },
    format: { type: 'string' },
    category: { type: 'string' },
    image_url: { type: 'string' },
    rating: { type: 'number' },
    rating_count: { type: 'integer' },
    certificate: { type: 'boolean' },
    portfolio: { type: 'boolean' },
    status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
    meta_title: { type: 'string' },
    meta_description: { type: 'string' },
    ...timestampFieldsSchema.properties,
  },
};

/**
 * Academy Pricing Schema
 */
export const academyPricingSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    name: { type: 'string' },
    original_price: { type: 'integer' },
    discount_price: { type: 'integer' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    discount_percentage: { type: 'integer' },
    formatted_original_price: { type: 'string' },
    formatted_discount_price: { type: 'string' },
  },
};

/**
 * Academy Feature Schema
 */
export const academyFeatureSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: 'string' },
    icon: { type: 'string' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Academy Session Schema
 */
export const academySessionSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    topic_id: { type: 'integer' },
    title: { type: 'string' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Academy Topic Schema
 */
export const academyTopicSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: 'string' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    sessions: {
      type: 'array',
      items: academySessionSchema,
    },
  },
};

/**
 * Academy Instructor Schema (denormalized)
 */
export const academyInstructorSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    name: { type: 'string' },
    job_title: { type: 'string' },
    avatar_url: { type: 'string' },
    description: { type: 'string' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Academy Testimonial Schema
 */
export const academyTestimonialSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    name: { type: 'string' },
    avatar_url: { type: 'string' },
    comment: { type: 'string' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Academy FAQ Schema
 */
export const academyFaqSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    question: { type: 'string' },
    answer: { type: 'string' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Complete Academy Detail Schema (with all relations)
 */
export const academyDetailSchema = {
  type: 'object',
  properties: {
    ...academyEntitySchema.properties,
    pricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    features: {
      type: 'array',
      items: academyFeatureSchema,
    },
    topics: {
      type: 'array',
      items: academyTopicSchema,
    },
    instructors: {
      type: 'array',
      items: academyInstructorSchema,
    },
    testimonials: {
      type: 'array',
      items: academyTestimonialSchema,
    },
    faqs: {
      type: 'array',
      items: academyFaqSchema,
    },
    // Additional computed fields
    isPopular: { type: 'boolean' },
    isPremium: { type: 'boolean' },
    enrollmentCount: { type: 'integer' },
    formattedPricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    instructorCount: { type: 'integer' },
    topicCount: { type: 'integer' },
    sessionCount: { type: 'integer' },
    estimatedDuration: { type: 'string' },
    difficultyLevel: { type: 'string' },
    averageRating: { type: 'number' },
    completionRate: { type: 'number' },
  },
};

/**
 * Academy Query Schema
 */
export const academyQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    ...searchQuerySchema.properties,
    category: { type: 'string' },
    status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
    featured: { type: 'boolean' },
  },
};

/**
 * Route Schemas for Fastify
 */

/**
 * User Academy with Full Relations Schema
 */
export const userAcademyWithRelationsSchema = {
  type: 'object',
  properties: {
    // Base academy properties
    id: { type: 'integer' },
    title: { type: 'string' },
    path_slug: { type: 'string' },
    description: { type: 'string' },
    duration: { type: 'string' },
    format: { type: 'string' },
    category: { type: 'string' },
    image_url: { type: 'string' },
    rating: { type: 'number' },
    rating_count: { type: 'integer' },
    certificate: { type: 'boolean' },
    portfolio: { type: 'boolean' },
    status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
    meta_title: { type: 'string' },
    meta_description: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },

    // Relations
    pricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    features: {
      type: 'array',
      items: academyFeatureSchema,
    },
    instructors: {
      type: 'array',
      items: academyInstructorSchema,
    },
    topics: {
      type: 'array',
      items: academyTopicSchema,
    },
    faqs: {
      type: 'array',
      items: academyFaqSchema,
    },
    testimonials: {
      type: 'array',
      items: academyTestimonialSchema,
    },

    // Computed fields
    _count: {
      type: 'object',
      properties: {
        enrollments: { type: 'integer' },
      },
    },
    isPopular: { type: 'boolean' },
    isPremium: { type: 'boolean' },
    enrollmentCount: { type: 'integer' },
    formattedPricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    instructorCount: { type: 'integer' },
    topicCount: { type: 'integer' },
    sessionCount: { type: 'integer' },
  },
};

// GET /api/academys - Get all academys
export const getAllAcademiesSchema = {
  tags: ['User Academies'],
  summary: 'Get all academies',
  description: 'Retrieve all available academies with pagination and filtering',
  querystring: academyQuerySchema,
  response: {
    200: createPaginatedResponseSchema({
      type: 'array',
      items: userAcademyWithRelationsSchema,
    }),
    500: createErrorResponseSchema(),
  },
};

// GET /api/academys/categories - Get academy categories
export const getAcademyCategoriesSchema = {
  tags: ['User Academies'],
  summary: 'Get academy categories',
  description: 'Retrieve available academy categories',
  response: {
    200: createSuccessResponseSchema({
      type: 'array',
      items: { type: 'string' },
    }),
    500: createErrorResponseSchema(),
  },
};

// GET /api/academys/:slug - Get academy by slug
export const getAcademyBySlugSchema = {
  tags: ['User Academies'],
  summary: 'Get academy by slug',
  description: 'Retrieve detailed academy information by slug',
  params: {
    type: 'object',
    properties: {
      slug: { type: 'string', minLength: 3, maxLength: 100 },
    },
  },
  response: {
    200: createSuccessResponseSchema(academyDetailSchema),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// POST /api/admin/academys - Create academy
export const createAcademySchema = {
  tags: ['Admin Academies'],
  summary: 'Create new academy',
  description: 'Create a new academy (Admin only)',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 3, maxLength: 255 },
      path_slug: { type: 'string', pattern: '^[a-z0-9-]+$', minLength: 3, maxLength: 100 },
      description: { type: 'string', minLength: 10 },
      duration: { type: 'string', maxLength: 100 },
      format: { type: 'string', maxLength: 100 },
      category: { type: 'string', maxLength: 100 },
      image_url: { type: 'string', maxLength: 500 },
      certificate: { type: 'boolean', default: false },
      portfolio: { type: 'boolean', default: false },
      status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' },
      meta_title: { type: 'string', maxLength: 255 },
      meta_description: { type: 'string', maxLength: 500 },
    },
  },
  response: {
    201: createSuccessResponseSchema(academyEntitySchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// PUT /api/admin/academys/:id - Update academy
export const updateAcademySchema = {
  tags: ['Admin Academies'],
  summary: 'Update academy',
  description: 'Update an existing academy (Admin only)',
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 3, maxLength: 255 },
      path_slug: { type: 'string', pattern: '^[a-z0-9-]+$', minLength: 3, maxLength: 100 },
      description: { type: 'string', minLength: 10 },
      duration: { type: 'string', maxLength: 100 },
      format: { type: 'string', maxLength: 100 },
      category: { type: 'string', maxLength: 100 },
      image_url: { type: 'string', maxLength: 500 },
      certificate: { type: 'boolean' },
      portfolio: { type: 'boolean' },
      status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
      meta_title: { type: 'string', maxLength: 255 },
      meta_description: { type: 'string', maxLength: 500 },
    },
  },
  response: {
    200: createSuccessResponseSchema(academyEntitySchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// DELETE /api/admin/academys/:id - Delete academy
export const deleteAcademySchema = {
  tags: ['Admin Academies'],
  summary: 'Delete academy',
  description: 'Delete a academy (Admin only)',
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: 'object' }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Admin Academy with Full Relations Schema
 */
export const adminAcademyWithRelationsSchema = {
  type: 'object',
  properties: {
    // Base academy properties
    id: { type: 'integer' },
    title: { type: 'string' },
    path_slug: { type: 'string' },
    description: { type: 'string' },
    duration: { type: 'string' },
    format: { type: 'string' },
    category: { type: 'string' },
    image_url: { type: 'string' },
    rating: { type: 'number' },
    rating_count: { type: 'integer' },
    certificate: { type: 'boolean' },
    portfolio: { type: 'boolean' },
    status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
    meta_title: { type: 'string' },
    meta_description: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },

    // Relations
    pricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    features: {
      type: 'array',
      items: academyFeatureSchema,
    },
    instructors: {
      type: 'array',
      items: academyInstructorSchema,
    },
    topics: {
      type: 'array',
      items: academyTopicSchema,
    },
    faqs: {
      type: 'array',
      items: academyFaqSchema,
    },
    testimonials: {
      type: 'array',
      items: academyTestimonialSchema,
    },

    // Computed fields
    _count: {
      type: 'object',
      properties: {
        enrollments: { type: 'integer' },
      },
    },
    isPopular: { type: 'boolean' },
    isPremium: { type: 'boolean' },
    enrollmentCount: { type: 'integer' },
    formattedPricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    instructorCount: { type: 'integer' },
    topicCount: { type: 'integer' },
    sessionCount: { type: 'integer' },
  },
};

// GET /api/admin/academys - Get all academys for admin
export const getAdminAcademiesSchema = {
  tags: ['Admin Academies'],
  summary: 'Get all academys for admin',
  description: 'Retrieve all academys with pagination for admin dashboard',
  querystring: academyQuerySchema,
  response: {
    200: createPaginatedResponseSchema({
      type: 'array',
      items: adminAcademyWithRelationsSchema,
    }),
    401: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// GET /api/admin/academys/:slug - Get academy by slug (Admin only)
export const getAdminAcademyBySlugSchema = {
  tags: ['Admin Academies'],
  summary: 'Get academy by slug (Admin only)',
  description: 'Retrieve a specific academy by slug with full relations for admin dashboard',
  params: {
    type: 'object',
    properties: {
      slug: { type: 'string', minLength: 1 },
    },
    required: ['slug'],
  },
  response: {
    200: createSuccessResponseSchema(adminAcademyWithRelationsSchema),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// GET /api/admin/academys/statistics - Get academy statistics
export const getAcademyStatisticsSchema = {
  tags: ['Admin Academies'],
  summary: 'Get academy statistics',
  description: 'Retrieve academy statistics (Admin only)',
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema({
      type: 'object',
      properties: {
        totalAcademies: { type: 'integer' },
        activeAcademies: { type: 'integer' },
        draftAcademies: { type: 'integer' },
        archivedAcademies: { type: 'integer' },
        totalEnrollments: { type: 'integer' },
        averageRating: { type: 'number' },
      },
    }),
    401: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Pricing CRUD Schemas
 */
export const createPricingSchema = {
  tags: ['Admin Academies'],
  summary: 'Create pricing for academy',
  description: 'Add a new pricing tier to a academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 50 },
      original_price: { type: 'number', minimum: 0 },
      discount_price: { type: 'number', minimum: 0 },
      order: { type: 'number', minimum: 1 },
    },
    required: ['name', 'original_price', 'discount_price', 'order'],
  },
  response: {
    201: createSuccessResponseSchema(academyPricingSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updatePricingSchema = {
  tags: ['Admin Academies'],
  summary: 'Update pricing for academy',
  description: 'Update an existing pricing tier',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      pricingId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'pricingId'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 50 },
      original_price: { type: 'number', minimum: 0 },
      discount_price: { type: 'number', minimum: 0 },
      order: { type: 'number', minimum: 1 },
    },
    required: ['name', 'original_price', 'discount_price', 'order'],
  },
  response: {
    200: createSuccessResponseSchema(academyPricingSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deletePricingSchema = {
  tags: ['Admin Academies'],
  summary: 'Delete pricing for academy',
  description: 'Delete a pricing tier from academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      pricingId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'pricingId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Features CRUD Schemas
 */
export const createFeatureSchema = {
  tags: ['Admin Academies'],
  summary: 'Create feature for academy',
  description: 'Add a new feature to a academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 100 },
      description: { type: 'string', minLength: 1, maxLength: 500 },
      icon: { type: 'string', minLength: 1, maxLength: 50 },
      feature_order: { type: 'number', minimum: 1 },
    },
    required: ['title', 'description', 'icon', 'feature_order'],
  },
  response: {
    201: createSuccessResponseSchema(academyFeatureSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateFeatureSchema = {
  tags: ['Admin Academies'],
  summary: 'Update feature for academy',
  description: 'Update an existing feature',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      featureId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'featureId'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 100 },
      description: { type: 'string', minLength: 1, maxLength: 500 },
      icon: { type: 'string', minLength: 1, maxLength: 50 },
      feature_order: { type: 'number', minimum: 1 },
    },
    required: ['title', 'description', 'icon', 'feature_order'],
  },
  response: {
    200: createSuccessResponseSchema(academyFeatureSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteFeatureSchema = {
  tags: ['Admin Academies'],
  summary: 'Delete feature for academy',
  description: 'Delete a feature from academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      featureId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'featureId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Instructors CRUD Schemas
 */
export const createInstructorSchema = {
  tags: ['Admin Academies'],
  summary: 'Create instructor for academy',
  description: 'Add a new instructor to a academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      instructor_id: { type: 'number', minimum: 1 },
      instructor_order: { type: 'number', minimum: 1 },
    },
    required: ['instructor_id', 'instructor_order'],
  },
  response: {
    201: createSuccessResponseSchema(academyInstructorSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateInstructorSchema = {
  tags: ['Admin Academies'],
  summary: 'Update instructor for academy',
  description: 'Update an existing instructor assignment',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      instructorId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'instructorId'],
  },
  body: {
    type: 'object',
    properties: {
      instructor_order: { type: 'number', minimum: 1 },
    },
    required: ['instructor_order'],
  },
  response: {
    200: createSuccessResponseSchema(academyInstructorSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteInstructorSchema = {
  tags: ['Admin Academies'],
  summary: 'Delete instructor from academy',
  description: 'Remove an instructor from academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      instructorId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'instructorId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Topics CRUD Schemas
 */
export const createTopicSchema = {
  tags: ['Admin Academies'],
  summary: 'Create topic for academy',
  description: 'Add a new topic to a academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 1000 },
      topic_order: { type: 'number', minimum: 1 },
    },
    required: ['title', 'description', 'topic_order'],
  },
  response: {
    201: createSuccessResponseSchema(academyTopicSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateTopicSchema = {
  tags: ['Admin Academies'],
  summary: 'Update topic for academy',
  description: 'Update an existing topic',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      topicId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'topicId'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 1000 },
      topic_order: { type: 'number', minimum: 1 },
    },
    required: ['title', 'description', 'topic_order'],
  },
  response: {
    200: createSuccessResponseSchema(academyTopicSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteTopicSchema = {
  tags: ['Admin Academies'],
  summary: 'Delete topic from academy',
  description: 'Remove a topic from academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      topicId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'topicId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Testimonials CRUD Schemas
 */
export const createTestimonialSchema = {
  tags: ['Admin Academies'],
  summary: 'Create testimonial for academy',
  description: 'Add a new testimonial to a academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      avatar_url: { type: 'string', maxLength: 500 },
      comment: { type: 'string', minLength: 1, maxLength: 1000 },
      testimonial_order: { type: 'number', minimum: 1 },
    },
    required: ['name', 'comment', 'testimonial_order'],
  },
  response: {
    201: createSuccessResponseSchema(academyTestimonialSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateTestimonialSchema = {
  tags: ['Admin Academies'],
  summary: 'Update testimonial for academy',
  description: 'Update an existing testimonial',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      testimonialId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'testimonialId'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      avatar_url: { type: 'string', maxLength: 500 },
      comment: { type: 'string', minLength: 1, maxLength: 1000 },
      testimonial_order: { type: 'number', minimum: 1 },
    },
    required: ['name', 'comment', 'testimonial_order'],
  },
  response: {
    200: createSuccessResponseSchema(academyTestimonialSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteTestimonialSchema = {
  tags: ['Admin Academies'],
  summary: 'Delete testimonial from academy',
  description: 'Remove a testimonial from academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      testimonialId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'testimonialId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * FAQs CRUD Schemas
 */
export const createFaqSchema = {
  tags: ['Admin Academies'],
  summary: 'Create FAQ for academy',
  description: 'Add a new FAQ to a academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      question: { type: 'string', minLength: 1, maxLength: 500 },
      answer: { type: 'string', minLength: 1, maxLength: 2000 },
      faq_order: { type: 'number', minimum: 1 },
    },
    required: ['question', 'answer', 'faq_order'],
  },
  response: {
    201: createSuccessResponseSchema(academyFaqSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateFaqSchema = {
  tags: ['Admin Academies'],
  summary: 'Update FAQ for academy',
  description: 'Update an existing FAQ',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      faqId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'faqId'],
  },
  body: {
    type: 'object',
    properties: {
      question: { type: 'string', minLength: 1, maxLength: 500 },
      answer: { type: 'string', minLength: 1, maxLength: 2000 },
      faq_order: { type: 'number', minimum: 1 },
    },
    required: ['question', 'answer', 'faq_order'],
  },
  response: {
    200: createSuccessResponseSchema(academyFaqSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteFaqSchema = {
  tags: ['Admin Academies'],
  summary: 'Delete FAQ from academy',
  description: 'Remove a FAQ from academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      faqId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'faqId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Create Session Schema
 */
export const createSessionSchema = {
  tags: ['Admin Academies'],
  summary: 'Create session for topic',
  description: 'Add a new session to a topic',
  params: {
    type: 'object',
    properties: {
      academy_id: { type: 'string', minLength: 1 },
      topic_id: { type: 'string', minLength: 1 },
    },
    required: ['academy_id', 'topic_id'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      session_order: { type: 'number', minimum: 1 },
    },
    required: ['title', 'session_order'],
  },
  response: {
    201: createSuccessResponseSchema(academySessionSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Update Session Schema
 */
export const updateSessionSchema = {
  tags: ['Admin Academies'],
  summary: 'Update session',
  description: 'Update an existing session',
  params: {
    type: 'object',
    properties: {
      academy_id: { type: 'string', minLength: 1 },
      topic_id: { type: 'string', minLength: 1 },
      session_id: { type: 'string', minLength: 1 },
    },
    required: ['academy_id', 'topic_id', 'session_id'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      session_order: { type: 'number', minimum: 1 },
    },
    required: ['title', 'session_order'],
  },
  response: {
    200: createSuccessResponseSchema(academySessionSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

/**
 * Delete Session Schema
 */
export const deleteSessionSchema = {
  tags: ['Admin Academies'],
  summary: 'Delete session',
  description: 'Delete a session from a topic',
  params: {
    type: 'object',
    properties: {
      academy_id: { type: 'string', minLength: 1 },
      topic_id: { type: 'string', minLength: 1 },
      session_id: { type: 'string', minLength: 1 },
    },
    required: ['academy_id', 'topic_id', 'session_id'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};
