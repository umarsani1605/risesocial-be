import { adminTestimonialsController } from '../../controllers/admin/testimonialsController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadMiddleware } from '../../middleware/fileUploadMiddleware.js';
import {
  getAllTestimonialsSchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  deleteTestimonialSchema,
  toggleFeaturedTestimonialSchema,
  approveTestimonialSchema,
  rejectTestimonialSchema,
  getTestimonialsStatisticsSchema,
  getTestimonialStatisticsSchema,
  uploadTestimonialAvatarSchema,
} from '../../schemas/testimonialsSchemas.js';

export default async function adminTestimonialsRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', { schema: getAllTestimonialsSchema }, adminTestimonialsController.getTestimonialsForAdmin);
  fastify.get('/statistics', { schema: getTestimonialsStatisticsSchema }, adminTestimonialsController.getAllTestimonialsStatistics);
  fastify.get('/:id/statistics', { schema: getTestimonialStatisticsSchema }, adminTestimonialsController.getTestimonialStatistics);
  fastify.post('/', { schema: createTestimonialSchema }, adminTestimonialsController.createTestimonial);
  fastify.put('/:id', { schema: updateTestimonialSchema }, adminTestimonialsController.updateTestimonial);
  fastify.put('/:id/toggle-featured', { schema: toggleFeaturedTestimonialSchema }, adminTestimonialsController.toggleFeaturedTestimonial);
  fastify.put('/:id/approve', { schema: approveTestimonialSchema }, adminTestimonialsController.approveTestimonial);
  fastify.put('/:id/reject', { schema: rejectTestimonialSchema }, adminTestimonialsController.rejectTestimonial);
  fastify.delete('/:id', { schema: deleteTestimonialSchema }, adminTestimonialsController.deleteTestimonial);
  fastify.post('/:id/avatar', { schema: uploadTestimonialAvatarSchema, preHandler: [uploadMiddleware] }, adminTestimonialsController.uploadTestimonialAvatar);
}
