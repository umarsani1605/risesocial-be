import { userTestimonialsController } from '../../controllers/user/testimonialsController.js';
import {
  getAllTestimonialsSchema,
  getTestimonialByIdSchema,
  getFeaturedTestimonialsSchema,
  getTestimonialsByCountrySchema,
  getTestimonialsByRatingSchema,
  getCountriesWithCountsSchema,
} from '../../schemas/testimonialsSchemas.js';

export default async function userTestimonialsRoutes(fastify) {
  fastify.get('/', { schema: getAllTestimonialsSchema }, userTestimonialsController.getTestimonials);
  fastify.get('/featured', { schema: getFeaturedTestimonialsSchema }, userTestimonialsController.getFeaturedTestimonials);
  fastify.get('/countries', { schema: getCountriesWithCountsSchema }, userTestimonialsController.getCountriesWithCounts);
  fastify.get('/by-country', { schema: getTestimonialsByCountrySchema }, userTestimonialsController.getTestimonialsByCountry);
  fastify.get('/by-rating', { schema: getTestimonialsByRatingSchema }, userTestimonialsController.getTestimonialsByRating);
  fastify.get('/:id', { schema: getTestimonialByIdSchema }, userTestimonialsController.getTestimonialById);
}
