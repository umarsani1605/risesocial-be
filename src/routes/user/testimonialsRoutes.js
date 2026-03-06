import { userTestimonialsController } from '../../controllers/user/testimonialsController.js';
import { getUserTestimonialsSchema, getUserTestimonialByIdSchema } from '../../schemas/shared/testimonialsSchemas.js';

export default async function userTestimonialsRoutes(fastify) {
  fastify.get('/', {
    schema: getUserTestimonialsSchema,
    handler: userTestimonialsController.getTestimonials,
  });

  fastify.get('/:id', {
    schema: getUserTestimonialByIdSchema,
    handler: userTestimonialsController.getTestimonialById,
  });
}
