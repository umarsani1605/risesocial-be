import prisma from '../lib/prisma.js';
import { BaseRepository } from './base/BaseRepository.js';
import { getLogger } from '../lib/loggerContext.js';

export class JobsRepository extends BaseRepository {
  constructor() {
    super(prisma.job);
  }

  get logger() {
    return getLogger();
  }

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

  async slugExists(slug, excludeId = null) {
    const where = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return await this.exists(where);
  }

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

  async findJobByLinkedInId(linkedinJobId) {
    this.logger.debug({ linkedinJobId }, '[jobsRepository] findJobByLinkedInId');
    const job = await this.model.findFirst({
      where: { linkedin_job_id: linkedinJobId },
    });
    this.logger.debug({ found: !!job }, '[jobsRepository] findJobByLinkedInId result');
    return job;
  }

  async createManyJobs(jobsData) {
    this.logger.info({ size: jobsData.length }, '[jobsRepository] createManyJobs');
    return await this.model.createMany({
      data: jobsData,
      skipDuplicates: true, // Skip if linkedin_job_id already exists
    });
  }

  async findJobsByLinkedInIds(linkedinIds) {
    this.logger.debug({ size: linkedinIds?.length }, '[jobsRepository] findJobsByLinkedInIds');
    const ids = (linkedinIds || []).map((v) => String(v));
    return await this.model.findMany({
      where: { linkedin_job_id: { in: ids } },
      select: { id: true, linkedin_job_id: true },
    });
  }

  async createJobAIInsights(data) {
    this.logger.debug({ job_id: data.job_id }, '[jobsRepository] createJobAIInsights');
    return await prisma.jobAIInsights.create({
      data,
    });
  }

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

  async createLocation(locationData) {
    this.logger.debug({ locationData }, '[jobsRepository] createLocation');
    return await prisma.jobLocation.create({
      data: locationData,
    });
  }
  async findCompanyBySlug(slug) {
    this.logger.debug({ slug }, '[jobsRepository] findCompanyBySlug');
    return await prisma.company.findUnique({
      where: { slug },
    });
  }

  async createCompanyFromLinkedIn(linkedinJob) {
    this.logger.info({ organization: linkedinJob.organization }, '[jobsRepository] createCompanyFromLinkedIn');

    const companyData = {
      // Core fields
      name: linkedinJob.organization,
      slug: linkedinJob.linkedin_org_slug,
      logo_url: linkedinJob.organization_logo,
      website_url: linkedinJob.linkedin_org_url,
      industry: linkedinJob.linkedin_org_industry,
      headquarters: linkedinJob.linkedin_org_headquarters,
      description: linkedinJob.linkedin_org_description,

      // LinkedIn specific fields
      linkedin_url: linkedinJob.organization_url,
      linkedin_slug: linkedinJob.linkedin_org_slug,
      linkedin_employees: linkedinJob.linkedin_org_employees,
      linkedin_size: linkedinJob.linkedin_org_size,
      linkedin_slogan: linkedinJob.linkedin_org_slogan,
      linkedin_followers: linkedinJob.linkedin_org_followers,
      linkedin_type: linkedinJob.linkedin_org_type,
      linkedin_founded_date: linkedinJob.linkedin_org_foundeddate,
      linkedin_specialties: linkedinJob.linkedin_org_specialties,
      linkedin_locations: linkedinJob.linkedin_org_locations,
      linkedin_is_recruitment_agency: linkedinJob.linkedin_org_recruitment_agency_derived,
    };

    return await prisma.company.create({
      data: companyData,
    });
  }

  async updateWithRelations(id, jobData, companyData, locationData) {
    this.logger.info({ id, jobData, companyData, locationData }, '[jobsRepository] updateWithRelations start');

    return await prisma.$transaction(async (tx) => {
      // Update company if provided
      if (companyData && Object.keys(companyData).length > 0) {
        const existingJob = await tx.job.findUnique({
          where: { id },
          include: { company: true },
        });

        if (existingJob?.company) {
          await tx.company.update({
            where: { id: existingJob.company.id },
            data: companyData,
          });
        }
      }

      // Update location if provided
      if (locationData && Object.keys(locationData).length > 0) {
        const existingJob = await tx.job.findUnique({
          where: { id },
          include: { location: true },
        });

        if (existingJob?.location) {
          await tx.jobLocation.update({
            where: { id: existingJob.location.id },
            data: locationData,
          });
        }
      }

      // Update job
      const updatedJob = await tx.job.update({
        where: { id },
        data: jobData,
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

      this.logger.info({ updatedJob }, '[jobsRepository] updateWithRelations success');
      return updatedJob;
    });
  }

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
