import { userTestimonialsRepository } from '../../repositories/user/testimonialsRepository.js';

class UserTestimonialsService {
  constructor() {
    this.testimonialsRepository = userTestimonialsRepository;
  }


  async getTestimonials(filters = {}, page = undefined, limit = undefined, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const publicFilters = { ...filters, status: 'ACTIVE' };
      const result = await this.testimonialsRepository.findMany(publicFilters, page, limit, sortBy, sortOrder);
      const response = { testimonials: result.testimonials };

      if (result.pagination) {
        response.pagination = result.pagination;
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to get testimonials: ${error.message}`);
    }
  }

  async getTestimonialById(id) {
    try {
      const testimonial = await this.testimonialsRepository.findById(id);
      return testimonial;
    } catch (error) {
      throw new Error(`Failed to get testimonial by ID: ${error.message}`);
    }
  }
}

export const userTestimonialsService = new UserTestimonialsService();
