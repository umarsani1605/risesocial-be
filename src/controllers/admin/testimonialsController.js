import { adminTestimonialsService } from '../../services/admin/testimonialsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminTestimonialsController {
  async getTestimonials(request, reply) {
    try {

      const { page, limit, search, country, minRating, featured, status, sortBy, sortOrder } = request.query;

      const filters = {};
      if (search) filters.search = search;
      if (country) filters.country = country;
      if (minRating) filters.minRating = parseInt(minRating);
      if (featured !== undefined) filters.featured = featured === 'true' || featured === true;
      if (status) filters.status = status;

      const pageNum = page ? parseInt(page) : undefined;
      const limitNum = limit ? parseInt(limit) : undefined;
      const sort = sortBy || 'createdAt';
      const order = sortOrder || 'desc';

      const result = await adminTestimonialsService.getTestimonials(filters, pageNum, limitNum, sort, order);

      return reply.send(successResponse(result, 'Testimonials retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async getTestimonialById(request, reply) {
    try {

      const { id } = request.params;
      const testimonialId = parseInt(id);

      const testimonial = await adminTestimonialsService.getTestimonialById(testimonialId);

      if (!testimonial) {
        return reply.status(404).send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(testimonial, 'Testimonial retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async createTestimonial(request, reply) {
    try {

      const validation = adminTestimonialsService.validateTestimonialData(request.body, false);

      if (!validation.isValid) {
        return reply.send(errorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400));
      }

      const testimonial = await adminTestimonialsService.createTestimonial(request.body);

      return reply.code(201).send(successResponse(testimonial, 'Testimonial created successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async updateTestimonial(request, reply) {
    try {

      const { id } = request.params;
      const testimonialId = parseInt(id);

      const validation = adminTestimonialsService.validateTestimonialData(request.body, true);

      if (!validation.isValid) {
        return reply.send(errorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400));
      }

      const testimonial = await adminTestimonialsService.updateTestimonial(testimonialId, request.body);

      if (!testimonial) {
        return reply.status(404).send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(testimonial, 'Testimonial updated successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async deleteTestimonial(request, reply) {
    try {

      const { id } = request.params;
      const testimonialId = parseInt(id);

      const success = await adminTestimonialsService.deleteTestimonial(testimonialId);

      if (!success) {
        return reply.status(404).send(errorResponse('Testimonial not found', 404));
      }

      return reply.send(successResponse(null, 'Testimonial deleted successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }
}

export const adminTestimonialsController = new AdminTestimonialsController();
