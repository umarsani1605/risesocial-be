import { jobsRepository } from '../repositories/jobsRepository.js';
import { linkedInJobSearch } from '../integrations/linkedinJobSearch.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Jobs business logic service
 * Handles job search, recommendations, and management
 */
export class JobsService {
  get logger() {
    return getLogger();
  }
  /**
   * Search jobs with full-text search and filtering
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results with enhanced data
   */
  async searchJobs(options = {}) {
    this.logger.info({ options }, '[jobsService] searchJobs start');

    const result = await jobsRepository.searchJobs(options);

    this.logger.info({ count: result.data.length }, '[jobsService] searchJobs result');

    return result;
  }

  /**
   * Get job by slug
   * @param {string} slug - Job slug
   * @returns {Promise<Object>} Job details
   * @throws {Error} If job not found
   */
  async getJobBySlug(slug) {
    const job = await jobsRepository.findBySlug(slug);

    if (!job) {
      const error = new Error(`Job with slug '${slug}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return job;
  }

  /**
   * Get job by ID
   * @param {number} id - Job ID
   * @returns {Promise<Object>} Job details
   * @throws {Error} If job not found
   */
  async getJobById(id) {
    const job = await jobsRepository.findById(id);

    if (!job) {
      const error = new Error(`Job with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return job;
  }

  /**
   * Get job recommendations for a user
   * @param {number} userId - User ID (for future user profile integration)
   * @param {Object} preferences - User preferences
   * @returns {Promise<Array>} Recommended jobs
   */
  async getJobRecommendations(userId, preferences = {}) {
    // For now, use simple preferences matching
    // In the future, this could integrate with user profile and ML algorithms
    const userProfile = {
      skills: preferences.skills || [],
      preferredLocation: preferences.location,
      experienceLevel: preferences.experienceLevel,
    };

    const jobs = await jobsRepository.getRecommendations(userProfile, preferences.limit || 10);
    return jobs;
  }

  /**
   * Create new job posting (Admin only)
   * @param {Object} jobData - Job data
   * @param {number} userId - Creator user ID
   * @returns {Promise<Object>} Created job
   * @throws {Error} If validation fails
   */
  async createJob(jobData, userId) {
    // Validate job data
    await this.validateJobData(jobData);

    // Generate slug if not provided
    if (!jobData.slug) {
      jobData.slug = await this.generateUniqueSlug(jobData.title);
    } else {
      // Validate slug format and uniqueness
      this.validateSlug(jobData.slug);
      const slugExists = await jobsRepository.slugExists(jobData.slug);
      if (slugExists) {
        const error = new Error('Job with this slug already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    // Set defaults and metadata
    const jobDataWithDefaults = {
      ...jobData,
      posted_date: new Date(),
      application_deadline: jobData.application_deadline ? new Date(jobData.application_deadline) : null,
      created_by: userId,
      // Ensure skills is an array
      skills: Array.isArray(jobData.skills) ? jobData.skills : [],
    };

    const job = await jobsRepository.create(jobDataWithDefaults);
    return job;
  }

  /**
   * Update job by ID
   * @param {number} id - Job ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated job
   * @throws {Error} If job not found or validation fails
   */
  async updateJob(id, updateData) {
    // Check if job exists
    const existingJob = await jobsRepository.findById(id);
    if (!existingJob) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate update data
    if (updateData.title || updateData.description) {
      await this.validateJobData(updateData, true);
    }

    // Handle slug update
    if (updateData.slug && updateData.slug !== existingJob.slug) {
      this.validateSlug(updateData.slug);
      const slugExists = await jobsRepository.slugExists(updateData.slug, id);
      if (slugExists) {
        const error = new Error('Job with this slug already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    // Handle date fields
    if (updateData.posted_date) {
      updateData.posted_date = new Date(updateData.posted_date);
    }
    if (updateData.valid_until) {
      updateData.valid_until = new Date(updateData.valid_until);
    }

    // Extract nested objects for separate handling
    const { company, location, ...jobUpdateData } = updateData;

    // Update job with nested objects
    const job = await jobsRepository.updateWithRelations(id, jobUpdateData, company, location);
    return job;
  }

  /**
   * Delete job by ID
   * @param {number} id - Job ID
   * @returns {Promise<void>}
   * @throws {Error} If job not found
   */
  async deleteJob(id) {
    const job = await jobsRepository.findById(id);
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    await jobsRepository.delete(id);
  }

  /**
   * Validate job data
   * @private
   * @param {Object} data - Job data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @throws {Error} If validation fails
   */
  async validateJobData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate && !data.title) {
      errors.push('Title is required');
    }

    if (data.title && data.title.length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (data.title && data.title.length > 255) {
      errors.push('Title must not exceed 255 characters');
    }

    if (!isUpdate && !data.description) {
      errors.push('Description is required');
    }

    if (data.description && data.description.length < 50) {
      errors.push('Description must be at least 50 characters long');
    }

    if (!isUpdate && !data.company) {
      errors.push('Company is required');
    }

    if (!isUpdate && !data.location) {
      errors.push('Location is required');
    }

    if (data.salary_min && data.salary_max && data.salary_min > data.salary_max) {
      errors.push('Minimum salary cannot be greater than maximum salary');
    }

    if (data.application_deadline) {
      const deadline = new Date(data.application_deadline);
      if (deadline < new Date()) {
        errors.push('Application deadline cannot be in the past');
      }
    }

    if (data.job_type && !this.isValidJobType(data.job_type)) {
      errors.push('Invalid job type');
    }

    if (data.experience_level && !this.isValidExperienceLevel(data.experience_level)) {
      errors.push('Invalid experience level');
    }

    if (data.slug) {
      this.validateSlug(data.slug);
    }

    if (errors.length > 0) {
      const error = new Error(errors.join(', '));
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Generate unique slug from title
   * @private
   * @param {string} title - Job title
   * @returns {Promise<string>} Unique slug
   */
  async generateUniqueSlug(title) {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    let slug = baseSlug;
    let counter = 1;

    while (await jobsRepository.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Validate slug format
   * @private
   * @param {string} slug - Slug to validate
   * @throws {Error} If slug is invalid
   */
  validateSlug(slug) {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      const error = new Error('Slug can only contain lowercase letters, numbers, and hyphens');
      error.statusCode = 400;
      throw error;
    }

    if (slug.length < 3 || slug.length > 100) {
      const error = new Error('Slug must be between 3 and 100 characters long');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Check if job type is valid
   * @private
   * @param {string} jobType - Job type to validate
   * @returns {boolean} Is valid job type
   */
  isValidJobType(jobType) {
    const validTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'temporary'];
    return validTypes.includes(jobType.toLowerCase());
  }

  /**
   * Check if experience level is valid
   * @private
   * @param {string} experienceLevel - Experience level to validate
   * @returns {boolean} Is valid experience level
   */
  isValidExperienceLevel(experienceLevel) {
    const validLevels = ['entry-level', 'junior', 'mid-level', 'senior', 'lead', 'executive'];
    return validLevels.includes(experienceLevel.toLowerCase());
  }

  /**
   * Generate slug from title
   * @private
   * @param {string} title - Job title
   * @returns {string} Generated slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Get featured jobs (using regular search with limit)
   * @param {number} limit - Number of featured jobs to return
   * @returns {Promise<Array>} Featured jobs
   */
  async getFeaturedJobs(limit = 6) {
    this.logger.info({ limit }, '[jobsService] getFeaturedJobs start');

    const options = {
      page: 1,
      limit: limit,
      sortBy: 'postedDate',
      sortOrder: 'desc',
    };

    const result = await this.searchJobs(options);

    this.logger.info({ count: result.data.length }, '[jobsService] getFeaturedJobs result');
    return result.data;
  }

  /**
   * Get job categories (distinct employment types)
   * @returns {Promise<Array>} Array of unique job categories
   */
  async getJobCategories() {
    this.logger.info('[jobsService] getJobCategories start');

    const categories = await jobsRepository.model.findMany({
      select: {
        employment_type: true,
      },
      distinct: ['employment_type'],
      where: {
        status: 'active',
      },
      orderBy: {
        employment_type: 'asc',
      },
    });

    const uniqueCategories = categories
      .map((job) => job.employment_type)
      .filter(Boolean)
      .sort();

    this.logger.info({ categories: uniqueCategories }, '[jobsService] getJobCategories result');
    return uniqueCategories;
  }

  /**
   * Sync jobs from LinkedIn API to database
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync results
   */
  async syncJobsFromLinkedIn(options = {}) {
    try {
      this.logger.info({ options }, '[jobsService] sync start');
      this.logger.info('[jobsService] call linkedinJobSearch.manualSync');

      const searchResult = await linkedInJobSearch.searchJobs(options);

      this.logger.info({ searchResult }, '[jobsService] searchResult');

      if (!searchResult.success) {
        throw new Error(searchResult.error || 'Failed to fetch jobs from LinkedIn');
      }

      const linkedinJobs = searchResult.jobs;
      this.logger.info({ total: linkedinJobs.length, success: searchResult.success }, '[jobsService] linkedinJobs');

      if (linkedinJobs.length === 0) {
        return {
          success: true,
          message: 'No jobs found from LinkedIn',
          totalJobs: 0,
          savedJobs: 0,
          skippedJobs: 0,
        };
      }

      const jobsToSave = [];
      let skippedCount = 0;

      for (const linkedinJob of linkedinJobs) {
        const existingJob = await jobsRepository.findJobByLinkedInId(linkedinJob.id);

        if (existingJob) {
          skippedCount++;
          continue;
        }

        let locationId = null;
        {
          const locationData = {
            city: linkedinJob.cities_derived?.[0],
            region: linkedinJob.regions_derived?.[0],
            country: linkedinJob.countries_derived?.[0],
            latitude: linkedinJob.lats_derived?.[0],
            longitude: linkedinJob.lngs_derived?.[0],
            timezone: linkedinJob.timezones_derived?.[0],
            raw_location_data: linkedinJob.locations_raw?.[0],
            is_remote: linkedinJob.remote_derived,
          };

          if (locationData.city || locationData.region || locationData.country || locationData.latitude || locationData.longitude) {
            const existingLocation = await jobsRepository.findLocationByDetails(locationData);
            if (existingLocation) {
              locationId = existingLocation.id;
            } else {
              const newLocation = await jobsRepository.createLocation(locationData);
              locationId = newLocation.id;
            }
          }
        }

        // Find or create company from LinkedIn data
        let companyId;
        const existingCompany = await jobsRepository.findCompanyBySlug(linkedinJob.linkedin_org_slug);

        if (existingCompany) {
          companyId = existingCompany.id;
          this.logger.debug({ companyId, organization: linkedinJob.organization }, '[jobsService] using existing company');
        } else {
          const newCompany = await jobsRepository.createCompanyFromLinkedIn(linkedinJob);
          companyId = newCompany.id;
          this.logger.info({ companyId, organization: linkedinJob.organization }, '[jobsService] created new company from LinkedIn data');
        }

        const jobData = {
          title: linkedinJob.title,
          slug: this.generateSlug(linkedinJob.title),
          company_id: companyId,
          location_id: locationId,
          linkedin_job_id: linkedinJob.id,
          external_url: linkedinJob.url,
          posted_date: new Date(linkedinJob.date_posted),
          valid_until: linkedinJob.date_validthrough ? new Date(linkedinJob.date_validthrough) : null,
          employment_type: linkedinJob.employment_type?.[0] || 'FULL_TIME',
          seniority_level: linkedinJob.seniority || 'MID_LEVEL',
          description: linkedinJob.description_text || '',
          salary_raw: linkedinJob.salary_raw ? JSON.stringify(linkedinJob.salary_raw) : null,
          location_requirements_raw: linkedinJob.location_requirements_raw ? JSON.stringify(linkedinJob.location_requirements_raw) : null,
          source_type: 'jobboard',
          source: 'linkedin',
          source_domain: linkedinJob.source_domain,
          source_url: linkedinJob.url,
          direct_apply: linkedinJob.directapply || false,
          status: 'active',
          api_created_at: new Date(),
        };

        jobsToSave.push(jobData);
      }

      let savedCount = 0;

      if (jobsToSave.length > 0) {
        this.logger.info({ toSave: jobsToSave.length, skipped: skippedCount }, '[jobsService] persisting jobs');

        const result = await jobsRepository.createManyJobs(jobsToSave);

        this.logger.info({ result }, '[jobsService] createMany result');

        savedCount = result.count || jobsToSave.length;

        // Persist AI insights for newly saved jobs
        try {
          const linkedinIds = linkedinJobs.map((j) => j.id);
          const savedJobs = await jobsRepository.findJobsByLinkedInIds(linkedinIds);
          let aiSaved = 0;

          for (const lj of linkedinJobs) {
            const job = savedJobs.find((sj) => sj.linkedin_job_id === String(lj.id) || sj.linkedin_job_id === lj.id);
            if (!job) continue;

            const aiPayload = {
              ai_salary_currency: lj.ai_salary_currency,
              ai_salary_value: lj.ai_salary_value,
              ai_salary_min_value: lj.ai_salary_minvalue,
              ai_salary_max_value: lj.ai_salary_maxvalue,
              ai_salary_unit_text: lj.ai_salary_unittext,
              ai_benefits: lj.ai_benefits,
              ai_experience_level: lj.ai_experience_level,
              ai_work_arrangement: lj.ai_work_arrangement,
              ai_work_arrangement_days: lj.ai_work_arrangement_office_days,
              ai_remote_location: lj.ai_remote_location,
              ai_remote_location_derived: lj.ai_remote_location_derived,
              ai_key_skills: lj.ai_key_skills,
              ai_core_responsibilities: lj.ai_core_responsibilities,
              ai_requirements_summary: lj.ai_requirements_summary,
              ai_working_hours: lj.ai_working_hours ? String(lj.ai_working_hours) : null,
              ai_job_language: lj.ai_job_language,
              ai_visa_sponsorship: lj.ai_visa_sponsorship,
              ai_hiring_manager_name: lj.ai_hiring_manager_name,
              ai_hiring_manager_email: lj.ai_hiring_manager_email_address,
            };

            const hasAny = Object.values(aiPayload).some((v) => v !== null && v !== undefined);
            if (!hasAny) continue;

            await jobsRepository.createJobAIInsights({ job_id: job.id, ...aiPayload });
            aiSaved++;
          }

          this.logger.info({ aiSaved }, '[jobsService] AI insights saved');
        } catch (aiErr) {
          this.logger.error({ err: aiErr }, '[jobsService] save AI insights failed');
        }
      }

      this.logger.info({ totalJobs: linkedinJobs.length, saved: savedCount, skipped: skippedCount }, '[jobsService] sync done');

      return {
        success: true,
        message: 'LinkedIn sync completed successfully',
        totalJobs: linkedinJobs.length,
        savedJobs: savedCount,
        skippedJobs: skippedCount,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[jobsService] sync failed');
      throw error;
    }
  }

  /**
   * Get companies with filtering and pagination
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Object>} Paginated companies with metadata
   */
  async getCompanies(options = {}) {
    this.logger.info({ options }, '[jobsService] getCompanies start');
    try {
      const result = await jobsRepository.searchCompanies(options);
      this.logger.info({ count: result.data.length }, '[jobsService] getCompanies success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[jobsService] getCompanies error');
      throw error;
    }
  }
}

export const jobsService = new JobsService();
