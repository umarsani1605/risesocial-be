import prisma from '../../config/database.js';
import { BaseRepository } from '../shared/BaseRepository.js';

export class AdminCohortRepository extends BaseRepository {
  constructor() {
    super(prisma.cohort);
  }


  async findAll({ id, academy_id, status } = {}) {
    const where = {};
    if (id) where.id = Number(id);
    if (academy_id) where.academy_id = Number(academy_id);
    if (status) where.status = Array.isArray(status) ? { in: status } : status;

    const data = await this.model.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        academy: { select: { id: true, title: true, slug: true } },
        _count: { select: { placements: true } },
      },
    });

    return data.map((c) => ({ ...c, enrollment_count: c._count.placements, _count: undefined }));
  }

  async findByIdWithDetails(id) {

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
        _count: { select: { placements: true } },
      },
    });
  }

  // --- Module order management ---

  async createModule(cohortId, academyId, data) {

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

    return module;
  }

  async updateModule(cohortId, moduleId, data) {

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

    return result;
  }

  async deleteModule(cohortId, moduleId) {

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

    return { message: 'Module deleted successfully' };
  }

  // --- Attachment order management ---

  async createAttachment(moduleId, cohortId, academyId, data) {

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

    return attachment;
  }

  async updateAttachment(moduleId, attachmentId, data) {

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

    return result;
  }

  async deleteAttachment(moduleId, attachmentId) {

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

    return { message: 'Attachment deleted successfully', filePath };
  }

  // --- Enrollment management ---

  async findEnrollments(cohortId, { status } = {}) {

    const where = { cohort_id: cohortId };
    if (status) where.status = status;

    const data = await prisma.cohortPlacement.findMany({
      where,
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true, phone: true, avatar: true } },
        certificate: { select: { id: true, certificate_code: true, file_path: true } },
        academy_enrollment: { select: { id: true, academy_id: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return { data };
  }

  async createEnrollment(cohortId, academyId, userId, notes = null) {

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

    return await prisma.cohortMentor.create({
      data: { cohort_id: cohortId, academy_id: academyId, ...data },
    });
  }

  async updateMentor(cohortId, mentorId, data) {

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

    const existing = await prisma.cohortMentor.findFirst({
      where: { id: mentorId, cohort_id: cohortId },
    });

    if (!existing) throw new Error('Mentor not found');

    await prisma.cohortMentor.delete({ where: { id: mentorId } });
    return { message: 'Mentor removed successfully' };
  }

  // --- Bulk copy from academy (used on cohort create) ---

  async bulkCreateModulesFromAcademyTopics(tx, cohortId, academyId) {
    const topics = await tx.academyTopic.findMany({
      where: { academy_id: academyId },
      include: { theme: { select: { order: true } } },
      orderBy: [{ theme: { order: 'asc' } }, { order: 'asc' }],
    });

    if (topics.length === 0) return 0;

    const data = topics.map((topic, index) => ({
      cohort_id: cohortId,
      academy_id: academyId,
      title: topic.title,
      description: topic.description,
      order: index + 1,
      is_published: false,
    }));

    const result = await tx.cohortModule.createMany({ data });
    return result.count;
  }

  async bulkCreateMentorsFromAcademyInstructors(tx, cohortId, academyId) {
    const instructors = await tx.academyInstructor.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });

    if (instructors.length === 0) return 0;

    const data = instructors.map((inst) => ({
      cohort_id: cohortId,
      academy_id: academyId,
      name: inst.name,
      avatar: inst.avatar_url,
      job_title: inst.job_title,
    }));

    const result = await tx.cohortMentor.createMany({ data });
    return result.count;
  }
}

export const adminCohortRepository = new AdminCohortRepository();
