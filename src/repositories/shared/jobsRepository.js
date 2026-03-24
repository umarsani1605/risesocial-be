import prisma from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

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
      page,
      limit,
      query,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      company,
      companySlug,
      jobSlug,
      industry,
      skills,
      isRemote,
      featured,
      status,
      sortBy = 'postedDate',
      sortOrder = 'desc',
    } = options;

    // Only apply pagination if both page and limit are provided
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? Number(limit) : undefined;

    const where = {};

    // Status filter - default to 'active' for public API
    if (status) {
      where.status = status;
    } else {
      where.status = 'active';
    }

    // Featured filter
    if (featured !== undefined) {
      where.featured = Boolean(featured);
    }

    // Full-text search across multiple fields
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { company: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    // Location filter - search in related location table
    if (location && location !== 'all') {
      if (location.toLowerCase() === 'remote') {
        where.location = { is_remote: true };
      } else {
        where.location = {
          OR: [
            { city: { contains: location, mode: 'insensitive' } },
            { region: { contains: location, mode: 'insensitive' } },
            { country: { contains: location, mode: 'insensitive' } },
          ],
        };
      }
    }

    // Job type filter (employment_type in schema)
    if (jobType && jobType !== 'all') {
      where.employment_type = { equals: jobType, mode: 'insensitive' };
    }

    if (experienceLevel && experienceLevel !== 'all') {
      where.seniority_level = { contains: experienceLevel, mode: 'insensitive' };
    }

    if (salaryMin || salaryMax) {
      where.salary_min = {};
      if (salaryMin) where.salary_min.gte = Number(salaryMin);
      if (salaryMax) where.salary_max = { lte: Number(salaryMax) };
    }

    // Company name filter
    if (company) {
      where.company = { name: { contains: company, mode: 'insensitive' } };
    }

    // Company slug filter (exact match)
    if (companySlug) {
      where.company = {
        ...where.company,
        slug: companySlug,
      };
    }

    // Job slug filter (exact match)
    if (jobSlug) {
      where.slug = jobSlug;
    }

    // Industry filter - search in related company table
    if (industry && industry !== 'all') {
      where.company = {
        ...where.company,
        industry: { contains: industry, mode: 'insensitive' },
      };
    }

    if (skills && Array.isArray(skills) && skills.length > 0) {
      where.AND = skills.map((skill) => ({
        skills: { array_contains: skill },
      }));
    }

    if (isRemote !== undefined) {
      where.location = {
        ...where.location,
        is_remote: Boolean(isRemote),
      };
    }

    // Sort options
    let orderBy = { created_at: sortOrder };
    if (sortBy === 'postedDate') {
      orderBy = { posted_date: sortOrder };
    } else if (sortBy === 'title') {
      orderBy = { title: sortOrder };
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
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

    // Return meta only if pagination was requested
    const result = { data };
    if (page && limit) {
      result.meta = {
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
          featured,
          status,
        },
      };
    }

    return result;
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
    return await this.model.findFirst({
      where: { slug },
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

  async findById(id) {
    return await this.model.findUnique({
      where: { id },
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
      skipDuplicates: true,
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

  async findCompanyById(id) {
    this.logger.debug({ id }, '[jobsRepository] findCompanyById');
    return await prisma.company.findUnique({
      where: { id },
    });
  }

  async findCompanyBySlug(slug) {
    this.logger.debug({ slug }, '[jobsRepository] findCompanyBySlug');
    return await prisma.company.findUnique({
      where: { slug },
    });
  }

  async findCompanyByName(name) {
    this.logger.debug({ name }, '[jobsRepository] findCompanyByName');
    return await prisma.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  async createCompany(data) {
    this.logger.debug({ name: data.name }, '[jobsRepository] createCompany');
    return await prisma.company.create({ data });
  }

  async createCompanyFromLinkedIn(linkedinJob) {
    this.logger.info({ organization: linkedinJob.organization }, '[jobsRepository] createCompanyFromLinkedIn');

    const companyData = {
      name: linkedinJob.organization,
      slug: linkedinJob.linkedin_org_slug,
      logo_url: linkedinJob.organization_logo,
      website_url: linkedinJob.linkedin_org_url,
      industry: linkedinJob.linkedin_org_industry,
      headquarters: linkedinJob.linkedin_org_headquarters,
      description: linkedinJob.linkedin_org_description,

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

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { headquarters: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

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

export const jobsRepository = new JobsRepository();
