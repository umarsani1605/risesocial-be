import prisma from '../../config/database.js';

export class CohortPlacementRepository {

  async createPlacement({ academyEnrollmentId, cohortId, userId, academyId, notes }) {
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
      return placement;
    } catch (error) {
      throw error;
    }
  }

  async findByEnrollmentId(enrollmentId) {
    try {
      const placement = await prisma.cohortPlacement.findUnique({
        where: { academy_enrollment_id: enrollmentId },
      });
      return placement;
    } catch (error) {
      throw error;
    }
  }

  async findByUserCohort(userId, cohortId) {
    try {
      const placement = await prisma.cohortPlacement.findUnique({
        where: { cohort_id_user_id: { cohort_id: cohortId, user_id: userId } },
      });
      return placement;
    } catch (error) {
      throw error;
    }
  }

  async findByCohort(cohortId) {
    try {
      const placements = await prisma.cohortPlacement.findMany({
        where: { cohort_id: cohortId },
        orderBy: { created_at: 'asc' },
        include: {
          user: { select: { id: true, first_name: true, last_name: true, email: true, avatar: true } },
          academy_enrollment: { select: { id: true, completed_at: true } },
        },
      });
      return placements;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const placement = await prisma.cohortPlacement.findUnique({ where: { id } });
      return placement;
    } catch (error) {
      throw error;
    }
  }

  async deletePlacement(id) {
    try {
      const deleted = await prisma.cohortPlacement.delete({ where: { id } });
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  async hasCertificate(placementId) {
    const cert = await prisma.cohortCertificate.findFirst({
      where: { placement_id: placementId },
      select: { id: true },
    });
    return !!cert;
  }

  async replacePlacement(currentId, { cohortId, userId, academyId, academyEnrollmentId, notes }) {
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
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export const cohortPlacementRepository = new CohortPlacementRepository();
