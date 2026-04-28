import { cohortPlacementRepository } from '../../repositories/cohorts/cohortPlacementRepository.js';
import { academyEnrollmentRepository } from '../../repositories/cohorts/academyEnrollmentRepository.js';
import { getLogger } from '../../utils/loggerContext.js';
import prisma from '../../config/database.js';

function makeError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

const VALID_COHORT_STATUSES = ['not_started', 'in_progress'];

export class AdminPlacementService {
  get logger() {
    return getLogger();
  }

  async listAcademyEnrollments({ page = 1, limit = 20, status, placed, academy_id, user_id } = {}) {
    this.logger.info('[AdminPlacementService] listAcademyEnrollments start');

    const where = {};
    if (status) where.status = status;
    if (academy_id) where.academy_id = Number(academy_id);
    if (user_id) where.user_id = Number(user_id);
    if (placed === true) where.placement = { isNot: null };
    if (placed === false) where.placement = { is: null };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.academyEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, first_name: true, last_name: true, email: true, avatar: true } },
          academy: { select: { id: true, title: true, slug: true } },
          transaction: { select: { id: true, status: true, paid_at: true, transaction_code: true } },
          placement: {
            include: { cohort: { select: { id: true, name: true, status: true } } },
          },
        },
      }),
      prisma.academyEnrollment.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getEnrollmentDetail(enrollmentId) {
    this.logger.info({ enrollmentId }, '[AdminPlacementService] getEnrollmentDetail start');

    const enrollment = await academyEnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw makeError('Enrollment not found', 404);
    return enrollment;
  }

  async assignToCohort(enrollmentId, cohortId, { notes, adminId } = {}) {
    this.logger.info({ enrollmentId, cohortId, adminId }, '[AdminPlacementService] assignToCohort start');

    const enrollment = await academyEnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw makeError('Enrollment not found', 404);
    if (enrollment.status !== 'active') {
      throw makeError(`Cannot assign placement: enrollment status is '${enrollment.status}' (must be active)`, 422);
    }

    const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) throw makeError('Cohort not found', 404);
    if (cohort.academy_id !== enrollment.academy_id) {
      throw makeError('Cohort belongs to a different academy', 422);
    }
    if (!VALID_COHORT_STATUSES.includes(cohort.status)) {
      throw makeError(`Cannot assign to cohort with status '${cohort.status}'`, 422);
    }

    const existingByUserCohort = await cohortPlacementRepository.findByUserCohort(enrollment.user_id, cohortId);
    if (existingByUserCohort) throw makeError('User already placed in this cohort', 409);

    const existingPlacement = await cohortPlacementRepository.findByEnrollmentId(enrollmentId);

    let placement;
    if (existingPlacement) {
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

    this.logger.info({ placementId: placement.id, adminId }, '[AdminPlacementService] assignToCohort success');
    return placement;
  }

  async cancelEnrollment(enrollmentId, { reason, adminId } = {}) {
    this.logger.info({ enrollmentId, adminId }, '[AdminPlacementService] cancelEnrollment start');

    const enrollment = await academyEnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw makeError('Enrollment not found', 404);

    if (enrollment.placement) {
      await cohortPlacementRepository.deletePlacement(enrollment.placement.id);
      this.logger.info({ placementId: enrollment.placement.id }, '[AdminPlacementService] placement deleted before cancel');
    }

    const updated = await academyEnrollmentRepository.updateStatus(enrollmentId, 'cancelled', {
      notes: reason ?? null,
    });

    this.logger.info({ enrollmentId, adminId }, '[AdminPlacementService] cancelEnrollment success');
    return updated;
  }

  async dropPlacement(placementId, { reason, adminId } = {}) {
    this.logger.info({ placementId, reason, adminId }, '[AdminPlacementService] dropPlacement start');

    try {
      const deleted = await cohortPlacementRepository.deletePlacement(placementId);
      this.logger.info({ placementId, reason, adminId }, '[AdminPlacementService] dropPlacement success');
      return deleted;
    } catch (error) {
      if (error.code === 'P2025') throw makeError('Placement not found', 404);
      throw error;
    }
  }
}

export const adminPlacementService = new AdminPlacementService();
