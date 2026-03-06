import { adminTestimonialsService } from '../../services/admin/testimonialsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminTestimonialsController {
  async getTestimonials(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] getTestimonials start');
      request.log.debug({ query: request.query }, '[adminTestimonialsController] rawQuery');

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

      request.log.info('[adminTestimonialsController] getTestimonials success');
      return reply.send(successResponse(result, 'Testimonials retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] getTestimonials error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async getTestimonialById(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] getTestimonialById start');
      request.log.debug({ params: request.params }, '[adminTestimonialsController] rawParams');

      const { id } = request.params;
      const testimonialId = parseInt(id);

      const testimonial = await adminTestimonialsService.getTestimonialById(testimonialId);

      if (!testimonial) {
        request.log.info({ id: testimonialId }, '[adminTestimonialsController] getTestimonialById not_found');
        return reply.status(404).send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[adminTestimonialsController] getTestimonialById success');
      return reply.send(successResponse(testimonial, 'Testimonial retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] getTestimonialById error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async createTestimonial(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] createTestimonial start');
      request.log.debug({ body: request.body }, '[adminTestimonialsController] rawBody');

      const validation = adminTestimonialsService.validateTestimonialData(request.body, false);

      if (!validation.isValid) {
        request.log.info({ errors: validation.errors }, '[adminTestimonialsController] createTestimonial validation_failed');
        return reply.send(errorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400));
      }

      const testimonial = await adminTestimonialsService.createTestimonial(request.body);

      request.log.info('[adminTestimonialsController] createTestimonial success');
      return reply.code(201).send(successResponse(testimonial, 'Testimonial created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] createTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async updateTestimonial(request, reply) {
    try {
      request.log.info('[adminTestimonialsController] updateTestimonial start');
      request.log.debug({ params: request.params, body: request.body }, '[adminTestimonialsController] raw');

      const { id } = request.params;
      const testimonialId = parseInt(id);

      const validation = adminTestimonialsService.validateTestimonialData(request.body, true);

      if (!validation.isValid) {
        request.log.info({ errors: validation.errors }, '[adminTestimonialsController] updateTestimonial validation_failed');
        return reply.send(errorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400));
      }

      const testimonial = await adminTestimonialsService.updateTestimonial(testimonialId, request.body);

      if (!testimonial) {
        request.log.info({ id: testimonialId }, '[adminTestimonialsController] updateTestimonial not_found');
        return reply.status(404).send(errorResponse('Testimonial not found', 404));
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
      const testimonialId = parseInt(id);

      const success = await adminTestimonialsService.deleteTestimonial(testimonialId);

      if (!success) {
        request.log.info({ id: testimonialId }, '[adminTestimonialsController] deleteTestimonial not_found');
        return reply.status(404).send(errorResponse('Testimonial not found', 404));
      }

      request.log.info('[adminTestimonialsController] deleteTestimonial success');
      return reply.send(successResponse(null, 'Testimonial deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminTestimonialsController] deleteTestimonial error');
      return reply.send(errorResponse(error.message, 500));
    }
  }
}

export const adminTestimonialsController = new AdminTestimonialsController();
