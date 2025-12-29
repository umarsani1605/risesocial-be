import { adminAcademyController } from '../../controllers/admin/academyController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadAcademyImage } from '../../middleware/fileUploadMiddleware.js';
import {
  getAdminAcademiesSchema,
  getAdminAcademyBySlugSchema,
  getAcademyStatisticsSchema,
  createAcademySchema,
  updateAcademySchema,
  deleteAcademySchema,
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
} from '../../schemas/academySchemas.js';

export default async function adminAcademyRoutes(fastify) {
  fastify.get('/', {
    schema: getAdminAcademiesSchema,
    handler: adminAcademyController.getAllAcademies,
  });

  fastify.get('/:slug', {
    schema: getAdminAcademyBySlugSchema,
    handler: adminAcademyController.getAcademyBySlug,
  });

  fastify.post('/', {
    schema: createAcademySchema,
    preHandler: [uploadAcademyImage],
    handler: adminAcademyController.createAcademy,
  });

  fastify.put('/:id', {
    schema: updateAcademySchema,
    preHandler: [uploadAcademyImage],
    handler: adminAcademyController.updateAcademy,
  });

  fastify.delete('/:id', {
    schema: deleteAcademySchema,
    handler: adminAcademyController.deleteAcademy,
  });

  fastify.get('/statistics', {
    schema: getAcademyStatisticsSchema,
    handler: adminAcademyController.getStatistics,
  });

  // Pricing routes
  fastify.post('/:id/pricing', {
    schema: createPricingSchema,
    handler: adminAcademyController.createPricing,
  });

  fastify.put('/:id/pricing/:pricingId', {
    schema: updatePricingSchema,
    handler: adminAcademyController.updatePricing,
  });

  fastify.delete('/:id/pricing/:pricingId', {
    schema: deletePricingSchema,
    handler: adminAcademyController.deletePricing,
  });

  // Feature routes
  fastify.post('/:id/features', {
    schema: createFeatureSchema,
    handler: adminAcademyController.createFeature,
  });

  fastify.put('/:id/features/:featureId', {
    schema: updateFeatureSchema,
    handler: adminAcademyController.updateFeature,
  });

  fastify.delete('/:id/features/:featureId', {
    schema: deleteFeatureSchema,
    handler: adminAcademyController.deleteFeature,
  });

  // Instructor routes
  fastify.post('/:id/instructors', {
    schema: createInstructorSchema,
    preHandler: [uploadAcademyImage],
    handler: adminAcademyController.createInstructor,
  });

  fastify.put('/:id/instructors/:instructorId', {
    schema: updateInstructorSchema,
    preHandler: [uploadAcademyImage],
    handler: adminAcademyController.updateInstructor,
  });

  fastify.delete('/:id/instructors/:instructorId', {
    schema: deleteInstructorSchema,
    handler: adminAcademyController.deleteInstructor,
  });

  // Topic routes
  fastify.post('/:id/topics', {
    schema: createTopicSchema,
    handler: adminAcademyController.createTopic,
  });

  fastify.put('/:id/topics/:topicId', {
    schema: updateTopicSchema,
    handler: adminAcademyController.updateTopic,
  });

  fastify.delete('/:id/topics/:topicId', {
    schema: deleteTopicSchema,
    handler: adminAcademyController.deleteTopic,
  });

  // Testimonial routes
  fastify.post('/:id/testimonials', {
    schema: createTestimonialSchema,
    preHandler: [uploadAcademyImage],
    handler: adminAcademyController.createTestimonial,
  });

  fastify.put('/:id/testimonials/:testimonialId', {
    schema: updateTestimonialSchema,
    preHandler: [uploadAcademyImage],
    handler: adminAcademyController.updateTestimonial,
  });

  fastify.delete('/:id/testimonials/:testimonialId', {
    schema: deleteTestimonialSchema,
    handler: adminAcademyController.deleteTestimonial,
  });

  // FAQ routes
  fastify.post('/:id/faqs', {
    schema: createFaqSchema,
    handler: adminAcademyController.createFaq,
  });

  fastify.put('/:id/faqs/:faqId', {
    schema: updateFaqSchema,
    handler: adminAcademyController.updateFaq,
  });

  fastify.delete('/:id/faqs/:faqId', {
    schema: deleteFaqSchema,
    handler: adminAcademyController.deleteFaq,
  });

  // Session routes
  fastify.post('/:academy_id/topics/:topic_id/sessions', {
    schema: createSessionSchema,
    handler: adminAcademyController.createSession,
  });

  fastify.put('/:academy_id/topics/:topic_id/sessions/:session_id', {
    schema: updateSessionSchema,
    handler: adminAcademyController.updateSession,
  });

  fastify.delete('/:academy_id/topics/:topic_id/sessions/:session_id', {
    schema: deleteSessionSchema,
    handler: adminAcademyController.deleteSession,
  });
}
