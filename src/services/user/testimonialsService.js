import { userTestimonialsRepository } from '../../repositories/user/testimonialsRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

class UserTestimonialsService {
  constructor() {
    this.testimonialsRepository = userTestimonialsRepository;
  }

  get logger() {
    return getLogger();
  }

  async getTestimonials(filters = {}, page = undefined, limit = undefined, sortBy = 'createdAt', sortOrder = 'desc') {
    this.logger.info('[userTestimonialsService] getTestimonials start');
    this.logger.debug({ filters, page, limit, sortBy, sortOrder }, '[userTestimonialsService] rawOptions');
    try {
      const publicFilters = { ...filters, status: 'ACTIVE' };
      const result = await this.testimonialsRepository.findMany(publicFilters, page, limit, sortBy, sortOrder);
      const response = { testimonials: result.testimonials };

      if (result.pagination) {
        response.pagination = result.pagination;
      }

      this.logger.info('[userTestimonialsService] getTestimonials success');
      return response;
    } catch (error) {
      this.logger.error({ err: error }, '[userTestimonialsService] getTestimonials error');
      throw new Error(`Failed to get testimonials: ${error.message}`);
    }
  }

  async getTestimonialById(id) {
    this.logger.info({ id }, '[userTestimonialsService] getTestimonialById start');
    try {
      const testimonial = await this.testimonialsRepository.findById(id);
      this.logger.info({ found: !!testimonial }, '[userTestimonialsService] getTestimonialById success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[userTestimonialsService] getTestimonialById error');
      throw new Error(`Failed to get testimonial by ID: ${error.message}`);
    }
  }
}

export const userTestimonialsService = new UserTestimonialsService();
