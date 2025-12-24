import { testimonialsService } from '../../services/testimonialsService.js';
import { fileUploadService } from '../../services/fileUploadService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminTestimonialsController {
  constructor() {
    this.testimonialsService = testimonialsService;
  }

    async createTestimonial(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] createTestimonial start');
      request.log.debug({ body: request.body }, '[adminTestimonialsController] rawBody');

      const testimonial = await this.testimonialsService.createTestimonial(request.body);
      request.log.info('[adminTestimonialsController] createTestimonial success');
      return reply.status(201).send(successResponse(testimonial, 'Testimonial created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] createTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

    async updateTestimonial(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] updateTestimonial start');
      request.log.debug({ params: request.params, body: request.body }, '[adminTestimonialsController] rawParams');

      const { id } = request.params;
      const testimonial = await this.testimonialsService.updateTestimonial(id, request.body);

      if (!testimonial) {
        request.log.info({ id }, '[adminTestimonialsController] updateTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[adminTestimonialsController] updateTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] updateTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

    async deleteTestimonial(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] deleteTestimonial start');
      request.log.debug({ params: request.params }, '[adminTestimonialsController] rawParams');
      const { id } = request.params;
      const success = await this.testimonialsService.deleteTestimonial(id);

      if (!success) {
        request.log.info({ id }, '[adminTestimonialsController] deleteTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[adminTestimonialsController] deleteTestimonial success');
      return reply.send(successResponse(null, 'Testimonial deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] deleteTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

    async getTestimonialsForAdmin(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] getTestimonialsForAdmin start');
      request.log.debug({ query: request.query }, '[adminTestimonialsController] rawQuery');
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
      } = request.query;

      const filters = {
        search,
        status: status || undefined, // Admin can see all statuses
        country: country || undefined,
        minRating: minRating || undefined,
        featured: featured || undefined,
      };

      const result = await this.testimonialsService.getTestimonials(filters, Number(page), Number(limit), sortBy, sortOrder);

      request.log.info('[adminTestimonialsController] getTestimonialsForAdmin success');
      return reply.send(successResponse(result, 'Admin testimonials retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] getTestimonialsForAdmin error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

    async getTestimonialStatistics(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] getTestimonialStatistics start');
      const { id } = request.params;
      const statistics = await this.testimonialsService.getTestimonialStatistics(id);

      if (!statistics) {
        request.log.info({ id }, '[adminTestimonialsController] getTestimonialStatistics not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[adminTestimonialsController] getTestimonialStatistics success');
      return reply.send(successResponse(statistics, 'Testimonial statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] getTestimonialStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

    async getAllTestimonialsStatistics(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] getAllTestimonialsStatistics start');
      const statistics = await this.testimonialsService.getAllTestimonialsStatistics();

      request.log.info('[adminTestimonialsController] getAllTestimonialsStatistics success');
      return reply.send(successResponse(statistics, 'All testimonials statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] getAllTestimonialsStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

    async toggleFeaturedTestimonial(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] toggleFeaturedTestimonial start');
      request.log.debug({ params: request.params }, '[adminTestimonialsController] rawParams');
      const { id } = request.params;
      const testimonial = await this.testimonialsService.toggleFeaturedTestimonial(id);

      if (!testimonial) {
        request.log.info({ id }, '[adminTestimonialsController] toggleFeaturedTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[adminTestimonialsController] toggleFeaturedTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial featured status toggled successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] toggleFeaturedTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

    async approveTestimonial(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] approveTestimonial start');
      request.log.debug({ params: request.params }, '[adminTestimonialsController] rawParams');
      const { id } = request.params;
      const testimonial = await this.testimonialsService.approveTestimonial(id);

      if (!testimonial) {
        request.log.info({ id }, '[adminTestimonialsController] approveTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[adminTestimonialsController] approveTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial approved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] approveTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

    async rejectTestimonial(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] rejectTestimonial start');
      request.log.debug({ params: request.params }, '[adminTestimonialsController] rawParams');
      const { id } = request.params;
      const testimonial = await this.testimonialsService.rejectTestimonial(id);

      if (!testimonial) {
        request.log.info({ id }, '[adminTestimonialsController] rejectTestimonial not_found');
        return reply.send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[adminTestimonialsController] rejectTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial rejected successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] rejectTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

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
