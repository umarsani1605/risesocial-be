import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';
import { adminTestimonialsController } from '../../controllers/admin/testimonialsController.js';
import {
  getAdminTestimonialsSchema,
  getAdminTestimonialByIdSchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  deleteTestimonialSchema,
} from '../../schemas/shared/testimonialsSchemas.js';

/**
 * Admin testimonials routes
 * Provides CRUD operations for testimonials with authentication
 *
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export async function testimonialsRoutes(fastify) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authMiddleware);

  // Apply admin role authorization to all routes
  fastify.addHook('preHandler', authorizeRoles(['ADMIN']));

  // GET /admin/testimonials - List all testimonials (any status)
  fastify.get(
    '/',
    {
      schema: getAdminTestimonialsSchema,
    },
    adminTestimonialsController.getTestimonials,
  );

  // GET /admin/testimonials/:id - Get single testimonial (any status)
  fastify.get(
    '/:id',
    {
      schema: getAdminTestimonialByIdSchema,
    },
    adminTestimonialsController.getTestimonialById,
  );

  // POST /admin/testimonials - Create new testimonial
  fastify.post(
    '/',
    {
      schema: createTestimonialSchema,
    },
    adminTestimonialsController.createTestimonial,
  );

  // PUT /admin/testimonials/:id - Update testimonial
  fastify.put(
    '/:id',
    {
      schema: updateTestimonialSchema,
    },
    adminTestimonialsController.updateTestimonial,
  );

  // DELETE /admin/testimonials/:id - Delete testimonial
  fastify.delete(
    '/:id',
    {
      schema: deleteTestimonialSchema,
    },
    adminTestimonialsController.deleteTestimonial,
  );
}

export default testimonialsRoutes;
