import { TestimonialsRepository } from '../repositories/testimonialsRepository.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Testimonials Service
 * Handles business logic for testimonials
 */
class TestimonialsService {
  constructor() {
    this.testimonialsRepository = new TestimonialsRepository();
  }

  get logger() {
    return getLogger();
  }

  /**
   * Enhance testimonial object with computed fields
   */
  enhanceTestimonial(testimonial) {
    if (!testimonial) return null;

    const enhanced = {
      ...testimonial,
      isActive: testimonial.status === 'ACTIVE',
      isPending: testimonial.status === 'PENDING',
      isInactive: testimonial.status === 'INACTIVE',
      ratingStars: '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating),
      ratingPercentage: (testimonial.rating / 5) * 100,
      textPreview: testimonial.text ? testimonial.text.substring(0, 100) + (testimonial.text.length > 100 ? '...' : '') : null,
      textWordCount: testimonial.text ? testimonial.text.split(' ').length : 0,
      formattedCreatedAt: testimonial.created_at ? new Date(testimonial.created_at).toLocaleDateString('id-ID') : null,
      formattedUpdatedAt: testimonial.updated_at ? new Date(testimonial.updated_at).toLocaleDateString('id-ID') : null,
      createdDaysAgo: testimonial.created_at ? Math.floor((new Date() - new Date(testimonial.created_at)) / (1000 * 60 * 60 * 24)) : null,
      updatedDaysAgo: testimonial.updated_at ? Math.floor((new Date() - new Date(testimonial.updated_at)) / (1000 * 60 * 60 * 24)) : null,
      statusBadge: {
        text: testimonial.status,
        color: testimonial.status === 'ACTIVE' ? 'green' : testimonial.status === 'PENDING' ? 'yellow' : 'red',
        variant: testimonial.status === 'ACTIVE' ? 'success' : testimonial.status === 'PENDING' ? 'warning' : 'danger',
      },
      featuredBadge: testimonial.featured ? { text: 'Featured', color: 'blue', variant: 'info' } : null,
      ratingQuality:
        testimonial.rating >= 5
          ? 'excellent'
          : testimonial.rating >= 4
          ? 'good'
          : testimonial.rating >= 3
          ? 'average'
          : testimonial.rating >= 2
          ? 'below_average'
          : 'poor',
      countryFlag: this.getCountryFlag(testimonial.country),
      socialProof: {
        isHighRated: testimonial.rating >= 4,
        isFeatured: testimonial.featured,
        isRecent: testimonial.created_at ? new Date() - new Date(testimonial.created_at) < 30 * 24 * 60 * 60 * 1000 : false,
      },
    };

    return enhanced;
  }

  /**
   * Get country flag emoji (simplified version)
   */
  getCountryFlag(country) {
    if (!country) return '';

    const countryFlags = {
      Indonesia: '🇮🇩',
      Malaysia: '🇲🇾',
      Singapore: '🇸🇬',
      Thailand: '🇹🇭',
      Philippines: '🇵🇭',
      Vietnam: '🇻🇳',
      'United States': '🇺🇸',
      Canada: '🇨🇦',
      'United Kingdom': '🇬🇧',
      Australia: '🇦🇺',
      Germany: '🇩🇪',
      France: '🇫🇷',
      Japan: '🇯🇵',
      'South Korea': '🇰🇷',
      India: '🇮🇳',
      Netherlands: '🇳🇱',
      Sweden: '🇸🇪',
      Switzerland: '🇨🇭',
    };

    return countryFlags[country] || '🌍';
  }

  /**
   * Get all testimonials with search and filtering
   */
  async getTestimonials(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    this.logger.info('[testimonialsService] getTestimonials start');
    this.logger.debug({ filters, page, limit, sortBy, sortOrder }, '[testimonialsService] rawOptions');
    try {
      const result = await this.testimonialsRepository.findMany(filters, page, limit, sortBy, sortOrder);
      const enhancedTestimonials = result.testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));
      const response = { testimonials: enhancedTestimonials, pagination: result.pagination };
      this.logger.info('[testimonialsService] getTestimonials success');
      return response;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonials error');
      throw new Error(`Failed to get testimonials: ${error.message}`);
    }
  }

  /**
   * Get testimonial by ID
   */
  async getTestimonialById(id) {
    this.logger.info({ id }, '[testimonialsService] getTestimonialById start');
    try {
      const testimonial = await this.testimonialsRepository.findById(id);
      const result = this.enhanceTestimonial(testimonial);
      this.logger.info('[testimonialsService] getTestimonialById success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonialById error');
      throw new Error(`Failed to get testimonial: ${error.message}`);
    }
  }

  /**
   * Get featured testimonials
   */
  async getFeaturedTestimonials(limit = 6) {
    this.logger.info({ limit }, '[testimonialsService] getFeaturedTestimonials start');
    try {
      const testimonials = await this.testimonialsRepository.getFeatured(limit);
      const result = testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));
      this.logger.info('[testimonialsService] getFeaturedTestimonials success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getFeaturedTestimonials error');
      throw new Error(`Failed to get featured testimonials: ${error.message}`);
    }
  }

  /**
   * Get testimonials by country
   */
  async getTestimonialsByCountry(country, limit = 10) {
    this.logger.info({ country, limit }, '[testimonialsService] getTestimonialsByCountry start');
    try {
      const testimonials = await this.testimonialsRepository.getByCountry(country, limit);
      const result = testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));
      this.logger.info('[testimonialsService] getTestimonialsByCountry success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonialsByCountry error');
      throw new Error(`Failed to get testimonials by country: ${error.message}`);
    }
  }

  /**
   * Get testimonials by rating
   */
  async getTestimonialsByRating(minRating, limit = 10) {
    this.logger.info({ minRating, limit }, '[testimonialsService] getTestimonialsByRating start');
    try {
      const testimonials = await this.testimonialsRepository.getByRating(minRating, limit);
      const result = testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));
      this.logger.info('[testimonialsService] getTestimonialsByRating success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonialsByRating error');
      throw new Error(`Failed to get testimonials by rating: ${error.message}`);
    }
  }

  /**
   * Create a new testimonial
   */
  async createTestimonial(data) {
    this.logger.info('[testimonialsService] createTestimonial start');
    try {
      if (!data.name || typeof data.name !== 'string') {
        throw new Error('Name is required and must be a string');
      }
      if (!data.country || typeof data.country !== 'string') {
        throw new Error('Country is required and must be a string');
      }
      if (!data.text || typeof data.text !== 'string') {
        throw new Error('Text is required and must be a string');
      }
      if (data.rating !== undefined) {
        const rating = parseInt(data.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          throw new Error('Rating must be a number between 1 and 5');
        }
        data.rating = rating;
      }
      const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
      if (data.status && !validStatuses.includes(data.status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }
      if (data.featured !== undefined && typeof data.featured !== 'boolean') {
        throw new Error('Featured must be a boolean');
      }

      const testimonialData = {
        name: data.name.trim(),
        country: data.country.trim(),
        text: data.text.trim(),
        rating: data.rating || 5,
        status: data.status || 'ACTIVE',
        featured: data.featured || false,
      };

      const testimonial = await this.testimonialsRepository.create(testimonialData);
      const result = this.enhanceTestimonial(testimonial);
      this.logger.info('[testimonialsService] createTestimonial success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] createTestimonial error');
      throw new Error(`Failed to create testimonial: ${error.message}`);
    }
  }

  /**
   * Update a testimonial
   */
  async updateTestimonial(id, data) {
    this.logger.info({ id }, '[testimonialsService] updateTestimonial start');
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid testimonial ID is required');
      }
      if (data.rating !== undefined) {
        const rating = parseInt(data.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          throw new Error('Rating must be a number between 1 and 5');
        }
        data.rating = rating;
      }
      const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
      if (data.status && !validStatuses.includes(data.status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }
      if (data.featured !== undefined && typeof data.featured !== 'boolean') {
        throw new Error('Featured must be a boolean');
      }

      const updateData = {};
      if (data.name) updateData.name = data.name.trim();
      if (data.country) updateData.country = data.country.trim();
      if (data.text) updateData.text = data.text.trim();
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.status) updateData.status = data.status;
      if (data.featured !== undefined) updateData.featured = data.featured;

      const testimonial = await this.testimonialsRepository.update(id, updateData);
      const result = this.enhanceTestimonial(testimonial);
      this.logger.info('[testimonialsService] updateTestimonial success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] updateTestimonial error');
      throw new Error(`Failed to update testimonial: ${error.message}`);
    }
  }

  /**
   * Delete a testimonial
   */
  async deleteTestimonial(id) {
    this.logger.info({ id }, '[testimonialsService] deleteTestimonial start');
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid testimonial ID is required');
      }
      const deleted = await this.testimonialsRepository.delete(id);
      this.logger.info('[testimonialsService] deleteTestimonial success');
      return deleted;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] deleteTestimonial error');
      throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
  }

  /**
   * Get testimonials statistics
   */
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

  /**
   * Get testimonials for admin (including inactive/pending)
   */
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

  /**
   * Get countries with testimonial counts
   */
  async getCountriesWithCounts() {
    this.logger.info('[testimonialsService] getCountriesWithCounts start');
    try {
      const countries = await this.testimonialsRepository.getCountriesWithCounts();
      const response = countries.map((item) => ({ ...item, flag: this.getCountryFlag(item.country) }));
      this.logger.info('[testimonialsService] getCountriesWithCounts success');
      return response;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getCountriesWithCounts error');
      throw new Error(`Failed to get countries with counts: ${error.message}`);
    }
  }

  /**
   * Validate testimonial data
   */
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

export { TestimonialsService };
