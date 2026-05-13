import { adminCohortService } from '../../services/admin/cohortService.js';
import { fileUploadService } from '../../services/shared/fileUploadService.js';
import { successResponse, errorResponse, paginationMeta, toFileUrl } from '../../utils/response.js';

export class AdminCohortController {
  // --- Cohort CRUD ---

  async createCohort(request, reply) {
    try {

      const cohort = await adminCohortService.createCohort(request.body);

      return reply.status(201).send(successResponse(cohort, 'Cohort created successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      return reply.status(500).send(errorResponse('Failed to create cohort', 500, error.message));
    }
  }

  async updateCohort(request, reply) {
    try {

      const { id } = request.params;
      const cohort = await adminCohortService.updateCohort(Number(id), request.body);

      return reply.send(successResponse(cohort, 'Cohort updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      return reply.status(500).send(errorResponse('Failed to update cohort', 500, error.message));
    }
  }

  async deleteCohort(request, reply) {
    try {

      const { id } = request.params;
      await adminCohortService.deleteCohort(Number(id));

      return reply.send(successResponse(null, 'Cohort deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to delete cohort', 500, error.message));
    }
  }

  async getAllCohorts(request, reply) {
    try {

      const result = await adminCohortService.getCohorts(request.query);

      return reply.send(successResponse(result.data, 'Cohorts retrieved successfully', result.meta));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve cohorts', 500, error.message));
    }
  }

  async getCohortById(request, reply) {
    try {

      const { id } = request.params;
      const cohort = await adminCohortService.getCohortById(Number(id));

      for (const module of cohort.modules ?? []) {
        for (const att of module.attachments ?? []) {
          att.file_url = toFileUrl(att.file_path);
        }
      }

      return reply.send(successResponse(cohort, 'Cohort retrieved successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to retrieve cohort', 500, error.message));
    }
  }

  // --- Module management ---

  async createModule(request, reply) {
    try {

      const { id } = request.params;
      const module = await adminCohortService.createModule(Number(id), request.body);

      return reply.status(201).send(successResponse(module, 'Module created successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      return reply.status(500).send(errorResponse('Failed to create module', 500, error.message));
    }
  }

  async updateModule(request, reply) {
    try {

      const { id, moduleId } = request.params;
      const module = await adminCohortService.updateModule(Number(id), Number(moduleId), request.body);

      return reply.send(successResponse(module, 'Module updated successfully'));
    } catch (error) {

      if (error.statusCode === 404 || error.message === 'Module not found') return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to update module', 500, error.message));
    }
  }

  async deleteModule(request, reply) {
    try {

      const { id, moduleId } = request.params;
      await adminCohortService.deleteModule(Number(id), Number(moduleId));

      return reply.send(successResponse(null, 'Module deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404 || error.message === 'Module not found') return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to delete module', 500, error.message));
    }
  }

  // --- Attachment management ---

  async createAttachment(request, reply) {
    try {

      const { id, moduleId } = request.params;
      const data = request.body || {};

      if (request.uploadedFile) {
        // Use unified upload service with FK to module (atomicity fix)
        const uploadResult = await fileUploadService.upload(request.uploadedFile, {
          cohortModuleId: Number(moduleId),
        });
        data.type = data.type || 'file';
        data.file_path = uploadResult.relativePath;
        data.file_mime = uploadResult.mimeType;
        data.file_size_kb = Math.ceil(uploadResult.fileSize / 1024);
        data.label = data.label || request.uploadedFile.originalName;
      }

      if (data.type === 'external_link' && !data.label && data.url) {
        try {
          const res = await fetch(data.url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(5000),
          });
          const html = await res.text();
          const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
          data.label = ogTitle ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? '';
        } catch {}
      }

      const attachment = await adminCohortService.createAttachment(Number(id), Number(moduleId), data);
      attachment.file_url = toFileUrl(attachment.file_path);

      return reply.status(201).send(successResponse(attachment, 'Attachment created successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      return reply.status(500).send(errorResponse('Failed to create attachment', 500, error.message));
    }
  }

  async updateAttachment(request, reply) {
    try {

      const { id, moduleId, attachmentId } = request.params;
      const attachment = await adminCohortService.updateAttachment(Number(id), Number(moduleId), Number(attachmentId), request.body);

      return reply.send(successResponse(attachment, 'Attachment updated successfully'));
    } catch (error) {

      if (error.statusCode === 404 || error.message === 'Attachment not found') return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to update attachment', 500, error.message));
    }
  }

  async deleteAttachment(request, reply) {
    try {

      const { id, moduleId, attachmentId } = request.params;
      await adminCohortService.deleteAttachment(Number(id), Number(moduleId), Number(attachmentId));

      return reply.send(successResponse(null, 'Attachment deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404 || error.message === 'Attachment not found') return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to delete attachment', 500, error.message));
    }
  }

  // --- Enrollment management ---

  async getEnrollments(request, reply) {
    try {

      const { id } = request.params;
      const result = await adminCohortService.getEnrollments(Number(id), request.query);

      return reply.send(successResponse(result.data, 'Enrollments retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve enrollments', 500, error.message));
    }
  }

  async manualEnroll(request, reply) {
    try {

      const { id } = request.params;
      const { user_id, notes } = request.body;
      const enrollment = await adminCohortService.manualEnroll(Number(id), Number(user_id), notes);

      return reply.status(201).send(successResponse(enrollment, 'Student enrolled successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      return reply.status(500).send(errorResponse('Failed to enroll student', 500, error.message));
    }
  }

  async updateEnrollment(request, reply) {
    try {

      const { id, enrollmentId } = request.params;
      const enrollment = await adminCohortService.updateEnrollment(Number(id), Number(enrollmentId), request.body);

      return reply.send(successResponse(enrollment, 'Enrollment updated successfully'));
    } catch (error) {

      if (error.statusCode === 404 || error.message === 'Enrollment not found') return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to update enrollment', 500, error.message));
    }
  }

  // --- Mentor management ---

  async createMentor(request, reply) {
    try {

      const { id } = request.params;
      const data = request.body || {};

      if (request.uploadedFile) {
        data.avatarFile = request.uploadedFile;
      }

      const mentor = await adminCohortService.createMentor(Number(id), data);

      return reply.status(201).send(successResponse(mentor, 'Mentor added successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to add mentor', 500, error.message));
    }
  }

  async updateMentor(request, reply) {
    try {

      const { id, mentorId } = request.params;
      const data = request.body || {};

      if (request.uploadedFile) {
        data.avatarFile = request.uploadedFile;
      }

      const mentor = await adminCohortService.updateMentor(Number(id), Number(mentorId), data);

      return reply.send(successResponse(mentor, 'Mentor updated successfully'));
    } catch (error) {

      if (error.statusCode === 404 || error.message === 'Mentor not found') return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to update mentor', 500, error.message));
    }
  }

  async deleteMentor(request, reply) {
    try {

      const { id, mentorId } = request.params;
      await adminCohortService.deleteMentor(Number(id), Number(mentorId));

      return reply.send(successResponse(null, 'Mentor removed successfully'));
    } catch (error) {

      if (error.statusCode === 404 || error.message === 'Mentor not found') return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to remove mentor', 500, error.message));
    }
  }

  // --- Certificate generation ---

  async generateCertificate(request, reply) {
    try {

      const { id, placementId } = request.params;
      const grades = request.body?.grades ?? {};
      const cert = await adminCohortService.generateCertificate(Number(id), Number(placementId), grades);

      return reply.status(201).send(successResponse(cert, 'Certificate generated successfully'));
    } catch (error) {

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (error.statusCode === 400) return reply.status(400).send(errorResponse(error.message, 400));
      if (error.statusCode === 409) return reply.status(409).send(errorResponse(error.message, 409));
      return reply.status(500).send(errorResponse('Failed to generate certificate', 500, error.message));
    }
  }
}

export const adminCohortController = new AdminCohortController();
