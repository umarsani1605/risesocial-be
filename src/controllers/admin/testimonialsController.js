import { TestimonialsService } from '../../services/testimonialsService.js';
import { fileUploadService } from '../../services/fileUploadService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin Testimonials HTTP controllers
 * Handles admin-only testimonials management requests
 */
export class AdminTestimonialsController {
  constructor() {
    this.testimonialsService = new TestimonialsService();
  }

  /**
   * Create new testimonial (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async createTestimonial(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] createTestimonial start');
      req.log.debug({ body: req.body }, '[adminTestimonialsController] rawBody');

      const testimonial = await this.testimonialsService.createTestimonial(req.body);
      req.log.info('[adminTestimonialsController] createTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial created successfully', 201));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] createTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Update testimonial (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async updateTestimonial(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] updateTestimonial start');
      req.log.debug({ params: req.params, body: req.body }, '[adminTestimonialsController] rawParams');

      const { id } = req.params;
      const testimonial = await this.testimonialsService.updateTestimonial(id, req.body);

      if (!testimonial) {
        req.log.info({ id }, '[adminTestimonialsController] updateTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      req.log.info('[adminTestimonialsController] updateTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial updated successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] updateTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Delete testimonial (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async deleteTestimonial(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] deleteTestimonial start');
      req.log.debug({ params: req.params }, '[adminTestimonialsController] rawParams');
      const { id } = req.params;
      const success = await this.testimonialsService.deleteTestimonial(id);

      if (!success) {
        req.log.info({ id }, '[adminTestimonialsController] deleteTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      req.log.info('[adminTestimonialsController] deleteTestimonial success');
      return reply.send(successResponse(null, 'Testimonial deleted successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] deleteTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get testimonials for admin with all statuses (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonialsForAdmin(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] getTestimonialsForAdmin start');
      req.log.debug({ query: req.query }, '[adminTestimonialsController] rawQuery');
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
        status: status || undefined, // Admin can see all statuses
        country: country || undefined,
        minRating: minRating || undefined,
        featured: featured || undefined,
      };

      const result = await this.testimonialsService.getTestimonials(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);

      req.log.info('[adminTestimonialsController] getTestimonialsForAdmin success');
      return reply.send(successResponse(result, 'Admin testimonials retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] getTestimonialsForAdmin error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get testimonial statistics (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async getTestimonialStatistics(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] getTestimonialStatistics start');
      const { id } = req.params;
      const statistics = await this.testimonialsService.getTestimonialStatistics(id);

      if (!statistics) {
        req.log.info({ id }, '[adminTestimonialsController] getTestimonialStatistics not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      req.log.info('[adminTestimonialsController] getTestimonialStatistics success');
      return reply.send(successResponse(statistics, 'Testimonial statistics retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] getTestimonialStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get all testimonials statistics (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async getAllTestimonialsStatistics(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] getAllTestimonialsStatistics start');
      const statistics = await this.testimonialsService.getAllTestimonialsStatistics();

      req.log.info('[adminTestimonialsController] getAllTestimonialsStatistics success');
      return reply.send(successResponse(statistics, 'All testimonials statistics retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] getAllTestimonialsStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Toggle testimonial featured status (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async toggleFeaturedTestimonial(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] toggleFeaturedTestimonial start');
      req.log.debug({ params: req.params }, '[adminTestimonialsController] rawParams');
      const { id } = req.params;
      const testimonial = await this.testimonialsService.toggleFeaturedTestimonial(id);

      if (!testimonial) {
        req.log.info({ id }, '[adminTestimonialsController] toggleFeaturedTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      req.log.info('[adminTestimonialsController] toggleFeaturedTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial featured status toggled successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] toggleFeaturedTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Approve testimonial (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async approveTestimonial(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] approveTestimonial start');
      req.log.debug({ params: req.params }, '[adminTestimonialsController] rawParams');
      const { id } = req.params;
      const testimonial = await this.testimonialsService.approveTestimonial(id);

      if (!testimonial) {
        req.log.info({ id }, '[adminTestimonialsController] approveTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      req.log.info('[adminTestimonialsController] approveTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial approved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] approveTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Reject testimonial (Admin only)
   * @param {Object} req - Fastify request object
   * @param {Object} reply - Fastify reply object
   */
  async rejectTestimonial(req, reply) {
    try {
      req.log.info('[adminTestimonialsController] rejectTestimonial start');
      req.log.debug({ params: req.params }, '[adminTestimonialsController] rawParams');
      const { id } = req.params;
      const testimonial = await this.testimonialsService.rejectTestimonial(id);

      if (!testimonial) {
        req.log.info({ id }, '[adminTestimonialsController] rejectTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      req.log.info('[adminTestimonialsController] rejectTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial rejected successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminTestimonialsController] rejectTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Upload testimonial avatar (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async uploadTestimonialAvatar(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] uploadTestimonialAvatar start');

      const { id } = request.params;
      const { file } = request;

      if (!file) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      // Upload file using service
      const uploadResult = await fileUploadService.uploadFile(file, {
        uploadType: 'TESTIMONIAL_AVATAR',
        maxSize: 2 * 1024 * 1024, // 2MB for testimonial avatar
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });

      // Update testimonial with new avatar URL
      const testimonial = await this.testimonialsService.updateTestimonial(Number(id), {
        avatar_url: uploadResult.fileUrl,
      });

      request.log.info('[adminTestimonialsController] uploadTestimonialAvatar success');
      return reply.status(200).send(successResponse(testimonial, 'Testimonial avatar uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] uploadTestimonialAvatar error');
      return reply.status(500).send(errorResponse('Failed to upload testimonial avatar', 500, error.message));
    }
  }
}

// Export instance
export const adminTestimonialsController = new AdminTestimonialsController();
