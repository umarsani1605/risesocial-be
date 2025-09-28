
import { EnrollmentService } from '../../services/enrollmentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User Enrollment HTTP controllers
 * Handles user-specific enrollment requests
 */
export class UserEnrollmentController {
  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  /**
   * Get enrollment by ID (with user ownership check)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getEnrollmentById(request, reply) {
    try {
      request.log.info('[userEnrollmentController] getEnrollmentById start');
      request.log.debug({ params: request.params }, '[userEnrollmentController] rawParams');

      const { id } = request.params;
      const enrollment = await this.enrollmentService.getEnrollmentById(parseInt(id));

      if (!enrollment) {
        request.log.info({ id }, '[userEnrollmentController] getEnrollmentById not_found');
        return reply.send(errorResponse('Enrollment tidak ditemukan', 404));
      }

      request.log.info('[userEnrollmentController] getEnrollmentById success');
      return reply.send(successResponse(enrollment, 'Enrollment berhasil ditemukan'));
    } catch (error) {
      request.log.error({ err: error }, '[userEnrollmentController] getEnrollmentById error');
      return reply.send(errorResponse('Gagal mendapatkan enrollment', 500, error.message));
    }
  }

  /**
   * Get enrollment by user and academy
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getEnrollmentByUserAndAcademy(request, reply) {
    try {
      request.log.info('[userEnrollmentController] getEnrollmentByUserAndAcademy start');
      request.log.debug({ params: request.params }, '[userEnrollmentController] rawParams');

      const { userId, academyId } = request.params;
      const enrollment = await this.enrollmentService.getEnrollmentByUserAndAcademy(parseInt(userId), parseInt(academyId));

      if (!enrollment) {
        request.log.info({ userId, academyId }, '[userEnrollmentController] getEnrollmentByUserAndAcademy not_found');
        return reply.status(404).send(errorResponse('Enrollment tidak ditemukan', 404));
      }

      request.log.info('[userEnrollmentController] getEnrollmentByUserAndAcademy success');
      return reply.send(successResponse(enrollment, 'Enrollment berhasil ditemukan'));
    } catch (error) {
      request.log.error({ err: error }, '[userEnrollmentController] getEnrollmentByUserAndAcademy error');
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment', 500, error.message));
    }
  }

  /**
   * Get user enrollments
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getUserEnrollments(request, reply) {
    try {
      request.log.info('[userEnrollmentController] getUserEnrollments start');
      request.log.debug({ params: request.params, query: request.query }, '[userEnrollmentController] rawParams');

      const { userId } = request.params;
      const options = {
        enrollment_status: request.query.enrollment_status,
        progress_min: request.query.progress_min ? parseInt(request.query.progress_min) : undefined,
        progress_max: request.query.progress_max ? parseInt(request.query.progress_max) : undefined,
        page: request.query.page ? parseInt(request.query.page) : 1,
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
      };

      const enrollments = await this.enrollmentService.getUserEnrollments(parseInt(userId), options);

      request.log.info('[userEnrollmentController] getUserEnrollments success');
      return reply.send(successResponse(enrollments, 'Enrollment user berhasil ditemukan'));
    } catch (error) {
      request.log.error({ err: error }, '[userEnrollmentController] getUserEnrollments error');
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment user', 500, error.message));
    }
  }

  /**
   * Update enrollment progress (user can update their own progress)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateProgress(request, reply) {
    try {
      request.log.info('[userEnrollmentController] updateProgress start');
      request.log.debug({ params: request.params, body: request.body }, '[userEnrollmentController] rawParams');

      const { id } = request.params;
      const { progress_percentage } = request.body;

      const enrollment = await this.enrollmentService.updateProgress(parseInt(id), progress_percentage);

      request.log.info('[userEnrollmentController] updateProgress success');
      return reply.send(successResponse(enrollment, 'Progress enrollment berhasil diupdate'));
    } catch (error) {
      request.log.error({ err: error }, '[userEnrollmentController] updateProgress error');
      return reply.status(500).send(errorResponse('Gagal mengupdate progress enrollment', 500, error.message));
    }
  }
}

// Export instance
export const userEnrollmentController = new UserEnrollmentController();
