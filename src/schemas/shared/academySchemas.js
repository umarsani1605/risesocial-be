import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  timestampFieldsSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
} from './baseSchemas.js';

export const academyEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    slug: { type: 'string' },
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
    pixel_id: { type: 'string', nullable: true },
    ...timestampFieldsSchema.properties,
  },
};

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
  },
};

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

export const academyTopicSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    theme_id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: 'string' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

export const academyThemeSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: 'string' },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    topics: {
      type: 'array',
      items: academyTopicSchema,
    },
  },
};

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
    themes: {
      type: 'array',
      items: academyThemeSchema,
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
    has_cohort: { type: 'boolean' },
    isPopular: { type: 'boolean' },
    isPremium: { type: 'boolean' },
    formattedPricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    instructorCount: { type: 'integer' },
    topicCount: { type: 'integer' },
    estimatedDuration: { type: 'string' },
    difficultyLevel: { type: 'string' },
    averageRating: { type: 'number' },
    completionRate: { type: 'number' },
  },
};

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

export const userAcademyWithRelationsSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    slug: { type: 'string' },
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
    pixel_id: { type: 'string', nullable: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },

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
    themes: {
      type: 'array',
      items: academyThemeSchema,
    },
    faqs: {
      type: 'array',
      items: academyFaqSchema,
    },
    testimonials: {
      type: 'array',
      items: academyTestimonialSchema,
    },

    isPopular: { type: 'boolean' },
    isPremium: { type: 'boolean' },
    formattedPricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    instructorCount: { type: 'integer' },
    topicCount: { type: 'integer' },
  },
};

export const getAllAcademiesSchema = {
  tags: ['User Academies'],
  summary: 'Get all academies',
  description: 'Retrieve all available academies with pagination and filtering',
  querystring: academyQuerySchema,
  response: {
    200: createPaginatedResponseSchema(userAcademyWithRelationsSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAcademyCategoriesSchema = {
  tags: ['User Academies'],
  summary: 'Get academy categories',
  description: 'Retrieve available academy categories',
  response: {
    200: createSuccessResponseSchema({
      type: 'array',
      items: { type: 'string' },
    }),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

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

export const createAcademySchema = {
  tags: ['Admin Academies'],
  summary: 'Create new academy',
  description: 'Create a new academy (Admin only)',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['title', 'description', 'duration', 'format', 'category', 'status'],
    properties: {
      title: { type: 'string' },
      slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
      description: { type: 'string' },
      duration: { type: 'string' },
      format: { type: 'string' },
      category: { type: 'string' },
      image_url: { type: 'string' },
      certificate: { type: 'boolean', default: false },
      portfolio: { type: 'boolean', default: false },
      status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' },
      pixel_id: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(academyEntitySchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateAcademySchema = {
  tags: ['Admin Academies'],
  summary: 'Update academy',
  description: 'Update an existing academy (Admin only)',
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: {
    type: 'object',
    required: ['title', 'description', 'duration', 'format', 'category', 'status'],
    properties: {
      title: { type: 'string' },
      slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
      description: { type: 'string' },
      duration: { type: 'string' },
      format: { type: 'string' },
      category: { type: 'string' },
      image_url: { type: 'string' },
      certificate: { type: 'boolean' },
      portfolio: { type: 'boolean' },
      status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
      pixel_id: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(academyEntitySchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteAcademySchema = {
  tags: ['Admin Academies'],
  summary: 'Delete academy',
  description: 'Delete a academy (Admin only)',
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const adminAcademyWithRelationsSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    slug: { type: 'string' },
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
    pixel_id: { type: 'string', nullable: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },

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
    themes: {
      type: 'array',
      items: academyThemeSchema,
    },
    faqs: {
      type: 'array',
      items: academyFaqSchema,
    },
    testimonials: {
      type: 'array',
      items: academyTestimonialSchema,
    },

    _count: {
      type: 'object',
      properties: {
        enrollments: { type: 'integer' },
      },
    },
    cohort_count: { type: 'integer' },
    has_cohort: { type: 'boolean' },
    isPopular: { type: 'boolean' },
    isPremium: { type: 'boolean' },
    formattedPricing: {
      type: 'array',
      items: academyPricingSchema,
    },
    instructorCount: { type: 'integer' },
    topicCount: { type: 'integer' },
  },
};

export const getAdminAcademiesSchema = {
  tags: ['Admin Academies'],
  summary: 'Get all academys for admin',
  description: 'Retrieve all academys with pagination for admin dashboard',
  querystring: academyQuerySchema,
  response: {
    200: createPaginatedResponseSchema(adminAcademyWithRelationsSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid query parameters'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

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
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

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
        averageRating: { type: 'number' },
      },
    }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

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
      name: { type: 'string' },
      original_price: { type: 'number' },
      discount_price: { type: 'number' },
      order: { type: 'number' },
    },
    required: ['name', 'original_price'],
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(academyPricingSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
      name: { type: 'string' },
      original_price: { type: 'number' },
      discount_price: { type: 'number' },
      order: { type: 'number' },
    },
    required: ['name', 'original_price'],
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(academyPricingSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Pricing not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Pricing not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

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
      title: { type: 'string' },
      description: { type: 'string' },
      icon: { type: 'string' },
      feature_order: { type: 'number' },
    },
    required: ['title', 'description', 'icon'],
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(academyFeatureSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
      title: { type: 'string' },
      description: { type: 'string' },
      icon: { type: 'string' },
      feature_order: { type: 'number' },
    },
    required: ['title', 'description', 'icon'],
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(academyFeatureSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Feature not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Feature not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

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
      name: { type: 'string' },
      job_title: { type: 'string' },
      avatar_url: { type: 'string' },
      description: { type: 'string' },
      order: { type: 'number' },
    },
    required: ['name', 'job_title'],
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(academyInstructorSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
      name: { type: 'string' },
      job_title: { type: 'string' },
      avatar_url: { type: 'string' },
      description: { type: 'string' },
      order: { type: 'number' },
    },
    required: ['name', 'job_title'],
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(academyInstructorSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Instructor not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const createTopicSchema = {
  tags: ['Admin Academies'],
  summary: 'Create topic for academy',
  description: 'Add a new topic (Level 2) to a academy, must belong to a theme',
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
      theme_id: { type: 'integer' },
      title: { type: 'string' },
      description: { type: 'string' },
      topic_order: { type: 'number' },
    },
    required: ['theme_id', 'title'],
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(academyTopicSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
    required: ['title'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      topic_order: { type: 'number' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(academyTopicSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Topic not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Topic not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

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
      name: { type: 'string' },
      avatar_url: { type: 'string' },
      comment: { type: 'string' },
      testimonial_order: { type: 'number' },
    },
    required: ['name', 'comment'],
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(academyTestimonialSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
      name: { type: 'string' },
      avatar_url: { type: 'string' },
      comment: { type: 'string' },
      testimonial_order: { type: 'number' },
    },
    required: ['name', 'comment'],
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(academyTestimonialSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Testimonial not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Testimonial not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

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
      question: { type: 'string' },
      answer: { type: 'string' },
      faq_order: { type: 'number' },
    },
    required: ['question', 'answer'],
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(academyFaqSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
      question: { type: 'string' },
      answer: { type: 'string' },
      faq_order: { type: 'number' },
    },
    required: ['question', 'answer'],
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(academyFaqSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'FAQ not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
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
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'FAQ not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// ─── GET sub-resource list schemas ───────────────────────────────────────────

const academyIdParam = {
  type: 'object',
  properties: { id: { type: 'string', minLength: 1 } },
  required: ['id'],
};

export const getAcademyPricingsSchema = {
  tags: ['Admin Academies'],
  summary: 'Get pricing list for academy',
  description: 'Retrieve all pricing tiers for a specific academy',
  params: academyIdParam,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: academyPricingSchema }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAcademyFeaturesSchema = {
  tags: ['Admin Academies'],
  summary: 'Get features list for academy',
  description: 'Retrieve all features for a specific academy',
  params: academyIdParam,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: academyFeatureSchema }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAcademyInstructorsSchema = {
  tags: ['Admin Academies'],
  summary: 'Get instructors list for academy',
  description: 'Retrieve all instructors for a specific academy',
  params: academyIdParam,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: academyInstructorSchema }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAcademyTopicsSchema = {
  tags: ['Admin Academies'],
  summary: 'Get topics list for academy',
  description: 'Retrieve all topics (Level 2) for a specific academy',
  params: academyIdParam,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: academyTopicSchema }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAcademyTestimonialsSchema = {
  tags: ['Admin Academies'],
  summary: 'Get testimonials list for academy',
  description: 'Retrieve all testimonials for a specific academy',
  params: academyIdParam,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: academyTestimonialSchema }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getAcademyFaqsSchema = {
  tags: ['Admin Academies'],
  summary: 'Get FAQs list for academy',
  description: 'Retrieve all FAQs for a specific academy',
  params: academyIdParam,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: academyFaqSchema }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// ─── Theme CRUD schemas ───────────────────────────────────────────────────────

export const getAcademyThemesSchema = {
  tags: ['Admin Academies'],
  summary: 'Get themes list for academy',
  description: 'Retrieve all themes (Level 1) with nested topics for a specific academy',
  params: academyIdParam,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: academyThemeSchema }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const createThemeSchema = {
  tags: ['Admin Academies'],
  summary: 'Create theme for academy',
  description: 'Add a new curriculum theme (Level 1) to a academy',
  params: academyIdParam,
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      order: { type: 'number' },
    },
    required: ['title'],
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(academyThemeSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Academy not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateThemeSchema = {
  tags: ['Admin Academies'],
  summary: 'Update theme for academy',
  description: 'Update an existing curriculum theme (Level 1)',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      themeId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'themeId'],
  },
  body: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      order: { type: 'number' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(academyThemeSchema),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Theme not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteThemeSchema = {
  tags: ['Admin Academies'],
  summary: 'Delete theme from academy',
  description: 'Remove a curriculum theme (Level 1) and all its topics from academy',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      themeId: { type: 'string', minLength: 1 },
    },
    required: ['id', 'themeId'],
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Theme not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
