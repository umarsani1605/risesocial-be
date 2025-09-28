import { academyService } from '../../services/academyService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User Academy HTTP controllers
 * Handles public academy-related requests
 */
export class UserAcademyController {
  /**
   * Get all academies with pagination and filtering
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAcademys(request, reply) {
    try {
      request.log.info('[userAcademyController] getAcademys start');
      request.log.debug({ query: request.query }, '[userAcademyController] rawQuery');
      const result = await academyService.getAllAcademies(request.query);
      request.log.info('[userAcademyController] getAcademys success');
      return reply.send(successResponse(result.data, 'Academies retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAcademys error');
      return reply.status(500).send(errorResponse('Failed to fetch academies', 500, error.message));
    }
  }

  /**
   * Get academy by slug
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAcademyBySlug(request, reply) {
    try {
      const { slug } = request.params;
      request.log.info('[userAcademyController] getAcademyBySlug start');
      request.log.info({ params: request.params }, '[userAcademyController] rawParams');

      const academy = await academyService.getAcademyBySlug(slug);

      return reply.send(successResponse(academy, 'Academy retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAcademyBySlug error');

      if (error.statusCode === 404) {
        request.log.info({ slug }, '[userAcademyController] getAcademyBySlug not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch academy', 500, error.message));
    }
  }

  /**
   * Get academy categories
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getCategories(request, reply) {
    try {
      request.log.info('[userAcademyController] getCategories start');
      const categories = await academyService.getCategories();
      request.log.info('[userAcademyController] getCategories success');
      return reply.send(successResponse(categories, 'Categories retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getCategories error');
      return reply.status(500).send(errorResponse('Failed to fetch categories', 500, error.message));
    }
  }
}

// Export instance
export const userAcademyController = new UserAcademyController();
