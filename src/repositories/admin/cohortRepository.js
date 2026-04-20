import prisma from '../../config/database.js';
import { BaseRepository } from '../shared/BaseRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AdminCohortRepository extends BaseRepository {
  constructor() {
    super(prisma.cohort);
  }

  get logger() {
    return getLogger();
  }

  async findWithPagination({ page = 1, limit = 10, id, academy_id, status } = {}) {
    this.logger.info({ page, limit, id, academy_id, status }, '[adminCohortRepository] findWithPagination called');

    const skip = (page - 1) * limit;
    const where = {};
    if (id) where.id = Number(id);
    if (academy_id) where.academy_id = Number(academy_id);
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          academy: { select: { id: true, title: true, slug: true } },
          _count: { select: { enrollments: true } },
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

  async findByIdWithDetails(id) {
    this.logger.info({ id }, '[adminCohortRepository] findByIdWithDetails called');

    return await this.model.findUnique({
      where: { id },
      include: {
        academy: { select: { id: true, title: true, slug: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            attachments: { orderBy: { order: 'asc' } },
          },
        },
        mentors: true,
        _count: { select: { enrollments: true } },
      },
    });
  }

  // --- Module order management ---

  async createModule(cohortId, academyId, data) {
    this.logger.info({ cohortId, data }, '[adminCohortRepository] createModule called');

    const { order, ...rest } = data || {};

    const module = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;

      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        await tx.cohortModule.updateMany({
          where: { cohort_id: cohortId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.cohortModule.findFirst({
          where: { cohort_id: cohortId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.cohortModule.create({
        data: { cohort_id: cohortId, academy_id: academyId, ...rest, order: finalOrder },
      });
    });

    this.logger.info({ moduleId: module.id }, '[adminCohortRepository] createModule success');
    return module;
  }

  async updateModule(cohortId, moduleId, data) {
    this.logger.info({ cohortId, moduleId, data }, '[adminCohortRepository] updateModule called');

    const { order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.cohortModule.findFirst({
        where: { id: moduleId, cohort_id: cohortId },
        select: { order: true },
      });

      if (!existing) throw new Error('Module not found');

      if (typeof order === 'number' && order >= 1) {
        if (order < existing.order) {
          await tx.cohortModule.updateMany({
            where: { cohort_id: cohortId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.cohortModule.updateMany({
            where: { cohort_id: cohortId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      return tx.cohortModule.update({
        where: { id: moduleId },
        data: { ...rest, ...(typeof order === 'number' ? { order } : {}) },
      });
    });

    this.logger.info({ moduleId: result.id }, '[adminCohortRepository] updateModule success');
    return result;
  }

  async deleteModule(cohortId, moduleId) {
    this.logger.info({ cohortId, moduleId }, '[adminCohortRepository] deleteModule called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.cohortModule.findFirst({
        where: { id: moduleId, cohort_id: cohortId },
        select: { order: true },
      });

      if (!existing) throw new Error('Module not found');

      await tx.cohortModule.delete({ where: { id: moduleId } });

      await tx.cohortModule.updateMany({
        where: { cohort_id: cohortId, order: { gt: existing.order } },
        data: { order: { decrement: 1 } },
      });
    });

    this.logger.info({ moduleId }, '[adminCohortRepository] deleteModule success');
    return { message: 'Module deleted successfully' };
  }

  // --- Attachment order management ---

  async createAttachment(moduleId, cohortId, academyId, data) {
    this.logger.info({ moduleId, data }, '[adminCohortRepository] createAttachment called');

    const { order, ...rest } = data || {};

    const attachment = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;

      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        await tx.cohortModuleAttachment.updateMany({
          where: { cohort_module_id: moduleId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.cohortModuleAttachment.findFirst({
          where: { cohort_module_id: moduleId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.cohortModuleAttachment.create({
        data: { cohort_module_id: moduleId, cohort_id: cohortId, academy_id: academyId, ...rest, order: finalOrder },
      });
    });

    this.logger.info({ attachmentId: attachment.id }, '[adminCohortRepository] createAttachment success');
    return attachment;
  }

  async updateAttachment(moduleId, attachmentId, data) {
    this.logger.info({ moduleId, attachmentId, data }, '[adminCohortRepository] updateAttachment called');

    const { order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.cohortModuleAttachment.findFirst({
        where: { id: attachmentId, cohort_module_id: moduleId },
        select: { order: true },
      });

      if (!existing) throw new Error('Attachment not found');

      if (typeof order === 'number' && order >= 1) {
        if (order < existing.order) {
          await tx.cohortModuleAttachment.updateMany({
            where: { cohort_module_id: moduleId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.cohortModuleAttachment.updateMany({
            where: { cohort_module_id: moduleId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      return tx.cohortModuleAttachment.update({
        where: { id: attachmentId },
        data: { ...rest, ...(typeof order === 'number' ? { order } : {}) },
      });
    });

    this.logger.info({ attachmentId: result.id }, '[adminCohortRepository] updateAttachment success');
    return result;
  }

  async deleteAttachment(moduleId, attachmentId) {
    this.logger.info({ moduleId, attachmentId }, '[adminCohortRepository] deleteAttachment called');

    let filePath = null;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.cohortModuleAttachment.findFirst({
        where: { id: attachmentId, cohort_module_id: moduleId },
        select: { order: true, file_path: true, type: true },
      });

      if (!existing) throw new Error('Attachment not found');

      if (existing.type === 'file' && existing.file_path) {
        filePath = existing.file_path;
      }

      await tx.cohortModuleAttachment.delete({ where: { id: attachmentId } });

      await tx.cohortModuleAttachment.updateMany({
        where: { cohort_module_id: moduleId, order: { gt: existing.order } },
        data: { order: { decrement: 1 } },
      });
    });

    this.logger.info({ attachmentId }, '[adminCohortRepository] deleteAttachment success');
    return { message: 'Attachment deleted successfully', filePath };
  }

  // --- Enrollment management ---

  async findEnrollments(cohortId, { page = 1, limit = 10, status } = {}) {
    this.logger.info({ cohortId, page, limit, status }, '[adminCohortRepository] findEnrollments called');

    const skip = (page - 1) * limit;
    const where = { cohort_id: cohortId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.cohortEnrollment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, first_name: true, last_name: true, email: true, avatar: true } },
          certificate: { select: { id: true, certificate_code: true, file_path: true } },
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

  async createEnrollment(cohortId, academyId, userId, notes = null) {
    this.logger.info({ cohortId, userId }, '[adminCohortRepository] createEnrollment called');

    return await prisma.cohortEnrollment.create({
      data: {
        cohort_id: cohortId,
        academy_id: academyId,
        user_id: userId,
        status: 'active',
        enrolled_at: new Date(),
        notes,
      },
    });
  }

  async updateEnrollment(cohortId, enrollmentId, data) {
    this.logger.info({ cohortId, enrollmentId, data }, '[adminCohortRepository] updateEnrollment called');

    const existing = await prisma.cohortEnrollment.findFirst({
      where: { id: enrollmentId, cohort_id: cohortId },
    });

    if (!existing) throw new Error('Enrollment not found');

    return await prisma.cohortEnrollment.update({
      where: { id: enrollmentId },
      data,
    });
  }

  // --- Mentor management ---

  async createMentor(cohortId, academyId, data) {
    this.logger.info({ cohortId, data }, '[adminCohortRepository] createMentor called');

    return await prisma.cohortMentor.create({
      data: { cohort_id: cohortId, academy_id: academyId, ...data },
    });
  }

  async updateMentor(cohortId, mentorId, data) {
    this.logger.info({ cohortId, mentorId, data }, '[adminCohortRepository] updateMentor called');

    const existing = await prisma.cohortMentor.findFirst({
      where: { id: mentorId, cohort_id: cohortId },
    });

    if (!existing) throw new Error('Mentor not found');

    return await prisma.cohortMentor.update({
      where: { id: mentorId },
      data,
    });
  }

  async deleteMentor(cohortId, mentorId) {
    this.logger.info({ cohortId, mentorId }, '[adminCohortRepository] deleteMentor called');

    const existing = await prisma.cohortMentor.findFirst({
      where: { id: mentorId, cohort_id: cohortId },
    });

    if (!existing) throw new Error('Mentor not found');

    await prisma.cohortMentor.delete({ where: { id: mentorId } });
    this.logger.info({ mentorId }, '[adminCohortRepository] deleteMentor success');
    return { message: 'Mentor removed successfully' };
  }
}

export const adminCohortRepository = new AdminCohortRepository();
