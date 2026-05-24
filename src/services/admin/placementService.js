import { cohortPlacementRepository } from '../../repositories/cohorts/cohortPlacementRepository.js';
import { academyEnrollmentRepository } from '../../repositories/cohorts/academyEnrollmentRepository.js';
import prisma from '../../config/database.js';
import { captureEvent } from '../../config/posthog.js';

function makeError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export class AdminPlacementService {

  async listAcademyEnrollments({ placed, academy_id, user_id } = {}) {
    const where = {
      transaction: { is: { status: 'paid' } },
    };
    if (academy_id) where.academy_id = Number(academy_id);
    if (user_id) where.user_id = Number(user_id);
    if (placed === true) where.placement = { isNot: null };
    if (placed === false) where.placement = { is: null };

    return await prisma.academyEnrollment.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true, avatar: true, phone: true } },
        academy: { select: { id: true, title: true, slug: true } },
        transaction: { select: { id: true, status: true, paid_at: true, transaction_code: true } },
        placement: {
          include: {
            cohort: { select: { id: true, name: true, status: true } },
            certificate: { select: { id: true } },
          },
        },
      },
    });
  }

  async getEnrollmentDetail(enrollmentId) {

    const enrollment = await academyEnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw makeError('Enrollment not found', 404);
    return enrollment;
  }

  async assignToCohort(enrollmentId, cohortId, { notes, adminId } = {}) {

    const enrollment = await academyEnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw makeError('Enrollment not found', 404);
    if (enrollment.transaction?.status !== 'paid') {
      throw makeError('Only paid enrollments can be assigned to a cohort', 422);
    }
    if (enrollment.completed_at) {
      throw makeError('Completed enrollments cannot be moved to another cohort', 409);
    }

    const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) throw makeError('Cohort not found', 404);
    if (cohort.academy_id !== enrollment.academy_id) {
      throw makeError('Cohort belongs to a different academy', 422);
    }
    if (cohort.status === 'completed') {
      throw makeError('Cannot assign to a completed cohort', 422);
    }

    const existingByUserCohort = await cohortPlacementRepository.findByUserCohort(enrollment.user_id, cohortId);
    if (existingByUserCohort) throw makeError('User already placed in this cohort', 409);

    const existingPlacement = await cohortPlacementRepository.findByEnrollmentId(enrollmentId);

    let placement;
    if (existingPlacement) {
      const hasCert = await cohortPlacementRepository.hasCertificate(existingPlacement.id);
      if (hasCert) {
        throw makeError(
          'Cannot transfer student who already has a certificate. Revoke the certificate first.',
          409
        );
      }
      // Re-assign: atomically move to the new cohort
      placement = await cohortPlacementRepository.replacePlacement(existingPlacement.id, {
        cohortId,
        userId: enrollment.user_id,
        academyId: enrollment.academy_id,
        academyEnrollmentId: enrollmentId,
        notes: notes ?? null,
      });
    } else {
      placement = await cohortPlacementRepository.createPlacement({
        academyEnrollmentId: enrollmentId,
        cohortId,
        userId: enrollment.user_id,
        academyId: enrollment.academy_id,
        notes: notes ?? null,
      });
    }

    captureEvent(adminId, 'cohort.placement_assigned', {
      placement_id: placement.id,
      cohort_id: cohortId,
      enrollment_id: enrollmentId,
      admin_user_id: adminId,
    });

    return placement;
  }

  async dropPlacement(placementId, { reason, adminId } = {}) {
    try {
      const hasCert = await cohortPlacementRepository.hasCertificate(placementId);
      if (hasCert) {
        throw makeError(
          'Cannot unassign student who already has a certificate. Revoke the certificate first.',
          409
        );
      }
      const existing = await cohortPlacementRepository.findById(placementId);
      const deleted = await cohortPlacementRepository.deletePlacement(placementId);

      captureEvent(adminId, 'cohort.placement_dropped', {
        placement_id: placementId,
        cohort_id: existing?.cohort_id,
        admin_user_id: adminId,
      });

      return deleted;
    } catch (error) {
      if (error.code === 'P2025') throw makeError('Placement not found', 404);
      throw error;
    }
  }
}

export const adminPlacementService = new AdminPlacementService();
