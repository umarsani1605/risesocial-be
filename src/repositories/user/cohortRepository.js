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
          _count: { select: { placements: true } },
          mentors: { select: { id: true, name: true, avatar: true, job_title: true } },
        },
      }),
      this.model.count({ where }),
    ]);

    return {
      data: data.map((c) => ({ ...c, enrollment_count: c._count.placements, _count: undefined })),
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
        _count: { select: { placements: true } },
      },
    });

    if (!cohort) return null;
    const enrollment_count = cohort._count.placements;
    return { ...cohort, enrollment_count, current_students: enrollment_count, _count: undefined };
  }

  async findPlacementByUserCohort(userId, cohortId) {
    this.logger.info({ userId, cohortId }, '[userCohortRepository] findPlacementByUserCohort called');

    return await prisma.cohortPlacement.findUnique({
      where: { cohort_id_user_id: { cohort_id: cohortId, user_id: userId } },
    });
  }

  async findStudentsByCohort(cohortId) {
    this.logger.info({ cohortId }, '[userCohortRepository] findStudentsByCohort called');

    const placements = await prisma.cohortPlacement.findMany({
      where: { cohort_id: cohortId },
      orderBy: { created_at: 'asc' },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, avatar: true } },
      },
    });

    return placements.map((p) => ({ id: p.id, user: p.user }));
  }

  async findUserEnrollments(userId, { page = 1, limit = 10 } = {}) {
    this.logger.info({ userId, page, limit }, '[userCohortRepository] findUserEnrollments called');

    const skip = (page - 1) * limit;
    const where = {
      user_id: userId,
      status: { in: ['active', 'completed'] },
    };

    const [data, total] = await Promise.all([
      prisma.academyEnrollment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          transaction: {
            select: {
              id: true,
              transaction_code: true,
              status: true,
              amount: true,
              expired_at: true,
              paid_at: true,
              midtrans_data: { select: { snap_token: true, redirect_url: true } },
            },
          },
          placement: {
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
            },
          },
        },
      }),
      prisma.academyEnrollment.count({ where }),
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

    const placements = await prisma.cohortPlacement.findMany({
      where: { user_id: userId },
      select: { cohort_id: true },
    });

    if (placements.length === 0) return [];

    const cohortIds = placements.map((p) => p.cohort_id);

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
