import { userTestimonialsController } from '../../controllers/user/testimonialsController.js';
import {
  getUserTestimonialsSchema,
  getUserFeaturedTestimonialsSchema,
  getUserTestimonialsByCountrySchema,
  getUserTestimonialsByRatingSchema,
  getUserCountriesWithCountsSchema,
  getUserTestimonialByIdSchema,
} from '../../schemas/testimonialsSchemas.js';

export default async function userTestimonialsRoutes(fastify) {
  fastify.get('/', {
    schema: getUserTestimonialsSchema,
    handler: userTestimonialsController.getTestimonials,
  });

  fastify.get('/featured', {
    schema: getUserFeaturedTestimonialsSchema,
    handler: userTestimonialsController.getFeaturedTestimonials,
  });

  fastify.get('/by-country', {
    schema: getUserTestimonialsByCountrySchema,
    handler: userTestimonialsController.getTestimonialsByCountry,
  });

  fastify.get('/by-rating', {
    schema: getUserTestimonialsByRatingSchema,
    handler: userTestimonialsController.getTestimonialsByRating,
  });

  fastify.get('/countries', {
    schema: getUserCountriesWithCountsSchema,
    handler: userTestimonialsController.getCountriesWithCounts,
  });

  fastify.get('/:id', {
    schema: getUserTestimonialByIdSchema,
    handler: userTestimonialsController.getTestimonialById,
  });
}
