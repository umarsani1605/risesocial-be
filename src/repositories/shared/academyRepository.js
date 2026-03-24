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
      where: { slug: slug },
      include: {
        pricing: { orderBy: { order: 'asc' } },
        features: { orderBy: { order: 'asc' } },
        themes: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { order: 'asc' },
            },
          },
        },
        instructors: { orderBy: { order: 'asc' } },
        testimonials: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
        cohorts: {
          where: { status: { in: ['not_started', 'ongoing'] } },
          orderBy: { start_date: 'desc' },
          take: 1,
          select: { id: true, name: true, status: true },
        },
        ...options.include,
      },
      ...options,
    });

    return academy;
  }

  async findAll(options = {}) {
    this.logger.info({ options }, '[academyRepository] findAll called');
    const { page, limit, category, search, status, includeRelations = false } = options;

    // Only apply pagination if both page and limit are provided
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? Number(limit) : undefined;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    }

    const include = includeRelations
      ? {
          pricing: { orderBy: { order: 'asc' } },
          features: { orderBy: { order: 'asc' } },
          instructors: { orderBy: { order: 'asc' } },
        }
      : {};

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
        include,
        orderBy: [{ created_at: 'desc' }],
      }),
      this.model.count({ where }),
    ]);

    const result = { data };

    if (page && limit) {
      result.meta = {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      };
    }

    return result;
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
    const where = { slug: slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return await this.exists(where);
  }

  // Read-only methods for sub-tables
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
}

export const academyRepository = new AcademyRepository();
