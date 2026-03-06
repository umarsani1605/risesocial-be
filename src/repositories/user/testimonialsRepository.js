import prisma from '../../config/database.js';
import { BaseRepository } from '../shared/BaseRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

class UserTestimonialsRepository extends BaseRepository {
  constructor() {
    super(prisma.testimonial);
    this.prisma = prisma;
  }

  get logger() {
    return getLogger();
  }

  async findMany(filters = {}, page = undefined, limit = undefined, sortBy = 'createdAt', sortOrder = 'desc') {
    this.logger.info('[userTestimonialsRepository] findMany start');
    this.logger.debug({ filters, page, limit, sortBy, sortOrder }, '[userTestimonialsRepository] rawOptions');
    try {
      const whereClause = {};
      if (filters.status) whereClause.status = filters.status;
      else whereClause.status = 'ACTIVE';
      if (filters.country) whereClause.country = { contains: filters.country, mode: 'insensitive' };
      if (filters.minRating) whereClause.rating = { gte: parseInt(filters.minRating) };
      if (filters.featured !== undefined) {
        whereClause.featured = filters.featured === true || filters.featured === 'true';
      }
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { text: { contains: filters.search, mode: 'insensitive' } },
          { country: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const orderBy = {};
      if (sortBy === 'createdAt') orderBy.created_at = sortOrder;
      else if (sortBy === 'name') orderBy.name = sortOrder;
      else if (sortBy === 'rating') orderBy.rating = sortOrder;
      else if (sortBy === 'country') orderBy.country = sortOrder;
      else if (sortBy === 'featured') orderBy.featured = sortOrder;
      else orderBy.created_at = 'desc';

      if (page !== undefined && limit !== undefined) {
        const skip = (page - 1) * limit;
        const [testimonials, total] = await Promise.all([
          this.prisma.testimonial.findMany({ where: whereClause, orderBy, skip, take: limit }),
          this.prisma.testimonial.count({ where: whereClause }),
        ]);

        const result = {
          testimonials,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 },
        };
        this.logger.info('[userTestimonialsRepository] findMany success (paginated)');
        return result;
      } else {
        const testimonials = await this.prisma.testimonial.findMany({ where: whereClause, orderBy });

        const result = { testimonials };
        this.logger.info('[userTestimonialsRepository] findMany success (all)');
        return result;
      }
    } catch (error) {
      this.logger.error({ err: error }, '[userTestimonialsRepository] findMany error');
      throw new Error(`Failed to fetch testimonials: ${error.message}`);
    }
  }

  async findById(id) {
    this.logger.info({ id }, '[userTestimonialsRepository] findById start');
    try {
      const testimonial = await this.prisma.testimonial.findUnique({ where: { id: parseInt(id) } });
      this.logger.info({ found: !!testimonial }, '[userTestimonialsRepository] findById success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[userTestimonialsRepository] findById error');
      throw new Error(`Failed to find testimonial by ID: ${error.message}`);
    }
  }
}

export const userTestimonialsRepository = new UserTestimonialsRepository();
