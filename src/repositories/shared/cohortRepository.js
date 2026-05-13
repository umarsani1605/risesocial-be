import prisma from '../../config/database.js';

/**
 * SharedCohortRepository - queries used by multiple layers (webhook, certificate)
 */
export class SharedCohortRepository {

  async findEnrollmentByTransactionId(transactionId) {

    return await prisma.cohortEnrollment.findFirst({
      where: { transaction_id: transactionId },
    });
  }

  async updateEnrollmentStatus(enrollmentId, status, enrolledAt = null) {

    return await prisma.cohortEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        ...(enrolledAt ? { enrolled_at: enrolledAt } : {}),
        updated_at: new Date(),
      },
    });
  }

  async findCompletedEnrollmentsWithoutCertificate(cohortId) {

    return await prisma.cohortEnrollment.findMany({
      where: {
        cohort_id: cohortId,
        status: 'completed',
        certificate: null,
      },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true } },
      },
    });
  }

  async getNextCertificateSequence() {

    const latest = await prisma.cohortCertificate.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });

    return (latest?.id || 0) + 1;
  }

  async createCertificate(data) {

    return await prisma.cohortCertificate.create({ data });
  }
}

export const sharedCohortRepository = new SharedCohortRepository();
