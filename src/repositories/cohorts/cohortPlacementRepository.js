import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

export class CohortPlacementRepository {
  get logger() {
    return getLogger();
  }

  async createPlacement({ academyEnrollmentId, cohortId, userId, academyId, notes }) {
    this.logger.info(
      { academyEnrollmentId, cohortId, userId, academyId },
      '[CohortPlacementRepository] createPlacement start',
    );
    try {
      const placement = await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: academyEnrollmentId,
          cohort_id: cohortId,
          user_id: userId,
          academy_id: academyId,
          notes: notes ?? null,
        },
      });
      this.logger.info({ id: placement.id }, '[CohortPlacementRepository] createPlacement success');
      return placement;
    } catch (error) {
      this.logger.error({ err: error }, '[CohortPlacementRepository] createPlacement error');
      throw error;
    }
  }

  async findByEnrollmentId(enrollmentId) {
    this.logger.info({ enrollmentId }, '[CohortPlacementRepository] findByEnrollmentId start');
    try {
      const placement = await prisma.cohortPlacement.findUnique({
        where: { academy_enrollment_id: enrollmentId },
      });
      this.logger.info({ found: !!placement }, '[CohortPlacementRepository] findByEnrollmentId success');
      return placement;
    } catch (error) {
      this.logger.error({ err: error }, '[CohortPlacementRepository] findByEnrollmentId error');
      throw error;
    }
  }

  async findByUserCohort(userId, cohortId) {
    this.logger.info({ userId, cohortId }, '[CohortPlacementRepository] findByUserCohort start');
    try {
      const placement = await prisma.cohortPlacement.findUnique({
        where: { cohort_id_user_id: { cohort_id: cohortId, user_id: userId } },
      });
      this.logger.info({ found: !!placement }, '[CohortPlacementRepository] findByUserCohort success');
      return placement;
    } catch (error) {
      this.logger.error({ err: error }, '[CohortPlacementRepository] findByUserCohort error');
      throw error;
    }
  }

  async findByCohort(cohortId) {
    this.logger.info({ cohortId }, '[CohortPlacementRepository] findByCohort start');
    try {
      const placements = await prisma.cohortPlacement.findMany({
        where: { cohort_id: cohortId },
        orderBy: { created_at: 'asc' },
        include: {
          user: { select: { id: true, first_name: true, last_name: true, email: true, avatar: true } },
          academy_enrollment: { select: { id: true, completed_at: true } },
        },
      });
      this.logger.info({ count: placements.length }, '[CohortPlacementRepository] findByCohort success');
      return placements;
    } catch (error) {
      this.logger.error({ err: error }, '[CohortPlacementRepository] findByCohort error');
      throw error;
    }
  }

  async findById(id) {
    this.logger.info({ id }, '[CohortPlacementRepository] findById start');
    try {
      const placement = await prisma.cohortPlacement.findUnique({ where: { id } });
      this.logger.info({ found: !!placement }, '[CohortPlacementRepository] findById success');
      return placement;
    } catch (error) {
      this.logger.error({ err: error }, '[CohortPlacementRepository] findById error');
      throw error;
    }
  }

  async deletePlacement(id) {
    this.logger.info({ id }, '[CohortPlacementRepository] deletePlacement start');
    try {
      const deleted = await prisma.cohortPlacement.delete({ where: { id } });
      this.logger.info({ id: deleted.id }, '[CohortPlacementRepository] deletePlacement success');
      return deleted;
    } catch (error) {
      this.logger.error({ err: error }, '[CohortPlacementRepository] deletePlacement error');
      throw error;
    }
  }

  async transferPlacement(placementId, newCohortId) {
    this.logger.info({ placementId, newCohortId }, '[CohortPlacementRepository] transferPlacement start');
    const current = await this.findById(placementId);
    if (!current) {
      const err = new Error('Placement not found');
      err.code = 'P2025';
      throw err;
    }
    return this.replacePlacement(placementId, {
      cohortId: newCohortId,
      userId: current.user_id,
      academyId: current.academy_id,
      academyEnrollmentId: current.academy_enrollment_id,
      notes: current.notes,
    });
  }

  async replacePlacement(currentId, { cohortId, userId, academyId, academyEnrollmentId, notes }) {
    this.logger.info({ currentId, cohortId }, '[CohortPlacementRepository] replacePlacement start');
    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.cohortPlacement.delete({ where: { id: currentId } });
        return tx.cohortPlacement.create({
          data: {
            academy_enrollment_id: academyEnrollmentId,
            cohort_id: cohortId,
            user_id: userId,
            academy_id: academyId,
            notes: notes ?? null,
          },
        });
      });
      this.logger.info({ id: result.id }, '[CohortPlacementRepository] replacePlacement success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[CohortPlacementRepository] replacePlacement error');
      throw error;
    }
  }
}

export const cohortPlacementRepository = new CohortPlacementRepository();
