import { TestimonialsService } from '../../services/testimonialsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User Testimonials HTTP controllers
 * Handles public testimonials browsing requests
 */
export class UserTestimonialsController {
  constructor() {
    this.testimonialsService = new TestimonialsService();
  }

  /**
   * Get all testimonials with search and filtering
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  getTestimonials = async (req, reply) => {
    try {
      req.log.info('[userTestimonialsController] getTestimonials start');
      req.log.debug({ query: req.query }, '[userTestimonialsController] rawQuery');
      const { page = 1, limit = 10, search = '', country = '', minRating = '', featured = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const filters = {
        search,
        status: 'ACTIVE', // Only show active testimonials for public
        country: country || undefined,
        minRating: minRating || undefined,
        featured: featured || undefined,
      };

      const result = await this.testimonialsService.getTestimonials(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);

      req.log.info('[userTestimonialsController] getTestimonials success');
      return reply.send(successResponse(result, 'Testimonials retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userTestimonialsController] getTestimonials error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get testimonial by ID
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  getTestimonialById = async (req, reply) => {
    try {
      req.log.info('[userTestimonialsController] getTestimonialById start');
      req.log.debug({ params: req.params }, '[userTestimonialsController] rawParams');
      const { id } = req.params;
      const testimonial = await this.testimonialsService.getTestimonialById(id);

      if (!testimonial || testimonial.status !== 'ACTIVE') {
        req.log.info({ id }, '[userTestimonialsController] getTestimonialById not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      req.log.info('[userTestimonialsController] getTestimonialById success');
      return reply.send(successResponse(testimonial, 'Testimonial retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userTestimonialsController] getTestimonialById error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get featured testimonials
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  getFeaturedTestimonials = async (req, reply) => {
    try {
      req.log.info('[userTestimonialsController] getFeaturedTestimonials start');
      req.log.debug({ query: req.query }, '[userTestimonialsController] rawQuery');
      const { limit = 6 } = req.query;
      const testimonials = await this.testimonialsService.getFeaturedTestimonials(parseInt(limit));

      req.log.info('[userTestimonialsController] getFeaturedTestimonials success');
      return reply.send(successResponse(testimonials, 'Featured testimonials retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userTestimonialsController] getFeaturedTestimonials error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get testimonials by country
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  getTestimonialsByCountry = async (req, reply) => {
    try {
      req.log.info('[userTestimonialsController] getTestimonialsByCountry start');
      req.log.debug({ query: req.query }, '[userTestimonialsController] rawQuery');
      const { country, limit = 10 } = req.query;

      if (!country) {
        return reply.send(errorResponse('Country parameter is required', 400));
      }

      const testimonials = await this.testimonialsService.getTestimonialsByCountry(country, parseInt(limit));

      req.log.info('[userTestimonialsController] getTestimonialsByCountry success');
      return reply.send(successResponse(testimonials, `Testimonials from ${country} retrieved successfully`));
    } catch (error) {
      req.log.error({ err: error }, '[userTestimonialsController] getTestimonialsByCountry error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get testimonials by rating
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  getTestimonialsByRating = async (req, reply) => {
    try {
      req.log.info('[userTestimonialsController] getTestimonialsByRating start');
      req.log.debug({ query: req.query }, '[userTestimonialsController] rawQuery');
      const { rating, limit = 10 } = req.query;

      if (!rating || rating < 1 || rating > 5) {
        return reply.send(errorResponse('Valid rating parameter (1-5) is required', 400));
      }

      const testimonials = await this.testimonialsService.getTestimonialsByRating(parseInt(rating), parseInt(limit));

      req.log.info('[userTestimonialsController] getTestimonialsByRating success');
      return reply.send(successResponse(testimonials, `Testimonials with ${rating} stars retrieved successfully`));
    } catch (error) {
      req.log.error({ err: error }, '[userTestimonialsController] getTestimonialsByRating error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get countries with testimonial counts
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  getCountriesWithCounts = async (req, reply) => {
    try {
      req.log.info('[userTestimonialsController] getCountriesWithCounts start');
      const countries = await this.testimonialsService.getCountriesWithCounts();

      req.log.info('[userTestimonialsController] getCountriesWithCounts success');
      return reply.send(successResponse(countries, 'Countries with testimonial counts retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userTestimonialsController] getCountriesWithCounts error');
      return reply.send(errorResponse(error.message, 500));
    }
  };
}

// Export instance
export const userTestimonialsController = new UserTestimonialsController();
