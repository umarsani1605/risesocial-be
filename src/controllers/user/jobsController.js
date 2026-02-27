import { JobsService } from '../../services/jobsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User Jobs Controller
 * Handles job browsing, search, and viewing for regular users
 */
class JobsController {
  constructor() {
    this.jobsService = new JobsService();
  }

  /**
   * Get all jobs with search and filtering (User accessible)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getJobs = async (req, reply) => {
    req.log.info('[userJobsController] getJobs start');
    req.log.debug({ query: req.query }, '[userJobsController] rawQuery');
    try {
      const {
        page = 1,
        limit = 1000,
        search = '',
        location = '',
        jobType = '',
        experienceLevel = '',
        minSalary = '',
        maxSalary = '',
        isRemote = '',
        companyName = '',
        companySlug = '',
        jobSlug = '',
        skills = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        query: search,
        location,
        jobType,
        experienceLevel,
        salaryMin: minSalary ? parseInt(minSalary) : undefined,
        salaryMax: maxSalary ? parseInt(maxSalary) : undefined,
        isRemote: isRemote === 'true' ? true : isRemote === 'false' ? false : undefined,
        company: companyName,
        companySlug,
        jobSlug,
        skills: skills ? skills.split(',').map((skill) => skill.trim()) : undefined,
        sortBy,
        sortOrder,
      };

      const result = await this.jobsService.searchJobs(options);

      req.log.info('[userJobsController] getJobs success');
      return reply.send(successResponse(result.data, 'Jobs retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userJobsController] getJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get job by ID
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getJobById = async (req, reply) => {
    req.log.info('[userJobsController] getJobById start');
    req.log.debug({ params: req.params }, '[userJobsController] rawParams');
    try {
      const { id } = req.params;
      const jobId = parseInt(id);

      if (isNaN(jobId)) {
        return reply.send(errorResponse('Invalid job ID', 400));
      }

      const job = await this.jobsService.getJobById(jobId);

      if (!job) {
        req.log.info({ id }, '[userJobsController] getJobById not_found');
        return reply.send(errorResponse('Job not found', 404));
      }

      req.log.info('[userJobsController] getJobById success');
      return reply.send(successResponse(job, 'Job retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userJobsController] getJobById error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get featured jobs
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getFeaturedJobs = async (req, reply) => {
    try {
      req.log.info('[userJobsController] getFeaturedJobs start');
      req.log.debug({ query: req.query }, '[userJobsController] rawQuery');
      const { limit = 6 } = req.query;
      const jobs = await this.jobsService.getFeaturedJobs(parseInt(limit));
      req.log.info('[userJobsController] getFeaturedJobs success');
      return reply.send(successResponse(jobs, 'Featured jobs retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userJobsController] getFeaturedJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get job categories
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getJobCategories = async (req, reply) => {
    try {
      req.log.info('[userJobsController] getJobCategories start');
      const categories = await this.jobsService.getJobCategories();
      req.log.info('[userJobsController] getJobCategories success');
      return reply.send(successResponse(categories, 'Job categories retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userJobsController] getJobCategories error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Search jobs
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  searchJobs = async (req, reply) => {
    try {
      req.log.info('[userJobsController] searchJobs start');
      req.log.debug({ query: req.query }, '[userJobsController] rawQuery');
      const { q, location, jobType, experienceLevel, skills, page = 1, limit = 10 } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        query: q,
        location,
        jobType,
        experienceLevel,
        skills: skills ? skills.split(',').map((skill) => skill.trim()) : undefined,
      };

      const result = await this.jobsService.searchJobs(options);
      req.log.info('[userJobsController] searchJobs success');
      return reply.send(successResponse(result, 'Jobs search completed successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userJobsController] searchJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get companies with filtering
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getCompanies = async (req, reply) => {
    try {
      req.log.info('[userJobsController] getCompanies start');
      req.log.debug({ query: req.query }, '[userJobsController] rawQuery');

      const {
        page = 1,
        limit = 20,
        slug = '',
        name = '',
        headquarters = '',
        industry = '',
        linkedinSize = '',
        search = '',
        sortBy = 'name',
        sortOrder = 'asc',
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        slug,
        name,
        headquarters,
        industry,
        linkedinSize,
        search,
        sortBy,
        sortOrder,
      };

      const result = await this.jobsService.getCompanies(options);
      req.log.info('[userJobsController] getCompanies success');
      return reply.send(successResponse(result.data, 'Companies retrieved successfully', result.meta));
    } catch (error) {
      req.log.error({ err: error }, '[userJobsController] getCompanies error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get job recommendations for user
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getJobRecommendations = async (req, reply) => {
    try {
      req.log.info('[userJobsController] getJobRecommendations start');
      req.log.debug({ query: req.query }, '[userJobsController] rawQuery');
      const userId = req.user?.id;
      const { limit = 10 } = req.query;

      const recommendations = await this.jobsService.getJobRecommendations(userId, parseInt(limit));

      req.log.info('[userJobsController] getJobRecommendations success');
      return reply.send(successResponse(recommendations, 'Job recommendations retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[userJobsController] getJobRecommendations error');
      return reply.send(errorResponse(error.message, 500));
    }
  };
}

export default JobsController;
