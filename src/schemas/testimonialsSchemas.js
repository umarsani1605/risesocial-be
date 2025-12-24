import { 
  createSuccessResponseSchema, 
  createPaginatedResponseSchema, 
  createErrorResponseSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
  timestampFieldsSchema
} from "./baseSchemas.js";

const TESTIMONIAL_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING'];

const testimonialEntitySchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Unique testimonial identifier" },
    name: { type: "string", description: "Author name" },
    country: { type: "string", description: "Author country" },
    text: { type: "string", description: "Testimonial content" },
    rating: { type: "integer", minimum: 1, maximum: 5, description: "Rating (1-5)" },
    status: { type: "string", enum: TESTIMONIAL_STATUSES, description: "Testimonial status" },
    featured: { type: "boolean", description: "Is featured" },
    avatar_url: { type: "string", description: "Avatar URL", nullable: true },
    ...timestampFieldsSchema,
  },
};

const testimonialInputSchema = {
  type: "object",
  required: ['name', 'country', 'text'],
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100, description: "Author name" },
    country: { type: "string", minLength: 1, maxLength: 100, description: "Author country" },
    text: { type: "string", minLength: 10, maxLength: 1000, description: "Testimonial content" },
    rating: { type: "integer", minimum: 1, maximum: 5, default: 5, description: "Rating (1-5)" },
    status: { type: "string", enum: TESTIMONIAL_STATUSES, default: 'ACTIVE', description: "Testimonial status" },
    featured: { type: "boolean", default: false, description: "Is featured" },
    avatar_url: { type: "string", maxLength: 500, description: "Avatar URL" },
  },
  additionalProperties: false,
};

const testimonialUpdateSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100, description: "Author name" },
    country: { type: "string", minLength: 1, maxLength: 100, description: "Author country" },
    text: { type: "string", minLength: 10, maxLength: 1000, description: "Testimonial content" },
    rating: { type: "integer", minimum: 1, maximum: 5, description: "Rating (1-5)" },
    status: { type: "string", enum: TESTIMONIAL_STATUSES, description: "Testimonial status" },
    featured: { type: "boolean", description: "Is featured" },
    avatar_url: { type: "string", maxLength: 500, description: "Avatar URL" },
  },
  additionalProperties: false,
};

const testimonialsQuerySchema = {
  type: "object",
  properties: {
    ...paginationQuerySchema.properties,
    ...searchQuerySchema.properties,
    country: { type: "string", description: "Filter by country" },
    rating: { type: "integer", minimum: 1, maximum: 5, description: "Filter by minimum rating" },
    status: { type: "string", enum: TESTIMONIAL_STATUSES, description: "Filter by status" },
    featured: { type: "boolean", description: "Filter featured testimonials" },
  },
};

export const getAllTestimonialsSchema = {
  summary: "Get all testimonials",
  description: "Retrieve paginated list of testimonials with optional filtering",
  tags: ['Testimonials'],
  querystring: testimonialsQuerySchema,
  response: {
    200: createPaginatedResponseSchema(testimonialEntitySchema, "Testimonials retrieved successfully"),
    400: createErrorResponseSchema(400, "Bad Request - Invalid query parameters"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const getTestimonialByIdSchema = {
  summary: "Get testimonial by ID",
  description: "Retrieve a specific testimonial by ID",
  tags: ['Testimonials'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, "Testimonial retrieved successfully"),
    404: createErrorResponseSchema(404, "Testimonial not found"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const getFeaturedTestimonialsSchema = {
  summary: "Get featured testimonials",
  description: "Retrieve featured testimonials",
  tags: ['Testimonials'],
  querystring: {
    type: "object",
    properties: {
      limit: { type: "integer", minimum: 1, maximum: 50, default: 6, description: "Number of testimonials to return" },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      { type: "array", items: testimonialEntitySchema },
      "Featured testimonials retrieved successfully"
    ),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const getTestimonialsByCountrySchema = {
  summary: "Get testimonials by country",
  description: "Retrieve testimonials filtered by country",
  tags: ['Testimonials'],
  querystring: {
    type: "object",
    required: ['country'],
    properties: {
      country: { type: "string", minLength: 1, description: "Country name" },
      limit: { type: "integer", minimum: 1, maximum: 50, default: 10, description: "Number of testimonials to return" },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      { type: "array", items: testimonialEntitySchema },
      "Testimonials retrieved successfully"
    ),
    400: createErrorResponseSchema(400, "Bad Request - Country is required"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const getTestimonialsByRatingSchema = {
  summary: "Get testimonials by rating",
  description: "Retrieve testimonials filtered by minimum rating",
  tags: ['Testimonials'],
  querystring: {
    type: "object",
    required: ['minRating'],
    properties: {
      minRating: { type: "integer", minimum: 1, maximum: 5, description: "Minimum rating" },
      limit: { type: "integer", minimum: 1, maximum: 50, default: 10, description: "Number of testimonials to return" },
    },
  },
  response: {
    200: createSuccessResponseSchema(
      { type: "array", items: testimonialEntitySchema },
      "Testimonials retrieved successfully"
    ),
    400: createErrorResponseSchema(400, "Bad Request - Invalid rating"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const getCountriesWithCountsSchema = {
  summary: "Get countries with testimonial counts",
  description: "Retrieve list of countries with number of testimonials",
  tags: ['Testimonials'],
  response: {
    200: createSuccessResponseSchema(
      {
        type: "array",
        items: {
          type: "object",
          properties: {
            country: { type: "string" },
            count: { type: "integer" },
          },
        },
      },
      "Countries retrieved successfully"
    ),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const createTestimonialSchema = {
  summary: "Create testimonial",
  description: "Create a new testimonial (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  body: testimonialInputSchema,
  response: {
    201: createSuccessResponseSchema(testimonialEntitySchema, "Testimonial created successfully"),
    400: createErrorResponseSchema(400, "Bad Request - Invalid input data"),
    401: createErrorResponseSchema(401, "Unauthorized"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const updateTestimonialSchema = {
  summary: "Update testimonial",
  description: "Update an existing testimonial (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: testimonialUpdateSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, "Testimonial updated successfully"),
    400: createErrorResponseSchema(400, "Bad Request - Invalid input data"),
    401: createErrorResponseSchema(401, "Unauthorized"),
    404: createErrorResponseSchema(404, "Testimonial not found"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const deleteTestimonialSchema = {
  summary: "Delete testimonial",
  description: "Delete a testimonial (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema({ type: "object", properties: { message: { type: "string" } } }, "Testimonial deleted successfully"),
    401: createErrorResponseSchema(401, "Unauthorized"),
    404: createErrorResponseSchema(404, "Testimonial not found"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const toggleFeaturedTestimonialSchema = {
  summary: "Toggle featured status",
  description: "Toggle featured status of a testimonial (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, "Featured status toggled successfully"),
    401: createErrorResponseSchema(401, "Unauthorized"),
    404: createErrorResponseSchema(404, "Testimonial not found"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const approveTestimonialSchema = {
  summary: "Approve testimonial",
  description: "Approve a pending testimonial (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, "Testimonial approved successfully"),
    401: createErrorResponseSchema(401, "Unauthorized"),
    404: createErrorResponseSchema(404, "Testimonial not found"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const rejectTestimonialSchema = {
  summary: "Reject testimonial",
  description: "Reject a pending testimonial (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(testimonialEntitySchema, "Testimonial rejected successfully"),
    401: createErrorResponseSchema(401, "Unauthorized"),
    404: createErrorResponseSchema(404, "Testimonial not found"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const getTestimonialsStatisticsSchema = {
  summary: "Get testimonials statistics",
  description: "Get overall testimonials statistics (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(
      {
        type: "object",
        properties: {
          total: { type: "integer" },
          active: { type: "integer" },
          pending: { type: "integer" },
          featured: { type: "integer" },
          byCountry: { type: "object" },
          byRating: { type: "object" },
          averageRating: { type: "number" },
        },
      },
      "Statistics retrieved successfully"
    ),
    401: createErrorResponseSchema(401, "Unauthorized"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const getTestimonialStatisticsSchema = {
  summary: "Get testimonial statistics",
  description: "Get statistics for a specific testimonial (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(
      {
        type: "object",
        properties: {
          views: { type: "integer" },
          likes: { type: "integer" },
          shares: { type: "integer" },
        },
      },
      "Statistics retrieved successfully"
    ),
    401: createErrorResponseSchema(401, "Unauthorized"),
    404: createErrorResponseSchema(404, "Testimonial not found"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};

export const uploadTestimonialAvatarSchema = {
  summary: "Upload testimonial avatar",
  description: "Upload avatar for a testimonial (Admin only)",
  tags: ['Admin Testimonials'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(
      {
        type: "object",
        properties: {
          avatar_url: { type: "string" },
        },
      },
      "Avatar uploaded successfully"
    ),
    400: createErrorResponseSchema(400, "Bad Request - Invalid file"),
    401: createErrorResponseSchema(401, "Unauthorized"),
    404: createErrorResponseSchema(404, "Testimonial not found"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};
