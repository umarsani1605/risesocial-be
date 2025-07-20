import { BaseRepository } from './base/BaseRepository.js';

/**
 * Testimonials Repository
 * Handles all database operations for testimonials
 */
class TestimonialsRepository extends BaseRepository {
  constructor() {
    super('testimonial');
  }

  /**
   * Get all testimonials with pagination, search, and filtering
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} Testimonials with pagination
   */
  async findMany(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause = {};

      // Status filter
      if (filters.status) {
        whereClause.status = filters.status;
      } else {
        // Default to ACTIVE testimonials for public access
        whereClause.status = 'ACTIVE';
      }

      // Country filter
      if (filters.country) {
        whereClause.country = { contains: filters.country, mode: 'insensitive' };
      }

      // Rating filter
      if (filters.minRating) {
        whereClause.rating = { gte: parseInt(filters.minRating) };
      }

      // Featured filter
      if (filters.featured !== undefined) {
        whereClause.featured = filters.featured === 'true';
      }

      // Search filter
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { text: { contains: filters.search, mode: 'insensitive' } },
          { country: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Build order clause
      const orderBy = {};
      if (sortBy === 'createdAt') {
        orderBy.created_at = sortOrder;
      } else if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else if (sortBy === 'rating') {
        orderBy.rating = sortOrder;
      } else if (sortBy === 'country') {
        orderBy.country = sortOrder;
      } else if (sortBy === 'featured') {
        orderBy.featured = sortOrder;
      } else {
        orderBy.created_at = 'desc'; // Default fallback
      }

      // Execute query
      const [testimonials, total] = await Promise.all([
        this.prisma.testimonial.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.testimonial.count({
          where: whereClause,
        }),
      ]);

      return {
        testimonials,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch testimonials: ${error.message}`);
    }
  }

  /**
   * Get featured testimonials
   * @param {number} limit - Number of testimonials to fetch
   * @returns {Promise<Array>} Featured testimonials
   */
  async getFeatured(limit = 6) {
    try {
      const testimonials = await this.prisma.testimonial.findMany({
        where: {
          status: 'ACTIVE',
          featured: true,
        },
        orderBy: {
          rating: 'desc',
        },
        take: limit,
      });

      return testimonials;
    } catch (error) {
      throw new Error(`Failed to get featured testimonials: ${error.message}`);
    }
  }

  /**
   * Get testimonials by country
   * @param {string} country - Country name
   * @param {number} limit - Number of testimonials to fetch
   * @returns {Promise<Array>} Testimonials from specific country
   */
  async getByCountry(country, limit = 10) {
    try {
      const testimonials = await this.prisma.testimonial.findMany({
        where: {
          status: 'ACTIVE',
          country: { contains: country, mode: 'insensitive' },
        },
        orderBy: {
          rating: 'desc',
        },
        take: limit,
      });

      return testimonials;
    } catch (error) {
      throw new Error(`Failed to get testimonials by country: ${error.message}`);
    }
  }

  /**
   * Get testimonials by rating
   * @param {number} minRating - Minimum rating
   * @param {number} limit - Number of testimonials to fetch
   * @returns {Promise<Array>} Testimonials with minimum rating
   */
  async getByRating(minRating, limit = 10) {
    try {
      const testimonials = await this.prisma.testimonial.findMany({
        where: {
          status: 'ACTIVE',
          rating: { gte: parseInt(minRating) },
        },
        orderBy: {
          rating: 'desc',
        },
        take: limit,
      });

      return testimonials;
    } catch (error) {
      throw new Error(`Failed to get testimonials by rating: ${error.message}`);
    }
  }

  /**
   * Get testimonials statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
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
        this.prisma.testimonial.aggregate({
          _avg: { rating: true },
          where: { status: 'ACTIVE' },
        }),
        this.prisma.testimonial.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
        this.prisma.testimonial.groupBy({
          by: ['country'],
          _count: { country: true },
          where: { status: 'ACTIVE' },
        }),
        this.prisma.testimonial.groupBy({
          by: ['country'],
          _count: { country: true },
          where: { status: 'ACTIVE' },
          orderBy: { _count: { country: 'desc' } },
          take: 5,
        }),
        this.prisma.testimonial.groupBy({
          by: ['rating'],
          _count: { rating: true },
          where: { status: 'ACTIVE' },
          orderBy: { rating: 'desc' },
        }),
      ]);

      return {
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
        topCountries: topCountries.map((item) => ({
          country: item.country,
          count: item._count.country,
        })),
        ratingDistribution: ratingDistribution.map((item) => ({
          rating: item.rating,
          count: item._count.rating,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get testimonials statistics: ${error.message}`);
    }
  }

  /**
   * Create a new testimonial
   * @param {Object} data - Testimonial data
   * @returns {Promise<Object>} Created testimonial
   */
  async create(data) {
    try {
      const testimonial = await this.prisma.testimonial.create({
        data: {
          ...data,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return testimonial;
    } catch (error) {
      throw new Error(`Failed to create testimonial: ${error.message}`);
    }
  }

  /**
   * Update a testimonial
   * @param {number} id - Testimonial ID
   * @param {Object} data - Update data
   * @returns {Promise<Object|null>} Updated testimonial or null
   */
  async update(id, data) {
    try {
      const testimonial = await this.prisma.testimonial.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });

      return testimonial;
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Testimonial not found
      }
      throw new Error(`Failed to update testimonial: ${error.message}`);
    }
  }

  /**
   * Delete a testimonial
   * @param {number} id - Testimonial ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      await this.prisma.testimonial.delete({
        where: { id: parseInt(id) },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false; // Testimonial not found
      }
      throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
  }

  /**
   * Get testimonial by ID
   * @param {number} id - Testimonial ID
   * @returns {Promise<Object|null>} Testimonial object or null
   */
  async findById(id) {
    try {
      const testimonial = await this.prisma.testimonial.findUnique({
        where: { id: parseInt(id) },
      });

      return testimonial;
    } catch (error) {
      throw new Error(`Failed to find testimonial by ID: ${error.message}`);
    }
  }

  /**
   * Get all testimonials for admin (including inactive/pending)
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} Testimonials with pagination
   */
  async findManyForAdmin(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause = {};

      // Status filter (admin can see all statuses)
      if (filters.status) {
        whereClause.status = filters.status;
      }

      // Country filter
      if (filters.country) {
        whereClause.country = { contains: filters.country, mode: 'insensitive' };
      }

      // Rating filter
      if (filters.minRating) {
        whereClause.rating = { gte: parseInt(filters.minRating) };
      }

      // Featured filter
      if (filters.featured !== undefined) {
        whereClause.featured = filters.featured === 'true';
      }

      // Search filter
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { text: { contains: filters.search, mode: 'insensitive' } },
          { country: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Build order clause
      const orderBy = {};
      if (sortBy === 'createdAt') {
        orderBy.created_at = sortOrder;
      } else if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else if (sortBy === 'rating') {
        orderBy.rating = sortOrder;
      } else if (sortBy === 'country') {
        orderBy.country = sortOrder;
      } else if (sortBy === 'featured') {
        orderBy.featured = sortOrder;
      } else if (sortBy === 'status') {
        orderBy.status = sortOrder;
      } else {
        orderBy.created_at = 'desc'; // Default fallback
      }

      // Execute query
      const [testimonials, total] = await Promise.all([
        this.prisma.testimonial.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.testimonial.count({
          where: whereClause,
        }),
      ]);

      return {
        testimonials,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch testimonials for admin: ${error.message}`);
    }
  }

  /**
   * Get countries with testimonial counts
   * @returns {Promise<Array>} Countries with counts
   */
  async getCountriesWithCounts() {
    try {
      const countries = await this.prisma.testimonial.groupBy({
        by: ['country'],
        _count: { country: true },
        where: { status: 'ACTIVE' },
        orderBy: { country: 'asc' },
      });

      return countries.map((item) => ({
        country: item.country,
        count: item._count.country,
      }));
    } catch (error) {
      throw new Error(`Failed to get countries with counts: ${error.message}`);
    }
  }
}

export { TestimonialsRepository };
