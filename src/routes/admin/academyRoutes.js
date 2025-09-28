import { adminAcademyController } from '../../controllers/admin/academyController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadAcademyImage } from '../../middleware/fileUploadMiddleware.js';

/**
 * Admin Academy routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function adminAcademyRoutes(fastify) {
  // GET /admin/academies - Get all academies (Admin only)
  fastify.get(
    '/',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.getAllAcademies
  );

  // GET /admin/academies/:slug - Get academy by slug (Admin only)
  fastify.get(
    '/:slug',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.getAcademyBySlug
  );

  // POST /admin/academies - Create new academy (Admin only)
  fastify.post(
    '/',
    {
      // preHandler: authMiddleware,
      preHandler: [uploadAcademyImage],
    },
    adminAcademyController.createAcademy
  );

  // PUT /admin/academies/:id - Update academy (Admin only)
  fastify.put(
    '/:id',
    {
      // preHandler: authMiddleware,
      preHandler: [uploadAcademyImage],
    },
    adminAcademyController.updateAcademy
  );

  // DELETE /admin/academies/:id - Delete academy (Admin only)
  fastify.delete(
    '/:id',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.deleteAcademy
  );

  // GET /admin/academies/statistics - Get statistics (Admin only)
  fastify.get(
    '/statistics',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.getStatistics
  );

  // PRICING ROUTES

  // POST /admin/academies/:id/pricing - Create pricing for academy
  fastify.post(
    '/:id/pricing',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.createPricing
  );

  // PUT /admin/academies/:id/pricing/:pricingId - Update pricing for academy
  fastify.put(
    '/:id/pricing/:pricingId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.updatePricing
  );

  // DELETE /admin/academies/:id/pricing/:pricingId - Delete pricing for academy
  fastify.delete(
    '/:id/pricing/:pricingId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.deletePricing
  );

  // FEATURES ROUTES

  // POST /admin/academies/:id/features - Create feature for academy
  fastify.post(
    '/:id/features',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.createFeature
  );

  // PUT /admin/academies/:id/features/:featureId - Update feature for academy
  fastify.put(
    '/:id/features/:featureId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.updateFeature
  );

  // DELETE /admin/academies/:id/features/:featureId - Delete feature for academy
  fastify.delete(
    '/:id/features/:featureId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.deleteFeature
  );

  // INSTRUCTORS ROUTES

  // POST /admin/academies/:id/instructors - Create instructor for academy
  fastify.post(
    '/:id/instructors',
    {
      // preHandler: authMiddleware,
      preHandler: [uploadAcademyImage],
    },
    adminAcademyController.createInstructor
  );

  // PUT /admin/academies/:id/instructors/:instructorId - Update instructor for academy
  fastify.put(
    '/:id/instructors/:instructorId',
    {
      // preHandler: authMiddleware,
      preHandler: [uploadAcademyImage],
    },
    adminAcademyController.updateInstructor
  );

  // DELETE /admin/academies/:id/instructors/:instructorId - Delete instructor for academy
  fastify.delete(
    '/:id/instructors/:instructorId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.deleteInstructor
  );

  // TOPICS ROUTES

  // POST /admin/academies/:id/topics - Create topic for academy
  fastify.post(
    '/:id/topics',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.createTopic
  );

  // PUT /admin/academies/:id/topics/:topicId - Update topic for academy
  fastify.put(
    '/:id/topics/:topicId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.updateTopic
  );

  // DELETE /admin/academies/:id/topics/:topicId - Delete topic for academy
  fastify.delete(
    '/:id/topics/:topicId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.deleteTopic
  );

  // TESTIMONIALS ROUTES

  // POST /admin/academies/:id/testimonials - Create testimonial for academy
  fastify.post(
    '/:id/testimonials',
    {
      // preHandler: authMiddleware,
      preHandler: [uploadAcademyImage],
    },
    adminAcademyController.createTestimonial
  );

  // PUT /admin/academies/:id/testimonials/:testimonialId - Update testimonial for academy
  fastify.put(
    '/:id/testimonials/:testimonialId',
    {
      // preHandler: authMiddleware,
      preHandler: [uploadAcademyImage],
    },
    adminAcademyController.updateTestimonial
  );

  // DELETE /admin/academies/:id/testimonials/:testimonialId - Delete testimonial for academy
  fastify.delete(
    '/:id/testimonials/:testimonialId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.deleteTestimonial
  );

  // FAQs ROUTES

  // POST /admin/academies/:id/faqs - Create FAQ for academy
  fastify.post(
    '/:id/faqs',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.createFaq
  );

  // PUT /admin/academies/:id/faqs/:faqId - Update FAQ for academy
  fastify.put(
    '/:id/faqs/:faqId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.updateFaq
  );

  // DELETE /admin/academies/:id/faqs/:faqId - Delete FAQ for academy
  fastify.delete(
    '/:id/faqs/:faqId',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.deleteFaq
  );

  // SESSION ROUTES

  // POST /admin/academies/:academy_id/topics/:topic_id/sessions - Create session for topic
  fastify.post(
    '/:academy_id/topics/:topic_id/sessions',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.createSession
  );

  // PUT /admin/academies/:academy_id/topics/:topic_id/sessions/:session_id - Update session
  fastify.put(
    '/:academy_id/topics/:topic_id/sessions/:session_id',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.updateSession
  );

  // DELETE /admin/academies/:academy_id/topics/:topic_id/sessions/:session_id - Delete session
  fastify.delete(
    '/:academy_id/topics/:topic_id/sessions/:session_id',
    {
      // preHandler: authMiddleware,
    },
    adminAcademyController.deleteSession
  );
}
