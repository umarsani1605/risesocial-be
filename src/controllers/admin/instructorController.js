import { instructorService } from '../../services/shared/instructorService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminInstructorController {
  constructor() {
    this.instructorService = instructorService;
  }

  async createInstructor(request, reply) {
    try {

      const instructor = await this.instructorService.createInstructor(request.body);
      return reply.status(201).send(successResponse(instructor, 'Instructor berhasil dibuat'));
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async updateInstructor(request, reply) {
    try {

      const { id } = request.params;
      const instructor = await this.instructorService.updateInstructor(Number(id), request.body);

      if (!instructor) {
        return reply.send(errorResponse('Instructor tidak ditemukan', 404));
      }

      return reply.send(successResponse(instructor, 'Instructor berhasil diupdate'));
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async deleteInstructor(request, reply) {
    try {

      const { id } = request.params;
      const result = await this.instructorService.deleteInstructor(Number(id));

      if (!result) {
        return reply.send(errorResponse('Instructor tidak ditemukan', 404));
      }

      return reply.send(successResponse(null, 'Instructor berhasil dihapus'));
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async getAvailableInstructorsForAcademy(request, reply) {
    try {

      const { academyId } = request.params;
      const instructors = await this.instructorService.getAvailableInstructorsForAcademy(Number(academyId));

      return reply.send(
        successResponse(
          {
            instructors,
            total: instructors.length,
            academy_id: Number(academyId),
          },
          'Available instructors berhasil diambil',
        ),
      );
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async assignInstructorToAcademy(request, reply) {
    try {

      const { academyId } = request.params;
      const { instructor_id, instructor_order } = request.body;

      const result = await this.instructorService.assignInstructorToAcademy(Number(academyId), Number(instructor_id), instructor_order);

      return reply.send(successResponse(result, 'Instructor berhasil diassign ke academy'));
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async removeInstructorFromAcademy(request, reply) {
    try {

      const { academyId, instructorId } = request.params;
      const result = await this.instructorService.removeInstructorFromAcademy(Number(academyId), Number(instructorId));

      if (!result) {
        return reply.send(errorResponse('Assignment tidak ditemukan', 404));
      }

      return reply.send(successResponse(null, 'Instructor berhasil diremove dari academy'));
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async getInstructorStats(request, reply) {
    try {
      const stats = await this.instructorService.getInstructorStats();
      return reply.send(successResponse(stats, 'Statistik instructor berhasil diambil'));
    } catch (error) {
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  async uploadInstructorAvatar(request, reply) {
    try {

      const { id } = request.params;
      const file = request.file;

      if (!file) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const result = {
        id: Number(id),
        name: 'Instructor Name',
        avatar_url: `/uploads/images/${file.filename}`,
      };

      return reply.send(successResponse(result, 'Instructor avatar uploaded successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to upload instructor avatar', 500, error.message));
    }
  }
}

export const adminInstructorController = new AdminInstructorController();
