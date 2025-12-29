import { testimonialsRepository } from '../repositories/testimonialsRepository.js';
import { getLogger } from '../utils/loggerContext.js';

class TestimonialsService {
  constructor() {
    this.testimonialsRepository = testimonialsRepository;
  }

  get logger() {
    return getLogger();
  }

  async getTestimonialsStatistics() {
    this.logger.info('[testimonialsService] getTestimonialsStatistics start');
    try {
      const stats = await this.testimonialsRepository.getStatistics();
      const total = stats.totalTestimonials || 1;
      const result = {
        ...stats,
        statusPercentages: {
          active: Math.round((stats.activeTestimonials / total) * 100),
          inactive: Math.round((stats.inactiveTestimonials / total) * 100),
          pending: Math.round((stats.pendingTestimonials / total) * 100),
        },
        featuredPercentage: Math.round((stats.featuredTestimonials / total) * 100),
        insights: {
          mostCommonStatus:
            stats.activeTestimonials >= stats.inactiveTestimonials && stats.activeTestimonials >= stats.pendingTestimonials
              ? 'ACTIVE'
              : stats.inactiveTestimonials >= stats.pendingTestimonials
              ? 'INACTIVE'
              : 'PENDING',
          hasRecentActivity: stats.recentTestimonials > 0,
          isHighQuality: stats.averageRating >= 4,
          globalReach: stats.countriesCount >= 5,
          averageTestimonialsPerMonth: Math.round(stats.totalTestimonials / 12),
        },
      };
      this.logger.info('[testimonialsService] getTestimonialsStatistics success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonialsStatistics error');
      throw new Error(`Failed to get testimonials statistics: ${error.message}`);
    }
  }

  async getTestimonialsForAdmin(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    this.logger.info('[testimonialsService] getTestimonialsForAdmin start');
    this.logger.debug({ filters, page, limit, sortBy, sortOrder }, '[testimonialsService] rawOptions');
    try {
      const result = await this.testimonialsRepository.findManyForAdmin(filters, page, limit, sortBy, sortOrder);
      const enhancedTestimonials = result.testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));
      const response = { testimonials: enhancedTestimonials, pagination: result.pagination };
      this.logger.info('[testimonialsService] getTestimonialsForAdmin success');
      return response;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonialsForAdmin error');
      throw new Error(`Failed to get testimonials for admin: ${error.message}`);
    }
  }

  async getCountriesWithCounts() {
    this.logger.info('[testimonialsService] getCountriesWithCounts start');
    try {
      const countries = await this.testimonialsRepository.getCountriesWithCounts();
      this.logger.info('[testimonialsService] getCountriesWithCounts success');
      return countries;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getCountriesWithCounts error');
      throw new Error('Failed to get country data');
    }
  }

  validateTestimonialData(data, isUpdate = false) {
    const errors = [];
    if (!isUpdate && (!data.name || typeof data.name !== 'string')) errors.push('Name is required and must be a string');
    else if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 2)) errors.push('Name must be at least 2 characters long');
    else if (data.name && data.name.trim().length > 255) errors.push('Name must be less than 255 characters');
    if (!isUpdate && (!data.country || typeof data.country !== 'string')) errors.push('Country is required and must be a string');
    else if (data.country && (typeof data.country !== 'string' || data.country.trim().length < 2))
      errors.push('Country must be at least 2 characters long');
    else if (data.country && data.country.trim().length > 100) errors.push('Country must be less than 100 characters');
    if (!isUpdate && (!data.text || typeof data.text !== 'string')) errors.push('Text is required and must be a string');
    else if (data.text && (typeof data.text !== 'string' || data.text.trim().length < 10)) errors.push('Text must be at least 10 characters long');
    if (data.rating !== undefined) {
      const rating = parseInt(data.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) errors.push('Rating must be a number between 1 and 5');
    }
    const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
    if (data.status && !validStatuses.includes(data.status)) errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    if (data.featured !== undefined && typeof data.featured !== 'boolean') errors.push('Featured must be a boolean');
    return { isValid: errors.length === 0, errors };
  }
}

export const testimonialsService = new TestimonialsService();
