import { TestimonialsService } from '../../services/testimonialsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { validationResult } from 'express-validator';

class TestimonialsController {
  constructor() {
    this.testimonialsService = new TestimonialsService();
  }

  /**
   * Get all testimonials with search and filtering
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonials(req, reply) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        country = '',
        minRating = '',
        featured = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters = {
        search,
        status: status || undefined,
        country: country || undefined,
        minRating: minRating || undefined,
        featured: featured || undefined,
      };

      const result = await this.testimonialsService.getTestimonials(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);

      return reply.send(successResponse(result, 'Testimonials retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get testimonial by ID
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonialById(req, reply) {
    try {
      const { id } = req.params;
      const testimonial = await this.testimonialsService.getTestimonialById(id);

      if (!testimonial) {
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(testimonial, 'Testimonial retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get featured testimonials
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getFeaturedTestimonials(req, reply) {
    try {
      const { limit = 6 } = req.query;
      const testimonials = await this.testimonialsService.getFeaturedTestimonials(parseInt(limit));

      return reply.send(successResponse(testimonials, 'Featured testimonials retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get testimonials by country
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonialsByCountry(req, reply) {
    try {
      const { country } = req.params;
      const { limit = 10 } = req.query;

      const testimonials = await this.testimonialsService.getTestimonialsByCountry(country, parseInt(limit));

      return reply.send(successResponse(testimonials, `Testimonials from ${country} retrieved successfully`));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get testimonials by rating
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonialsByRating(req, reply) {
    try {
      const { rating } = req.params;
      const { limit = 10 } = req.query;

      const testimonials = await this.testimonialsService.getTestimonialsByRating(parseInt(rating), parseInt(limit));

      return reply.send(successResponse(testimonials, `Testimonials with rating ${rating}+ retrieved successfully`));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get countries with testimonial counts
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getCountriesWithCounts(req, reply) {
    try {
      const countries = await this.testimonialsService.getCountriesWithCounts();

      return reply.send(successResponse(countries, 'Countries with testimonial counts retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Create new testimonial (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async createTestimonial(req, reply) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation failed', 400, errors.array()));
      }

      const testimonial = await this.testimonialsService.createTestimonial(req.body);
      return reply.send(successResponse(testimonial, 'Testimonial created successfully', 201));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Update testimonial (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async updateTestimonial(req, reply) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation failed', 400, errors.array()));
      }

      const { id } = req.params;
      const testimonial = await this.testimonialsService.updateTestimonial(id, req.body);

      if (!testimonial) {
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(testimonial, 'Testimonial updated successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Delete testimonial (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async deleteTestimonial(req, reply) {
    try {
      const { id } = req.params;
      const success = await this.testimonialsService.deleteTestimonial(id);

      if (!success) {
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(null, 'Testimonial deleted successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get testimonials statistics (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonialsStatistics(req, reply) {
    try {
      const stats = await this.testimonialsService.getTestimonialsStatistics();
      return reply.send(successResponse(stats, 'Testimonials statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get testimonials for admin (including inactive/pending)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonialsForAdmin(req, reply) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        country = '',
        minRating = '',
        featured = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters = {
        search,
        status: status || undefined,
        country: country || undefined,
        minRating: minRating || undefined,
        featured: featured || undefined,
      };

      const result = await this.testimonialsService.getTestimonialsForAdmin(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);

      return reply.send(successResponse(result, 'Testimonials retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Admin search testimonials (alias for getTestimonialsForAdmin)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async adminSearchTestimonials(req, reply) {
    return this.getTestimonialsForAdmin(req, reply);
  }

  /**
   * Get testimonial statistics by ID
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonialStatistics(req, reply) {
    try {
      const { id } = req.params;
      const stats = await this.testimonialsService.getTestimonialStatistics(id);
      return reply.send(successResponse(stats, 'Testimonial statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get all testimonials statistics
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getAllTestimonialsStatistics(req, reply) {
    try {
      const stats = await this.testimonialsService.getAllTestimonialsStatistics();
      return reply.send(successResponse(stats, 'All testimonials statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Toggle testimonial featured status
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async toggleFeaturedTestimonial(req, reply) {
    try {
      const { id } = req.params;
      const testimonial = await this.testimonialsService.toggleFeaturedTestimonial(id);

      if (!testimonial) {
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(testimonial, 'Featured status updated successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Approve testimonial
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async approveTestimonial(req, reply) {
    try {
      const { id } = req.params;
      const testimonial = await this.testimonialsService.approveTestimonial(id);

      if (!testimonial) {
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(testimonial, 'Testimonial approved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Reject testimonial
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async rejectTestimonial(req, reply) {
    try {
      const { id } = req.params;
      const testimonial = await this.testimonialsService.rejectTestimonial(id);

      if (!testimonial) {
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(testimonial, 'Testimonial rejected successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }
}

export { TestimonialsController };
