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
   * Get available instructors for academy (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAvailableInstructorsForAcademy(request, reply) {
    try {
      request.log.info('[adminInstructorController] getAvailableInstructorsForAcademy start');
      request.log.debug({ params: request.params }, '[adminInstructorController] rawParams');

      const { academyId } = request.params;
      const instructors = await this.instructorService.getAvailableInstructorsForAcademy(parseInt(academyId));

      request.log.info('[adminInstructorController] getAvailableInstructorsForAcademy success');
      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            academy_id: parseInt(academyId),
          },
          'Available instructors berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] getAvailableInstructorsForAcademy error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Assign instructor to academy (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async assignInstructorToAcademy(request, reply) {
    try {
      request.log.info('[adminInstructorController] assignInstructorToAcademy start');
      request.log.debug({ params: request.params, body: request.body }, '[adminInstructorController] rawParams');

      const { academyId } = request.params;
      const { instructor_id, instructor_order } = request.body;

      const result = await this.instructorService.assignInstructorToAcademy(parseInt(academyId), parseInt(instructor_id), instructor_order);

      request.log.info('[adminInstructorController] assignInstructorToAcademy success');
      return reply.send(successResponse(result, 'Instructor berhasil diassign ke academy'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] assignInstructorToAcademy error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Remove instructor from academy (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async removeInstructorFromAcademy(request, reply) {
    try {
      request.log.info('[adminInstructorController] removeInstructorFromAcademy start');
      request.log.debug({ params: request.params }, '[adminInstructorController] rawParams');

      const { academyId, instructorId } = request.params;
      const result = await this.instructorService.removeInstructorFromAcademy(parseInt(academyId), parseInt(instructorId));

      if (!result) {
        request.log.info({ academyId, instructorId }, '[adminInstructorController] removeInstructorFromAcademy not_found');
        return reply.send(errorResponse('Assignment tidak ditemukan', 404));
      }

      request.log.info('[adminInstructorController] removeInstructorFromAcademy success');
      return reply.send(successResponse(null, 'Instructor berhasil diremove dari academy'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] removeInstructorFromAcademy error');
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

  /**
   * Upload instructor avatar
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async uploadInstructorAvatar(request, reply) {
    try {
      request.log.info('[adminInstructorController] uploadInstructorAvatar start');

      const { id } = request.params;
      const file = request.file;

      if (!file) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      // Simple file upload - just return success for now
      const result = {
        id: Number(id),
        name: 'Instructor Name', // This should come from database
        avatar_url: `/uploads/images/${file.filename}`,
      };

      request.log.info('[adminInstructorController] uploadInstructorAvatar success');
      return reply.send(successResponse(result, 'Instructor avatar uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminInstructorController] uploadInstructorAvatar error');
      return reply.status(500).send(errorResponse('Failed to upload instructor avatar', 500, error.message));
    }
  }
}

// Export instance
export const adminInstructorController = new AdminInstructorController();
