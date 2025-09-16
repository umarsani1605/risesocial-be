import prisma from '../lib/prisma.js';
import { BaseRepository } from './base/BaseRepository.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Jobs repository for data access operations
 * Includes full-text search and advanced filtering
 */
export class JobsRepository extends BaseRepository {
  constructor() {
    super(prisma.job);
  }

  get logger() {
    return getLogger();
  }

  /**
   * Full-text search jobs with advanced filtering
   * @param {Object} options - Search and filter options
   * @returns {Promise<Object>} Paginated result with data and meta
   */
  async searchJobs(options = {}) {
    this.logger.info({ options }, '[jobsRepository] searchJobs start');

    const {
      page = 1,
      limit = 20,
      query,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      company,
      companySlug,
      jobSlug,
      skills,
      isRemote,
      sortBy = 'postedDate',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { skills: { has: query } },
        { location: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (jobType && jobType !== 'all') {
      where.job_type = jobType;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      where.experience_level = experienceLevel;
    }

    if (salaryMin || salaryMax) {
      where.salary_min = {};
      if (salaryMin) where.salary_min.gte = Number(salaryMin);
      if (salaryMax) where.salary_max = { lte: Number(salaryMax) };
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    if (companySlug) {
      where.company = {
        slug: companySlug,
      };
    }

    if (jobSlug) {
      where.slug = jobSlug;
    }

    if (skills && Array.isArray(skills) && skills.length > 0) {
      where.AND = skills.map((skill) => ({
        skills: { array_contains: skill },
      }));
    }

    if (isRemote !== undefined) {
      where.is_remote = Boolean(isRemote);
    }

    const orderBy = { created_at: sortOrder };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          company: true,
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
            },
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

    this.logger.info({ data, total }, '[jobsRepository] searchJobs result');

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
          companySlug,
          jobSlug,
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

    if (skills.length > 0) {
      where.OR = skills.map((skill) => ({
        skills: { array_contains: skill },
      }));
    }

    if (preferredLocation) {
      where.location = { contains: preferredLocation, mode: 'insensitive' };
    }

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

  /**
   * Find job by ID
   * @param {number} id - Job ID
   * @returns {Promise<Object|null>} Job or null
   */
  async findById(id) {
    return await this.model.findUnique({
      where: { id },
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

  /**
   * Find job by LinkedIn job ID
   * @param {string} linkedinJobId - LinkedIn job ID
   * @returns {Promise<Object|null>} Job or null
   */
  async findJobByLinkedInId(linkedinJobId) {
    this.logger.debug({ linkedinJobId }, '[jobsRepository] findJobByLinkedInId');
    const job = await this.model.findFirst({
      where: { linkedin_job_id: linkedinJobId },
    });
    this.logger.debug({ found: !!job }, '[jobsRepository] findJobByLinkedInId result');
    return job;
  }

  /**
   * Create multiple jobs in batch
   * @param {Array} jobsData - Array of job data
   * @returns {Promise<Array>} Created jobs
   */
  async createManyJobs(jobsData) {
    this.logger.info({ size: jobsData.length }, '[jobsRepository] createManyJobs');
    return await this.model.createMany({
      data: jobsData,
      skipDuplicates: true, // Skip if linkedin_job_id already exists
    });
  }

  /**
   * Find location by details
   * @param {Object} locationData - Location data
   * @returns {Promise<Object|null>} Location or null
   */
  async findLocationByDetails(locationData) {
    const { city, region, country } = locationData;
    this.logger.debug({ city, region, country }, '[jobsRepository] findLocation');
    return await prisma.jobLocation.findFirst({
      where: {
        city: city,
        region: region,
        country: country,
      },
    });
  }

  /**
   * Create new location
   * @param {Object} locationData - Location data
   * @returns {Promise<Object>} Created location
   */
  async createLocation(locationData) {
    this.logger.debug({ locationData }, '[jobsRepository] createLocation');
    return await prisma.jobLocation.create({
      data: locationData,
    });
  }

  /**
   * Search companies with filtering and pagination
   * @param {Object} options - Search and filter options
   * @returns {Promise<Object>} Paginated result with data and meta
   */
  async searchCompanies(options = {}) {
    this.logger.info({ options }, '[jobsRepository] searchCompanies start');

    const { page = 1, limit = 20, slug, name, headquarters, industry, linkedinSize, search, sortBy = 'name', sortOrder = 'asc' } = options;

    const skip = (page - 1) * limit;
    const where = {};

    // Search across multiple fields
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { headquarters: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Exact match filters
    if (slug) {
      where.slug = slug;
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (headquarters) {
      where.headquarters = { contains: headquarters, mode: 'insensitive' };
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }

    if (linkedinSize) {
      where.linkedin_size = { contains: linkedinSize, mode: 'insensitive' };
    }

    // Sort options
    let orderBy = {};
    switch (sortBy) {
      case 'created_at':
        orderBy = { created_at: sortOrder };
        break;
      case 'linkedin_employees':
        orderBy = { linkedin_employees: sortOrder };
        break;
      case 'linkedin_followers':
        orderBy = { linkedin_followers: sortOrder };
        break;
      case 'name':
      default:
        orderBy = { name: sortOrder };
        break;
    }

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          _count: {
            select: {
              jobs: {
                where: {
                  status: 'active',
                },
              },
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    this.logger.info({ data, total }, '[jobsRepository] searchCompanies result');

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
        searchQuery: search || null,
        appliedFilters: {
          slug,
          name,
          headquarters,
          industry,
          linkedinSize,
        },
      },
    };
  }
}

// Export instance
export const jobsRepository = new JobsRepository();
