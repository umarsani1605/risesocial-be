import InstructorService from '../../services/instructorService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin Instructor HTTP controllers
 * Handles admin-only instructor management requests
 */
export class AdminInstructorController {
  constructor() {
    this.instructorService = new InstructorService();
  }

  /**
   * Create new instructor (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createInstructor(request, reply) {
    try {
      request.log.info('[adminInstructorController] createInstructor start');
      request.log.debug({ body: request.body }, '[adminInstructorController] rawBody');

      const instructor = await this.instructorService.createInstructor(request.body);
      request.log.info('[adminInstructorController] createInstructor success');
      return reply.status(201).send(successResponse(instructor, 'Instructor berhasil dibuat'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] createInstructor error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Update instructor (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateInstructor(request, reply) {
    try {
      request.log.info('[adminInstructorController] updateInstructor start');
      request.log.debug({ params: request.params, body: request.body }, '[adminInstructorController] rawParams');

      const { id } = request.params;
      const instructor = await this.instructorService.updateInstructor(parseInt(id), request.body);

      if (!instructor) {
        request.log.info({ id }, '[adminInstructorController] updateInstructor not_found');
        return reply.send(errorResponse('Instructor tidak ditemukan', 404));
      }

      request.log.info('[adminInstructorController] updateInstructor success');
      return reply.send(successResponse(instructor, 'Instructor berhasil diupdate'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] updateInstructor error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Delete instructor (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteInstructor(request, reply) {
    try {
      request.log.info('[adminInstructorController] deleteInstructor start');
      request.log.debug({ params: request.params }, '[adminInstructorController] rawParams');

      const { id } = request.params;
      const result = await this.instructorService.deleteInstructor(parseInt(id));

      if (!result) {
        request.log.info({ id }, '[adminInstructorController] deleteInstructor not_found');
        return reply.send(errorResponse('Instructor tidak ditemukan', 404));
      }

      request.log.info('[adminInstructorController] deleteInstructor success');
      return reply.send(successResponse(null, 'Instructor berhasil dihapus'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] deleteInstructor error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Get available instructors for bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAvailableInstructorsForBootcamp(request, reply) {
    try {
      request.log.info('[adminInstructorController] getAvailableInstructorsForBootcamp start');
      request.log.debug({ params: request.params }, '[adminInstructorController] rawParams');

      const { bootcampId } = request.params;
      const instructors = await this.instructorService.getAvailableInstructorsForBootcamp(parseInt(bootcampId));

      request.log.info('[adminInstructorController] getAvailableInstructorsForBootcamp success');
      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            bootcamp_id: parseInt(bootcampId),
          },
          'Available instructors berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] getAvailableInstructorsForBootcamp error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Assign instructor to bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async assignInstructorToBootcamp(request, reply) {
    try {
      request.log.info('[adminInstructorController] assignInstructorToBootcamp start');
      request.log.debug({ params: request.params, body: request.body }, '[adminInstructorController] rawParams');

      const { bootcampId } = request.params;
      const { instructor_id, instructor_order } = request.body;

      const result = await this.instructorService.assignInstructorToBootcamp(parseInt(bootcampId), parseInt(instructor_id), instructor_order);

      request.log.info('[adminInstructorController] assignInstructorToBootcamp success');
      return reply.send(successResponse(result, 'Instructor berhasil diassign ke bootcamp'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] assignInstructorToBootcamp error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Remove instructor from bootcamp (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async removeInstructorFromBootcamp(request, reply) {
    try {
      request.log.info('[adminInstructorController] removeInstructorFromBootcamp start');
      request.log.debug({ params: request.params }, '[adminInstructorController] rawParams');

      const { bootcampId, instructorId } = request.params;
      const result = await this.instructorService.removeInstructorFromBootcamp(parseInt(bootcampId), parseInt(instructorId));

      if (!result) {
        request.log.info({ bootcampId, instructorId }, '[adminInstructorController] removeInstructorFromBootcamp not_found');
        return reply.send(errorResponse('Assignment tidak ditemukan', 404));
      }

      request.log.info('[adminInstructorController] removeInstructorFromBootcamp success');
      return reply.send(successResponse(null, 'Instructor berhasil diremove dari bootcamp'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] removeInstructorFromBootcamp error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Get instructor statistics (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getInstructorStats(request, reply) {
    try {
      request.log.info('[adminInstructorController] getInstructorStats start');
      const stats = await this.instructorService.getInstructorStats();
      request.log.info('[adminInstructorController] getInstructorStats success');
      return reply.send(successResponse(stats, 'Statistik instructor berhasil diambil'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] getInstructorStats error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }
}

// Export instance
export const adminInstructorController = new AdminInstructorController();
