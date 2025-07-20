import { bootcampService } from '../../services/bootcampService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Bootcamp HTTP controllers
 * Handles request/response only, delegates business logic to service
 */
export class BootcampController {
  /**
   * Get all bootcamps with pagination and filtering
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAllBootcamps(request, reply) {
    try {
      const result = await bootcampService.getAllBootcamps(request.query);
      return reply.send(successResponse(result.data, 'Bootcamps retrieved successfully', result.meta));
    } catch (error) {
      request.log.error(error);
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
      const bootcamp = await bootcampService.getBootcampBySlug(slug);
      return reply.send(successResponse(bootcamp, 'Bootcamp retrieved successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 404) {
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
      const { limit = 6 } = request.query;
      const bootcamps = await bootcampService.getFeaturedBootcamps(Number(limit));
      return reply.send(successResponse(bootcamps, 'Featured bootcamps retrieved successfully'));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(errorResponse('Failed to fetch featured bootcamps', 500, error.message));
    }
  }

  /**
   * Create new bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createBootcamp(request, reply) {
    try {
      const { userId } = request.user;
      const bootcamp = await bootcampService.createBootcamp(request.body, userId);
      return reply.status(201).send(successResponse(bootcamp, 'Bootcamp created successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 400) {
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
      const { id } = request.params;
      const bootcamp = await bootcampService.updateBootcamp(Number(id), request.body);
      return reply.send(successResponse(bootcamp, 'Bootcamp updated successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.statusCode === 400) {
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
      const { id } = request.params;
      await bootcampService.deleteBootcamp(Number(id));
      return reply.send(successResponse(null, 'Bootcamp deleted successfully'));
    } catch (error) {
      request.log.error(error);

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete bootcamp', 500, error.message));
    }
  }

  /**
   * Get bootcamp categories
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getCategories(request, reply) {
    try {
      const categories = await bootcampService.getCategories();
      return reply.send(successResponse(categories, 'Categories retrieved successfully'));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(errorResponse('Failed to fetch categories', 500, error.message));
    }
  }

  /**
   * Get bootcamp statistics (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getStatistics(request, reply) {
    try {
      const statistics = await bootcampService.getStatistics();
      return reply.send(successResponse(statistics, 'Statistics retrieved successfully'));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(errorResponse('Failed to fetch statistics', 500, error.message));
    }
  }
}

// Export instance
export const bootcampController = new BootcampController();
