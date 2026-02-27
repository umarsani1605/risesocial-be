import { jobsService } from '../../services/jobsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

class JobsController {
  constructor() {
    this.jobsService = jobsService;
  }

  getJobs = async (request, reply) => {
    request.log.info('[userJobsController] getJobs start');
    request.log.debug({ query: request.query }, '[userJobsController] rawQuery');
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        query = '',
        location = '',
        jobType = '',
        experienceLevel = '',
        minSalary = '',
        maxSalary = '',
        isRemote = '',
        companyName = '',
        companySlug = '',
        jobSlug = '',
        industry = '',
        skills = '',
        sortBy = 'postedDate',
        sortOrder = 'desc',
      } = request.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        query: search || query,
        location,
        jobType,
        experienceLevel,
        salaryMin: minSalary ? Number(minSalary) : undefined,
        salaryMax: maxSalary ? Number(maxSalary) : undefined,
        isRemote: isRemote === 'true' ? true : isRemote === 'false' ? false : undefined,
        company: companyName,
        companySlug,
        jobSlug,
        industry,
        skills: skills ? skills.split(',').map((skill) => skill.trim()) : undefined,
        sortBy,
        sortOrder,
      };

      const result = await this.jobsService.searchJobs(options);

      request.log.info('[userJobsController] getJobs success');
      return reply.send({
        success: true,
        message: 'Jobs retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      request.log.error({ err: error }, '[userJobsController] getJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobById = async (request, reply) => {
    request.log.info('[userJobsController] getJobById start');
    request.log.debug({ params: request.params }, '[userJobsController] rawParams');
    try {
      const { id } = request.params;
      const jobId = Number(id);

      const job = await this.jobsService.getJobById(jobId);

      if (!job) {
        request.log.info({ id }, '[userJobsController] getJobById not_found');
        return reply.send(errorResponse('Job not found', 404));
      }

      request.log.info('[userJobsController] getJobById success');
      return reply.send(successResponse(job, 'Job retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userJobsController] getJobById error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getFeaturedJobs = async (request, reply) => {
    try {
      request.log.info('[userJobsController] getFeaturedJobs start');
      request.log.debug({ query: request.query }, '[userJobsController] rawQuery');
      const { limit = 6 } = request.query;
      const jobs = await this.jobsService.getFeaturedJobs(Number(limit));
      request.log.info('[userJobsController] getFeaturedJobs success');
      return reply.send(successResponse(jobs, 'Featured jobs retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userJobsController] getFeaturedJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobCategories = async (request, reply) => {
    try {
      request.log.info('[userJobsController] getJobCategories start');
      const categories = await this.jobsService.getJobCategories();
      request.log.info('[userJobsController] getJobCategories success');
      return reply.send(successResponse(categories, 'Job categories retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userJobsController] getJobCategories error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  searchJobs = async (request, reply) => {
    try {
      request.log.info('[userJobsController] searchJobs start');
      request.log.debug({ query: request.query }, '[userJobsController] rawQuery');
      const { q, location, jobType, experienceLevel, skills, page = 1, limit = 10 } = request.query;

      const options = {
        page: Number(page),
        limit: Number(limit),
        query: q,
        location,
        jobType,
        experienceLevel,
        skills: skills ? skills.split(',').map((skill) => skill.trim()) : undefined,
      };

      const result = await this.jobsService.searchJobs(options);
      request.log.info('[userJobsController] searchJobs success');
      return reply.send(successResponse(result, 'Jobs search completed successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userJobsController] searchJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getCompanies = async (request, reply) => {
    try {
      request.log.info('[userJobsController] getCompanies start');
      request.log.debug({ query: request.query }, '[userJobsController] rawQuery');

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
      } = request.query;

      const options = {
        page: Number(page),
        limit: Number(limit),
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
      request.log.info('[userJobsController] getCompanies success');
      return reply.send(successResponse(result.data, 'Companies retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[userJobsController] getCompanies error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobRecommendations = async (request, reply) => {
    try {
      request.log.info('[userJobsController] getJobRecommendations start');
      request.log.debug({ params: request.params, query: request.query }, '[userJobsController] rawParams');
      const { id } = request.params;
      const jobId = Number(id);
      const { limit = 4 } = request.query;

      const recommendations = await this.jobsService.getJobRecommendations(jobId, Number(limit));

      request.log.info('[userJobsController] getJobRecommendations success');
      return reply.send(successResponse(recommendations, 'Job recommendations retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userJobsController] getJobRecommendations error');
      return reply.send(errorResponse(error.message, 500));
    }
  };
}

export const userJobsController = new JobsController();
