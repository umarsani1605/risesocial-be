import { validationResult } from 'express-validator';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * EnrollmentController - Controller untuk mengelola enrollment bootcamp
 * Menangani HTTP request/response dan berinteraksi dengan service layer
 */
class EnrollmentController {
  constructor(enrollmentService) {
    this.enrollmentService = enrollmentService;
  }

  /**
   * Mendapatkan semua enrollment
   * GET /api/enrollments
   */
  async getAllEnrollments(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation error', 400, errors.array()));
      }

      const options = {
        user_id: request.query.user_id ? parseInt(request.query.user_id) : undefined,
        bootcamp_id: request.query.bootcamp_id ? parseInt(request.query.bootcamp_id) : undefined,
        enrollment_status: request.query.enrollment_status,
        progress_min: request.query.progress_min ? parseInt(request.query.progress_min) : undefined,
        progress_max: request.query.progress_max ? parseInt(request.query.progress_max) : undefined,
        enrolled_from: request.query.enrolled_from,
        enrolled_to: request.query.enrolled_to,
        page: request.query.page ? parseInt(request.query.page) : 1,
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
        include_user: request.query.include_user === 'true',
        include_bootcamp: request.query.include_bootcamp === 'true',
        include_pricing: request.query.include_pricing === 'true',
      };

      const enrollments = await this.enrollmentService.getAllEnrollments(options);

      return reply.send(successResponse(enrollments, 'Enrollment berhasil ditemukan'));
    } catch (error) {
      request.log.error(error);
      return reply.send(errorResponse('Gagal mendapatkan enrollment', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment berdasarkan ID
   * GET /api/enrollments/:id
   */
  async getEnrollmentById(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation error', 400, errors.array()));
      }

      const { id } = request.params;
      const enrollment = await this.enrollmentService.getEnrollmentById(parseInt(id));

      if (!enrollment) {
        return reply.send(errorResponse('Enrollment tidak ditemukan', 404));
      }

      return reply.send(successResponse(enrollment, 'Enrollment berhasil ditemukan'));
    } catch (error) {
      request.log.error('Error getting enrollment by ID:', error);
      return reply.send(errorResponse('Gagal mendapatkan enrollment', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment berdasarkan user dan bootcamp
   * GET /api/enrollments/user/:userId/bootcamp/:bootcampId
   */
  async getEnrollmentByUserAndBootcamp(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const { userId, bootcampId } = request.params;
      const enrollment = await this.enrollmentService.getEnrollmentByUserAndBootcamp(parseInt(userId), parseInt(bootcampId));

      if (!enrollment) {
        return reply.status(404).send(errorResponse('Enrollment tidak ditemukan', 404));
      }

      return reply.send(successResponse(enrollment, 'Enrollment berhasil ditemukan'));
    } catch (error) {
      request.log.error('Error getting enrollment by user and bootcamp:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment berdasarkan user ID
   * GET /api/enrollments/user/:userId
   */
  async getUserEnrollments(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const { userId } = request.params;
      const options = {
        enrollment_status: request.query.enrollment_status,
        progress_min: request.query.progress_min ? parseInt(request.query.progress_min) : undefined,
        progress_max: request.query.progress_max ? parseInt(request.query.progress_max) : undefined,
        page: request.query.page ? parseInt(request.query.page) : 1,
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
      };

      const enrollments = await this.enrollmentService.getUserEnrollments(parseInt(userId), options);

      return reply.send(successResponse(enrollments, 'Enrollment user berhasil ditemukan'));
    } catch (error) {
      request.log.error('Error getting user enrollments:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment user', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment berdasarkan bootcamp ID
   * GET /api/enrollments/bootcamp/:bootcampId
   */
  async getBootcampEnrollments(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const options = {
        enrollment_status: request.query.enrollment_status,
        progress_min: request.query.progress_min ? parseInt(request.query.progress_min) : undefined,
        progress_max: request.query.progress_max ? parseInt(request.query.progress_max) : undefined,
        page: request.query.page ? parseInt(request.query.page) : 1,
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
      };

      const enrollments = await this.enrollmentService.getBootcampEnrollments(parseInt(bootcampId), options);

      return reply.send(successResponse(enrollments, 'Enrollment bootcamp berhasil ditemukan'));
    } catch (error) {
      request.log.error('Error getting bootcamp enrollments:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment bootcamp', 500, error.message));
    }
  }

  /**
   * Membuat enrollment baru
   * POST /api/enrollments
   */
  async createEnrollment(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const enrollmentData = {
        user_id: request.body.user_id,
        bootcamp_id: request.body.bootcamp_id,
        pricing_tier_id: request.body.pricing_tier_id,
        enrollment_status: request.body.enrollment_status,
        progress_percentage: request.body.progress_percentage,
      };

      const enrollment = await this.enrollmentService.createEnrollment(enrollmentData);

      return reply.status(201).send(successResponse(enrollment, 'Enrollment berhasil dibuat'));
    } catch (error) {
      request.log.error('Error creating enrollment:', error);
      return reply.status(500).send(errorResponse('Gagal membuat enrollment', 500, error.message));
    }
  }

  /**
   * Update enrollment
   * PUT /api/enrollments/:id
   */
  async updateEnrollment(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const { id } = request.params;
      const updateData = {
        enrollment_status: request.body.enrollment_status,
        progress_percentage: request.body.progress_percentage,
        pricing_tier_id: request.body.pricing_tier_id,
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

      const enrollment = await this.enrollmentService.updateEnrollment(parseInt(id), updateData);

      return reply.send(successResponse(enrollment, 'Enrollment berhasil diupdate'));
    } catch (error) {
      request.log.error('Error updating enrollment:', error);
      return reply.status(500).send(errorResponse('Gagal mengupdate enrollment', 500, error.message));
    }
  }

  /**
   * Update progress enrollment
   * PUT /api/enrollments/:id/progress
   */
  async updateProgress(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const { id } = request.params;
      const { progress_percentage } = request.body;

      const enrollment = await this.enrollmentService.updateProgress(parseInt(id), progress_percentage);

      return reply.send(successResponse(enrollment, 'Progress enrollment berhasil diupdate'));
    } catch (error) {
      request.log.error('Error updating progress:', error);
      return reply.status(500).send(errorResponse('Gagal mengupdate progress enrollment', 500, error.message));
    }
  }

  /**
   * Update status enrollment
   * PUT /api/enrollments/:id/status
   */
  async updateStatus(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const { id } = request.params;
      const { enrollment_status } = request.body;

      const enrollment = await this.enrollmentService.updateStatus(parseInt(id), enrollment_status);

      return reply.send(successResponse(enrollment, 'Status enrollment berhasil diupdate'));
    } catch (error) {
      request.log.error('Error updating status:', error);
      return reply.status(500).send(errorResponse('Gagal mengupdate status enrollment', 500, error.message));
    }
  }

  /**
   * Bulk update status enrollment
   * PUT /api/enrollments/bulk-status
   */
  async bulkUpdateStatus(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const { enrollment_ids, enrollment_status } = request.body;

      const result = await this.enrollmentService.bulkUpdateStatus(enrollment_ids, enrollment_status);

      return reply.send(successResponse(result, 'Bulk update status berhasil'));
    } catch (error) {
      request.log.error('Error bulk updating status:', error);
      return reply.status(500).send(errorResponse('Gagal bulk update status', 500, error.message));
    }
  }

  /**
   * Mendapatkan statistik enrollment
   * GET /api/enrollments/stats
   */
  async getEnrollmentStats(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const options = {
        bootcamp_id: request.query.bootcamp_id ? parseInt(request.query.bootcamp_id) : undefined,
        user_id: request.query.user_id ? parseInt(request.query.user_id) : undefined,
        date_from: request.query.date_from,
        date_to: request.query.date_to,
      };

      const stats = await this.enrollmentService.getEnrollmentStats(options);

      return reply.send(successResponse(stats, 'Statistik enrollment berhasil didapat'));
    } catch (error) {
      request.log.error('Error getting enrollment stats:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan statistik enrollment', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment yang akan berakhir
   * GET /api/enrollments/expiring
   */
  async getExpiringEnrollments(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const days = request.query.days ? parseInt(request.query.days) : 7;

      const enrollments = await this.enrollmentService.getExpiringEnrollments(days);

      return reply.send(successResponse(enrollments, 'Enrollment yang akan berakhir berhasil ditemukan'));
    } catch (error) {
      request.log.error('Error getting expiring enrollments:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment yang akan berakhir', 500, error.message));
    }
  }

  /**
   * Mendapatkan top learners
   * GET /api/enrollments/top-learners
   */
  async getTopLearners(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const options = {
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
        bootcamp_id: request.query.bootcamp_id ? parseInt(request.query.bootcamp_id) : undefined,
      };

      const topLearners = await this.enrollmentService.getTopLearners(options);

      return reply.send(successResponse(topLearners, 'Top learners berhasil ditemukan'));
    } catch (error) {
      request.log.error('Error getting top learners:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan top learners', 500, error.message));
    }
  }

  /**
   * Mendapatkan dashboard overview
   * GET /api/enrollments/dashboard
   */
  async getDashboardOverview(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const options = {
        bootcamp_id: request.query.bootcamp_id ? parseInt(request.query.bootcamp_id) : undefined,
        user_id: request.query.user_id ? parseInt(request.query.user_id) : undefined,
        date_from: request.query.date_from,
        date_to: request.query.date_to,
      };

      const dashboard = await this.enrollmentService.getDashboardOverview(options);

      return reply.send(successResponse(dashboard, 'Dashboard overview berhasil didapat'));
    } catch (error) {
      request.log.error('Error getting dashboard overview:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan dashboard overview', 500, error.message));
    }
  }

  /**
   * Search enrollments
   * GET /api/enrollments/search
   */
  async searchEnrollments(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      // Implementasi search logic bisa ditambahkan di service
      const options = {
        q: request.query.q,
        user_name: request.query.user_name,
        bootcamp_title: request.query.bootcamp_title,
        email: request.query.email,
        enrollment_status: request.query.enrollment_status,
        progress_min: request.query.progress_min ? parseInt(request.query.progress_min) : undefined,
        progress_max: request.query.progress_max ? parseInt(request.query.progress_max) : undefined,
        page: request.query.page ? parseInt(request.query.page) : 1,
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
      };

      // Untuk sementara gunakan getAllEnrollments dengan filter
      const enrollments = await this.enrollmentService.getAllEnrollments({
        enrollment_status: options.enrollment_status,
        progress_min: options.progress_min,
        progress_max: options.progress_max,
        page: options.page,
        limit: options.limit,
        include_user: true,
        include_bootcamp: true,
      });

      return reply.send(successResponse(enrollments, 'Search enrollment berhasil'));
    } catch (error) {
      request.log.error('Error searching enrollments:', error);
      return reply.status(500).send(errorResponse('Gagal melakukan search enrollment', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment overview
   * GET /api/enrollments/overview
   */
  async getEnrollmentOverview(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const options = {
        bootcamp_id: request.query.bootcamp_id ? parseInt(request.query.bootcamp_id) : undefined,
        user_id: request.query.user_id ? parseInt(request.query.user_id) : undefined,
        date_from: request.query.date_from,
        date_to: request.query.date_to,
      };

      const overview = await this.enrollmentService.getDashboardOverview(options);

      return reply.send(successResponse(overview, 'Enrollment overview berhasil didapat'));
    } catch (error) {
      request.log.error('Error getting enrollment overview:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment overview', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment analysis
   * GET /api/enrollments/analysis
   */
  async getEnrollmentAnalysis(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const options = {
        period: request.query.period || 'monthly',
        bootcamp_id: request.query.bootcamp_id ? parseInt(request.query.bootcamp_id) : undefined,
        date_from: request.query.date_from,
        date_to: request.query.date_to,
      };

      // Untuk sementara gunakan stats
      const analysis = await this.enrollmentService.getEnrollmentStats(options);

      return reply.send(
        successResponse(
          {
            ...analysis,
            period: options.period,
            analysis_type: 'enrollment_performance',
          },
          'Enrollment analysis berhasil didapat'
        )
      );
    } catch (error) {
      request.log.error('Error getting enrollment analysis:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment analysis', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment trends
   * GET /api/enrollments/trends
   */
  async getEnrollmentTrends(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const options = {
        period: request.query.period || '30days',
        bootcamp_id: request.query.bootcamp_id ? parseInt(request.query.bootcamp_id) : undefined,
        group_by: request.query.group_by || 'day',
      };

      // Untuk sementara gunakan stats
      const trends = await this.enrollmentService.getEnrollmentStats(options);

      return reply.send(
        successResponse(
          {
            ...trends,
            period: options.period,
            group_by: options.group_by,
            trend_type: 'enrollment_trends',
          },
          'Enrollment trends berhasil didapat'
        )
      );
    } catch (error) {
      request.log.error('Error getting enrollment trends:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment trends', 500, error.message));
    }
  }

  /**
   * Mendapatkan enrollment reports
   * GET /api/enrollments/reports
   */
  async getEnrollmentReports(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const options = {
        type: request.query.type || 'summary',
        format: request.query.format || 'json',
        bootcamp_id: request.query.bootcamp_id ? parseInt(request.query.bootcamp_id) : undefined,
        user_id: request.query.user_id ? parseInt(request.query.user_id) : undefined,
        date_from: request.query.date_from,
        date_to: request.query.date_to,
      };

      // Generate report berdasarkan type
      let reportData;
      switch (options.type) {
        case 'detailed':
          reportData = await this.enrollmentService.getAllEnrollments({
            bootcamp_id: options.bootcamp_id,
            user_id: options.user_id,
            enrolled_from: options.date_from,
            enrolled_to: options.date_to,
            include_user: true,
            include_bootcamp: true,
            include_pricing: true,
            limit: 1000,
          });
          break;
        case 'progress':
          reportData = await this.enrollmentService.getAllEnrollments({
            bootcamp_id: options.bootcamp_id,
            user_id: options.user_id,
            enrolled_from: options.date_from,
            enrolled_to: options.date_to,
            include_user: true,
            include_bootcamp: true,
            limit: 1000,
          });
          break;
        case 'completion':
          reportData = await this.enrollmentService.getAllEnrollments({
            bootcamp_id: options.bootcamp_id,
            user_id: options.user_id,
            enrolled_from: options.date_from,
            enrolled_to: options.date_to,
            enrollment_status: 'COMPLETED',
            include_user: true,
            include_bootcamp: true,
            limit: 1000,
          });
          break;
        default: // summary
          reportData = await this.enrollmentService.getEnrollmentStats(options);
          break;
      }

      return reply.send(
        successResponse(
          {
            report_type: options.type,
            report_format: options.format,
            generated_at: new Date().toISOString(),
            report_data: reportData,
          },
          'Enrollment reports berhasil didapat'
        )
      );
    } catch (error) {
      request.log.error('Error getting enrollment reports:', error);
      return reply.status(500).send(errorResponse('Gagal mendapatkan enrollment reports', 500, error.message));
    }
  }

  /**
   * Delete enrollment
   * DELETE /api/enrollments/:id
   */
  async deleteEnrollment(request, reply) {
    try {
      // Validasi input
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.status(400).send(errorResponse('Validation error', 400, errors.array()));
      }

      const { id } = request.params;

      // Cek apakah enrollment ada
      const enrollment = await this.enrollmentService.getEnrollmentById(parseInt(id));
      if (!enrollment) {
        return reply.status(404).send(errorResponse('Enrollment tidak ditemukan', 404));
      }

      // Soft delete dengan mengubah status menjadi CANCELLED
      await this.enrollmentService.updateStatus(parseInt(id), 'CANCELLED');

      return reply.send(successResponse(null, 'Enrollment berhasil dihapus (dibatalkan)'));
    } catch (error) {
      request.log.error('Error deleting enrollment:', error);
      return reply.status(500).send(errorResponse('Gagal menghapus enrollment', 500, error.message));
    }
  }
}

export { EnrollmentController };
