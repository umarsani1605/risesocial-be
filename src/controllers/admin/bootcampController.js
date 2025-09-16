import { bootcampService } from '../../services/bootcampService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin Bootcamp HTTP controllers
 * Handles admin-only bootcamp-related requests
 */
export class AdminBootcampController {
  /**
   * Create new bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createBootcamp(request, reply) {
    try {
      request.log.info('[adminBootcampController] createBootcamp start');
      request.log.debug({ body: request.body, user: request.user }, '[adminBootcampController] rawBody');
      const { userId } = request.user;
      const bootcamp = await bootcampService.createBootcamp(request.body, userId);
      request.log.info('[adminBootcampController] createBootcamp success');
      return reply.status(201).send(successResponse(bootcamp, 'Bootcamp created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] createBootcamp error');

      if (error.statusCode === 400) {
        request.log.info({ body: request.body }, '[adminBootcampController] createBootcamp validation_failed');
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to create bootcamp', 500, error.message));
    }
  }

  /**
   * Update bootcamp by ID (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateBootcamp(request, reply) {
    try {
      request.log.info('[adminBootcampController] updateBootcamp start');
      request.log.debug({ params: request.params, body: request.body }, '[adminBootcampController] rawParams');
      const { id } = request.params;
      const bootcamp = await bootcampService.updateBootcamp(Number(id), request.body);
      request.log.info('[adminBootcampController] updateBootcamp success');
      return reply.send(successResponse(bootcamp, 'Bootcamp updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] updateBootcamp error');

      if (error.statusCode === 404) {
        request.log.info({ id }, '[adminBootcampController] updateBootcamp not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.statusCode === 400) {
        request.log.info({ id, body: request.body }, '[adminBootcampController] updateBootcamp validation_failed');
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to update bootcamp', 500, error.message));
    }
  }

  /**
   * Delete bootcamp by ID (Admin only) - Soft delete
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteBootcamp(request, reply) {
    try {
      request.log.info('[adminBootcampController] deleteBootcamp start');
      request.log.debug({ params: request.params }, '[adminBootcampController] rawParams');
      const { id } = request.params;
      await bootcampService.deleteBootcamp(Number(id));
      request.log.info('[adminBootcampController] deleteBootcamp success');
      return reply.send(successResponse(null, 'Bootcamp deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] deleteBootcamp error');

      if (error.statusCode === 404) {
        request.log.info({ id }, '[adminBootcampController] deleteBootcamp not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete bootcamp', 500, error.message));
    }
  }

  /**
   * Get all bootcamps for admin dashboard
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAllBootcamps(request, reply) {
    try {
      request.log.info('[adminBootcampController] getAllBootcamps start');
      const result = await bootcampService.getAllBootcamps(request.query);
      request.log.info('[adminBootcampController] getAllBootcamps success');
      return reply.send(successResponse(result.data, 'Bootcamps retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] getAllBootcamps error');
      return reply.status(500).send(errorResponse('Failed to fetch bootcamps', 500, error.message));
    }
  }

  /**
   * Get bootcamp by slug (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getBootcampBySlug(request, reply) {
    try {
      const { slug } = request.params;
      request.log.info({ slug }, '[adminBootcampController] getBootcampBySlug start');

      const bootcamp = await bootcampService.getBootcampBySlug(slug);

      request.log.info('[adminBootcampController] getBootcampBySlug success');
      return reply.send(successResponse(bootcamp, 'Bootcamp retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] getBootcampBySlug error');

      if (error.statusCode === 404) {
        request.log.info({ slug: request.params.slug }, '[adminBootcampController] getBootcampBySlug not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch bootcamp', 500, error.message));
    }
  }

  /**
   * Get bootcamp statistics (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getStatistics(request, reply) {
    try {
      request.log.info('[adminBootcampController] getStatistics start');
      const statistics = await bootcampService.getStatistics();
      request.log.info('[adminBootcampController] getStatistics success');
      return reply.send(successResponse(statistics, 'Statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] getStatistics error');
      return reply.status(500).send(errorResponse('Failed to fetch statistics', 500, error.message));
    }
  }

  // ==================== PRICING METHODS ====================

  /**
   * Create pricing for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createPricing(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ bootcampId: id }, '[adminBootcampController] createPricing start');

      const pricing = await bootcampService.createPricing(Number(id), request.body);

      request.log.info('[adminBootcampController] createPricing success');
      return reply.status(201).send(successResponse(pricing, 'Pricing created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] createPricing error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id }, '[adminBootcampController] createPricing bootcamp_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to create pricing', 500, error.message));
    }
  }

  /**
   * Update pricing for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updatePricing(request, reply) {
    try {
      const { id, pricingId } = request.params;
      request.log.info({ bootcampId: id, pricingId }, '[adminBootcampController] updatePricing start');

      const pricing = await bootcampService.updatePricing(Number(id), Number(pricingId), request.body);

      request.log.info('[adminBootcampController] updatePricing success');
      return reply.send(successResponse(pricing, 'Pricing updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] updatePricing error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id, pricingId: request.params.pricingId }, '[adminBootcampController] updatePricing not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update pricing', 500, error.message));
    }
  }

  /**
   * Delete pricing for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deletePricing(request, reply) {
    try {
      const { id, pricingId } = request.params;
      request.log.info({ bootcampId: id, pricingId }, '[adminBootcampController] deletePricing start');

      const result = await bootcampService.deletePricing(Number(id), Number(pricingId));

      request.log.info('[adminBootcampController] deletePricing success');
      return reply.send(successResponse(result, 'Pricing deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] deletePricing error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id, pricingId: request.params.pricingId }, '[adminBootcampController] deletePricing not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete pricing', 500, error.message));
    }
  }

  // ==================== FEATURES METHODS ====================

  /**
   * Create feature for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createFeature(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ bootcampId: id }, '[adminBootcampController] createFeature start');

      const feature = await bootcampService.createFeature(Number(id), request.body);

      request.log.info('[adminBootcampController] createFeature success');
      return reply.status(201).send(successResponse(feature, 'Feature created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] createFeature error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id }, '[adminBootcampController] createFeature bootcamp_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to create feature', 500, error.message));
    }
  }

  /**
   * Update feature for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateFeature(request, reply) {
    try {
      const { id, featureId } = request.params;
      request.log.info({ bootcampId: id, featureId }, '[adminBootcampController] updateFeature start');

      const feature = await bootcampService.updateFeature(Number(id), Number(featureId), request.body);

      request.log.info('[adminBootcampController] updateFeature success');
      return reply.send(successResponse(feature, 'Feature updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] updateFeature error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id, featureId: request.params.featureId }, '[adminBootcampController] updateFeature not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update feature', 500, error.message));
    }
  }

  /**
   * Delete feature for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteFeature(request, reply) {
    try {
      const { id, featureId } = request.params;
      request.log.info({ bootcampId: id, featureId }, '[adminBootcampController] deleteFeature start');

      const result = await bootcampService.deleteFeature(Number(id), Number(featureId));

      request.log.info('[adminBootcampController] deleteFeature success');
      return reply.send(successResponse(result, 'Feature deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] deleteFeature error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id, featureId: request.params.featureId }, '[adminBootcampController] deleteFeature not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete feature', 500, error.message));
    }
  }

  // ==================== INSTRUCTORS METHODS ====================

  /**
   * Create instructor for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createInstructor(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ bootcampId: id }, '[adminBootcampController] createInstructor start');

      const instructor = await bootcampService.createInstructor(Number(id), request.body);

      request.log.info('[adminBootcampController] createInstructor success');
      return reply.status(201).send(successResponse(instructor, 'Instructor added successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] createInstructor error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id }, '[adminBootcampController] createInstructor bootcamp_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add instructor', 500, error.message));
    }
  }

  /**
   * Update instructor for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateInstructor(request, reply) {
    try {
      const { id, instructorId } = request.params;
      request.log.info({ bootcampId: id, instructorId }, '[adminBootcampController] updateInstructor start');

      const instructor = await bootcampService.updateInstructor(Number(id), Number(instructorId), request.body);

      request.log.info('[adminBootcampController] updateInstructor success');
      return reply.send(successResponse(instructor, 'Instructor updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] updateInstructor error');

      if (error.statusCode === 404) {
        request.log.info(
          { bootcampId: request.params.id, instructorId: request.params.instructorId },
          '[adminBootcampController] updateInstructor not_found'
        );
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update instructor', 500, error.message));
    }
  }

  /**
   * Delete instructor from bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteInstructor(request, reply) {
    try {
      const { id, instructorId } = request.params;
      request.log.info({ bootcampId: id, instructorId }, '[adminBootcampController] deleteInstructor start');

      const result = await bootcampService.deleteInstructor(Number(id), Number(instructorId));

      request.log.info('[adminBootcampController] deleteInstructor success');
      return reply.send(successResponse(result, 'Instructor removed successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] deleteInstructor error');

      if (error.statusCode === 404) {
        request.log.info(
          { bootcampId: request.params.id, instructorId: request.params.instructorId },
          '[adminBootcampController] deleteInstructor not_found'
        );
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to remove instructor', 500, error.message));
    }
  }

  // ==================== TOPICS METHODS ====================

  /**
   * Create topic for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createTopic(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ bootcampId: id }, '[adminBootcampController] createTopic start');

      const topic = await bootcampService.createTopic(Number(id), request.body);

      request.log.info('[adminBootcampController] createTopic success');
      return reply.status(201).send(successResponse(topic, 'Topic added successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] createTopic error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id }, '[adminBootcampController] createTopic bootcamp_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add topic', 500, error.message));
    }
  }

  /**
   * Update topic for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateTopic(request, reply) {
    try {
      const { id, topicId } = request.params;
      request.log.info({ bootcampId: id, topicId }, '[adminBootcampController] updateTopic start');

      const topic = await bootcampService.updateTopic(Number(id), Number(topicId), request.body);

      request.log.info('[adminBootcampController] updateTopic success');
      return reply.send(successResponse(topic, 'Topic updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] updateTopic error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id, topicId: request.params.topicId }, '[adminBootcampController] updateTopic not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update topic', 500, error.message));
    }
  }

  /**
   * Delete topic from bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteTopic(request, reply) {
    try {
      const { id, topicId } = request.params;
      request.log.info({ bootcampId: id, topicId }, '[adminBootcampController] deleteTopic start');

      const result = await bootcampService.deleteTopic(Number(id), Number(topicId));

      request.log.info('[adminBootcampController] deleteTopic success');
      return reply.send(successResponse(result, 'Topic deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] deleteTopic error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id, topicId: request.params.topicId }, '[adminBootcampController] deleteTopic not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete topic', 500, error.message));
    }
  }

  // ==================== TESTIMONIALS METHODS ====================

  /**
   * Create testimonial for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createTestimonial(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ bootcampId: id }, '[adminBootcampController] createTestimonial start');

      const testimonial = await bootcampService.createTestimonial(Number(id), request.body);

      request.log.info('[adminBootcampController] createTestimonial success');
      return reply.status(201).send(successResponse(testimonial, 'Testimonial added successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] createTestimonial error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id }, '[adminBootcampController] createTestimonial bootcamp_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add testimonial', 500, error.message));
    }
  }

  /**
   * Update testimonial for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateTestimonial(request, reply) {
    try {
      const { id, testimonialId } = request.params;
      request.log.info({ bootcampId: id, testimonialId }, '[adminBootcampController] updateTestimonial start');

      const testimonial = await bootcampService.updateTestimonial(Number(id), Number(testimonialId), request.body);

      request.log.info('[adminBootcampController] updateTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] updateTestimonial error');

      if (error.statusCode === 404) {
        request.log.info(
          { bootcampId: request.params.id, testimonialId: request.params.testimonialId },
          '[adminBootcampController] updateTestimonial not_found'
        );
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update testimonial', 500, error.message));
    }
  }

  /**
   * Delete testimonial from bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteTestimonial(request, reply) {
    try {
      const { id, testimonialId } = request.params;
      request.log.info({ bootcampId: id, testimonialId }, '[adminBootcampController] deleteTestimonial start');

      const result = await bootcampService.deleteTestimonial(Number(id), Number(testimonialId));

      request.log.info('[adminBootcampController] deleteTestimonial success');
      return reply.send(successResponse(result, 'Testimonial deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] deleteTestimonial error');

      if (error.statusCode === 404) {
        request.log.info(
          { bootcampId: request.params.id, testimonialId: request.params.testimonialId },
          '[adminBootcampController] deleteTestimonial not_found'
        );
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete testimonial', 500, error.message));
    }
  }

  // ==================== FAQs METHODS ====================

  /**
   * Create FAQ for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createFaq(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ bootcampId: id }, '[adminBootcampController] createFaq start');

      const faq = await bootcampService.createFaq(Number(id), request.body);

      request.log.info('[adminBootcampController] createFaq success');
      return reply.status(201).send(successResponse(faq, 'FAQ added successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] createFaq error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id }, '[adminBootcampController] createFaq bootcamp_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add FAQ', 500, error.message));
    }
  }

  /**
   * Update FAQ for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateFaq(request, reply) {
    try {
      const { id, faqId } = request.params;
      request.log.info({ bootcampId: id, faqId }, '[adminBootcampController] updateFaq start');

      const faq = await bootcampService.updateFaq(Number(id), Number(faqId), request.body);

      request.log.info('[adminBootcampController] updateFaq success');
      return reply.send(successResponse(faq, 'FAQ updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] updateFaq error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id, faqId: request.params.faqId }, '[adminBootcampController] updateFaq not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update FAQ', 500, error.message));
    }
  }

  /**
   * Delete FAQ from bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteFaq(request, reply) {
    try {
      const { id, faqId } = request.params;
      request.log.info({ bootcampId: id, faqId }, '[adminBootcampController] deleteFaq start');

      const result = await bootcampService.deleteFaq(Number(id), Number(faqId));

      request.log.info('[adminBootcampController] deleteFaq success');
      return reply.send(successResponse(result, 'FAQ deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] deleteFaq error');

      if (error.statusCode === 404) {
        request.log.info({ bootcampId: request.params.id, faqId: request.params.faqId }, '[adminBootcampController] deleteFaq not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete FAQ', 500, error.message));
    }
  }

  // ==================== SESSION METHODS ====================

  /**
   * Create session for topic
   */
  async createSession(request, reply) {
    try {
      request.log.info('[adminBootcampController] createSession start');
      request.log.debug({ params: request.params, body: request.body }, '[adminBootcampController] createSession params');

      const { bootcamp_id, topic_id } = request.params;
      const session = await bootcampService.createSession(Number(bootcamp_id), Number(topic_id), request.body);

      request.log.info('[adminBootcampController] createSession success');
      return reply.status(201).send(successResponse(session, 'Session created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] createSession error');

      if (error.message === 'Bootcamp not found' || error.message === 'Topic not found or does not belong to bootcamp') {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to create session', 500, error.message));
    }
  }

  /**
   * Update session
   */
  async updateSession(request, reply) {
    try {
      request.log.info('[adminBootcampController] updateSession start');
      request.log.debug({ params: request.params, body: request.body }, '[adminBootcampController] updateSession params');

      const { bootcamp_id, topic_id, session_id } = request.params;
      const session = await bootcampService.updateSession(Number(bootcamp_id), Number(topic_id), Number(session_id), request.body);

      request.log.info('[adminBootcampController] updateSession success');
      return reply.send(successResponse(session, 'Session updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] updateSession error');

      if (
        error.message === 'Bootcamp not found' ||
        error.message === 'Topic not found or does not belong to bootcamp' ||
        error.message === 'Session not found or does not belong to topic'
      ) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update session', 500, error.message));
    }
  }

  /**
   * Delete session
   */
  async deleteSession(request, reply) {
    try {
      request.log.info('[adminBootcampController] deleteSession start');
      request.log.debug({ params: request.params }, '[adminBootcampController] deleteSession params');

      const { bootcamp_id, topic_id, session_id } = request.params;
      const result = await bootcampService.deleteSession(Number(bootcamp_id), Number(topic_id), Number(session_id));

      request.log.info('[adminBootcampController] deleteSession success');
      return reply.send(successResponse(result, 'Session deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminBootcampController] deleteSession error');

      if (
        error.message === 'Bootcamp not found' ||
        error.message === 'Topic not found or does not belong to bootcamp' ||
        error.message === 'Session not found or does not belong to topic'
      ) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete session', 500, error.message));
    }
  }
}

// Export instance
export const adminBootcampController = new AdminBootcampController();
