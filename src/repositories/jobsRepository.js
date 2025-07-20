import prisma from '../lib/prisma.js';
import { BaseRepository } from './base/BaseRepository.js';

/**
 * Jobs repository for data access operations
 * Includes full-text search and advanced filtering
 */
export class JobsRepository extends BaseRepository {
  constructor() {
    super(prisma.job);
  }

  /**
   * Full-text search jobs with advanced filtering
   * @param {Object} options - Search and filter options
   * @returns {Promise<Object>} Paginated result with data and meta
   */
  async searchJobs(options = {}) {
    const {
      page = 1,
      limit = 20,
      query, // Full-text search query
      location, // Location filter
      jobType, // Job type filter
      experienceLevel, // Experience level filter
      salaryMin, // Minimum salary
      salaryMax, // Maximum salary
      company, // Company filter
      skills, // Skills array
      isRemote, // Remote work filter
      sortBy = 'postedDate', // Sort by: postedDate, salary, relevance
      sortOrder = 'desc', // asc or desc
    } = options;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where = {};

    // Full-text search across multiple fields
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { skills: { has: query } }, // Assuming skills is a JSON array
        { location: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Job type filter
    if (jobType && jobType !== 'all') {
      where.job_type = jobType;
    }

    // Experience level filter
    if (experienceLevel && experienceLevel !== 'all') {
      where.experience_level = experienceLevel;
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      where.salary_min = {};
      if (salaryMin) where.salary_min.gte = Number(salaryMin);
      if (salaryMax) where.salary_max = { lte: Number(salaryMax) };
    }

    // Company filter
    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    // Skills filter (if skills is a JSON array field)
    if (skills && Array.isArray(skills) && skills.length > 0) {
      where.AND = skills.map((skill) => ({
        skills: { array_contains: skill },
      }));
    }

    // Remote work filter
    if (isRemote !== undefined) {
      where.is_remote = Boolean(isRemote);
    }

    // Build order by
    let orderBy = {};
    switch (sortBy) {
      case 'salary':
        orderBy = { salary_max: sortOrder };
        break;
      case 'company':
        orderBy = { company: sortOrder };
        break;
      case 'title':
        orderBy = { title: sortOrder };
        break;
      case 'postedDate':
      default:
        orderBy = { posted_date: sortOrder };
        break;
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          company: true, // Include all company fields
          location: {
            select: {
              id: true,
              city: true,
              region: true,
              country: true,
              timezone: true,
              latitude: true,
              longitude: true,
              raw_location_data: true,
              location_type: true,
              is_remote: true,
            }
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
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
        searchQuery: query || null,
        appliedFilters: {
          location,
          jobType,
          experienceLevel,
          salaryRange: salaryMin || salaryMax ? { min: salaryMin, max: salaryMax } : null,
          company,
          skills,
          isRemote,
        },
      },
    };
  }

  /**
   * Get job recommendations for a user based on skills and preferences
   * @param {Object} userProfile - User profile with skills and preferences
   * @param {number} limit - Number of recommendations
   * @returns {Promise<Array>} Recommended jobs
   */
  async getRecommendations(userProfile, limit = 10) {
    const { skills = [], preferredLocation, experienceLevel } = userProfile;

    const where = {};

    // Match skills (if user has skills)
    if (skills.length > 0) {
      where.OR = skills.map((skill) => ({
        skills: { array_contains: skill },
      }));
    }

    // Preferred location
    if (preferredLocation) {
      where.location = { contains: preferredLocation, mode: 'insensitive' };
    }

    // Experience level match
    if (experienceLevel) {
      where.experience_level = experienceLevel;
    }

    return await this.model.findMany({
      where,
      take: Number(limit),
      orderBy: [{ posted_date: 'desc' }, { salary_max: 'desc' }],
      include: {
        company: true, 
        location: true, 
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
  }

  /**
   * Get popular job categories with counts
   * @returns {Promise<Array>} Job categories with counts
   */
  async getPopularCategories() {
    const result = await this.model.groupBy({
      by: ['job_type'],
      _count: { job_type: true },
      orderBy: {
        _count: { job_type: 'desc' },
      },
    });

    return result.map((item) => ({
      category: item.job_type,
      count: item._count.job_type,
    }));
  }

  /**
   * Get popular locations with job counts
   * @returns {Promise<Array>} Locations with job counts
   */
  async getPopularLocations() {
    const result = await this.model.groupBy({
      by: ['location'],
      _count: { location: true },
      orderBy: {
        _count: { location: 'desc' },
      },
      take: 10,
    });

    return result.map((item) => ({
      location: item.location,
      count: item._count.location,
    }));
  }

  /**
   * Get popular companies with job counts
   * @returns {Promise<Array>} Companies with job counts
   */
  async getPopularCompanies() {
    const result = await this.model.groupBy({
      by: ['company'],
      _count: { company: true },
      orderBy: {
        _count: { company: 'desc' },
      },
      take: 20,
    });

    return result.map((item) => ({
      company: item.company,
      count: item._count.company,
    }));
  }

  /**
   * Get trending skills from job postings
   * @returns {Promise<Array>} Trending skills
   */
  async getTrendingSkills() {
    // This would require a more complex query to extract skills from JSON arrays
    // For now, return a simple aggregation based on recent jobs
    const recentJobs = await this.model.findMany({
      where: {
        posted_date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        skills: true,
      },
    });

    // Flatten and count skills
    const skillCounts = {};
    recentJobs.forEach((job) => {
      if (job.skills && Array.isArray(job.skills)) {
        job.skills.forEach((skill) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    // Sort by count and return top skills
    return Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([skill, count]) => ({ skill, count }));
  }

  /**
   * Get job statistics
   * @returns {Promise<Object>} Job statistics
   */
  async getStatistics() {
    const [total, recentCount, averageSalary, remoteCount, topCompany] = await Promise.all([
      this.model.count(),
      this.model.count({
        where: {
          posted_date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      this.model.aggregate({
        _avg: {
          salary_max: true,
          salary_min: true,
        },
      }),
      this.model.count({
        where: { is_remote: true },
      }),
      this.model.groupBy({
        by: ['company'],
        _count: { company: true },
        orderBy: {
          _count: { company: 'desc' },
        },
        take: 1,
      }),
    ]);

    return {
      total,
      recent: recentCount,
      averageSalary: {
        min: Math.round(averageSalary._avg.salary_min || 0),
        max: Math.round(averageSalary._avg.salary_max || 0),
      },
      remote: remoteCount,
      remotePercentage: total > 0 ? Math.round((remoteCount / total) * 100) : 0,
      topCompany:
        topCompany.length > 0
          ? {
              name: topCompany[0].company,
              jobCount: topCompany[0]._count.company,
            }
          : null,
    };
  }

  /**
   * Check if job slug exists
   * @param {string} slug - Job slug
   * @param {number} excludeId - ID to exclude from check
   * @returns {Promise<boolean>} True if exists
   */
  async slugExists(slug, excludeId = null) {
    const where = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return await this.exists(where);
  }

  /**
   * Find job by slug
   * @param {string} slug - Job slug
   * @returns {Promise<Object|null>} Job or null
   */
  async findBySlug(slug) {
    return await this.model.findUnique({
      where: { slug },
      include: {
        company: true, // Include all company fields
        location: true, // Include all location fields
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
  }
}

// Export instance
export const jobsRepository = new JobsRepository();
