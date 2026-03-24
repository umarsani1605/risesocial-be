import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

/**
 * SharedCohortRepository - queries used by multiple layers (webhook, certificate)
 */
export class SharedCohortRepository {
  get logger() {
    return getLogger();
  }

  async findEnrollmentByTransactionId(transactionId) {
    this.logger.info({ transactionId }, '[sharedCohortRepository] findEnrollmentByTransactionId called');

    return await prisma.cohortEnrollment.findFirst({
      where: { transaction_id: transactionId },
    });
  }

  async updateEnrollmentStatus(enrollmentId, status, enrolledAt = null) {
    this.logger.info({ enrollmentId, status }, '[sharedCohortRepository] updateEnrollmentStatus called');

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
    this.logger.info({ cohortId }, '[sharedCohortRepository] findCompletedEnrollmentsWithoutCertificate called');

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
    this.logger.info('[sharedCohortRepository] getNextCertificateSequence called');

    const latest = await prisma.cohortCertificate.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });

    return (latest?.id || 0) + 1;
  }

  async createCertificate(data) {
    this.logger.info({ enrollmentId: data.enrollment_id }, '[sharedCohortRepository] createCertificate called');

    return await prisma.cohortCertificate.create({ data });
  }
}

export const sharedCohortRepository = new SharedCohortRepository();
