import { JobsService } from '../../services/jobsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { validationResult } from 'express-validator';

class JobsController {
  constructor() {
    this.jobsService = new JobsService();
  }

  /**
   * Get all jobs with search and filtering
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getJobs(req, reply) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        location = '',
        jobType = '',
        experienceLevel = '',
        minSalary = '',
        maxSalary = '',
        isRemote = '',
        companyName = '',
        skills = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters = {
        search,
        location,
        jobType,
        experienceLevel,
        minSalary: minSalary ? parseInt(minSalary) : undefined,
        maxSalary: maxSalary ? parseInt(maxSalary) : undefined,
        isRemote: isRemote === 'true' ? true : isRemote === 'false' ? false : undefined,
        companyName,
        skills: skills ? skills.split(',').map((skill) => skill.trim()) : undefined,
      };

      // For frontend pagination, fetch all jobs without backend pagination
      const allJobsFilters = { ...filters };
      const result = await this.jobsService.searchJobs(allJobsFilters, 1, 1000, sortBy, sortOrder); // Large limit to get all
      
      // Return only the jobs array, not the paginated structure
      return reply.send(successResponse(result.data, 'Jobs retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get job by ID or slug
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getJobById(req, reply) {
    try {
      const { id } = req.params;
      const job = await this.jobsService.getJobById(id);

      if (!job) {
        return reply.send(errorResponse('Job not found', 404));
      }

      return reply.send(successResponse(job, 'Job retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get job recommendations for user
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getJobRecommendations(req, reply) {
    try {
      const userId = req.user?.id;
      const { limit = 10 } = req.query;

      const recommendations = await this.jobsService.getJobRecommendations(userId, parseInt(limit));

      return reply.send(successResponse(recommendations, 'Job recommendations retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get market insights and analytics
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getMarketInsights(req, reply) {
    try {
      const insights = await this.jobsService.getMarketInsights();
      return reply.send(successResponse(insights, 'Market insights retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Create new job (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async createJob(req, reply) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation failed', 400, errors.array()));
      }

      const jobData = {
        ...req.body,
        postedBy: req.user.id,
      };

      const job = await this.jobsService.createJob(jobData);
      return reply.send(successResponse(job, 'Job created successfully', 201));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Update job (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async updateJob(req, reply) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation failed', 400, errors.array()));
      }

      const { id } = req.params;
      const job = await this.jobsService.updateJob(id, req.body);

      if (!job) {
        return reply.send(errorResponse('Job not found', 404));
      }

      return reply.send(successResponse(job, 'Job updated successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Delete job (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async deleteJob(req, reply) {
    try {
      const { id } = req.params;
      const success = await this.jobsService.deleteJob(id);

      if (!success) {
        return reply.send(errorResponse('Job not found', 404));
      }

      return reply.send(successResponse(null, 'Job deleted successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get jobs statistics (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getJobsStatistics(req, reply) {
    try {
      const stats = await this.jobsService.getJobsStatistics();
      return reply.send(successResponse(stats, 'Jobs statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get featured jobs
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getFeaturedJobs(req, reply) {
    try {
      const { limit = 6 } = req.query;
      const jobs = await this.jobsService.getFeaturedJobs(parseInt(limit));
      return reply.send(successResponse(jobs, 'Featured jobs retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get job categories
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getJobCategories(req, reply) {
    try {
      const categories = await this.jobsService.getJobCategories();
      return reply.send(successResponse(categories, 'Job categories retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Search jobs
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async searchJobs(req, reply) {
    try {
      const { q, location, jobType, experienceLevel, skills, page = 1, limit = 10 } = req.query;

      const filters = {
        search: q,
        location,
        jobType,
        experienceLevel,
        skills: skills ? skills.split(',').map((skill) => skill.trim()) : undefined,
      };

      const result = await this.jobsService.searchJobs(filters, parseInt(page), parseInt(limit));
      return reply.send(successResponse(result, 'Jobs search completed successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get job statistics by ID (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getJobStatistics(req, reply) {
    try {
      const { id } = req.params;
      const stats = await this.jobsService.getJobStatistics(id);
      return reply.send(successResponse(stats, 'Job statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get all jobs statistics (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  async getAllJobsStatistics(req, reply) {
    try {
      const stats = await this.jobsService.getAllJobsStatistics();
      return reply.send(successResponse(stats, 'All jobs statistics retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }
}

export { JobsController };
