import { instructorService } from '../../services/shared/instructorService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UserInstructorController {
  constructor() {
    this.instructorService = instructorService;
  }

  getAllInstructors = async (request, reply) => {
    try {

      const options = {
        page: Number(request.query.page) || 1,
        limit: Number(request.query.limit) || 10,
        search: request.query.search,
        includeAcademies: request.query.include_academies === 'true',
      };

      const result = await this.instructorService.getAllInstructors(options);

      return reply.send(successResponse(result, 'Instructor berhasil diambil'));
    } catch (error) {
      return reply.send(errorResponse('Gagal mendapatkan instructor', 500, error.message));
    }
  };

  async getInstructorById(request, reply) {
    try {

      const { id } = request.params;
      const includeAcademies = request.query.include_academies === 'true';

      const instructor = await this.instructorService.getInstructorById(Number(id), includeAcademies);

      if (!instructor) {
        return reply.send(errorResponse('Instructor tidak ditemukan', 404));
      }

      return reply.send(successResponse(instructor, 'Instructor berhasil diambil'));
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async searchInstructorByName(request, reply) {
    try {

      const { name } = request.query;
      const instructors = await this.instructorService.searchInstructorByName(name);

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            search_query: name,
          },
          'Pencarian instructor berhasil',
        ),
      );
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async getInstructorsByJobTitle(request, reply) {
    try {

      const { job_title } = request.query;
      const instructors = await this.instructorService.getInstructorsByJobTitle(job_title);

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            job_title_filter: job_title,
          },
          'Instructor berdasarkan job title berhasil diambil',
        ),
      );
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async getPopularInstructors(request, reply) {
    try {

      const limit = Number(request.query.limit) || 10;
      const instructors = await this.instructorService.getPopularInstructors(limit);

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            limit,
          },
          'Instructor terpopuler berhasil diambil',
        ),
      );
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async getInstructorsByAcademyId(request, reply) {
    try {

      const { academyId } = request.params;
      const instructors = await this.instructorService.getInstructorsByAcademyId(Number(academyId));

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            academy_id: Number(academyId),
          },
          'Instructor academy berhasil diambil',
        ),
      );
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async getAcademiesByInstructorId(request, reply) {
    try {

      const { instructorId } = request.params;
      const academies = await this.instructorService.getAcademiesByInstructorId(Number(instructorId));

      return reply.send(
        successResponse(
          {
            academies,
            total: academies.length,
            instructor_id: Number(instructorId),
          },
          'Academy instructor berhasil diambil',
        ),
      );
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }
}

export const userInstructorController = new UserInstructorController();
