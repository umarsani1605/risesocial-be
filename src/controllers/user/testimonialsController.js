import { userTestimonialsService } from '../../services/user/testimonialsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UserTestimonialsController {
  constructor() {
    this.testimonialsService = userTestimonialsService;
  }

  getTestimonials = async (request, reply) => {
    try {
      const { page, limit, search, country, minRating, featured, sortBy, sortOrder } = request.query;

      const filters = {};
      if (search) filters.search = search;
      if (country) filters.country = country;
      if (minRating) filters.minRating = parseInt(minRating);
      if (featured !== undefined) filters.featured = featured === 'true' || featured === true;
      filters.status = 'ACTIVE';

      const pageNum = page ? parseInt(page) : undefined;
      const limitNum = limit ? parseInt(limit) : undefined;
      const sort = sortBy || 'createdAt';
      const order = sortOrder || 'desc';

      const result = await this.testimonialsService.getTestimonials(filters, pageNum, limitNum, sort, order);

      return reply.send(successResponse(result, 'Testimonials retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getTestimonialById = async (request, reply) => {
    try {
      const { id } = request.params;
      const testimonial = await this.testimonialsService.getTestimonialById(id);

      if (!testimonial || testimonial.status !== 'ACTIVE') {
        return reply.status(404).send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(testimonial, 'Testimonial retrieved successfully'));
    } catch (error) {
      throw error;
    }
  };
}

export const userTestimonialsController = new UserTestimonialsController();
