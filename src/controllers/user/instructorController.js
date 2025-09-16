import InstructorService from '../../services/instructorService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User Instructor HTTP controllers
 * Handles public instructor browsing requests
 */
export class UserInstructorController {
  constructor() {
    this.instructorService = new InstructorService();
  }

  /**
   * Get all instructors with pagination and filtering
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  getAllInstructors = async (request, reply) => {
    try {
      request.log.info('[userInstructorController] getAllInstructors start');
      request.log.debug({ query: request.query }, '[userInstructorController] rawQuery');
      console.log('getAllInstructors - this:', this);
      console.log('getAllInstructors - this.instructorService:', this.instructorService);

      const options = {
        page: parseInt(request.query.page) || 1,
        limit: parseInt(request.query.limit) || 10,
        search: request.query.search,
        includeBootcamps: request.query.include_bootcamps === 'true',
      };

      const result = await this.instructorService.getAllInstructors(options);

      request.log.info('[userInstructorController] getAllInstructors success');
      return reply.send(successResponse(result, 'Instructor berhasil diambil'));
    } catch (error) {
      request.log.error({ err: error }, '[userInstructorController] getAllInstructors error');
      return reply.send(errorResponse('Gagal mendapatkan instructor', 500, error.message));
    }
  };

  /**
   * Get instructor by ID
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getInstructorById(request, reply) {
    try {
      request.log.info('[userInstructorController] getInstructorById start');
      request.log.debug({ params: request.params, query: request.query }, '[userInstructorController] rawParams');

      const { id } = request.params;
      const includeBootcamps = request.query.include_bootcamps === 'true';

      const instructor = await this.instructorService.getInstructorById(parseInt(id), includeBootcamps);

      if (!instructor) {
        request.log.info({ id }, '[userInstructorController] getInstructorById not_found');
        return reply.send(errorResponse('Instructor tidak ditemukan', 404));
      }

      request.log.info('[userInstructorController] getInstructorById success');
      return reply.send(successResponse(instructor, 'Instructor berhasil diambil'));
    } catch (error) {
      request.log.error({ err: error }, '[userInstructorController] getInstructorById error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Search instructor by name
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async searchInstructorByName(request, reply) {
    try {
      request.log.info('[userInstructorController] searchInstructorByName start');
      request.log.debug({ query: request.query }, '[userInstructorController] rawQuery');

      const { name } = request.query;
      const instructors = await this.instructorService.searchInstructorByName(name);

      request.log.info('[userInstructorController] searchInstructorByName success');
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
      request.log.error({ err: error }, '[userInstructorController] searchInstructorByName error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Get instructors by job title
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getInstructorsByJobTitle(request, reply) {
    try {
      request.log.info('[userInstructorController] getInstructorsByJobTitle start');
      request.log.debug({ query: request.query }, '[userInstructorController] rawQuery');

      const { job_title } = request.query;
      const instructors = await this.instructorService.getInstructorsByJobTitle(job_title);

      request.log.info('[userInstructorController] getInstructorsByJobTitle success');
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
      request.log.error({ err: error }, '[userInstructorController] getInstructorsByJobTitle error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Get popular instructors
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getPopularInstructors(request, reply) {
    try {
      request.log.info('[userInstructorController] getPopularInstructors start');
      request.log.debug({ query: request.query }, '[userInstructorController] rawQuery');

      const limit = parseInt(request.query.limit) || 10;
      const instructors = await this.instructorService.getPopularInstructors(limit);

      request.log.info('[userInstructorController] getPopularInstructors success');
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
      request.log.error({ err: error }, '[userInstructorController] getPopularInstructors error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Get instructors by bootcamp ID
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getInstructorsByBootcampId(request, reply) {
    try {
      request.log.info('[userInstructorController] getInstructorsByBootcampId start');
      request.log.debug({ params: request.params }, '[userInstructorController] rawParams');

      const { bootcampId } = request.params;
      const instructors = await this.instructorService.getInstructorsByBootcampId(parseInt(bootcampId));

      request.log.info('[userInstructorController] getInstructorsByBootcampId success');
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
      request.log.error({ err: error }, '[userInstructorController] getInstructorsByBootcampId error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Get bootcamps by instructor ID
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getBootcampsByInstructorId(request, reply) {
    try {
      request.log.info('[userInstructorController] getBootcampsByInstructorId start');
      request.log.debug({ params: request.params }, '[userInstructorController] rawParams');

      const { instructorId } = request.params;
      const bootcamps = await this.instructorService.getBootcampsByInstructorId(parseInt(instructorId));

      request.log.info('[userInstructorController] getBootcampsByInstructorId success');
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
      request.log.error({ err: error }, '[userInstructorController] getBootcampsByInstructorId error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }
}

// Export instance
export const userInstructorController = new UserInstructorController();
