import { jobsRepository } from '../repositories/jobsRepository.js';

/**
 * Jobs business logic service
 * Handles job search, recommendations, and management
 */
export class JobsService {
  /**
   * Search jobs with full-text search and filtering
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results with enhanced data
   */
  async searchJobs(options = {}) {
    const result = await jobsRepository.searchJobs(options);

    // Enhance each job with computed fields
    result.data = result.data.map((job) => this.enhanceJob(job));

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

    return this.enhanceJobDetails(job);
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
    return jobs.map((job) => this.enhanceJob(job));
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
    return this.enhanceJob(job);
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
    if (updateData.application_deadline) {
      updateData.application_deadline = new Date(updateData.application_deadline);
    }

    // Ensure skills is an array
    if (updateData.skills) {
      updateData.skills = Array.isArray(updateData.skills) ? updateData.skills : [];
    }

    const job = await jobsRepository.update(id, updateData);
    return this.enhanceJob(job);
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
   * Get popular job categories
   * @returns {Promise<Array>} Popular categories
   */
  async getPopularCategories() {
    return await jobsRepository.getPopularCategories();
  }

  /**
   * Get popular locations
   * @returns {Promise<Array>} Popular locations
   */
  async getPopularLocations() {
    return await jobsRepository.getPopularLocations();
  }

  /**
   * Get popular companies
   * @returns {Promise<Array>} Popular companies
   */
  async getPopularCompanies() {
    return await jobsRepository.getPopularCompanies();
  }

  /**
   * Get trending skills
   * @returns {Promise<Array>} Trending skills
   */
  async getTrendingSkills() {
    return await jobsRepository.getTrendingSkills();
  }

  /**
   * Get job statistics
   * @returns {Promise<Object>} Job statistics
   */
  async getStatistics() {
    return await jobsRepository.getStatistics();
  }

  /**
   * Get job market insights
   * @returns {Promise<Object>} Market insights
   */
  async getMarketInsights() {
    const [statistics, popularCategories, popularLocations, trendingSkills, popularCompanies] = await Promise.all([
      this.getStatistics(),
      this.getPopularCategories(),
      this.getPopularLocations(),
      this.getTrendingSkills(),
      this.getPopularCompanies(),
    ]);

    return {
      overview: statistics,
      categories: popularCategories.slice(0, 10),
      locations: popularLocations.slice(0, 10),
      skills: trendingSkills.slice(0, 15),
      companies: popularCompanies.slice(0, 15),
    };
  }

  /**
   * Enhance job object with computed fields
   * @private
   * @param {Object} job - Raw job data
   * @returns {Object} Enhanced job
   */
  enhanceJob(job) {
    const now = new Date();
    const postedDate = new Date(job.posted_date);
    const daysSincePosted = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));

    return {
      ...job,
      // Add computed fields
      daysSincePosted,
      isRecent: daysSincePosted <= 7,
      isExpiringSoon: job.application_deadline ? Math.floor((new Date(job.application_deadline) - now) / (1000 * 60 * 60 * 24)) <= 3 : false,
      applicationCount: job._count?.applications || 0,
      salaryRange: this.formatSalaryRange(job.salary_min, job.salary_max),
      formattedSalary: {
        min: job.salary_min ? this.formatCurrency(job.salary_min) : null,
        max: job.salary_max ? this.formatCurrency(job.salary_max) : null,
      },
      relativePostedDate: this.getRelativeDate(postedDate),
      skillsCount: job.skills ? job.skills.length : 0,
      isHighPaying: job.salary_max && job.salary_max > 15000000, // 15M IDR
      workType: job.is_remote ? 'Remote' : 'On-site',
    };
  }

  /**
   * Enhance job details with additional computed fields
   * @private
   * @param {Object} job - Raw job data
   * @returns {Object} Enhanced job details
   */
  enhanceJobDetails(job) {
    const enhanced = this.enhanceJob(job);

    return {
      ...enhanced,
      // Additional detail-specific enhancements
      descriptionWordCount: job.description ? job.description.split(' ').length : 0,
      estimatedReadTime: job.description
        ? Math.ceil(job.description.split(' ').length / 200) // 200 words per minute
        : 0,
      similarJobsQuery: this.generateSimilarJobsQuery(job),
    };
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
   * Format salary range
   * @private
   * @param {number} min - Minimum salary
   * @param {number} max - Maximum salary
   * @returns {string} Formatted salary range
   */
  formatSalaryRange(min, max) {
    if (!min && !max) return 'Salary not specified';
    if (!min) return `Up to ${this.formatCurrency(max)}`;
    if (!max) return `From ${this.formatCurrency(min)}`;
    if (min === max) return this.formatCurrency(min);
    return `${this.formatCurrency(min)} - ${this.formatCurrency(max)}`;
  }

  /**
   * Format currency to IDR
   * @private
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Get relative date string
   * @private
   * @param {Date} date - Date to format
   * @returns {string} Relative date string
   */
  getRelativeDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  /**
   * Generate query for finding similar jobs
   * @private
   * @param {Object} job - Job object
   * @returns {Object} Query object for similar jobs
   */
  generateSimilarJobsQuery(job) {
    return {
      skills: job.skills || [],
      location: job.location,
      jobType: job.job_type,
      experienceLevel: job.experience_level,
      excludeId: job.id,
    };
  }
}

// Export instance
export const jobsService = new JobsService();
