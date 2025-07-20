import { ProgramsService } from '../../services/programsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { validationResult } from 'express-validator';

class ProgramsController {
  constructor() {
    this.programsService = new ProgramsService();
  }

  /**
   * Get all programs with search and filtering
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getPrograms(req, reply) {
    try {
      const { page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const filters = {
        search,
        status: status || undefined, // Only filter by status if provided
      };

      const result = await this.programsService.getPrograms(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);

      return reply.send(successResponse(result, 'Programs retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get program by ID or slug
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getProgramById(req, reply) {
    try {
      const { id } = req.params;
      const program = await this.programsService.getProgramById(id);

      if (!program) {
        return reply.send(errorResponse('Program not found', 404));
      }

      return reply.send(successResponse(program, 'Program retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get featured programs
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getFeaturedPrograms(req, reply) {
    try {
      const { limit = 6 } = req.query;
      const programs = await this.programsService.getFeaturedPrograms(parseInt(limit));

      return reply.send(successResponse(programs, 'Featured programs retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Create new program (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async createProgram(req, reply) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation failed', 400, errors.array()));
      }

      const program = await this.programsService.createProgram(req.body);
      return reply.send(successResponse(program, 'Program created successfully', 201));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Update program (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async updateProgram(req, reply) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation failed', 400, errors.array()));
      }

      const { id } = req.params;
      const program = await this.programsService.updateProgram(id, req.body);

      if (!program) {
        return reply.send(errorResponse('Program not found', 404));
      }

      return reply.send(successResponse(program, 'Program updated successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Delete program (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async deleteProgram(req, reply) {
    try {
      const { id } = req.params;
      const success = await this.programsService.deleteProgram(id);

      if (!success) {
        return reply.send(errorResponse('Program not found', 404));
      }

      return reply.send(successResponse(null, 'Program deleted successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get programs statistics (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getProgramsStatistics(req, reply) {
    try {
      const stats = await this.programsService.getProgramsStatistics();
      return reply.send(successResponse(stats, 'Programs statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get programs for admin (including inactive/draft)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getProgramsForAdmin(req, reply) {
    try {
      const { page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const filters = {
        search,
        status: status || undefined, // Admin can filter by any status
      };

      const result = await this.programsService.getProgramsForAdmin(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);

      return reply.send(successResponse(result, 'Programs retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get program by slug
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getProgramBySlug(req, reply) {
    try {
      const { slug } = req.params;
      const program = await this.programsService.getProgramBySlug(slug);

      if (!program) {
        return reply.send(errorResponse('Program not found', 404));
      }

      return reply.send(successResponse(program, 'Program retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Admin search programs
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async adminSearchPrograms(req, reply) {
    try {
      const { page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const filters = {
        search,
        status: status || undefined,
      };

      const result = await this.programsService.adminSearchPrograms(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);

      return reply.send(successResponse(result, 'Programs search completed successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get program statistics
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getProgramStatistics(req, reply) {
    try {
      const { id } = req.params;
      const stats = await this.programsService.getProgramStatistics(id);

      return reply.send(successResponse(stats, 'Program statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get all programs statistics
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getAllProgramsStatistics(req, reply) {
    try {
      const stats = await this.programsService.getAllProgramsStatistics();

      return reply.send(successResponse(stats, 'All programs statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }
}

export { ProgramsController };
