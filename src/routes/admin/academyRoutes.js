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
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', { schema: getAdminAcademiesSchema }, adminAcademyController.getAllAcademies);
  fastify.get('/statistics', { schema: getAcademyStatisticsSchema }, adminAcademyController.getStatistics);
  fastify.get('/:slug', { schema: getAdminAcademyBySlugSchema }, adminAcademyController.getAcademyBySlug);
  fastify.post('/', { schema: createAcademySchema, preHandler: [uploadAcademyImage] }, adminAcademyController.createAcademy);
  fastify.put('/:id', { schema: updateAcademySchema, preHandler: [uploadAcademyImage] }, adminAcademyController.updateAcademy);
  fastify.delete('/:id', { schema: deleteAcademySchema }, adminAcademyController.deleteAcademy);

  fastify.post('/:id/pricing', { schema: createPricingSchema }, adminAcademyController.createPricing);
  fastify.put('/:id/pricing/:pricingId', { schema: updatePricingSchema }, adminAcademyController.updatePricing);
  fastify.delete('/:id/pricing/:pricingId', { schema: deletePricingSchema }, adminAcademyController.deletePricing);

  fastify.post('/:id/features', { schema: createFeatureSchema }, adminAcademyController.createFeature);
  fastify.put('/:id/features/:featureId', { schema: updateFeatureSchema }, adminAcademyController.updateFeature);
  fastify.delete('/:id/features/:featureId', { schema: deleteFeatureSchema }, adminAcademyController.deleteFeature);

  fastify.post('/:id/instructors', { schema: createInstructorSchema, preHandler: [uploadAcademyImage] }, adminAcademyController.createInstructor);
  fastify.put('/:id/instructors/:instructorId', { schema: updateInstructorSchema, preHandler: [uploadAcademyImage] }, adminAcademyController.updateInstructor);
  fastify.delete('/:id/instructors/:instructorId', { schema: deleteInstructorSchema }, adminAcademyController.deleteInstructor);

  fastify.post('/:id/topics', { schema: createTopicSchema }, adminAcademyController.createTopic);
  fastify.put('/:id/topics/:topicId', { schema: updateTopicSchema }, adminAcademyController.updateTopic);
  fastify.delete('/:id/topics/:topicId', { schema: deleteTopicSchema }, adminAcademyController.deleteTopic);

  fastify.post('/:id/testimonials', { schema: createTestimonialSchema, preHandler: [uploadAcademyImage] }, adminAcademyController.createTestimonial);
  fastify.put('/:id/testimonials/:testimonialId', { schema: updateTestimonialSchema, preHandler: [uploadAcademyImage] }, adminAcademyController.updateTestimonial);
  fastify.delete('/:id/testimonials/:testimonialId', { schema: deleteTestimonialSchema }, adminAcademyController.deleteTestimonial);

  fastify.post('/:id/faqs', { schema: createFaqSchema }, adminAcademyController.createFaq);
  fastify.put('/:id/faqs/:faqId', { schema: updateFaqSchema }, adminAcademyController.updateFaq);
  fastify.delete('/:id/faqs/:faqId', { schema: deleteFaqSchema }, adminAcademyController.deleteFaq);

  fastify.post('/:academyId/topics/:topicId/sessions', { schema: createSessionSchema }, adminAcademyController.createSession);
  fastify.put('/:academyId/topics/:topicId/sessions/:sessionId', { schema: updateSessionSchema }, adminAcademyController.updateSession);
  fastify.delete('/:academyId/topics/:topicId/sessions/:sessionId', { schema: deleteSessionSchema }, adminAcademyController.deleteSession);
}
