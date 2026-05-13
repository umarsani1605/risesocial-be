import prisma from '../../config/database.js';
import { BaseRepository } from '../shared/BaseRepository.js';

export class AdminAcademyRepository extends BaseRepository {
  constructor() {
    super(prisma.academy);
  }


  async findPricingsByAcademyId(academyId) {
    return await prisma.academyPricing.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async findFeaturesByAcademyId(academyId) {
    return await prisma.academyFeature.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async findInstructorsByAcademyId(academyId) {
    return await prisma.academyInstructor.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async findTopicsByAcademyId(academyId) {
    return await prisma.academyTopic.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async findTestimonialsByAcademyId(academyId) {
    return await prisma.academyTestimonial.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async findFaqsByAcademyId(academyId) {
    return await prisma.academyFaq.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async findThemesByAcademyId(academyId) {
    return await prisma.academyTheme.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
      include: {
        topics: { orderBy: { order: 'asc' } },
      },
    });
  }

  async createTheme(academyId, data) {

    const { order, ...rest } = data || {};

    const theme = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyTheme.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.academyTheme.findFirst({
          where: { academy_id: academyId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.academyTheme.create({
        data: { academy_id: academyId, ...rest, order: finalOrder },
        include: { topics: { orderBy: { order: 'asc' } } },
      });
    });

    return theme;
  }

  async updateTheme(academyId, themeId, data) {
    const { order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academyTheme.findFirst({
        where: { id: themeId, academy_id: academyId },
        select: { order: true },
      });

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          await tx.academyTheme.updateMany({
            where: { academy_id: academyId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.academyTheme.updateMany({
            where: { academy_id: academyId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.academyTheme.update({
        where: { id: themeId, academy_id: academyId },
        data: { ...rest, ...(order ? { order } : {}) },
        include: { topics: { orderBy: { order: 'asc' } } },
      });

      return updated;
    });

    return result;
  }

  async deleteTheme(academyId, themeId) {

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academyTheme.findFirst({
        where: { id: themeId, academy_id: academyId },
        select: { order: true },
      });

      // topics cascade-deleted via onDelete: Cascade in Prisma schema
      await tx.academyTheme.delete({
        where: { id: themeId, academy_id: academyId },
      });

      if (existing?.order) {
        const shiftResult = await tx.academyTheme.updateMany({
          where: { academy_id: academyId, order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });

    return { message: 'Theme deleted successfully' };
  }

  async createPricing(academyId, data) {

    const { order, ...rest } = data || {};

    const pricing = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyPricing.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.academyPricing.findFirst({
          where: { academy_id: academyId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.academyPricing.create({
        data: { academy_id: academyId, ...rest, order: finalOrder },
      });
    });

    return pricing;
  }

  async updatePricing(academyId, pricingId, data) {
    const { order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academyPricing.findFirst({
        where: { id: pricingId, academy_id: academyId },
        select: { order: true },
      });

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          await tx.academyPricing.updateMany({
            where: { academy_id: academyId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.academyPricing.updateMany({
            where: { academy_id: academyId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.academyPricing.update({
        where: { id: pricingId, academy_id: academyId },
        data: { ...rest, ...(order ? { order } : {}) },
      });

      return updated;
    });

    return result;
  }

  async deletePricing(academyId, pricingId) {

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academyPricing.findFirst({
        where: { id: pricingId, academy_id: academyId },
        select: { order: true },
      });

      await tx.academyPricing.delete({
        where: { id: pricingId, academy_id: academyId },
      });

      if (existing?.order) {
        const shiftResult = await tx.academyPricing.updateMany({
          where: { academy_id: academyId, order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });

    return { message: 'Pricing deleted successfully' };
  }

  async createFeature(academyId, data) {

    const { feature_order, order, ...rest } = data || {};
    const rawOrder = feature_order ?? order;

    const feature = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(rawOrder);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyFeature.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.academyFeature.findFirst({
          where: { academy_id: academyId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.academyFeature.create({
        data: { academy_id: academyId, ...rest, order: finalOrder },
      });
    });

    return feature;
  }

  async updateFeature(academyId, featureId, data) {
    const { feature_order, order: orderField, ...rest } = data || {};
    const order = feature_order ?? orderField;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academyFeature.findFirst({
        where: { id: featureId, academy_id: academyId },
        select: { order: true },
      });

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          await tx.academyFeature.updateMany({
            where: { academy_id: academyId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.academyFeature.updateMany({
            where: { academy_id: academyId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.academyFeature.update({
        where: { id: featureId, academy_id: academyId },
        data: { ...rest, ...(order ? { order } : {}) },
      });

      return updated;
    });

    return result;
  }

  async deleteFeature(academyId, featureId) {

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academyFeature.findFirst({
        where: { id: featureId, academy_id: academyId },
        select: { order: true },
      });

      await tx.academyFeature.delete({
        where: { id: featureId, academy_id: academyId },
      });

      if (existing?.order) {
        await tx.academyFeature.updateMany({
          where: { academy_id: academyId, order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });

    return { message: 'Feature deleted successfully' };
  }

  async createInstructor(academyId, data) {

    const { order, ...rest } = data || {};

    const instructor = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyInstructor.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.academyInstructor.findFirst({
          where: { academy_id: academyId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.academyInstructor.create({
        data: { academy_id: academyId, ...rest, order: finalOrder },
      });
    });

    return instructor;
  }

  async updateInstructor(academyId, instructorId, data) {
    const { order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academyInstructor.findFirst({
        where: { id: instructorId, academy_id: academyId },
        select: { order: true },
      });

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          await tx.academyInstructor.updateMany({
            where: { academy_id: academyId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.academyInstructor.updateMany({
            where: { academy_id: academyId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.academyInstructor.update({
        where: { id: instructorId, academy_id: academyId },
        data: { ...rest, ...(order ? { order } : {}) },
      });

      return updated;
    });

    return result;
  }

  async deleteInstructor(academyId, instructorId) {

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academyInstructor.findFirst({
        where: { id: instructorId, academy_id: academyId },
        select: { order: true },
      });

      await tx.academyInstructor.delete({
        where: { id: instructorId, academy_id: academyId },
      });

      if (existing?.order) {
        await tx.academyInstructor.updateMany({
          where: { academy_id: academyId, order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });

    return { message: 'Instructor removed successfully' };
  }

  async createTopic(academyId, data) {

    const { topic_order, order, theme_id, ...rest } = data || {};
    const rawOrder = topic_order ?? order;

    const topic = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(rawOrder);
      let finalOrder = desiredOrder;
      // Order is scoped per theme_id so sibling topics stay contiguous within a theme
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyTopic.updateMany({
          where: { academy_id: academyId, theme_id, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.academyTopic.findFirst({
          where: { academy_id: academyId, theme_id },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.academyTopic.create({
        data: { academy_id: academyId, theme_id, ...rest, order: finalOrder },
      });
    });

    return topic;
  }

  async updateTopic(academyId, topicId, data) {
    const { topic_order, order: orderField, theme_id, ...rest } = data || {};
    const order = topic_order ?? orderField;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academyTopic.findFirst({
        where: { id: topicId, academy_id: academyId },
        select: { order: true, theme_id: true },
      });

      // Use existing theme_id scope for order shifting unless caller is changing theme
      const scopeThemeId = theme_id ?? existing?.theme_id;

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          await tx.academyTopic.updateMany({
            where: { academy_id: academyId, theme_id: scopeThemeId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.academyTopic.updateMany({
            where: { academy_id: academyId, theme_id: scopeThemeId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.academyTopic.update({
        where: { id: topicId, academy_id: academyId },
        data: { ...rest, ...(theme_id ? { theme_id } : {}), ...(order ? { order } : {}) },
      });

      return updated;
    });

    return result;
  }

  async deleteTopic(academyId, topicId) {

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academyTopic.findFirst({
        where: { id: topicId, academy_id: academyId },
        select: { order: true, theme_id: true },
      });

      await tx.academyTopic.delete({
        where: { id: topicId, academy_id: academyId },
      });

      if (existing?.order) {
        await tx.academyTopic.updateMany({
          where: { academy_id: academyId, theme_id: existing.theme_id, order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });

    return { message: 'Topic deleted successfully' };
  }

  async createTestimonial(academyId, data) {

    const { testimonial_order, order, ...rest } = data || {};
    const rawOrder = testimonial_order ?? order;

    const testimonial = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(rawOrder);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyTestimonial.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.academyTestimonial.findFirst({
          where: { academy_id: academyId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.academyTestimonial.create({
        data: { academy_id: academyId, ...rest, order: finalOrder },
      });
    });

    return testimonial;
  }

  async updateTestimonial(academyId, testimonialId, data) {
    const { testimonial_order, order: orderField, ...rest } = data || {};
    const order = testimonial_order ?? orderField;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academyTestimonial.findFirst({
        where: { id: testimonialId, academy_id: academyId },
        select: { order: true },
      });

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          await tx.academyTestimonial.updateMany({
            where: { academy_id: academyId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.academyTestimonial.updateMany({
            where: { academy_id: academyId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.academyTestimonial.update({
        where: { id: testimonialId, academy_id: academyId },
        data: { ...rest, ...(order ? { order } : {}) },
      });

      return updated;
    });

    return result;
  }

  async deleteTestimonial(academyId, testimonialId) {

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academyTestimonial.findFirst({
        where: { id: testimonialId, academy_id: academyId },
        select: { order: true },
      });

      await tx.academyTestimonial.delete({
        where: { id: testimonialId, academy_id: academyId },
      });

      if (existing?.order) {
        await tx.academyTestimonial.updateMany({
          where: { academy_id: academyId, order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });

    return { message: 'Testimonial deleted successfully' };
  }

  async createFaq(academyId, data) {

    const { faq_order, order, ...rest } = data || {};
    const rawOrder = faq_order ?? order;

    const faq = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(rawOrder);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyFaq.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.academyFaq.findFirst({
          where: { academy_id: academyId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.academyFaq.create({
        data: { academy_id: academyId, ...rest, order: finalOrder },
      });
    });

    return faq;
  }

  async updateFaq(academyId, faqId, data) {
    const { faq_order, order: orderField, ...rest } = data || {};
    const order = faq_order ?? orderField;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academyFaq.findFirst({
        where: { id: faqId, academy_id: academyId },
        select: { order: true },
      });

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          await tx.academyFaq.updateMany({
            where: { academy_id: academyId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.academyFaq.updateMany({
            where: { academy_id: academyId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.academyFaq.update({
        where: { id: faqId, academy_id: academyId },
        data: { ...rest, ...(order ? { order } : {}) },
      });

      return updated;
    });

    return result;
  }

  async deleteFaq(academyId, faqId) {

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academyFaq.findFirst({
        where: { id: faqId, academy_id: academyId },
        select: { order: true },
      });

      await tx.academyFaq.delete({
        where: { id: faqId, academy_id: academyId },
      });

      if (existing?.order) {
        await tx.academyFaq.updateMany({
          where: { academy_id: academyId, order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });

    return { message: 'FAQ deleted successfully' };
  }
}

export const adminAcademyRepository = new AdminAcademyRepository();
