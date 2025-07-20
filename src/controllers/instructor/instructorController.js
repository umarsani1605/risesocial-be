import { validationResult } from 'express-validator';
import InstructorService from '../../services/instructorService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

class InstructorController {
  constructor() {
    this.instructorService = new InstructorService();
  }

  // ========================
  // INSTRUCTOR CRUD METHODS
  // ========================

  /**
   * Mendapatkan semua instructor dengan pagination dan filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllInstructors(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const options = {
        page: parseInt(request.query.page) || 1,
        limit: parseInt(request.query.limit) || 10,
        search: request.query.search,
        includeBootcamps: request.query.include_bootcamps === 'true',
      };

      const result = await this.instructorService.getAllInstructors(options);

      return reply.send(successResponse(result, 'Instructor berhasil diambil'));
    } catch (error) {
      request.log.error('Error getting instructors:', error);
      return reply.send(errorResponse('Gagal mendapatkan instructor', 500, error.message));
    }
  }

  /**
   * Mendapatkan instructor berdasarkan ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getInstructorById(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      const includeBootcamps = request.query.include_bootcamps === 'true';

      const instructor = await this.instructorService.getInstructorById(parseInt(id), includeBootcamps);

      if (!instructor) {
        return reply.send(errorResponse('Instructor tidak ditemukan', 404));
      }

      return reply.send(successResponse(instructor, 'Instructor berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Membuat instructor baru
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createInstructor(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const instructor = await this.instructorService.createInstructor(request.body);
      return reply.status(201).send(successResponse(instructor, 'Instructor berhasil dibuat'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Update instructor
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateInstructor(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      const instructor = await this.instructorService.updateInstructor(parseInt(id), request.body);

      return reply.send(successResponse(instructor, 'Instructor berhasil diupdate'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Menghapus instructor
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteInstructor(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      await this.instructorService.deleteInstructor(parseInt(id));

      return reply.send(successResponse(null, 'Instructor berhasil dihapus'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // SEARCH & FILTER METHODS
  // ========================

  /**
   * Mencari instructor berdasarkan nama
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async searchInstructorByName(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { name } = request.query;
      const instructors = await this.instructorService.searchInstructorByName(name);

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            search_query: name,
          },
          'Pencarian instructor berhasil'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Mendapatkan instructor berdasarkan job title
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getInstructorsByJobTitle(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { job_title } = request.query;
      const instructors = await this.instructorService.getInstructorsByJobTitle(job_title);

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            job_title_filter: job_title,
          },
          'Instructor berdasarkan job title berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Mendapatkan instructor terpopuler
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getPopularInstructors(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const limit = parseInt(request.query.limit) || 10;
      const instructors = await this.instructorService.getPopularInstructors(limit);

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            limit,
          },
          'Instructor terpopuler berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // BOOTCAMP ASSOCIATION METHODS
  // ========================

  /**
   * Mendapatkan instructor untuk bootcamp tertentu
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getInstructorsByBootcampId(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const instructors = await this.instructorService.getInstructorsByBootcampId(parseInt(bootcampId));

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            bootcamp_id: parseInt(bootcampId),
          },
          'Instructor bootcamp berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Mendapatkan bootcamp yang diajar oleh instructor
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getBootcampsByInstructorId(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { instructorId } = request.params;
      const bootcamps = await this.instructorService.getBootcampsByInstructorId(parseInt(instructorId));

      return reply.send(
        successResponse(
          {
            bootcamps,
            total: bootcamps.length,
            instructor_id: parseInt(instructorId),
          },
          'Bootcamp instructor berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Mendapatkan instructor yang tersedia untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getAvailableInstructorsForBootcamp(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const instructors = await this.instructorService.getAvailableInstructorsForBootcamp(parseInt(bootcampId));

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            bootcamp_id: parseInt(bootcampId),
          },
          'Instructor tersedia berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // ASSIGNMENT MANAGEMENT METHODS
  // ========================

  /**
   * Assign instructor ke bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async assignInstructorToBootcamp(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { instructor_id, instructor_order } = request.body;

      const assignment = await this.instructorService.assignInstructorToBootcamp(parseInt(bootcampId), instructor_id, instructor_order);

      return reply.status(201).send(successResponse(assignment, 'Instructor berhasil di-assign ke bootcamp'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Remove instructor dari bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async removeInstructorFromBootcamp(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId, instructorId } = request.params;

      await this.instructorService.removeInstructorFromBootcamp(parseInt(bootcampId), parseInt(instructorId));

      return reply.send(successResponse(null, 'Instructor berhasil di-remove dari bootcamp'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Reorder instructor dalam bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async reorderInstructorsInBootcamp(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { order_data } = request.body;

      const assignments = await this.instructorService.reorderInstructorsInBootcamp(parseInt(bootcampId), order_data);

      return reply.send(successResponse(assignments, 'Instructor berhasil diurutkan ulang'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Batch assign instructor ke bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async batchAssignInstructors(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { instructor_ids } = request.body;

      const assignments = await this.instructorService.batchAssignInstructors(parseInt(bootcampId), instructor_ids);

      return reply.status(201).send(successResponse(assignments, 'Instructor berhasil di-assign secara batch'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Batch remove instructor dari bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async batchRemoveInstructors(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { instructor_ids } = request.body;

      const removedCount = await this.instructorService.batchRemoveInstructors(parseInt(bootcampId), instructor_ids);

      return reply.send(
        successResponse(
          {
            removed_count: removedCount,
            instructor_ids,
          },
          'Instructor berhasil di-remove secara batch'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Mendapatkan detail assignment
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getAssignmentDetail(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId, instructorId } = request.params;

      const assignment = await this.instructorService.getAssignmentDetail(parseInt(bootcampId), parseInt(instructorId));

      if (!assignment) {
        return reply.send(errorResponse('Assignment tidak ditemukan', 404));
      }

      return reply.send(successResponse(assignment, 'Detail assignment berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // STATISTICS METHODS
  // ========================

  /**
   * Mendapatkan statistik instructor
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getInstructorStats(request, reply) {
    try {
      const stats = await this.instructorService.getInstructorStats();

      return reply.send(successResponse(stats, 'Statistik instructor berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // OVERVIEW METHODS
  // ========================

  /**
   * Mendapatkan overview instructor dengan bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getInstructorBootcampOverview(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { instructorId } = request.params;
      const includeDetails = request.query.include_details === 'true';

      const [instructor, bootcamps] = await Promise.all([
        this.instructorService.getInstructorById(parseInt(instructorId), false),
        this.instructorService.getBootcampsByInstructorId(parseInt(instructorId)),
      ]);

      if (!instructor) {
        return reply.send(errorResponse('Instructor tidak ditemukan', 404));
      }

      const overview = {
        instructor,
        bootcamps: {
          data: bootcamps,
          total: bootcamps.length,
          active_count: bootcamps.filter((b) => b.status === 'ACTIVE').length,
          categories: [...new Set(bootcamps.map((b) => b.category).filter(Boolean))],
        },
        summary: {
          total_bootcamps: bootcamps.length,
          profile_completeness: instructor.profile_completeness,
          experience_level: instructor.experience_level,
          instructor_type: instructor.instructor_type,
          expertise_areas: instructor.expertise_areas,
        },
      };

      return reply.send(successResponse(overview, 'Overview instructor-bootcamp berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Mendapatkan overview bootcamp dengan instructor
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getBootcampInstructorOverview(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const includeDetails = request.query.include_details === 'true';

      const [instructors, availableInstructors] = await Promise.all([
        this.instructorService.getInstructorsByBootcampId(parseInt(bootcampId)),
        this.instructorService.getAvailableInstructorsForBootcamp(parseInt(bootcampId)),
      ]);

      const overview = {
        bootcamp_id: parseInt(bootcampId),
        assigned_instructors: {
          data: instructors,
          total: instructors.length,
          experience_levels: this.getExperienceLevelDistribution(instructors),
          instructor_types: this.getInstructorTypeDistribution(instructors),
        },
        available_instructors: {
          data: includeDetails ? availableInstructors : [],
          total: availableInstructors.length,
        },
        summary: {
          total_assigned: instructors.length,
          total_available: availableInstructors.length,
          completion_rate:
            instructors.length > 0 ? Math.round(instructors.reduce((sum, i) => sum + i.profile_completeness, 0) / instructors.length) : 0,
        },
      };

      return reply.send(successResponse(overview, 'Overview bootcamp-instructor berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // HELPER METHODS
  // ========================

  /**
   * Mendapatkan distribusi experience level
   * @param {Array} instructors - Array instructor
   * @returns {Object} Distribution object
   */
  getExperienceLevelDistribution(instructors) {
    const distribution = {};
    instructors.forEach((instructor) => {
      const level = instructor.experience_level;
      distribution[level] = (distribution[level] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Mendapatkan distribusi instructor type
   * @param {Array} instructors - Array instructor
   * @returns {Object} Distribution object
   */
  getInstructorTypeDistribution(instructors) {
    const distribution = {};
    instructors.forEach((instructor) => {
      const type = instructor.instructor_type;
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  }
}

export default InstructorController;
