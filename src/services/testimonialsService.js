import { TestimonialsRepository } from '../repositories/testimonialsRepository.js';

/**
 * Testimonials Service
 * Handles business logic for testimonials
 */
class TestimonialsService {
  constructor() {
    this.testimonialsRepository = new TestimonialsRepository();
  }

  /**
   * Enhance testimonial object with computed fields
   * @param {Object} testimonial - Raw testimonial object
   * @returns {Object} Enhanced testimonial object
   */
  enhanceTestimonial(testimonial) {
    if (!testimonial) return null;

    const enhanced = {
      ...testimonial,
      // Status flags
      isActive: testimonial.status === 'ACTIVE',
      isPending: testimonial.status === 'PENDING',
      isInactive: testimonial.status === 'INACTIVE',

      // Rating display
      ratingStars: '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating),
      ratingPercentage: (testimonial.rating / 5) * 100,

      // Text formatting
      textPreview: testimonial.text ? testimonial.text.substring(0, 100) + (testimonial.text.length > 100 ? '...' : '') : null,
      textWordCount: testimonial.text ? testimonial.text.split(' ').length : 0,

      // Formatted dates
      formattedCreatedAt: testimonial.created_at ? new Date(testimonial.created_at).toLocaleDateString('id-ID') : null,
      formattedUpdatedAt: testimonial.updated_at ? new Date(testimonial.updated_at).toLocaleDateString('id-ID') : null,

      // Time calculations
      createdDaysAgo: testimonial.created_at ? Math.floor((new Date() - new Date(testimonial.created_at)) / (1000 * 60 * 60 * 24)) : null,
      updatedDaysAgo: testimonial.updated_at ? Math.floor((new Date() - new Date(testimonial.updated_at)) / (1000 * 60 * 60 * 24)) : null,

      // Status badge properties
      statusBadge: {
        text: testimonial.status,
        color: testimonial.status === 'ACTIVE' ? 'green' : testimonial.status === 'PENDING' ? 'yellow' : 'red',
        variant: testimonial.status === 'ACTIVE' ? 'success' : testimonial.status === 'PENDING' ? 'warning' : 'danger',
      },

      // Featured badge
      featuredBadge: testimonial.featured
        ? {
            text: 'Featured',
            color: 'blue',
            variant: 'info',
          }
        : null,

      // Rating quality
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

      // Country display
      countryFlag: this.getCountryFlag(testimonial.country),

      // Social proof data
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
   * @param {string} country - Country name
   * @returns {string} Flag emoji or empty string
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
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order
   * @returns {Promise<Object>} Testimonials with pagination
   */
  async getTestimonials(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const result = await this.testimonialsRepository.findMany(filters, page, limit, sortBy, sortOrder);

      // Enhance each testimonial
      const enhancedTestimonials = result.testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));

      return {
        testimonials: enhancedTestimonials,
        pagination: result.pagination,
      };
    } catch (error) {
      throw new Error(`Failed to get testimonials: ${error.message}`);
    }
  }

  /**
   * Get testimonial by ID
   * @param {number} id - Testimonial ID
   * @returns {Promise<Object|null>} Testimonial object or null
   */
  async getTestimonialById(id) {
    try {
      const testimonial = await this.testimonialsRepository.findById(id);
      return this.enhanceTestimonial(testimonial);
    } catch (error) {
      throw new Error(`Failed to get testimonial: ${error.message}`);
    }
  }

  /**
   * Get featured testimonials
   * @param {number} limit - Number of testimonials to fetch
   * @returns {Promise<Array>} Featured testimonials
   */
  async getFeaturedTestimonials(limit = 6) {
    try {
      const testimonials = await this.testimonialsRepository.getFeatured(limit);
      return testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));
    } catch (error) {
      throw new Error(`Failed to get featured testimonials: ${error.message}`);
    }
  }

  /**
   * Get testimonials by country
   * @param {string} country - Country name
   * @param {number} limit - Number of testimonials to fetch
   * @returns {Promise<Array>} Testimonials from specific country
   */
  async getTestimonialsByCountry(country, limit = 10) {
    try {
      const testimonials = await this.testimonialsRepository.getByCountry(country, limit);
      return testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));
    } catch (error) {
      throw new Error(`Failed to get testimonials by country: ${error.message}`);
    }
  }

  /**
   * Get testimonials by rating
   * @param {number} minRating - Minimum rating
   * @param {number} limit - Number of testimonials to fetch
   * @returns {Promise<Array>} Testimonials with minimum rating
   */
  async getTestimonialsByRating(minRating, limit = 10) {
    try {
      const testimonials = await this.testimonialsRepository.getByRating(minRating, limit);
      return testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));
    } catch (error) {
      throw new Error(`Failed to get testimonials by rating: ${error.message}`);
    }
  }

  /**
   * Create a new testimonial
   * @param {Object} data - Testimonial data
   * @returns {Promise<Object>} Created testimonial
   */
  async createTestimonial(data) {
    try {
      // Validate required fields
      if (!data.name || typeof data.name !== 'string') {
        throw new Error('Name is required and must be a string');
      }

      if (!data.country || typeof data.country !== 'string') {
        throw new Error('Country is required and must be a string');
      }

      if (!data.text || typeof data.text !== 'string') {
        throw new Error('Text is required and must be a string');
      }

      // Validate rating
      if (data.rating !== undefined) {
        const rating = parseInt(data.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          throw new Error('Rating must be a number between 1 and 5');
        }
        data.rating = rating;
      }

      // Validate status if provided
      const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
      if (data.status && !validStatuses.includes(data.status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      // Validate featured flag
      if (data.featured !== undefined && typeof data.featured !== 'boolean') {
        throw new Error('Featured must be a boolean');
      }

      // Prepare testimonial data
      const testimonialData = {
        name: data.name.trim(),
        country: data.country.trim(),
        text: data.text.trim(),
        rating: data.rating || 5,
        status: data.status || 'ACTIVE',
        featured: data.featured || false,
      };

      // Create testimonial
      const testimonial = await this.testimonialsRepository.create(testimonialData);
      return this.enhanceTestimonial(testimonial);
    } catch (error) {
      throw new Error(`Failed to create testimonial: ${error.message}`);
    }
  }

  /**
   * Update a testimonial
   * @param {number} id - Testimonial ID
   * @param {Object} data - Update data
   * @returns {Promise<Object|null>} Updated testimonial or null
   */
  async updateTestimonial(id, data) {
    try {
      // Validate ID
      if (!id || isNaN(id)) {
        throw new Error('Valid testimonial ID is required');
      }

      // Validate rating if provided
      if (data.rating !== undefined) {
        const rating = parseInt(data.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          throw new Error('Rating must be a number between 1 and 5');
        }
        data.rating = rating;
      }

      // Validate status if provided
      const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
      if (data.status && !validStatuses.includes(data.status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      // Validate featured flag
      if (data.featured !== undefined && typeof data.featured !== 'boolean') {
        throw new Error('Featured must be a boolean');
      }

      // Prepare update data
      const updateData = {};

      if (data.name) {
        updateData.name = data.name.trim();
      }

      if (data.country) {
        updateData.country = data.country.trim();
      }

      if (data.text) {
        updateData.text = data.text.trim();
      }

      if (data.rating !== undefined) {
        updateData.rating = data.rating;
      }

      if (data.status) {
        updateData.status = data.status;
      }

      if (data.featured !== undefined) {
        updateData.featured = data.featured;
      }

      // Update testimonial
      const testimonial = await this.testimonialsRepository.update(id, updateData);
      return this.enhanceTestimonial(testimonial);
    } catch (error) {
      throw new Error(`Failed to update testimonial: ${error.message}`);
    }
  }

  /**
   * Delete a testimonial
   * @param {number} id - Testimonial ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTestimonial(id) {
    try {
      // Validate ID
      if (!id || isNaN(id)) {
        throw new Error('Valid testimonial ID is required');
      }

      return await this.testimonialsRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
  }

  /**
   * Get testimonials statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getTestimonialsStatistics() {
    try {
      const stats = await this.testimonialsRepository.getStatistics();

      // Add percentage calculations
      const total = stats.totalTestimonials || 1; // Avoid division by zero

      return {
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
          averageTestimonialsPerMonth: Math.round(stats.totalTestimonials / 12), // Assuming 1 year of data
        },
      };
    } catch (error) {
      throw new Error(`Failed to get testimonials statistics: ${error.message}`);
    }
  }

  /**
   * Get testimonials for admin (including inactive/pending)
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order
   * @returns {Promise<Object>} Testimonials with pagination
   */
  async getTestimonialsForAdmin(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const result = await this.testimonialsRepository.findManyForAdmin(filters, page, limit, sortBy, sortOrder);

      // Enhance each testimonial
      const enhancedTestimonials = result.testimonials.map((testimonial) => this.enhanceTestimonial(testimonial));

      return {
        testimonials: enhancedTestimonials,
        pagination: result.pagination,
      };
    } catch (error) {
      throw new Error(`Failed to get testimonials for admin: ${error.message}`);
    }
  }

  /**
   * Get countries with testimonial counts
   * @returns {Promise<Array>} Countries with counts
   */
  async getCountriesWithCounts() {
    try {
      const countries = await this.testimonialsRepository.getCountriesWithCounts();

      // Enhance with flags
      return countries.map((item) => ({
        ...item,
        flag: this.getCountryFlag(item.country),
      }));
    } catch (error) {
      throw new Error(`Failed to get countries with counts: ${error.message}`);
    }
  }

  /**
   * Validate testimonial data
   * @param {Object} data - Testimonial data
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Validation result
   */
  validateTestimonialData(data, isUpdate = false) {
    const errors = [];

    // Name validation
    if (!isUpdate && (!data.name || typeof data.name !== 'string')) {
      errors.push('Name is required and must be a string');
    } else if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 2)) {
      errors.push('Name must be at least 2 characters long');
    } else if (data.name && data.name.trim().length > 255) {
      errors.push('Name must be less than 255 characters');
    }

    // Country validation
    if (!isUpdate && (!data.country || typeof data.country !== 'string')) {
      errors.push('Country is required and must be a string');
    } else if (data.country && (typeof data.country !== 'string' || data.country.trim().length < 2)) {
      errors.push('Country must be at least 2 characters long');
    } else if (data.country && data.country.trim().length > 100) {
      errors.push('Country must be less than 100 characters');
    }

    // Text validation
    if (!isUpdate && (!data.text || typeof data.text !== 'string')) {
      errors.push('Text is required and must be a string');
    } else if (data.text && (typeof data.text !== 'string' || data.text.trim().length < 10)) {
      errors.push('Text must be at least 10 characters long');
    }

    // Rating validation
    if (data.rating !== undefined) {
      const rating = parseInt(data.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        errors.push('Rating must be a number between 1 and 5');
      }
    }

    // Status validation
    const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Featured validation
    if (data.featured !== undefined && typeof data.featured !== 'boolean') {
      errors.push('Featured must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export { TestimonialsService };
