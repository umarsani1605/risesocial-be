import { adminBootcampController } from '../../controllers/admin/bootcampController.js';
import { authMiddleware } from '../../middleware/auth.js';
import {
  getAdminBootcampsSchema,
  getAdminBootcampBySlugSchema,
  createPricingSchema,
  updatePricingSchema,
  deletePricingSchema,
  createFeatureSchema,
  updateFeatureSchema,
  deleteFeatureSchema,
  createInstructorSchema,
  updateInstructorSchema,
  deleteInstructorSchema,
  createTopicSchema,
  updateTopicSchema,
  deleteTopicSchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  deleteTestimonialSchema,
  createFaqSchema,
  updateFaqSchema,
  deleteFaqSchema,
  createSessionSchema,
  updateSessionSchema,
  deleteSessionSchema,
} from '../../schemas/bootcampSchemas.js';

/**
 * Admin Bootcamp routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function adminBootcampRoutes(fastify) {
  const bootcampTag = { tags: ['Admin Bootcamps'] };

  // GET /api/admin/bootcamps - Get all bootcamps (Admin only)
  fastify.get(
    '/',
    {
      schema: {
        ...getAdminBootcampsSchema,
        response: {
          // Disable strict response schema validation to allow additional fields
          // 200: getAdminBootcampsSchema.response[200],
        },
      },
      preHandler: authMiddleware,
    },
    adminBootcampController.getAllBootcamps
  );

  // GET /api/admin/bootcamps/:slug - Get bootcamp by slug (Admin only)
  fastify.get(
    '/:slug',
    {
      schema: {
        ...getAdminBootcampBySlugSchema,
        response: {
          // Disable strict response schema validation to allow additional fields
          // 200: getAdminBootcampBySlugSchema.response[200],
        },
      },
      preHandler: authMiddleware,
    },
    adminBootcampController.getBootcampBySlug
  );

  // POST /api/admin/bootcamps - Create new bootcamp (Admin only)
  fastify.post(
    '/',
    {
      schema: {
        ...bootcampTag,
        body: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 255 },
            path_slug: { type: 'string', pattern: '^[a-z0-9-]+$', minLength: 3, maxLength: 100 },
            description: { type: 'string', minLength: 10 },
            duration: { type: 'string', maxLength: 100 },
            format: { type: 'string', maxLength: 100 },
            category: { type: 'string', maxLength: 100 },
            image_url: { type: 'string', format: 'uri', maxLength: 500 },
            certificate: { type: 'boolean', default: false },
            portfolio: { type: 'boolean', default: false },
            status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' },
            meta_title: { type: 'string', maxLength: 255 },
            meta_description: { type: 'string', maxLength: 500 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminBootcampController.createBootcamp
  );

  // PUT /api/admin/bootcamps/:id - Update bootcamp (Admin only)
  fastify.put(
    '/:id',
    {
      schema: {
        ...bootcampTag,
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 255 },
            path_slug: { type: 'string', pattern: '^[a-z0-9-]+$', minLength: 3, maxLength: 100 },
            description: { type: 'string', minLength: 10 },
            duration: { type: 'string', maxLength: 100 },
            format: { type: 'string', maxLength: 100 },
            category: { type: 'string', maxLength: 100 },
            image_url: { type: 'string', format: 'uri', maxLength: 500 },
            certificate: { type: 'boolean' },
            portfolio: { type: 'boolean' },
            status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
            meta_title: { type: 'string', maxLength: 255 },
            meta_description: { type: 'string', maxLength: 500 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminBootcampController.updateBootcamp
  );

  // DELETE /api/admin/bootcamps/:id - Delete bootcamp (Admin only)
  fastify.delete(
    '/:id',
    {
      schema: {
        ...bootcampTag,
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'null' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminBootcampController.deleteBootcamp
  );

  // GET /api/admin/bootcamps/statistics - Get statistics (Admin only)
  fastify.get(
    '/statistics',
    {
      schema: {
        ...bootcampTag,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  active: { type: 'integer' },
                  byCategory: { type: 'object' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    adminBootcampController.getStatistics
  );

  // ==================== PRICING ROUTES ====================

  // POST /api/admin/bootcamps/:id/pricing - Create pricing for bootcamp
  fastify.post(
    '/:id/pricing',
    {
      schema: createPricingSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.createPricing
  );

  // PUT /api/admin/bootcamps/:id/pricing/:pricingId - Update pricing for bootcamp
  fastify.put(
    '/:id/pricing/:pricingId',
    {
      schema: updatePricingSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.updatePricing
  );

  // DELETE /api/admin/bootcamps/:id/pricing/:pricingId - Delete pricing for bootcamp
  fastify.delete(
    '/:id/pricing/:pricingId',
    {
      schema: deletePricingSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.deletePricing
  );

  // ==================== FEATURES ROUTES ====================

  // POST /api/admin/bootcamps/:id/features - Create feature for bootcamp
  fastify.post(
    '/:id/features',
    {
      schema: createFeatureSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.createFeature
  );

  // PUT /api/admin/bootcamps/:id/features/:featureId - Update feature for bootcamp
  fastify.put(
    '/:id/features/:featureId',
    {
      schema: updateFeatureSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.updateFeature
  );

  // DELETE /api/admin/bootcamps/:id/features/:featureId - Delete feature for bootcamp
  fastify.delete(
    '/:id/features/:featureId',
    {
      schema: deleteFeatureSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.deleteFeature
  );

  // ==================== INSTRUCTORS ROUTES ====================

  // POST /api/admin/bootcamps/:id/instructors - Create instructor for bootcamp
  fastify.post(
    '/:id/instructors',
    {
      schema: createInstructorSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.createInstructor
  );

  // PUT /api/admin/bootcamps/:id/instructors/:instructorId - Update instructor for bootcamp
  fastify.put(
    '/:id/instructors/:instructorId',
    {
      schema: updateInstructorSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.updateInstructor
  );

  // DELETE /api/admin/bootcamps/:id/instructors/:instructorId - Delete instructor for bootcamp
  fastify.delete(
    '/:id/instructors/:instructorId',
    {
      schema: deleteInstructorSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.deleteInstructor
  );

  // ==================== TOPICS ROUTES ====================

  // POST /api/admin/bootcamps/:id/topics - Create topic for bootcamp
  fastify.post(
    '/:id/topics',
    {
      schema: createTopicSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.createTopic
  );

  // PUT /api/admin/bootcamps/:id/topics/:topicId - Update topic for bootcamp
  fastify.put(
    '/:id/topics/:topicId',
    {
      schema: updateTopicSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.updateTopic
  );

  // DELETE /api/admin/bootcamps/:id/topics/:topicId - Delete topic for bootcamp
  fastify.delete(
    '/:id/topics/:topicId',
    {
      schema: deleteTopicSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.deleteTopic
  );

  // ==================== TESTIMONIALS ROUTES ====================

  // POST /api/admin/bootcamps/:id/testimonials - Create testimonial for bootcamp
  fastify.post(
    '/:id/testimonials',
    {
      schema: createTestimonialSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.createTestimonial
  );

  // PUT /api/admin/bootcamps/:id/testimonials/:testimonialId - Update testimonial for bootcamp
  fastify.put(
    '/:id/testimonials/:testimonialId',
    {
      schema: updateTestimonialSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.updateTestimonial
  );

  // DELETE /api/admin/bootcamps/:id/testimonials/:testimonialId - Delete testimonial for bootcamp
  fastify.delete(
    '/:id/testimonials/:testimonialId',
    {
      schema: deleteTestimonialSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.deleteTestimonial
  );

  // ==================== FAQs ROUTES ====================

  // POST /api/admin/bootcamps/:id/faqs - Create FAQ for bootcamp
  fastify.post(
    '/:id/faqs',
    {
      schema: createFaqSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.createFaq
  );

  // PUT /api/admin/bootcamps/:id/faqs/:faqId - Update FAQ for bootcamp
  fastify.put(
    '/:id/faqs/:faqId',
    {
      schema: updateFaqSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.updateFaq
  );

  // DELETE /api/admin/bootcamps/:id/faqs/:faqId - Delete FAQ for bootcamp
  fastify.delete(
    '/:id/faqs/:faqId',
    {
      schema: deleteFaqSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.deleteFaq
  );

  // ==================== SESSION ROUTES ====================

  // POST /api/admin/bootcamps/:bootcamp_id/topics/:topic_id/sessions - Create session for topic
  fastify.post(
    '/:bootcamp_id/topics/:topic_id/sessions',
    {
      schema: createSessionSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.createSession
  );

  // PUT /api/admin/bootcamps/:bootcamp_id/topics/:topic_id/sessions/:session_id - Update session
  fastify.put(
    '/:bootcamp_id/topics/:topic_id/sessions/:session_id',
    {
      schema: updateSessionSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.updateSession
  );

  // DELETE /api/admin/bootcamps/:bootcamp_id/topics/:topic_id/sessions/:session_id - Delete session
  fastify.delete(
    '/:bootcamp_id/topics/:topic_id/sessions/:session_id',
    {
      schema: deleteSessionSchema,
      preHandler: authMiddleware,
    },
    adminBootcampController.deleteSession
  );
}
