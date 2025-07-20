import { BaseRepository } from './base/BaseRepository.js';

/**
 * Programs Repository
 * Handles all database operations for programs
 */
class ProgramsRepository extends BaseRepository {
  constructor() {
    super('program');
  }

  /**
   * Find program by slug
   * @param {string} slug - Program slug
   * @returns {Promise<Object|null>} Program object or null
   */
  async findBySlug(slug) {
    try {
      const program = await this.prisma.program.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              // We'll add program registrations in the future
            },
          },
        },
      });

      return program;
    } catch (error) {
      throw new Error(`Failed to find program by slug: ${error.message}`);
    }
  }

  /**
   * Get all programs with pagination, search, and filtering
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} Programs with pagination
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
        // Default to ACTIVE programs for public access
        whereClause.status = 'ACTIVE';
      }

      // Search filter
      if (filters.search) {
        whereClause.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Build order clause
      const orderBy = {};
      if (sortBy === 'createdAt') {
        orderBy.created_at = sortOrder;
      } else if (sortBy === 'title') {
        orderBy.title = sortOrder;
      } else if (sortBy === 'status') {
        orderBy.status = sortOrder;
      } else {
        orderBy.created_at = 'desc'; // Default fallback
      }

      // Execute query
      const [programs, total] = await Promise.all([
        this.prisma.program.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                // We'll add program registrations in the future
              },
            },
          },
        }),
        this.prisma.program.count({
          where: whereClause,
        }),
      ]);

      return {
        programs,
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
      throw new Error(`Failed to fetch programs: ${error.message}`);
    }
  }

  /**
   * Get featured programs
   * @param {number} limit - Number of programs to fetch
   * @returns {Promise<Array>} Featured programs
   */
  async getFeatured(limit = 6) {
    try {
      const programs = await this.prisma.program.findMany({
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        include: {
          _count: {
            select: {
              // We'll add program registrations in the future
            },
          },
        },
      });

      return programs;
    } catch (error) {
      throw new Error(`Failed to get featured programs: ${error.message}`);
    }
  }

  /**
   * Get programs statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const [totalPrograms, activePrograms, inactivePrograms, draftPrograms, recentPrograms] = await Promise.all([
        this.prisma.program.count(),
        this.prisma.program.count({ where: { status: 'ACTIVE' } }),
        this.prisma.program.count({ where: { status: 'INACTIVE' } }),
        this.prisma.program.count({ where: { status: 'DRAFT' } }),
        this.prisma.program.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      return {
        totalPrograms,
        activePrograms,
        inactivePrograms,
        draftPrograms,
        recentPrograms,
        programsByStatus: [
          { status: 'ACTIVE', count: activePrograms },
          { status: 'INACTIVE', count: inactivePrograms },
          { status: 'DRAFT', count: draftPrograms },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get programs statistics: ${error.message}`);
    }
  }

  /**
   * Create a new program
   * @param {Object} data - Program data
   * @returns {Promise<Object>} Created program
   */
  async create(data) {
    try {
      const program = await this.prisma.program.create({
        data: {
          ...data,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          _count: {
            select: {
              // We'll add program registrations in the future
            },
          },
        },
      });

      return program;
    } catch (error) {
      throw new Error(`Failed to create program: ${error.message}`);
    }
  }

  /**
   * Update a program
   * @param {number} id - Program ID
   * @param {Object} data - Update data
   * @returns {Promise<Object|null>} Updated program or null
   */
  async update(id, data) {
    try {
      const program = await this.prisma.program.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          updated_at: new Date(),
        },
        include: {
          _count: {
            select: {
              // We'll add program registrations in the future
            },
          },
        },
      });

      return program;
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Program not found
      }
      throw new Error(`Failed to update program: ${error.message}`);
    }
  }

  /**
   * Delete a program
   * @param {number} id - Program ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      await this.prisma.program.delete({
        where: { id: parseInt(id) },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false; // Program not found
      }
      throw new Error(`Failed to delete program: ${error.message}`);
    }
  }

  /**
   * Check if slug exists
   * @param {string} slug - Program slug
   * @param {number} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if slug exists
   */
  async slugExists(slug, excludeId = null) {
    try {
      const whereClause = { slug };
      if (excludeId) {
        whereClause.id = { not: parseInt(excludeId) };
      }

      const program = await this.prisma.program.findFirst({
        where: whereClause,
        select: { id: true },
      });

      return !!program;
    } catch (error) {
      throw new Error(`Failed to check slug existence: ${error.message}`);
    }
  }

  /**
   * Get program by ID or slug
   * @param {string} identifier - Program ID or slug
   * @returns {Promise<Object|null>} Program object or null
   */
  async findByIdOrSlug(identifier) {
    try {
      // Check if identifier is numeric (ID) or string (slug)
      const isNumeric = !isNaN(identifier) && !isNaN(parseFloat(identifier));

      const whereClause = isNumeric ? { id: parseInt(identifier) } : { slug: identifier };

      const program = await this.prisma.program.findUnique({
        where: whereClause,
        include: {
          _count: {
            select: {
              // We'll add program registrations in the future
            },
          },
        },
      });

      return program;
    } catch (error) {
      throw new Error(`Failed to find program: ${error.message}`);
    }
  }

  /**
   * Get all programs for admin (including inactive/draft)
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} Programs with pagination
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

      // Search filter
      if (filters.search) {
        whereClause.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Build order clause
      const orderBy = {};
      if (sortBy === 'createdAt') {
        orderBy.created_at = sortOrder;
      } else if (sortBy === 'title') {
        orderBy.title = sortOrder;
      } else if (sortBy === 'status') {
        orderBy.status = sortOrder;
      } else {
        orderBy.created_at = 'desc'; // Default fallback
      }

      // Execute query
      const [programs, total] = await Promise.all([
        this.prisma.program.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                // We'll add program registrations in the future
              },
            },
          },
        }),
        this.prisma.program.count({
          where: whereClause,
        }),
      ]);

      return {
        programs,
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
      throw new Error(`Failed to fetch programs for admin: ${error.message}`);
    }
  }
}

export { ProgramsRepository };
