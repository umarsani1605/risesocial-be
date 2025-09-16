import { bootcampService } from '../../services/bootcampService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User Bootcamp HTTP controllers
 * Handles public bootcamp-related requests
 */
export class UserBootcampController {
  /**
   * Get all bootcamps with pagination and filtering
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getBootcamps(request, reply) {
    try {
      request.log.info('[userBootcampController] getBootcamps start');
      request.log.debug({ query: request.query }, '[userBootcampController] rawQuery');
      const result = await bootcampService.getAllBootcamps(request.query);
      request.log.info('[userBootcampController] getBootcamps success');
      return reply.send(successResponse(result.data, 'Bootcamps retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[userBootcampController] getBootcamps error');
      return reply.status(500).send(errorResponse('Failed to fetch bootcamps', 500, error.message));
    }
  }

  /**
   * Get bootcamp by slug
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getBootcampBySlug(request, reply) {
    try {
      const { slug } = request.params;
      request.log.info('[userBootcampController] getBootcampBySlug start');
      request.log.info({ params: request.params }, '[userBootcampController] rawParams');

      const bootcamp = await bootcampService.getBootcampBySlug(slug);

      return reply.send(successResponse(bootcamp, 'Bootcamp retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userBootcampController] getBootcampBySlug error');

      if (error.statusCode === 404) {
        request.log.info({ slug }, '[userBootcampController] getBootcampBySlug not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch bootcamp', 500, error.message));
    }
  }

  /**
   * Get featured bootcamps
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getFeaturedBootcamps(request, reply) {
    try {
      request.log.info('[userBootcampController] getFeaturedBootcamps start');
      request.log.debug({ query: request.query }, '[userBootcampController] rawQuery');
      const { limit = 6 } = request.query;
      const bootcamps = await bootcampService.getFeaturedBootcamps(Number(limit));
      request.log.info('[userBootcampController] getFeaturedBootcamps success');
      return reply.send(successResponse(bootcamps, 'Featured bootcamps retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userBootcampController] getFeaturedBootcamps error');
      return reply.status(500).send(errorResponse('Failed to fetch featured bootcamps', 500, error.message));
    }
  }

  /**
   * Get bootcamp categories
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getCategories(request, reply) {
    try {
      request.log.info('[userBootcampController] getCategories start');
      const categories = await bootcampService.getCategories();
      request.log.info('[userBootcampController] getCategories success');
      return reply.send(successResponse(categories, 'Categories retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userBootcampController] getCategories error');
      return reply.status(500).send(errorResponse('Failed to fetch categories', 500, error.message));
    }
  }
}

// Export instance
export const userBootcampController = new UserBootcampController();
