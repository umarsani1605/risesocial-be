import { 
  createSuccessResponseSchema, 
  createPaginatedResponseSchema, 
  createErrorResponseSchema,
  paginationQuerySchema,
  searchQuerySchema,
  idParamSchema,
  timestampFieldsSchema
} from "./baseSchemas.js";

// TESTIMONIALS SCHEMAS - DOCUMENTATION ONLY

const testimonialEntitySchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Unique testimonial identifier" },
    name: { type: "string", description: "Author name", nullable: true },
    content: { type: "string", description: "Testimonial content", nullable: true },
    rating: { type: "integer", description: "Rating (1-5)", nullable: true },
    country: { type: "string", description: "Author country", nullable: true },
    is_featured: { type: "boolean", description: "Is featured", nullable: true },
    ...timestampFieldsSchema,
  },
};

export const getAllTestimonialsSchema = {
  summary: "Get all testimonials",
  querystring: { ...paginationQuerySchema },
  response: {
    200: createPaginatedResponseSchema(testimonialEntitySchema, "Testimonials retrieved"),
    500: createErrorResponseSchema(500, "Internal Server Error"),
  },
};
