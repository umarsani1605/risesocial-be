import { adminPlacementService } from '../../services/admin/placementService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminPlacementController {
  listEnrollments = async (request, reply) => {
    try {
      request.log.info('[AdminPlacementController] listEnrollments start');
      const { page, limit, status, placed, academy_id, user_id } = request.query;
      const result = await adminPlacementService.listAcademyEnrollments({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        status,
        placed,
        academy_id,
        user_id,
      });
      return reply.send(successResponse(result.data, 'Enrollments retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[AdminPlacementController] listEnrollments error');
      return reply.status(500).send(errorResponse('Failed to fetch enrollments', 500, error.message));
    }
  };

  getEnrollmentDetail = async (request, reply) => {
    try {
      request.log.info('[AdminPlacementController] getEnrollmentDetail start');
      const enrollment = await adminPlacementService.getEnrollmentDetail(Number(request.params.id));
      return reply.send(successResponse(enrollment, 'Enrollment retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[AdminPlacementController] getEnrollmentDetail error');
      if (error.statusCode === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to fetch enrollment', 500, error.message));
    }
  };

  assignToCohort = async (request, reply) => {
    try {
      request.log.info('[AdminPlacementController] assignToCohort start');
      const { cohort_id, notes } = request.body;
      const placement = await adminPlacementService.assignToCohort(
        Number(request.params.id),
        Number(cohort_id),
        { notes, adminId: request.user?.userId },
      );
      return reply.send(successResponse(placement, 'Placement created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[AdminPlacementController] assignToCohort error');
      const code = error.statusCode;
      if (code === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (code === 409) return reply.status(409).send(errorResponse(error.message, 409));
      if (code === 422) return reply.status(422).send(errorResponse(error.message, 422));
      return reply.status(500).send(errorResponse('Failed to assign placement', 500, error.message));
    }
  };

  cancelEnrollment = async (request, reply) => {
    try {
      request.log.info('[AdminPlacementController] cancelEnrollment start');
      const { reason } = request.body ?? {};
      const updated = await adminPlacementService.cancelEnrollment(
        Number(request.params.id),
        { reason, adminId: request.user?.userId },
      );
      return reply.send(successResponse(updated, 'Enrollment cancelled successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[AdminPlacementController] cancelEnrollment error');
      const code = error.statusCode;
      if (code === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to cancel enrollment', 500, error.message));
    }
  };

  transferPlacement = async (request, reply) => {
    try {
      request.log.info('[AdminPlacementController] transferPlacement start');
      const { cohort_id, notes } = request.body;
      const placement = await adminPlacementService.transferPlacement(
        Number(request.params.id),
        Number(cohort_id),
        { notes, adminId: request.user?.userId },
      );
      return reply.send(successResponse(placement, 'Placement transferred successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[AdminPlacementController] transferPlacement error');
      const code = error.statusCode;
      if (code === 404) return reply.status(404).send(errorResponse(error.message, 404));
      if (code === 409) return reply.status(409).send(errorResponse(error.message, 409));
      if (code === 422) return reply.status(422).send(errorResponse(error.message, 422));
      return reply.status(500).send(errorResponse('Failed to transfer placement', 500, error.message));
    }
  };

  dropPlacement = async (request, reply) => {
    try {
      request.log.info('[AdminPlacementController] dropPlacement start');
      const { reason } = request.body ?? {};
      const deleted = await adminPlacementService.dropPlacement(
        Number(request.params.id),
        { reason, adminId: request.user?.userId },
      );
      return reply.send(successResponse(deleted, 'Placement dropped successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[AdminPlacementController] dropPlacement error');
      const code = error.statusCode;
      if (code === 404) return reply.status(404).send(errorResponse(error.message, 404));
      return reply.status(500).send(errorResponse('Failed to drop placement', 500, error.message));
    }
  };
}

export const adminPlacementController = new AdminPlacementController();
