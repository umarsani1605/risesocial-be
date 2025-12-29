import { testimonialsService } from '../../services/testimonialsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UserTestimonialsController {
  constructor() {
    this.testimonialsService = testimonialsService;
  }

  getTestimonials = async (req, reply) => {
    try {
      request.log.info('[userTestimonialsController] getTestimonials start');
      request.log.debug({ query: request.query }, '[userTestimonialsController] rawQuery');
      const { page = 1, limit = 10, search = '', country = '', minRating = '', featured = '', sortBy = 'createdAt', sortOrder = 'desc' } = request.query;

      const filters = {
        search,
        status: 'ACTIVE', 
        country: country || undefined,
        minRating: minRating || undefined,
        featured: featured || undefined,
      };

      const result = await this.testimonialsService.getTestimonials(filters, Number(page), Number(limit), sortBy, sortOrder);

      request.log.info('[userTestimonialsController] getTestimonials success');
      return reply.send(successResponse(result, 'Testimonials retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userTestimonialsController] getTestimonials error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getTestimonialById = async (req, reply) => {
    try {
      request.log.info('[userTestimonialsController] getTestimonialById start');
      request.log.debug({ params: request.params }, '[userTestimonialsController] rawParams');
      const { id } = request.params;
      const testimonial = await this.testimonialsService.getTestimonialById(id);

      if (!testimonial || testimonial.status !== 'ACTIVE') {
        request.log.info({ id }, '[userTestimonialsController] getTestimonialById not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[userTestimonialsController] getTestimonialById success');
      return reply.send(successResponse(testimonial, 'Testimonial retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userTestimonialsController] getTestimonialById error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getFeaturedTestimonials = async (req, reply) => {
    try {
      request.log.info('[userTestimonialsController] getFeaturedTestimonials start');
      request.log.debug({ query: request.query }, '[userTestimonialsController] rawQuery');
      const { limit = 6 } = request.query;
      const testimonials = await this.testimonialsService.getFeaturedTestimonials(Number(limit));

      request.log.info('[userTestimonialsController] getFeaturedTestimonials success');
      return reply.send(successResponse(testimonials, 'Featured testimonials retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userTestimonialsController] getFeaturedTestimonials error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getTestimonialsByCountry = async (req, reply) => {
    try {
      request.log.info('[userTestimonialsController] getTestimonialsByCountry start');
      request.log.debug({ query: request.query }, '[userTestimonialsController] rawQuery');
      const { country, limit = 10 } = request.query;

      if (!country) {
        return reply.send(errorResponse('Country parameter is required', 400));
      }

      const testimonials = await this.testimonialsService.getTestimonialsByCountry(country, Number(limit));

      request.log.info('[userTestimonialsController] getTestimonialsByCountry success');
      return reply.send(successResponse(testimonials, `Testimonials from ${country} retrieved successfully`));
    } catch (error) {
      request.log.error({ err: error }, '[userTestimonialsController] getTestimonialsByCountry error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getTestimonialsByRating = async (req, reply) => {
    try {
      request.log.info('[userTestimonialsController] getTestimonialsByRating start');
      request.log.debug({ query: request.query }, '[userTestimonialsController] rawQuery');
      const { rating, limit = 10 } = request.query;

      if (!rating || rating < 1 || rating > 5) {
        return reply.send(errorResponse('Valid rating parameter (1-5) is required', 400));
      }

      const testimonials = await this.testimonialsService.getTestimonialsByRating(Number(rating), Number(limit));

      request.log.info('[userTestimonialsController] getTestimonialsByRating success');
      return reply.send(successResponse(testimonials, `Testimonials with ${rating} stars retrieved successfully`));
    } catch (error) {
      request.log.error({ err: error }, '[userTestimonialsController] getTestimonialsByRating error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getCountriesWithCounts = async (req, reply) => {
    try {
      request.log.info('[userTestimonialsController] getCountriesWithCounts start');
      const countries = await this.testimonialsService.getCountriesWithCounts();

      request.log.info('[userTestimonialsController] getCountriesWithCounts success');
      return reply.send(successResponse(countries, 'Countries with testimonial counts retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userTestimonialsController] getCountriesWithCounts error');
      return reply.send(errorResponse(error.message, 500));
    }
  };
}

export const userTestimonialsController = new UserTestimonialsController();
