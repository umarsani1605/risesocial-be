import prisma from '../../config/database.js';
import { BaseRepository } from '../shared/BaseRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

export class UserCohortRepository extends BaseRepository {
  constructor() {
    super(prisma.cohort);
  }

  get logger() {
    return getLogger();
  }

  async findPublicWithPagination({ page = 1, limit = 10, academy_id, status } = {}) {
    this.logger.info({ page, limit, academy_id, status }, '[userCohortRepository] findPublicWithPagination called');

    const skip = (page - 1) * limit;
    const where = {};
    if (academy_id) where.academy_id = Number(academy_id);
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          _count: { select: { enrollments: true } },
          mentors: { select: { id: true, name: true, avatar: true, job_title: true } },
        },
      }),
      this.model.count({ where }),
    ]);

    return {
      data: data.map((c) => ({ ...c, enrollment_count: c._count.enrollments, _count: undefined })),
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findByIdPublic(id) {
    this.logger.info({ id }, '[userCohortRepository] findByIdPublic called');

    const cohort = await this.model.findUnique({
      where: { id },
      include: {
        academy: { select: { id: true, title: true, slug: true, image_url: true, description: true, duration: true, certificate: true, portfolio: true, format: true } },
        mentors: { select: { id: true, name: true, avatar: true, job_title: true } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!cohort) return null;
    const enrollment_count = cohort._count.enrollments;
    return { ...cohort, enrollment_count, current_students: enrollment_count, _count: undefined };
  }

  async findStudentsByCohortId(cohortId) {
    this.logger.info({ cohortId }, '[userCohortRepository] findStudentsByCohortId called');

    const enrollments = await prisma.cohortEnrollment.findMany({
      where: { cohort_id: cohortId, status: { in: ['active', 'completed'] } },
      orderBy: { created_at: 'asc' },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, avatar: true } },
      },
    });

    return enrollments.map((e) => ({ id: e.id, status: e.status, user: e.user }));
  }

  async findEnrollmentByUserAndCohort(userId, cohortId) {
    this.logger.info({ userId, cohortId }, '[userCohortRepository] findEnrollmentByUserAndCohort called');

    return await prisma.cohortEnrollment.findFirst({
      where: { user_id: userId, cohort_id: cohortId },
    });
  }

  async findActiveEnrollment(userId, cohortId) {
    return await prisma.cohortEnrollment.findFirst({
      where: { user_id: userId, cohort_id: cohortId, status: { in: ['active', 'completed'] } },
    });
  }

  async createEnrollmentWithPayment(cohortId, academyId, userId, paymentData) {
    this.logger.info({ cohortId, userId }, '[userCohortRepository] createEnrollmentWithPayment called');

    return await prisma.$transaction(async (tx) => {
      // Create enrollment first (status=pending)
      const enrollment = await tx.cohortEnrollment.create({
        data: {
          cohort_id: cohortId,
          academy_id: academyId,
          user_id: userId,
          status: 'pending',
        },
      });

      // Layer 1: Create generic transaction
      const transaction = await tx.transaction.create({
        data: {
          transaction_code: paymentData.transactionCode,
          amount: paymentData.amount,
          currency: 'IDR',
          status: 'pending',
          provider: 'midtrans',
          customer_name: paymentData.customerName,
          customer_email: paymentData.customerEmail,
          customer_phone: paymentData.customerPhone || null,
          user_id: userId,
          product_type: 'academy_enrollment',
          product_type_id: enrollment.id,
          expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Layer 1b: Create transaction item
      await tx.transactionItem.create({
        data: {
          transaction_id: transaction.id,
          product_code: paymentData.itemProductCode,
          product_name: paymentData.itemProductName,
          product_category: 'academy_enrollment',
          quantity: 1,
          unit_price: paymentData.amount,
          total_price: paymentData.amount,
        },
      });

      // Layer 2: Create Midtrans transaction
      await tx.midtransTransaction.create({
        data: {
          transaction_id: transaction.id,
          snap_token: paymentData.snapToken,
          redirect_url: paymentData.redirectUrl,
          midtrans_order_id: paymentData.transactionCode,
          create_response: paymentData.snapResponse,
        },
      });

      // Update enrollment with transaction_id
      await tx.cohortEnrollment.update({
        where: { id: enrollment.id },
        data: { transaction_id: transaction.id },
      });

      return { enrollment, transaction, snapToken: paymentData.snapToken, redirectUrl: paymentData.redirectUrl };
    });
  }

  async findUserEnrollments(userId, { page = 1, limit = 10 } = {}) {
    this.logger.info({ userId, page, limit }, '[userCohortRepository] findUserEnrollments called');

    const skip = (page - 1) * limit;

    // Include pending enrollments only if their linked transaction is not failed/expired/cancelled.
    // This filters out abandoned enrollments while showing those awaiting payment confirmation.
    const where = {
      user_id: userId,
      OR: [
        { status: { in: ['active', 'completed'] } },
        {
          status: 'pending',
          transaction: { status: { notIn: ['failed', 'expired', 'cancelled'] } },
        },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.cohortEnrollment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          cohort: {
            select: {
              id: true,
              name: true,
              status: true,
              start_date: true,
              end_date: true,
              _count: { select: { modules: { where: { is_published: true } } } },
              academy: { select: { id: true, title: true, slug: true, image_url: true, duration: true, format: true, certificate: true, description: true } },
            },
          },
          transaction: {
            select: {
              id: true,
              transaction_code: true,
              status: true,
              amount: true,
              expired_at: true,
              paid_at: true,
              midtrans_data: {
                select: {
                  snap_token: true,
                  redirect_url: true,
                },
              },
            },
          },
        },
      }),
      prisma.cohortEnrollment.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async countCompletedModules(cohortId) {
    this.logger.info({ cohortId }, '[userCohortRepository] countCompletedModules called');

    // Count published modules whose session has already started — proxy for completed sessions
    return prisma.cohortModule.count({
      where: {
        cohort_id: cohortId,
        is_published: true,
        session_start_time: { lt: new Date() },
      },
    });
  }

  async findPublishedModules(cohortId) {
    this.logger.info({ cohortId }, '[userCohortRepository] findPublishedModules called');

    return await prisma.cohortModule.findMany({
      where: { cohort_id: cohortId, is_published: true },
      orderBy: { order: 'asc' },
      include: {
        attachments: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findPublishedModuleById(cohortId, moduleId) {
    this.logger.info({ cohortId, moduleId }, '[userCohortRepository] findPublishedModuleById called');

    return await prisma.cohortModule.findFirst({
      where: { id: moduleId, cohort_id: cohortId, is_published: true },
      include: {
        attachments: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findUpcomingModulesForUser(userId, limit = 7) {
    this.logger.info({ userId, limit }, '[userCohortRepository] findUpcomingModulesForUser called');

    const now = new Date();

    const activeEnrollments = await prisma.cohortEnrollment.findMany({
      where: { user_id: userId, status: 'active' },
      select: { cohort_id: true },
    });

    if (activeEnrollments.length === 0) return [];

    const cohortIds = activeEnrollments.map((e) => e.cohort_id);

    return await prisma.cohortModule.findMany({
      where: {
        cohort_id: { in: cohortIds },
        is_published: true,
        OR: [{ session_start_time: { gt: now } }, { assignment_deadline: { gt: now } }],
      },
      select: {
        id: true,
        cohort_id: true,
        title: true,
        session_start_time: true,
        session_end_time: true,
        assignment_deadline: true,
        meeting_link: true,
        assignment_link: true,
      },
      orderBy: { session_start_time: 'asc' },
    });
  }

  async findCertificateByCohortAndUser(cohortId, userId) {
    return await prisma.cohortCertificate.findFirst({
      where: { cohort_id: cohortId, user_id: userId },
    });
  }

  async findCertificateByCode(code) {
    return await prisma.cohortCertificate.findUnique({
      where: { certificate_code: code },
    });
  }
}

export const userCohortRepository = new UserCohortRepository();
