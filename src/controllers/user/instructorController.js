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
        includeAcademies: request.query.include_academies === 'true',
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
      const includeAcademies = request.query.include_academies === 'true';

      const instructor = await this.instructorService.getInstructorById(parseInt(id), includeAcademies);

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
   * Get instructors by academy ID
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getInstructorsByAcademyId(request, reply) {
    try {
      request.log.info('[userInstructorController] getInstructorsByAcademyId start');
      request.log.debug({ params: request.params }, '[userInstructorController] rawParams');

      const { academyId } = request.params;
      const instructors = await this.instructorService.getInstructorsByAcademyId(parseInt(academyId));

      request.log.info('[userInstructorController] getInstructorsByAcademyId success');
      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            academy_id: parseInt(academyId),
          },
          'Instructor academy berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error({ err: error }, '[userInstructorController] getInstructorsByAcademyId error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Get academies by instructor ID
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAcademiesByInstructorId(request, reply) {
    try {
      request.log.info('[userInstructorController] getAcademiesByInstructorId start');
      request.log.debug({ params: request.params }, '[userInstructorController] rawParams');

      const { instructorId } = request.params;
      const academies = await this.instructorService.getAcademiesByInstructorId(parseInt(instructorId));

      request.log.info('[userInstructorController] getAcademiesByInstructorId success');
      return reply.send(
        successResponse(
          {
            academies,
            total: academies.length,
            instructor_id: parseInt(instructorId),
          },
          'Academy instructor berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error({ err: error }, '[userInstructorController] getAcademiesByInstructorId error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }
}

// Export instance
export const userInstructorController = new UserInstructorController();
