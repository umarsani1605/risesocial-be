import { adminTestimonialsRepository } from '../../repositories/admin/testimonialsRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

class AdminTestimonialsService {
  constructor() {
    this.testimonialsRepository = adminTestimonialsRepository;
  }

  get logger() {
    return getLogger();
  }

  async getStatistics() {
    this.logger.info('[adminTestimonialsService] getStatistics start');
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
      this.logger.info('[adminTestimonialsService] getStatistics success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminTestimonialsService] getStatistics error');
      throw new Error(`Failed to get testimonials statistics: ${error.message}`);
    }
  }

  async getTestimonials(filters = {}, page = undefined, limit = undefined, sortBy = 'createdAt', sortOrder = 'desc') {
    this.logger.info('[adminTestimonialsService] getTestimonials start');
    this.logger.debug({ filters, page, limit, sortBy, sortOrder }, '[adminTestimonialsService] rawOptions');
    try {
      const result = await this.testimonialsRepository.findMany(filters, page, limit, sortBy, sortOrder);
      const response = { testimonials: result.testimonials };

      if (result.pagination) {
        response.pagination = result.pagination;
      }

      this.logger.info('[adminTestimonialsService] getTestimonials success');
      return response;
    } catch (error) {
      this.logger.error({ err: error }, '[adminTestimonialsService] getTestimonials error');
      throw new Error(`Failed to get testimonials for admin: ${error.message}`);
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
    else if (data.text && data.text.trim().length > 1000) errors.push('Text must be less than 1000 characters');

    if (!isUpdate && data.rating === undefined) {
      errors.push('Rating is required');
    } else if (data.rating !== undefined) {
      const rating = parseInt(data.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) errors.push('Rating must be a number between 1 and 5');
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
    if (data.status && !validStatuses.includes(data.status)) errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    if (data.featured !== undefined && typeof data.featured !== 'boolean') errors.push('Featured must be a boolean');

    if (data.avatar_url !== undefined && data.avatar_url !== null) {
      if (typeof data.avatar_url !== 'string') {
        errors.push('Avatar URL must be a string');
      } else if (data.avatar_url.length > 500) {
        errors.push('Avatar URL must be less than 500 characters');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  async getTestimonialById(id) {
    this.logger.info({ id }, '[adminTestimonialsService] getTestimonialById start');
    try {
      const testimonial = await this.testimonialsRepository.findById(id);
      this.logger.info({ found: !!testimonial }, '[adminTestimonialsService] getTestimonialById success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[adminTestimonialsService] getTestimonialById error');
      throw new Error(`Failed to get testimonial by ID: ${error.message}`);
    }
  }

  async createTestimonial(data) {
    this.logger.info('[adminTestimonialsService] createTestimonial start');
    try {
      const validation = this.validateTestimonialData(data, false);
      if (!validation.isValid) {
        const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }

      const testimonialData = {
        name: data.name.trim(),
        country: data.country.trim(),
        text: data.text.trim(),
        rating: parseInt(data.rating),
        status: data.status || 'ACTIVE',
        featured: data.featured || false,
      };

      const testimonial = await this.testimonialsRepository.create(testimonialData);
      this.logger.info({ id: testimonial.id }, '[adminTestimonialsService] createTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[adminTestimonialsService] createTestimonial error');
      throw new Error(`Failed to create testimonial: ${error.message}`);
    }
  }

  async updateTestimonial(id, data) {
    this.logger.info({ id }, '[adminTestimonialsService] updateTestimonial start');
    try {
      const validation = this.validateTestimonialData(data, true);
      if (!validation.isValid) {
        const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }

      const updateData = {};
      if (data.name) updateData.name = data.name.trim();
      if (data.country) updateData.country = data.country.trim();
      if (data.text) updateData.text = data.text.trim();
      if (data.rating !== undefined) updateData.rating = parseInt(data.rating);
      if (data.status) updateData.status = data.status;
      if (data.featured !== undefined) updateData.featured = data.featured;

      const testimonial = await this.testimonialsRepository.update(id, updateData);
      this.logger.info({ id, updated: !!testimonial }, '[adminTestimonialsService] updateTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[adminTestimonialsService] updateTestimonial error');
      throw new Error(`Failed to update testimonial: ${error.message}`);
    }
  }

  async deleteTestimonial(id) {
    this.logger.info({ id }, '[adminTestimonialsService] deleteTestimonial start');
    try {
      const success = await this.testimonialsRepository.delete(id);
      this.logger.info({ id, deleted: success }, '[adminTestimonialsService] deleteTestimonial success');
      return success;
    } catch (error) {
      this.logger.error({ err: error }, '[adminTestimonialsService] deleteTestimonial error');
      throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
  }
}

export const adminTestimonialsService = new AdminTestimonialsService();
