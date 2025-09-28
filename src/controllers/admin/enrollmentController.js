
import { EnrollmentService } from '../../services/enrollmentService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin Enrollment HTTP controllers
 * Handles admin-only enrollment management requests
 */
export class AdminEnrollmentController {
  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  /**
   * Get all enrollments (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAllEnrollments(request, reply) {
    try {
      request.log.info('[adminEnrollmentController] getAllEnrollments start');
      request.log.debug({ query: request.query }, '[adminEnrollmentController] rawQuery');

      const options = {
        user_id: request.query.user_id ? parseInt(request.query.user_id) : undefined,
        academy_id: request.query.academy_id ? parseInt(request.query.academy_id) : undefined,
        enrollment_status: request.query.enrollment_status,
        progress_min: request.query.progress_min ? parseInt(request.query.progress_min) : undefined,
        progress_max: request.query.progress_max ? parseInt(request.query.progress_max) : undefined,
        enrolled_from: request.query.enrolled_from,
        enrolled_to: request.query.enrolled_to,
        page: request.query.page ? parseInt(request.query.page) : 1,
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
        include_user: request.query.include_user === 'true',
        include_academy: request.query.include_academy === 'true',
        include_pricing: request.query.include_pricing === 'true',
      };

      const enrollments = await this.enrollmentService.getAllEnrollments(options);

      request.log.info('[adminEnrollmentController] getAllEnrollments success');
      return reply.send(successResponse(enrollments, 'Enrollment berhasil ditemukan'));
    } catch (error) {
      request.log.error({ err: error }, '[adminEnrollmentController] getAllEnrollments error');
      return reply.send(errorResponse('Gagal mendapatkan enrollment', 500, error.message));
    }
  }

  /**
   * Get academy enrollments (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAcademyEnrollments(request, reply) {
    try {
      request.log.info('[adminEnrollmentController] getAcademyEnrollments start');
      request.log.debug({ params: request.params, query: request.query }, '[adminEnrollmentController] rawParams');

      const { academyId } = request.params;
      const options = {
        enrollment_status: request.query.enrollment_status,
        progress_min: request.query.progress_min ? parseInt(request.query.progress_min) : undefined,
        progress_max: request.query.progress_max ? parseInt(request.query.progress_max) : undefined,
        page: request.query.page ? parseInt(request.query.page) : 1,
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
      };

      const enrollments = await this.enrollmentService.getAcademyEnrollments(parseInt(academyId), options);

      request.log.info('[adminEnrollmentController] getAcademyEnrollments success');
      return reply.send(successResponse(enrollments, 'Enrollment academy berhasil ditemukan'));
    } catch (error) {
      request.log.error({ err: error }, '[adminEnrollmentController] getAcademyEnrollments error');
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment academy', 500, error.message));
    }
  }

  /**
   * Create new enrollment (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async createEnrollment(request, reply) {
    try {
      request.log.info('[adminEnrollmentController] createEnrollment start');
      request.log.debug({ body: request.body }, '[adminEnrollmentController] rawBody');

      const enrollmentData = {
        user_id: request.body.user_id,
        academy_id: request.body.academy_id,
        pricing_tier_id: request.body.pricing_tier_id,
        enrollment_status: request.body.enrollment_status,
        progress_percentage: request.body.progress_percentage,
      };

      const enrollment = await this.enrollmentService.createEnrollment(enrollmentData);

      request.log.info('[adminEnrollmentController] createEnrollment success');
      return reply.status(201).send(successResponse(enrollment, 'Enrollment berhasil dibuat'));
    } catch (error) {
      request.log.error({ err: error }, '[adminEnrollmentController] createEnrollment error');
      return reply.status(500).send(errorResponse('Gagal membuat enrollment', 500, error.message));
    }
  }

  /**
   * Update enrollment (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateEnrollment(request, reply) {
    try {
      request.log.info('[adminEnrollmentController] updateEnrollment start');
      request.log.debug({ params: request.params, body: request.body }, '[adminEnrollmentController] rawParams');

      const { id } = request.params;
      const enrollment = await this.enrollmentService.updateEnrollment(parseInt(id), request.body);

      if (!enrollment) {
        request.log.info({ id }, '[adminEnrollmentController] updateEnrollment not_found');
        return reply.status(404).send(errorResponse('Enrollment tidak ditemukan', 404));
      }

      request.log.info('[adminEnrollmentController] updateEnrollment success');
      return reply.send(successResponse(enrollment, 'Enrollment berhasil diupdate'));
    } catch (error) {
      request.log.error({ err: error }, '[adminEnrollmentController] updateEnrollment error');
      return reply.status(500).send(errorResponse('Gagal mengupdate enrollment', 500, error.message));
    }
  }

  /**
   * Update enrollment status (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async updateStatus(request, reply) {
    try {
      request.log.info('[adminEnrollmentController] updateStatus start');
      request.log.debug({ params: request.params, body: request.body }, '[adminEnrollmentController] rawParams');

      const { id } = request.params;
      const { enrollment_status } = request.body;

      const enrollment = await this.enrollmentService.updateStatus(parseInt(id), enrollment_status);

      if (!enrollment) {
        request.log.info({ id }, '[adminEnrollmentController] updateStatus not_found');
        return reply.status(404).send(errorResponse('Enrollment tidak ditemukan', 404));
      }

      request.log.info('[adminEnrollmentController] updateStatus success');
      return reply.send(successResponse(enrollment, 'Status enrollment berhasil diupdate'));
    } catch (error) {
      request.log.error({ err: error }, '[adminEnrollmentController] updateStatus error');
      return reply.status(500).send(errorResponse('Gagal mengupdate status enrollment', 500, error.message));
    }
  }

  /**
   * Delete enrollment (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteEnrollment(request, reply) {
    try {
      request.log.info('[adminEnrollmentController] deleteEnrollment start');
      request.log.debug({ params: request.params }, '[adminEnrollmentController] rawParams');

      const { id } = request.params;
      const result = await this.enrollmentService.deleteEnrollment(parseInt(id));

      if (!result) {
        request.log.info({ id }, '[adminEnrollmentController] deleteEnrollment not_found');
        return reply.status(404).send(errorResponse('Enrollment tidak ditemukan', 404));
      }

      request.log.info('[adminEnrollmentController] deleteEnrollment success');
      return reply.send(successResponse(null, 'Enrollment berhasil dihapus'));
    } catch (error) {
      request.log.error({ err: error }, '[adminEnrollmentController] deleteEnrollment error');
      return reply.status(500).send(errorResponse('Gagal menghapus enrollment', 500, error.message));
    }
  }

  /**
   * Get enrollment statistics (Admin only)
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getEnrollmentStats(request, reply) {
    try {
      request.log.info('[adminEnrollmentController] getEnrollmentStats start');
      const stats = await this.enrollmentService.getEnrollmentStats();
      request.log.info('[adminEnrollmentController] getEnrollmentStats success');
      return reply.send(successResponse(stats, 'Statistik enrollment berhasil ditemukan'));
    } catch (error) {
      request.log.error({ err: error }, '[adminEnrollmentController] getEnrollmentStats error');
      return reply.status(500).send(errorResponse('Gagal mendapatkan statistik enrollment', 500, error.message));
    }
  }
}

// Export instance
export const adminEnrollmentController = new AdminEnrollmentController();
