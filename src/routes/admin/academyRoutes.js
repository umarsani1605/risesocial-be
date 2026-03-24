import { adminAcademyController } from '../../controllers/admin/academyController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { createUploadMiddleware } from '../../middleware/uploadMiddleware.js';

const uploadAcademyImage = createUploadMiddleware('academy_image');
const uploadInstructorAvatar = createUploadMiddleware('instructor_avatar');
import {
  getAdminAcademiesSchema,
  getAdminAcademyBySlugSchema,
  createAcademySchema,
  updateAcademySchema,
  deleteAcademySchema,
  getAcademyPricingsSchema,
  createPricingSchema,
  updatePricingSchema,
  deletePricingSchema,
  getAcademyFeaturesSchema,
  createFeatureSchema,
  updateFeatureSchema,
  deleteFeatureSchema,
  getAcademyInstructorsSchema,
  createInstructorSchema,
  updateInstructorSchema,
  deleteInstructorSchema,
  getAcademyThemesSchema,
  createThemeSchema,
  updateThemeSchema,
  deleteThemeSchema,
  getAcademyTopicsSchema,
  createTopicSchema,
  updateTopicSchema,
  deleteTopicSchema,
  getAcademyTestimonialsSchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  deleteTestimonialSchema,
  getAcademyFaqsSchema,
  createFaqSchema,
  updateFaqSchema,
  deleteFaqSchema,
} from '../../schemas/shared/academySchemas.js';

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
    preValidation: [uploadAcademyImage],
    handler: adminAcademyController.createAcademy,
  });

  fastify.put('/:id', {
    schema: updateAcademySchema,
    preValidation: [uploadAcademyImage],
    handler: adminAcademyController.updateAcademy,
  });

  fastify.delete('/:id', {
    schema: deleteAcademySchema,
    handler: adminAcademyController.deleteAcademy,
  });

  // Pricing routes
  fastify.get('/:id/pricing', {
    schema: getAcademyPricingsSchema,
    handler: adminAcademyController.getPricings,
  });

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
  fastify.get('/:id/features', {
    schema: getAcademyFeaturesSchema,
    handler: adminAcademyController.getFeatures,
  });

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
  fastify.get('/:id/instructors', {
    schema: getAcademyInstructorsSchema,
    handler: adminAcademyController.getInstructors,
  });

  fastify.post('/:id/instructors', {
    schema: createInstructorSchema,
    preValidation: [uploadInstructorAvatar],
    handler: adminAcademyController.createInstructor,
  });

  fastify.put('/:id/instructors/:instructorId', {
    schema: updateInstructorSchema,
    preValidation: [uploadInstructorAvatar],
    handler: adminAcademyController.updateInstructor,
  });

  fastify.delete('/:id/instructors/:instructorId', {
    schema: deleteInstructorSchema,
    handler: adminAcademyController.deleteInstructor,
  });

  // Theme routes (Level 1 curriculum)
  fastify.get('/:id/themes', {
    schema: getAcademyThemesSchema,
    handler: adminAcademyController.getThemes,
  });

  fastify.post('/:id/themes', {
    schema: createThemeSchema,
    handler: adminAcademyController.createTheme,
  });

  fastify.put('/:id/themes/:themeId', {
    schema: updateThemeSchema,
    handler: adminAcademyController.updateTheme,
  });

  fastify.delete('/:id/themes/:themeId', {
    schema: deleteThemeSchema,
    handler: adminAcademyController.deleteTheme,
  });

  // Topic routes (Level 2 curriculum, belongs to a theme)
  fastify.get('/:id/topics', {
    schema: getAcademyTopicsSchema,
    handler: adminAcademyController.getTopics,
  });

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
  fastify.get('/:id/testimonials', {
    schema: getAcademyTestimonialsSchema,
    handler: adminAcademyController.getTestimonials,
  });

  fastify.post('/:id/testimonials', {
    schema: createTestimonialSchema,
    preValidation: [uploadAcademyImage],
    handler: adminAcademyController.createTestimonial,
  });

  fastify.put('/:id/testimonials/:testimonialId', {
    schema: updateTestimonialSchema,
    preValidation: [uploadAcademyImage],
    handler: adminAcademyController.updateTestimonial,
  });

  fastify.delete('/:id/testimonials/:testimonialId', {
    schema: deleteTestimonialSchema,
    handler: adminAcademyController.deleteTestimonial,
  });

  // FAQ routes
  fastify.get('/:id/faqs', {
    schema: getAcademyFaqsSchema,
    handler: adminAcademyController.getFaqs,
  });

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
}
