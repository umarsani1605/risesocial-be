import { instructorService } from '../../services/instructorService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UserInstructorController {
  constructor() {
    this.instructorService = instructorService;
  }

  getAllInstructors = async (request, reply) => {
    try {
      request.log.info('[userInstructorController] getAllInstructors start');
      request.log.debug({ query: request.query }, '[userInstructorController] rawQuery');

      const options = {
        page: Number(request.query.page) || 1,
        limit: Number(request.query.limit) || 10,
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

  async getInstructorById(request, reply) {
    try {
      request.log.info('[userInstructorController] getInstructorById start');
      request.log.debug({ params: request.params, query: request.query }, '[userInstructorController] rawParams');

      const { id } = request.params;
      const includeAcademies = request.query.include_academies === 'true';

      const instructor = await this.instructorService.getInstructorById(Number(id), includeAcademies);

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

  async getPopularInstructors(request, reply) {
    try {
      request.log.info('[userInstructorController] getPopularInstructors start');
      request.log.debug({ query: request.query }, '[userInstructorController] rawQuery');

      const limit = Number(request.query.limit) || 10;
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

  async getInstructorsByAcademyId(request, reply) {
    try {
      request.log.info('[userInstructorController] getInstructorsByAcademyId start');
      request.log.debug({ params: request.params }, '[userInstructorController] rawParams');

      const { academyId } = request.params;
      const instructors = await this.instructorService.getInstructorsByAcademyId(Number(academyId));

      request.log.info('[userInstructorController] getInstructorsByAcademyId success');
      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            academy_id: Number(academyId),
          },
          'Instructor academy berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error({ err: error }, '[userInstructorController] getInstructorsByAcademyId error');
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async getAcademiesByInstructorId(request, reply) {
    try {
      request.log.info('[userInstructorController] getAcademiesByInstructorId start');
      request.log.debug({ params: request.params }, '[userInstructorController] rawParams');

      const { instructorId } = request.params;
      const academies = await this.instructorService.getAcademiesByInstructorId(Number(instructorId));

      request.log.info('[userInstructorController] getAcademiesByInstructorId success');
      return reply.send(
        successResponse(
          {
            academies,
            total: academies.length,
            instructor_id: Number(instructorId),
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

export const userInstructorController = new UserInstructorController();
