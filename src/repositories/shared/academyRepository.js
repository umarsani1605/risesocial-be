import prisma from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AcademyRepository extends BaseRepository {
  constructor() {
    super(prisma.academy);
  }

  get logger() {
    return getLogger();
  }

  async findBySlug(slug, options = {}) {
    this.logger.info({ slug }, '[academyRepository] findBySlug called');
    const academy = await this.model.findUnique({
      where: { path_slug: slug },
      include: {
        pricing: { orderBy: { order: 'asc' } },
        features: { orderBy: { order: 'asc' } },
        topics: { orderBy: { order: 'asc' }, include: { sessions: { orderBy: { order: 'asc' } } } },
        instructors: { orderBy: { order: 'asc' } },
        testimonials: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
        ...options.include,
      },
      ...options,
    });

    return academy;
  }

  async findWithPagination(options = {}) {
    this.logger.info({ options }, '[academyRepository] findWithPagination called');
    const { page = 1, limit = 10, category, search, minRating, includeRelations = false } = options;

    const skip = (page - 1) * limit;

    let where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    }

    if (minRating) {
      where.rating = { gte: Number(minRating) };
    }

    const include = includeRelations
      ? {
          pricing: { orderBy: { order: 'asc' } },
          features: { orderBy: { order: 'asc' } },
          instructors: { orderBy: { order: 'asc' } },
          _count: { select: { enrollments: true } },
        }
      : { _count: { select: { enrollments: true } } };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: Number(limit),
        include,
        orderBy: [{ rating: 'desc' }, { created_at: 'desc' }],
      }),
      this.model.count({ where }),
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

  async getCategories() {
    this.logger.info('[academyRepository] getCategories called');
    const result = await this.model.findMany({
      where: { status: 'ACTIVE' },
      select: { category: true },
      distinct: ['category'],
    });
    return result.map((item) => item.category).filter(Boolean);
  }

  async slugExists(slug, excludeId = null) {
    this.logger.info({ slug, excludeId }, '[academyRepository] slugExists called');
    const where = { path_slug: slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return await this.exists(where);
  }

  async getAcademyStatistics() {
    const [total, active, byCategory] = await Promise.all([
      this.model.count(),
      this.model.count({ where: { status: 'ACTIVE' } }),
      this.model.groupBy({
        by: ['category'],
        where: { status: 'ACTIVE' },
        _count: { category: true },
      }),
    ]);

    return {
      total,
      active,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      }, {}),
    };
  }

  async findPricingsByAcademyId(academyId) {
    return await prisma.academyPricing.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async createPricing(academyId, data) {
    this.logger.info({ academyId, data }, '[academyRepository] createPricing called');

    const { order, ...rest } = data || {};

    const pricing = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyPricing.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        this.logger.info({ academyId, desiredOrder, shifted: shiftResult.count }, '[academyRepository] pricing shift-on-create');
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

    this.logger.info({ pricingId: pricing.id }, '[academyRepository] createPricing success');
    return pricing;
  }

  async updatePricing(academyId, pricingId, data) {
    this.logger.info({ academyId, pricingId, data }, '[academyRepository] updatePricing called');
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

    this.logger.info({ pricingId: result.id }, '[academyRepository] updatePricing success');
    return result;
  }

  async deletePricing(academyId, pricingId) {
    this.logger.info({ academyId, pricingId }, '[academyRepository] deletePricing called');

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
        this.logger.info({ academyId, deletedOrder: existing.order, shifted: shiftResult.count }, '[academyRepository] pricing shift-on-delete');
      }
    });

    this.logger.info({ pricingId }, '[academyRepository] deletePricing success');
    return { message: 'Pricing deleted successfully' };
  }

  async findFeaturesByAcademyId(academyId) {
    return await prisma.academyFeature.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async createFeature(academyId, data) {
    this.logger.info({ academyId, data }, '[academyRepository] createFeature called');

    const { order, ...rest } = data || {};

    const feature = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyFeature.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        this.logger.info({ academyId, desiredOrder, shifted: shiftResult.count }, '[academyRepository] feature shift-on-create');
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

    this.logger.info({ featureId: feature.id }, '[academyRepository] createFeature success');
    return feature;
  }

  async updateFeature(academyId, featureId, data) {
    this.logger.info({ academyId, featureId, data }, '[academyRepository] updateFeature called');
    const { order, ...rest } = data || {};

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

    this.logger.info({ featureId: result.id }, '[academyRepository] updateFeature success');
    return result;
  }

  async deleteFeature(academyId, featureId) {
    this.logger.info({ academyId, featureId }, '[academyRepository] deleteFeature called');

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

    this.logger.info({ featureId }, '[academyRepository] deleteFeature success');
    return { message: 'Feature deleted successfully' };
  }

  async findInstructorsByAcademyId(academyId) {
    return await prisma.academyInstructor.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async createInstructor(academyId, data) {
    this.logger.info({ academyId, data }, '[academyRepository] createInstructor called');

    const { order, ...rest } = data || {};

    const instructor = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyInstructor.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        this.logger.info({ academyId, desiredOrder, shifted: shiftResult.count }, '[academyRepository] instructor shift-on-create');
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

    this.logger.info({ instructorId: instructor.id }, '[academyRepository] createInstructor success');
    return instructor;
  }

  async updateInstructor(academyId, instructorId, data) {
    this.logger.info({ academyId, instructorId, data }, '[academyRepository] updateInstructor called');
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

    this.logger.info({ instructorId: result.id }, '[academyRepository] updateInstructor success');
    return result;
  }

  async deleteInstructor(academyId, instructorId) {
    this.logger.info({ academyId, instructorId }, '[academyRepository] deleteInstructor called');

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

    this.logger.info({ instructorId }, '[academyRepository] deleteInstructor success');
    return { message: 'Instructor removed successfully' };
  }

  async findTopicsByAcademyId(academyId, includeSessions = false) {
    const includeOption = includeSessions
      ? {
          include: {
            sessions: {
              orderBy: { order: 'asc' },
            },
          },
        }
      : {};

    return await prisma.academyTopic.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
      ...includeOption,
    });
  }

  async createTopic(academyId, data) {
    this.logger.info({ academyId, data }, '[academyRepository] createTopic called');

    const { order, ...rest } = data || {};

    const topic = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyTopic.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        this.logger.info({ academyId, desiredOrder, shifted: shiftResult.count }, '[academyRepository] topic shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.academyTopic.findFirst({
          where: { academy_id: academyId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = (maxRow?.order || 0) + 1;
      }

      return tx.academyTopic.create({
        data: { academy_id: academyId, ...rest, order: finalOrder },
        include: { sessions: true },
      });
    });

    this.logger.info({ topicId: topic.id }, '[academyRepository] createTopic success');
    return topic;
  }

  async updateTopic(academyId, topicId, data) {
    this.logger.info({ academyId, topicId, data }, '[academyRepository] updateTopic called');
    const { order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academyTopic.findFirst({
        where: { id: topicId, academy_id: academyId },
        select: { order: true },
      });

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          await tx.academyTopic.updateMany({
            where: { academy_id: academyId, order: { gte: order, lt: existing.order } },
            data: { order: { increment: 1 } },
          });
        } else if (order > existing.order) {
          await tx.academyTopic.updateMany({
            where: { academy_id: academyId, order: { lte: order, gt: existing.order } },
            data: { order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.academyTopic.update({
        where: { id: topicId, academy_id: academyId },
        data: { ...rest, ...(order ? { order } : {}) },
        include: { sessions: true },
      });

      return updated;
    });

    this.logger.info({ topicId: result.id }, '[academyRepository] updateTopic success');
    return result;
  }

  async deleteTopic(academyId, topicId) {
    this.logger.info({ academyId, topicId }, '[academyRepository] deleteTopic called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academyTopic.findFirst({
        where: { id: topicId, academy_id: academyId },
        select: { order: true },
      });

      await tx.academyTopic.delete({
        where: { id: topicId, academy_id: academyId },
      });

      if (existing?.order) {
        await tx.academyTopic.updateMany({
          where: { academy_id: academyId, order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });

    this.logger.info({ topicId }, '[academyRepository] deleteTopic success');
    return { message: 'Topic deleted successfully' };
  }

  async findTestimonialsByAcademyId(academyId) {
    return await prisma.academyTestimonial.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async createTestimonial(academyId, data) {
    this.logger.info({ academyId, data }, '[academyRepository] createTestimonial called');

    const { order, ...rest } = data || {};

    const testimonial = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyTestimonial.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        this.logger.info({ academyId, desiredOrder, shifted: shiftResult.count }, '[academyRepository] testimonial shift-on-create');
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

    this.logger.info({ testimonialId: testimonial.id }, '[academyRepository] createTestimonial success');
    return testimonial;
  }

  async updateTestimonial(academyId, testimonialId, data) {
    this.logger.info({ academyId, testimonialId, data }, '[academyRepository] updateTestimonial called');
    const { order, ...rest } = data || {};

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

    this.logger.info({ testimonialId: result.id }, '[academyRepository] updateTestimonial success');
    return result;
  }

  async deleteTestimonial(academyId, testimonialId) {
    this.logger.info({ academyId, testimonialId }, '[academyRepository] deleteTestimonial called');

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

    this.logger.info({ testimonialId }, '[academyRepository] deleteTestimonial success');
    return { message: 'Testimonial deleted successfully' };
  }

  async findFaqsByAcademyId(academyId) {
    return await prisma.academyFaq.findMany({
      where: { academy_id: academyId },
      orderBy: { order: 'asc' },
    });
  }

  async createFaq(academyId, data) {
    this.logger.info({ academyId, data }, '[academyRepository] createFaq called');

    const { order, ...rest } = data || {};

    const faq = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academyFaq.updateMany({
          where: { academy_id: academyId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        this.logger.info({ academyId, desiredOrder, shifted: shiftResult.count }, '[academyRepository] faq shift-on-create');
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

    this.logger.info({ faqId: faq.id }, '[academyRepository] createFaq success');
    return faq;
  }

  async updateFaq(academyId, faqId, data) {
    this.logger.info({ academyId, faqId, data }, '[academyRepository] updateFaq called');
    const { order, ...rest } = data || {};

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

    this.logger.info({ faqId: result.id }, '[academyRepository] updateFaq success');
    return result;
  }

  async deleteFaq(academyId, faqId) {
    this.logger.info({ academyId, faqId }, '[academyRepository] deleteFaq called');

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

    this.logger.info({ faqId }, '[academyRepository] deleteFaq success');
    return { message: 'FAQ deleted successfully' };
  }

  async findSessionsByTopicId(topicId) {
    return await prisma.academySession.findMany({
      where: { topic_id: topicId },
      orderBy: { order: 'asc' },
    });
  }

  async findSessionsByAcademyId(academyId) {
    return await prisma.academySession.findMany({
      where: {
        topic: {
          academy_id: academyId,
        },
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            order: true,
            academy_id: true,
          },
        },
      },
      orderBy: [{ topic: { order: 'asc' } }, { order: 'asc' }],
    });
  }

  async createSession(academyId, topicId, data) {
    this.logger.info({ academyId, topicId, data }, '[academyRepository] createSession called');

    const { order, ...rest } = data || {};

    const session = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(order);
      let finalOrder = desiredOrder;

      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.academySession.updateMany({
          where: { topic_id: topicId, order: { gte: desiredOrder } },
          data: { order: { increment: 1 } },
        });
        this.logger.info({ topicId, desiredOrder, shifted: shiftResult.count }, '[academyRepository] session shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxSession = await tx.academySession.findFirst({
          where: { topic_id: topicId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        finalOrder = maxSession ? maxSession.order + 1 : 1;
      }

      return await tx.academySession.create({
        data: {
          topic_id: topicId,
          order: finalOrder,
          ...rest,
        },
      });
    });

    this.logger.info({ sessionId: session.id }, '[academyRepository] createSession success');
    return session;
  }

  async updateSession(academyId, topicId, sessionId, data) {
    this.logger.info({ academyId, topicId, sessionId, data }, '[academyRepository] updateSession called');
    const { order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.academySession.findFirst({
        where: { id: sessionId, topic_id: topicId },
        select: { order: true },
      });

      if (typeof order === 'number' && order >= 1 && existing) {
        if (order < existing.order) {
          const shiftResult = await tx.academySession.updateMany({
            where: {
              topic_id: topicId,
              order: { gte: order, lt: existing.order },
            },
            data: { order: { increment: 1 } },
          });
          this.logger.info({ topicId, sessionId, order, shifted: shiftResult.count }, '[academyRepository] session shift-up');
        } else if (order > existing.order) {
          const shiftResult = await tx.academySession.updateMany({
            where: {
              topic_id: topicId,
              order: { gt: existing.order, lte: order },
            },
            data: { order: { decrement: 1 } },
          });
          this.logger.info({ topicId, sessionId, order, shifted: shiftResult.count }, '[academyRepository] session shift-down');
        }
      }

      return await tx.academySession.update({
        where: { id: sessionId, topic_id: topicId },
        data: { order, ...rest },
      });
    });

    this.logger.info({ sessionId: result.id }, '[academyRepository] updateSession success');
    return result;
  }

  async deleteSession(academyId, topicId, sessionId) {
    this.logger.info({ academyId, topicId, sessionId }, '[academyRepository] deleteSession called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.academySession.findFirst({
        where: { id: sessionId, topic_id: topicId },
        select: { order: true },
      });

      await tx.academySession.delete({
        where: { id: sessionId, topic_id: topicId },
      });

      if (existing?.order) {
        const shiftResult = await tx.academySession.updateMany({
          where: {
            topic_id: topicId,
            order: { gt: existing.order },
          },
          data: { order: { decrement: 1 } },
        });
        this.logger.info({ topicId, deletedOrder: existing.order, shifted: shiftResult.count }, '[academyRepository] session shift-on-delete');
      }
    });

    this.logger.info({ sessionId }, '[academyRepository] deleteSession success');
    return { message: 'Session deleted successfully' };
  }
}

export const academyRepository = new AcademyRepository();
