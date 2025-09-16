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
 * Base Bootcamp Entity Schema
 */
export const bootcampEntitySchema = {
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
 * Bootcamp Pricing Schema
 */
export const bootcampPricingSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    bootcamp_id: { type: 'integer' },
    name: { type: 'string' },
    original_price: { type: 'integer' },
    discount_price: { type: 'integer' },
    tier_order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    discount_percentage: { type: 'integer' },
    formatted_original_price: { type: 'string' },
    formatted_discount_price: { type: 'string' },
  },
};

/**
 * Bootcamp Feature Schema
 */
export const bootcampFeatureSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    bootcamp_id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: 'string' },
    icon: { type: 'string' },
    feature_order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Bootcamp Session Schema
 */
export const bootcampSessionSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    topic_id: { type: 'integer' },
    title: { type: 'string' },
    session_order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Bootcamp Topic Schema
 */
export const bootcampTopicSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    bootcamp_id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: 'string' },
    topic_order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    sessions: {
      type: 'array',
      items: bootcampSessionSchema,
    },
  },
};

/**
 * Bootcamp Instructor Schema
 */
export const bootcampInstructorSchema = {
  type: 'object',
  properties: {
    bootcamp_id: { type: 'integer' },
    instructor_id: { type: 'integer' },
    instructor_order: { type: 'integer' },
    instructor: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        job_title: { type: 'string' },
        avatar_url: { type: 'string' },
        description: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  },
};

/**
 * Bootcamp Testimonial Schema
 */
export const bootcampTestimonialSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    bootcamp_id: { type: 'integer' },
    name: { type: 'string' },
    avatar_url: { type: 'string' },
    comment: { type: 'string' },
    testimonial_order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Bootcamp FAQ Schema
 */
export const bootcampFaqSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    bootcamp_id: { type: 'integer' },
    question: { type: 'string' },
    answer: { type: 'string' },
    faq_order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Complete Bootcamp Detail Schema (with all relations)
 */
export const bootcampDetailSchema = {
  type: 'object',
  properties: {
    ...bootcampEntitySchema.properties,
    pricing: {
      type: 'array',
      items: bootcampPricingSchema,
    },
    features: {
      type: 'array',
      items: bootcampFeatureSchema,
    },
    topics: {
      type: 'array',
      items: bootcampTopicSchema,
    },
    instructors: {
      type: 'array',
      items: bootcampInstructorSchema,
    },
    testimonials: {
      type: 'array',
      items: bootcampTestimonialSchema,
    },
    faqs: {
      type: 'array',
      items: bootcampFaqSchema,
    },
    // Additional computed fields
    isPopular: { type: 'boolean' },
    isPremium: { type: 'boolean' },
    enrollmentCount: { type: 'integer' },
    formattedPricing: {
      type: 'array',
      items: bootcampPricingSchema,
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
 * Bootcamp Query Schema
 */
export const bootcampQuerySchema = {
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
 * User Bootcamp with Full Relations Schema
 */
export const userBootcampWithRelationsSchema = {
  type: 'object',
  properties: {
    // Base bootcamp properties
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
      items: bootcampPricingSchema,
    },
    features: {
      type: 'array',
      items: bootcampFeatureSchema,
    },
    instructors: {
      type: 'array',
      items: bootcampInstructorSchema,
    },
    topics: {
      type: 'array',
      items: bootcampTopicSchema,
    },
    faqs: {
      type: 'array',
      items: bootcampFaqSchema,
    },
    testimonials: {
      type: 'array',
      items: bootcampTestimonialSchema,
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
      items: bootcampPricingSchema,
    },
    instructorCount: { type: 'integer' },
    topicCount: { type: 'integer' },
    sessionCount: { type: 'integer' },
  },
};

// GET /api/bootcamps - Get all bootcamps
export const getAllBootcampsSchema = {
  tags: ['User Bootcamps'],
  summary: 'Get all bootcamps',
  description: 'Retrieve all available bootcamps with pagination and filtering',
  querystring: bootcampQuerySchema,
  response: {
    200: createPaginatedResponseSchema({
      type: 'array',
      items: userBootcampWithRelationsSchema,
    }),
    500: createErrorResponseSchema(),
  },
};

// GET /api/bootcamps/featured - Get featured bootcamps
export const getFeaturedBootcampsSchema = {
  tags: ['User Bootcamps'],
  summary: 'Get featured bootcamps',
  description: 'Retrieve featured bootcamps',
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 20, default: 6 },
    },
  },
  response: {
    200: createSuccessResponseSchema({
      type: 'array',
      items: bootcampEntitySchema,
    }),
    500: createErrorResponseSchema(),
  },
};

// GET /api/bootcamps/categories - Get bootcamp categories
export const getBootcampCategoriesSchema = {
  tags: ['User Bootcamps'],
  summary: 'Get bootcamp categories',
  description: 'Retrieve available bootcamp categories',
  response: {
    200: createSuccessResponseSchema({
      type: 'array',
      items: { type: 'string' },
    }),
    500: createErrorResponseSchema(),
  },
};

// GET /api/bootcamps/:slug - Get bootcamp by slug
export const getBootcampBySlugSchema = {
  tags: ['User Bootcamps'],
  summary: 'Get bootcamp by slug',
  description: 'Retrieve detailed bootcamp information by slug',
  params: {
    type: 'object',
    properties: {
      slug: { type: 'string', minLength: 3, maxLength: 100 },
    },
  },
  response: {
    200: createSuccessResponseSchema(bootcampDetailSchema),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// POST /api/admin/bootcamps - Create bootcamp
export const createBootcampSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Create new bootcamp',
  description: 'Create a new bootcamp (Admin only)',
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
    201: createSuccessResponseSchema(bootcampEntitySchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// PUT /api/admin/bootcamps/:id - Update bootcamp
export const updateBootcampSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Update bootcamp',
  description: 'Update an existing bootcamp (Admin only)',
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
    200: createSuccessResponseSchema(bootcampEntitySchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// DELETE /api/admin/bootcamps/:id - Delete bootcamp
export const deleteBootcampSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Delete bootcamp',
  description: 'Delete a bootcamp (Admin only)',
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
 * Admin Bootcamp with Full Relations Schema
 */
export const adminBootcampWithRelationsSchema = {
  type: 'object',
  properties: {
    // Base bootcamp properties
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
      items: bootcampPricingSchema,
    },
    features: {
      type: 'array',
      items: bootcampFeatureSchema,
    },
    instructors: {
      type: 'array',
      items: bootcampInstructorSchema,
    },
    topics: {
      type: 'array',
      items: bootcampTopicSchema,
    },
    faqs: {
      type: 'array',
      items: bootcampFaqSchema,
    },
    testimonials: {
      type: 'array',
      items: bootcampTestimonialSchema,
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
      items: bootcampPricingSchema,
    },
    instructorCount: { type: 'integer' },
    topicCount: { type: 'integer' },
    sessionCount: { type: 'integer' },
  },
};

// GET /api/admin/bootcamps - Get all bootcamps for admin
export const getAdminBootcampsSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Get all bootcamps for admin',
  description: 'Retrieve all bootcamps with pagination for admin dashboard',
  querystring: bootcampQuerySchema,
  response: {
    200: createPaginatedResponseSchema({
      type: 'array',
      items: adminBootcampWithRelationsSchema,
    }),
    401: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// GET /api/admin/bootcamps/:slug - Get bootcamp by slug (Admin only)
export const getAdminBootcampBySlugSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Get bootcamp by slug (Admin only)',
  description: 'Retrieve a specific bootcamp by slug with full relations for admin dashboard',
  params: {
    type: 'object',
    properties: {
      slug: { type: 'string', minLength: 1 },
    },
    required: ['slug'],
  },
  response: {
    200: createSuccessResponseSchema(adminBootcampWithRelationsSchema),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

// GET /api/admin/bootcamps/statistics - Get bootcamp statistics
export const getBootcampStatisticsSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Get bootcamp statistics',
  description: 'Retrieve bootcamp statistics (Admin only)',
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema({
      type: 'object',
      properties: {
        totalBootcamps: { type: 'integer' },
        activeBootcamps: { type: 'integer' },
        draftBootcamps: { type: 'integer' },
        archivedBootcamps: { type: 'integer' },
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
  tags: ['Admin Bootcamps'],
  summary: 'Create pricing for bootcamp',
  description: 'Add a new pricing tier to a bootcamp',
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
      tier_order: { type: 'number', minimum: 1 },
    },
    required: ['name', 'original_price', 'discount_price', 'tier_order'],
  },
  response: {
    201: createSuccessResponseSchema(bootcampPricingSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updatePricingSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Update pricing for bootcamp',
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
      tier_order: { type: 'number', minimum: 1 },
    },
    required: ['name', 'original_price', 'discount_price', 'tier_order'],
  },
  response: {
    200: createSuccessResponseSchema(bootcampPricingSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deletePricingSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Delete pricing for bootcamp',
  description: 'Delete a pricing tier from bootcamp',
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
  tags: ['Admin Bootcamps'],
  summary: 'Create feature for bootcamp',
  description: 'Add a new feature to a bootcamp',
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
    201: createSuccessResponseSchema(bootcampFeatureSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateFeatureSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Update feature for bootcamp',
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
    200: createSuccessResponseSchema(bootcampFeatureSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteFeatureSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Delete feature for bootcamp',
  description: 'Delete a feature from bootcamp',
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
  tags: ['Admin Bootcamps'],
  summary: 'Create instructor for bootcamp',
  description: 'Add a new instructor to a bootcamp',
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
    201: createSuccessResponseSchema(bootcampInstructorSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateInstructorSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Update instructor for bootcamp',
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
    200: createSuccessResponseSchema(bootcampInstructorSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteInstructorSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Delete instructor from bootcamp',
  description: 'Remove an instructor from bootcamp',
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
  tags: ['Admin Bootcamps'],
  summary: 'Create topic for bootcamp',
  description: 'Add a new topic to a bootcamp',
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
    201: createSuccessResponseSchema(bootcampTopicSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateTopicSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Update topic for bootcamp',
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
    200: createSuccessResponseSchema(bootcampTopicSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteTopicSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Delete topic from bootcamp',
  description: 'Remove a topic from bootcamp',
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
  tags: ['Admin Bootcamps'],
  summary: 'Create testimonial for bootcamp',
  description: 'Add a new testimonial to a bootcamp',
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
    201: createSuccessResponseSchema(bootcampTestimonialSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateTestimonialSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Update testimonial for bootcamp',
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
    200: createSuccessResponseSchema(bootcampTestimonialSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteTestimonialSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Delete testimonial from bootcamp',
  description: 'Remove a testimonial from bootcamp',
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
  tags: ['Admin Bootcamps'],
  summary: 'Create FAQ for bootcamp',
  description: 'Add a new FAQ to a bootcamp',
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
    201: createSuccessResponseSchema(bootcampFaqSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const updateFaqSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Update FAQ for bootcamp',
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
    200: createSuccessResponseSchema(bootcampFaqSchema),
    400: createErrorResponseSchema(),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};

export const deleteFaqSchema = {
  tags: ['Admin Bootcamps'],
  summary: 'Delete FAQ from bootcamp',
  description: 'Remove a FAQ from bootcamp',
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
  tags: ['Admin Bootcamps'],
  summary: 'Create session for topic',
  description: 'Add a new session to a topic',
  params: {
    type: 'object',
    properties: {
      bootcamp_id: { type: 'string', minLength: 1 },
      topic_id: { type: 'string', minLength: 1 },
    },
    required: ['bootcamp_id', 'topic_id'],
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
    201: createSuccessResponseSchema(bootcampSessionSchema),
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
  tags: ['Admin Bootcamps'],
  summary: 'Update session',
  description: 'Update an existing session',
  params: {
    type: 'object',
    properties: {
      bootcamp_id: { type: 'string', minLength: 1 },
      topic_id: { type: 'string', minLength: 1 },
      session_id: { type: 'string', minLength: 1 },
    },
    required: ['bootcamp_id', 'topic_id', 'session_id'],
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
    200: createSuccessResponseSchema(bootcampSessionSchema),
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
  tags: ['Admin Bootcamps'],
  summary: 'Delete session',
  description: 'Delete a session from a topic',
  params: {
    type: 'object',
    properties: {
      bootcamp_id: { type: 'string', minLength: 1 },
      topic_id: { type: 'string', minLength: 1 },
      session_id: { type: 'string', minLength: 1 },
    },
    required: ['bootcamp_id', 'topic_id', 'session_id'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(),
    404: createErrorResponseSchema(),
    500: createErrorResponseSchema(),
  },
};
