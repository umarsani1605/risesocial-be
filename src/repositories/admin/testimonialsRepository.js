import prisma from '../../config/database.js';
import { BaseRepository } from '../shared/BaseRepository.js';

class AdminTestimonialsRepository extends BaseRepository {
  constructor() {
    super(prisma.testimonial);
    this.prisma = prisma;
  }


  async getStatistics() {
    try {
      const [
        totalTestimonials,
        activeTestimonials,
        inactiveTestimonials,
        pendingTestimonials,
        featuredTestimonials,
        recentTestimonials,
        avgRating,
        countriesCount,
      ] = await Promise.all([
        this.prisma.testimonial.count(),
        this.prisma.testimonial.count({ where: { status: 'ACTIVE' } }),
        this.prisma.testimonial.count({ where: { status: 'INACTIVE' } }),
        this.prisma.testimonial.count({ where: { status: 'PENDING' } }),
        this.prisma.testimonial.count({ where: { featured: true } }),
        this.prisma.testimonial.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        this.prisma.testimonial.aggregate({
          _avg: {
            rating: true,
          },
        }),
        this.prisma.testimonial.groupBy({
          by: ['country'],
          _count: true,
        }),
      ]);

      const stats = {
        totalTestimonials,
        activeTestimonials,
        inactiveTestimonials,
        pendingTestimonials,
        featuredTestimonials,
        recentTestimonials,
        averageRating: avgRating._avg.rating || 0,
        countriesCount: countriesCount.length,
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  async findMany(filters = {}, page = undefined, limit = undefined, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const whereClause = {};
      if (filters.status) whereClause.status = filters.status;
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
      else if (sortBy === 'status') orderBy.status = sortOrder;
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
        return result;
      } else {
        const testimonials = await this.prisma.testimonial.findMany({ where: whereClause, orderBy });

        const result = { testimonials };
        return result;
      }
    } catch (error) {
      throw new Error(`Failed to fetch testimonials: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const testimonial = await this.prisma.testimonial.create({ data: { ...data, created_at: new Date(), updated_at: new Date() } });
      return testimonial;
    } catch (error) {
      throw new Error(`Failed to create testimonial: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const testimonial = await this.prisma.testimonial.update({ where: { id: parseInt(id) }, data: { ...data, updated_at: new Date() } });
      return testimonial;
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw new Error(`Failed to update testimonial: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      await this.prisma.testimonial.delete({ where: { id: parseInt(id) } });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const testimonial = await this.prisma.testimonial.findUnique({ where: { id: parseInt(id) } });
      return testimonial;
    } catch (error) {
      throw new Error(`Failed to find testimonial by ID: ${error.message}`);
    }
  }
}

export const adminTestimonialsRepository = new AdminTestimonialsRepository();
