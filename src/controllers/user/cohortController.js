import { userCohortService } from '../../services/user/cohortService.js';
import { successResponse, errorResponse, toFileUrl } from '../../utils/response.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UserCohortController {
  async getAllCohorts(request, reply) {
    try {
      request.log.info('[userCohortController] getAllCohorts start');

      const result = await userCohortService.getCohorts(request.query);

      request.log.info('[userCohortController] getAllCohorts success');
      return reply.send(successResponse(result.data, 'Cohorts retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] getAllCohorts error');
      return reply.status(500).send(errorResponse('Failed to retrieve cohorts', 500, error.message));
    }
  }

  async getCohortById(request, reply) {
    try {
      request.log.info('[userCohortController] getCohortById start');

      const { id } = request.params;
      const cohort = await userCohortService.getCohortById(Number(id));

      request.log.info('[userCohortController] getCohortById success');
      return reply.send(successResponse(cohort, 'Cohort retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] getCohortById error');

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to retrieve cohort', 500, error.message));
    }
  }

  async getMyEnrollments(request, reply) {
    try {
      request.log.info('[userCohortController] getMyEnrollments start');

      const userId = request.user.userId;
      const result = await userCohortService.getMyEnrollments(userId, request.query);

      request.log.info('[userCohortController] getMyEnrollments success');
      return reply.send(successResponse(result.data, 'Enrollments retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] getMyEnrollments error');
      return reply.status(500).send(errorResponse('Failed to retrieve enrollments', 500, error.message));
    }
  }

  async getCohortStudents(request, reply) {
    try {
      request.log.info('[userCohortController] getCohortStudents start');
      const { id } = request.params;
      const students = await userCohortService.getCohortStudents(Number(id));
      request.log.info('[userCohortController] getCohortStudents success');
      return reply.send(successResponse(students, 'Students retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] getCohortStudents error');
      return reply.status(500).send(errorResponse('Failed to retrieve students', 500, error.message));
    }
  }

  async getCohortModules(request, reply) {
    try {
      request.log.info('[userCohortController] getCohortModules start');

      const { id } = request.params;
      const userId = request.user.userId;
      const modules = await userCohortService.getCohortModules(Number(id), userId);

      for (const module of modules) {
        for (const att of module.attachments ?? []) {
          att.file_url = toFileUrl(att.file_path);
        }
      }

      request.log.info('[userCohortController] getCohortModules success');
      return reply.send(successResponse(modules, 'Modules retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] getCohortModules error');

      if (error.statusCode === 403) return reply.status(403).send(errorResponse(error.message, 403));
      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to retrieve modules', 500, error.message));
    }
  }

  async getCohortModuleById(request, reply) {
    try {
      request.log.info('[userCohortController] getCohortModuleById start');

      const { id, moduleId } = request.params;
      const userId = request.user.userId;
      const module = await userCohortService.getCohortModuleById(Number(id), Number(moduleId), userId);

      request.log.info('[userCohortController] getCohortModuleById success');
      return reply.send(successResponse(module, 'Module retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] getCohortModuleById error');

      if (error.statusCode === 403) return reply.status(403).send(errorResponse(error.message, 403));
      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to retrieve module', 500, error.message));
    }
  }

  async getUpcomingSessions(request, reply) {
    try {
      request.log.info('[userCohortController] getUpcomingSessions start');

      const userId = request.user.userId;
      const limit = Math.min(Number(request.query.limit ?? 7), 20);
      const sessions = await userCohortService.getUpcomingSessions(userId, limit);

      request.log.info('[userCohortController] getUpcomingSessions success');
      return reply.send(successResponse(sessions, 'Upcoming sessions retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] getUpcomingSessions error');
      return reply.status(500).send(errorResponse('Failed to retrieve upcoming sessions', 500, error.message));
    }
  }

  async getCertificateInfo(request, reply) {
    try {
      request.log.info('[userCohortController] getCertificateInfo start');
      const { id } = request.params;
      const userId = request.user.userId;
      const result = await userCohortService.getCertificateInfo(Number(id), userId);
      if (!result) return reply.status(404).send(errorResponse('Certificate not found', 404));
      return reply.send(successResponse(result, 'Certificate info retrieved'));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] getCertificateInfo error');
      return reply.status(500).send(errorResponse('Failed to get certificate info', 500));
    }
  }

  async downloadCertificate(request, reply) {
    try {
      request.log.info('[userCohortController] downloadCertificate start');

      const { id } = request.params;
      const userId = request.user.userId;
      const { absolutePath, cert } = await userCohortService.downloadCertificate(Number(id), userId);

      const filename = path.basename(absolutePath);

      return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .sendFile(filename, path.dirname(absolutePath));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] downloadCertificate error');

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to download certificate', 500, error.message));
    }
  }

  async verifyCertificate(request, reply) {
    try {
      request.log.info('[userCohortController] verifyCertificate start');

      const { code } = request.params;
      const cert = await userCohortService.verifyCertificate(code);

      request.log.info('[userCohortController] verifyCertificate success');
      return reply.send(successResponse(cert, 'Certificate verified'));
    } catch (error) {
      request.log.error({ err: error }, '[userCohortController] verifyCertificate error');

      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to verify certificate', 500, error.message));
    }
  }
}

export const userCohortController = new UserCohortController();
