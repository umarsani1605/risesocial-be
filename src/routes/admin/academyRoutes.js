import { adminAcademyController } from '../../controllers/admin/academyController.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';
import { createUploadMiddleware } from '../../middleware/uploadMiddleware.js';
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

const uploadAcademyImage = createUploadMiddleware('academy_image');
const uploadInstructorAvatar = createUploadMiddleware('instructor_avatar');

const VIEW = requirePermission('admin.academy');
const EDIT = requirePermission('admin.academy', 'EDITOR');

export default async function adminAcademyRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);

  // Academy CRUD
  fastify.get('/', { schema: getAdminAcademiesSchema, preHandler: VIEW, handler: adminAcademyController.getAllAcademies });
  fastify.get('/:slug', { schema: getAdminAcademyBySlugSchema, preHandler: VIEW, handler: adminAcademyController.getAcademyBySlug });
  fastify.post('/', { schema: createAcademySchema, preValidation: [uploadAcademyImage], preHandler: EDIT, handler: adminAcademyController.createAcademy });
  fastify.put('/:id', { schema: updateAcademySchema, preValidation: [uploadAcademyImage], preHandler: EDIT, handler: adminAcademyController.updateAcademy });
  fastify.delete('/:id', { schema: deleteAcademySchema, preHandler: EDIT, handler: adminAcademyController.deleteAcademy });

  // Pricing
  fastify.get('/:id/pricing', { schema: getAcademyPricingsSchema, preHandler: VIEW, handler: adminAcademyController.getPricings });
  fastify.post('/:id/pricing', { schema: createPricingSchema, preHandler: EDIT, handler: adminAcademyController.createPricing });
  fastify.put('/:id/pricing/:pricingId', { schema: updatePricingSchema, preHandler: EDIT, handler: adminAcademyController.updatePricing });
  fastify.delete('/:id/pricing/:pricingId', { schema: deletePricingSchema, preHandler: EDIT, handler: adminAcademyController.deletePricing });

  // Features
  fastify.get('/:id/features', { schema: getAcademyFeaturesSchema, preHandler: VIEW, handler: adminAcademyController.getFeatures });
  fastify.post('/:id/features', { schema: createFeatureSchema, preHandler: EDIT, handler: adminAcademyController.createFeature });
  fastify.put('/:id/features/:featureId', { schema: updateFeatureSchema, preHandler: EDIT, handler: adminAcademyController.updateFeature });
  fastify.delete('/:id/features/:featureId', { schema: deleteFeatureSchema, preHandler: EDIT, handler: adminAcademyController.deleteFeature });

  // Instructors
  fastify.get('/:id/instructors', { schema: getAcademyInstructorsSchema, preHandler: VIEW, handler: adminAcademyController.getInstructors });
  fastify.post('/:id/instructors', { schema: createInstructorSchema, preValidation: [uploadInstructorAvatar], preHandler: EDIT, handler: adminAcademyController.createInstructor });
  fastify.put('/:id/instructors/:instructorId', { schema: updateInstructorSchema, preValidation: [uploadInstructorAvatar], preHandler: EDIT, handler: adminAcademyController.updateInstructor });
  fastify.delete('/:id/instructors/:instructorId', { schema: deleteInstructorSchema, preHandler: EDIT, handler: adminAcademyController.deleteInstructor });

  // Themes (Level 1 curriculum)
  fastify.get('/:id/themes', { schema: getAcademyThemesSchema, preHandler: VIEW, handler: adminAcademyController.getThemes });
  fastify.post('/:id/themes', { schema: createThemeSchema, preHandler: EDIT, handler: adminAcademyController.createTheme });
  fastify.put('/:id/themes/:themeId', { schema: updateThemeSchema, preHandler: EDIT, handler: adminAcademyController.updateTheme });
  fastify.delete('/:id/themes/:themeId', { schema: deleteThemeSchema, preHandler: EDIT, handler: adminAcademyController.deleteTheme });

  // Topics (Level 2 curriculum)
  fastify.get('/:id/topics', { schema: getAcademyTopicsSchema, preHandler: VIEW, handler: adminAcademyController.getTopics });
  fastify.post('/:id/topics', { schema: createTopicSchema, preHandler: EDIT, handler: adminAcademyController.createTopic });
  fastify.put('/:id/topics/:topicId', { schema: updateTopicSchema, preHandler: EDIT, handler: adminAcademyController.updateTopic });
  fastify.delete('/:id/topics/:topicId', { schema: deleteTopicSchema, preHandler: EDIT, handler: adminAcademyController.deleteTopic });

  // Testimonials
  fastify.get('/:id/testimonials', { schema: getAcademyTestimonialsSchema, preHandler: VIEW, handler: adminAcademyController.getTestimonials });
  fastify.post('/:id/testimonials', { schema: createTestimonialSchema, preValidation: [uploadAcademyImage], preHandler: EDIT, handler: adminAcademyController.createTestimonial });
  fastify.put('/:id/testimonials/:testimonialId', { schema: updateTestimonialSchema, preValidation: [uploadAcademyImage], preHandler: EDIT, handler: adminAcademyController.updateTestimonial });
  fastify.delete('/:id/testimonials/:testimonialId', { schema: deleteTestimonialSchema, preHandler: EDIT, handler: adminAcademyController.deleteTestimonial });

  // FAQs
  fastify.get('/:id/faqs', { schema: getAcademyFaqsSchema, preHandler: VIEW, handler: adminAcademyController.getFaqs });
  fastify.post('/:id/faqs', { schema: createFaqSchema, preHandler: EDIT, handler: adminAcademyController.createFaq });
  fastify.put('/:id/faqs/:faqId', { schema: updateFaqSchema, preHandler: EDIT, handler: adminAcademyController.updateFaq });
  fastify.delete('/:id/faqs/:faqId', { schema: deleteFaqSchema, preHandler: EDIT, handler: adminAcademyController.deleteFaq });
}
