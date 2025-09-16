import prisma from '../lib/prisma.js';
import { BaseRepository } from './base/BaseRepository.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Testimonials Repository
 * Handles all database operations for testimonials
 */
class TestimonialsRepository extends BaseRepository {
  constructor() {
    super(prisma.testimonial);
    this.prisma = prisma;
  }

  get logger() {
    return getLogger();
  }

  /**
   * Get all testimonials with pagination, search, and filtering
   */
  async findMany(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    this.logger.info('[testimonialsRepository] findMany start');
    this.logger.debug({ filters, page, limit, sortBy, sortOrder }, '[testimonialsRepository] rawOptions');
    try {
      const skip = (page - 1) * limit;
      const whereClause = {};
      if (filters.status) whereClause.status = filters.status;
      else whereClause.status = 'ACTIVE';
      if (filters.country) whereClause.country = { contains: filters.country, mode: 'insensitive' };
      if (filters.minRating) whereClause.rating = { gte: parseInt(filters.minRating) };
      if (filters.featured !== undefined) whereClause.featured = filters.featured === 'true';
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

      const [testimonials, total] = await Promise.all([
        this.prisma.testimonial.findMany({ where: whereClause, orderBy, skip, take: limit }),
        this.prisma.testimonial.count({ where: whereClause }),
      ]);

      const result = {
        testimonials,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 },
      };
      this.logger.info('[testimonialsRepository] findMany success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] findMany error');
      throw new Error(`Failed to fetch testimonials: ${error.message}`);
    }
  }

  /**
   * Get featured testimonials
   */
  async getFeatured(limit = 6) {
    this.logger.info({ limit }, '[testimonialsRepository] getFeatured start');
    try {
      const testimonials = await this.prisma.testimonial.findMany({
        where: { status: 'ACTIVE', featured: true },
        orderBy: { rating: 'desc' },
        take: limit,
      });
      this.logger.info('[testimonialsRepository] getFeatured success');
      return testimonials;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] getFeatured error');
      throw new Error(`Failed to get featured testimonials: ${error.message}`);
    }
  }

  /**
   * Get testimonials by country
   */
  async getByCountry(country, limit = 10) {
    this.logger.info({ country, limit }, '[testimonialsRepository] getByCountry start');
    try {
      const testimonials = await this.prisma.testimonial.findMany({
        where: { status: 'ACTIVE', country: { contains: country, mode: 'insensitive' } },
        orderBy: { rating: 'desc' },
        take: limit,
      });
      this.logger.info('[testimonialsRepository] getByCountry success');
      return testimonials;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] getByCountry error');
      throw new Error(`Failed to get testimonials by country: ${error.message}`);
    }
  }

  /**
   * Get testimonials by rating
   */
  async getByRating(minRating, limit = 10) {
    this.logger.info({ minRating, limit }, '[testimonialsRepository] getByRating start');
    try {
      const testimonials = await this.prisma.testimonial.findMany({
        where: { status: 'ACTIVE', rating: { gte: parseInt(minRating) } },
        orderBy: { rating: 'desc' },
        take: limit,
      });
      this.logger.info('[testimonialsRepository] getByRating success');
      return testimonials;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] getByRating error');
      throw new Error(`Failed to get testimonials by rating: ${error.message}`);
    }
  }

  /**
   * Get testimonials statistics
   */
  async getStatistics() {
    this.logger.info('[testimonialsRepository] getStatistics start');
    try {
      const [
        totalTestimonials,
        activeTestimonials,
        inactiveTestimonials,
        pendingTestimonials,
        featuredTestimonials,
        averageRating,
        recentTestimonials,
        countriesCount,
        topCountries,
        ratingDistribution,
      ] = await Promise.all([
        this.prisma.testimonial.count(),
        this.prisma.testimonial.count({ where: { status: 'ACTIVE' } }),
        this.prisma.testimonial.count({ where: { status: 'INACTIVE' } }),
        this.prisma.testimonial.count({ where: { status: 'PENDING' } }),
        this.prisma.testimonial.count({ where: { featured: true } }),
        this.prisma.testimonial.aggregate({ _avg: { rating: true }, where: { status: 'ACTIVE' } }),
        this.prisma.testimonial.count({ where: { created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
        this.prisma.testimonial.groupBy({ by: ['country'], _count: { country: true }, where: { status: 'ACTIVE' } }),
        this.prisma.testimonial.groupBy({
          by: ['country'],
          _count: { country: true },
          where: { status: 'ACTIVE' },
          orderBy: { _count: { country: 'desc' } },
          take: 5,
        }),
        this.prisma.testimonial.groupBy({ by: ['rating'], _count: { rating: true }, where: { status: 'ACTIVE' }, orderBy: { rating: 'desc' } }),
      ]);

      const result = {
        totalTestimonials,
        activeTestimonials,
        inactiveTestimonials,
        pendingTestimonials,
        featuredTestimonials,
        averageRating: averageRating._avg.rating ? parseFloat(averageRating._avg.rating.toFixed(2)) : 0,
        recentTestimonials,
        countriesCount: countriesCount.length,
        testimonialsByStatus: [
          { status: 'ACTIVE', count: activeTestimonials },
          { status: 'INACTIVE', count: inactiveTestimonials },
          { status: 'PENDING', count: pendingTestimonials },
        ],
        topCountries: topCountries.map((item) => ({ country: item.country, count: item._count.country })),
        ratingDistribution: ratingDistribution.map((item) => ({ rating: item.rating, count: item._count.rating })),
      };
      this.logger.info('[testimonialsRepository] getStatistics success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] getStatistics error');
      throw new Error(`Failed to get testimonials statistics: ${error.message}`);
    }
  }

  /**
   * Create a new testimonial
   */
  async create(data) {
    this.logger.info('[testimonialsRepository] create start');
    try {
      const testimonial = await this.prisma.testimonial.create({ data: { ...data, created_at: new Date(), updated_at: new Date() } });
      this.logger.info({ id: testimonial.id }, '[testimonialsRepository] create success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] create error');
      throw new Error(`Failed to create testimonial: ${error.message}`);
    }
  }

  /**
   * Update a testimonial
   */
  async update(id, data) {
    this.logger.info({ id }, '[testimonialsRepository] update start');
    try {
      const testimonial = await this.prisma.testimonial.update({ where: { id: parseInt(id) }, data: { ...data, updated_at: new Date() } });
      this.logger.info({ id: testimonial.id }, '[testimonialsRepository] update success');
      return testimonial;
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      this.logger.error({ err: error }, '[testimonialsRepository] update error');
      throw new Error(`Failed to update testimonial: ${error.message}`);
    }
  }

  /**
   * Delete a testimonial
   */
  async delete(id) {
    this.logger.info({ id }, '[testimonialsRepository] delete start');
    try {
      await this.prisma.testimonial.delete({ where: { id: parseInt(id) } });
      this.logger.info('[testimonialsRepository] delete success');
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      this.logger.error({ err: error }, '[testimonialsRepository] delete error');
      throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
  }

  /**
   * Get testimonial by ID
   */
  async findById(id) {
    this.logger.info({ id }, '[testimonialsRepository] findById start');
    try {
      const testimonial = await this.prisma.testimonial.findUnique({ where: { id: parseInt(id) } });
      this.logger.info({ found: !!testimonial }, '[testimonialsRepository] findById success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] findById error');
      throw new Error(`Failed to find testimonial by ID: ${error.message}`);
    }
  }

  /**
   * Get all testimonials for admin (including inactive/pending)
   */
  async findManyForAdmin(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    this.logger.info('[testimonialsRepository] findManyForAdmin start');
    this.logger.debug({ filters, page, limit, sortBy, sortOrder }, '[testimonialsRepository] rawOptions');
    try {
      const skip = (page - 1) * limit;
      const whereClause = {};
      if (filters.status) whereClause.status = filters.status;
      if (filters.country) whereClause.country = { contains: filters.country, mode: 'insensitive' };
      if (filters.minRating) whereClause.rating = { gte: parseInt(filters.minRating) };
      if (filters.featured !== undefined) whereClause.featured = filters.featured === 'true';
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
      else if (sortBy === 'status') orderBy.status = sortOrder;
      else orderBy.created_at = 'desc';

      const [testimonials, total] = await Promise.all([
        this.prisma.testimonial.findMany({ where: whereClause, orderBy, skip, take: limit }),
        this.prisma.testimonial.count({ where: whereClause }),
      ]);

      const result = {
        testimonials,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 },
      };
      this.logger.info('[testimonialsRepository] findManyForAdmin success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] findManyForAdmin error');
      throw new Error(`Failed to fetch testimonials for admin: ${error.message}`);
    }
  }

  /**
   * Get countries with testimonial counts
   */
  async getCountriesWithCounts() {
    this.logger.info('[testimonialsRepository] getCountriesWithCounts start');
    try {
      const countries = await this.prisma.testimonial.groupBy({
        by: ['country'],
        _count: { country: true },
        where: { status: 'ACTIVE' },
        orderBy: { country: 'asc' },
      });
      const result = countries.map((item) => ({ country: item.country, count: item._count.country }));
      this.logger.info('[testimonialsRepository] getCountriesWithCounts success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsRepository] getCountriesWithCounts error');
      throw new Error(`Failed to get countries with counts: ${error.message}`);
    }
  }
}

export { TestimonialsRepository };
