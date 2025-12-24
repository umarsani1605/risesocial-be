import { jobsRepository } from '../repositories/jobsRepository.js';
import { linkedInJobSearch } from '../integrations/linkedinJobSearch.js';
import { getLogger } from '../lib/loggerContext.js';

export class JobsService {
  get logger() {
    return getLogger();
  }

  async searchJobs(options = {}) {
    this.logger.info('[jobsService] searchJobs start');
    const result = await jobsRepository.searchJobs(options);
    this.logger.info('[jobsService] searchJobs success');
    return result;
  }

  async getJobById(id) {
    const job = await jobsRepository.findById(id);
    if (!job) throw new Error('Job not found');
    return job;
  }

  async getJobRecommendations(userId, preferences = {}) {
    const userProfile = {
      skills: preferences.skills || [],
      preferredLocation: preferences.location,
      experienceLevel: preferences.experienceLevel,
    };
    const jobs = await jobsRepository.getRecommendations(userProfile, preferences.limit || 10);
    return jobs;
  }

  async createJob(jobData, userId) {
    if (jobData.salary_min && jobData.salary_max && jobData.salary_min > jobData.salary_max) {
      throw new Error('Minimum salary cannot be greater than maximum salary');
    }
    if (jobData.application_deadline && new Date(jobData.application_deadline) < new Date()) {
      throw new Error('Application deadline cannot be in the past');
    }

    if (!jobData.slug) {
      jobData.slug = await this.generateUniqueSlug(jobData.title);
    } else {
      const slugExists = await jobsRepository.slugExists(jobData.slug);
      if (slugExists) throw new Error('Slug is already taken');
    }

    const jobDataWithDefaults = {
      ...jobData,
      posted_date: new Date(),
      application_deadline: jobData.application_deadline ? new Date(jobData.application_deadline) : null,
      created_by: userId,
      skills: Array.isArray(jobData.skills) ? jobData.skills : [],
    };

    const job = await jobsRepository.create(jobDataWithDefaults);
    return job;
  }

  async updateJob(id, updateData) {
    const existingJob = await jobsRepository.findById(id);
    if (!existingJob) throw new Error('Job not found');

    if (updateData.salary_min && updateData.salary_max && updateData.salary_min > updateData.salary_max) {
      throw new Error('Minimum salary cannot be greater than maximum salary');
    }

    if (updateData.slug && updateData.slug !== existingJob.slug) {
      const slugExists = await jobsRepository.slugExists(updateData.slug, id);
      if (slugExists) throw new Error('Slug is already taken');
    }

    if (updateData.posted_date) updateData.posted_date = new Date(updateData.posted_date);
    if (updateData.valid_until) updateData.valid_until = new Date(updateData.valid_until);

    const { company, location, ...jobUpdateData } = updateData;
    const job = await jobsRepository.updateWithRelations(id, jobUpdateData, company, location);
    return job;
  }

  async deleteJob(id) {
    const job = await jobsRepository.findById(id);
    if (!job) throw new Error('Job not found');
    await jobsRepository.delete(id);
  }

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

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  async getFeaturedJobs(limit = 6) {
    this.logger.info('[jobsService] getFeaturedJobs start');
    const options = {
      page: 1,
      limit: limit,
      sortBy: 'postedDate',
      sortOrder: 'desc',
    };
    const result = await this.searchJobs(options);
    this.logger.info('[jobsService] getFeaturedJobs success');
    return result.data;
  }

  async getJobCategories() {
    this.logger.info('[jobsService] getJobCategories start');
    const categories = await jobsRepository.model.findMany({
      select: { employment_type: true },
      distinct: ['employment_type'],
      where: { status: 'active' },
      orderBy: { employment_type: 'asc' },
    });
    const uniqueCategories = categories
      .map((job) => job.employment_type)
      .filter(Boolean)
      .sort();
    this.logger.info('[jobsService] getJobCategories success');
    return uniqueCategories;
  }

  async syncJobsFromLinkedIn(options = {}) {
    try {
      this.logger.info('[jobsService] sync start');
      const searchResult = await linkedInJobSearch.searchJobs(options);

      if (!searchResult.success) {
        throw new Error(searchResult.error || 'Failed to fetch data from LinkedIn');
      }

      const linkedinJobs = searchResult.jobs;

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

        let companyId;
        const existingCompany = await jobsRepository.findCompanyBySlug(linkedinJob.linkedin_org_slug);

        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const newCompany = await jobsRepository.createCompanyFromLinkedIn(linkedinJob);
          companyId = newCompany.id;
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
        const result = await jobsRepository.createManyJobs(jobsToSave);
        savedCount = result.count || jobsToSave.length;

        try {
          const linkedinIds = linkedinJobs.map((j) => j.id);
          const savedJobs = await jobsRepository.findJobsByLinkedInIds(linkedinIds);

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
          }
        } catch (aiErr) {
          this.logger.error({ err: aiErr }, '[jobsService] save AI insights failed');
        }
      }

      this.logger.info('[jobsService] sync done');
      return {
        success: true,
        message: 'LinkedIn sync successful',
        totalJobs: linkedinJobs.length,
        savedJobs: savedCount,
        skippedJobs: skippedCount,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[jobsService] sync failed');
      throw error;
    }
  }

  async getCompanies(options = {}) {
    this.logger.info('[jobsService] getCompanies start');
    try {
      const result = await jobsRepository.searchCompanies(options);
      this.logger.info('[jobsService] getCompanies success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[jobsService] getCompanies error');
      throw error;
    }
  }
}

export const jobsService = new JobsService();
