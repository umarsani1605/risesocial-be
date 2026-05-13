import { jobsService } from '../../services/shared/jobsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

class JobsController {
  constructor() {
    this.jobsService = jobsService;
  }

  getJobs = async (request, reply) => {
    try {
      const {
        page,
        limit,
        featured,
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

      // Only add pagination if both page and limit are provided
      if (page !== undefined && limit !== undefined) {
        options.page = parseInt(page);
        options.limit = parseInt(limit);
      }

      if (featured !== undefined) {
        options.featured = featured === 'true' || featured === true;
      }

      const result = await this.jobsService.searchJobs(options);


      // Return with or without meta based on whether pagination was requested
      if (result.meta) {
        return reply.send(successResponse(result.data, 'Jobs retrieved successfully', result.meta));
      } else {
        return reply.send(successResponse(result.data, 'Jobs retrieved successfully'));
      }
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobById = async (request, reply) => {
    try {
      const { id } = request.params;
      const jobId = Number(id);

      const job = await this.jobsService.getJobById(jobId);

      if (!job) {
        return reply.send(errorResponse('Job not found', 404));
      }

      return reply.send(successResponse(job, 'Job retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobCategories = async (request, reply) => {
    try {
      const categories = await this.jobsService.getJobCategories();
      return reply.send(successResponse(categories, 'Job categories retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getCompanies = async (request, reply) => {
    try {

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
      return reply.send(successResponse(result.data, 'Companies retrieved successfully', result.meta));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobRecommendations = async (request, reply) => {
    try {
      const { id } = request.params;
      const jobId = Number(id);
      const { limit = 4 } = request.query;

      const recommendations = await this.jobsService.getJobRecommendations(jobId, Number(limit));

      return reply.send(successResponse(recommendations, 'Job recommendations retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  };
}

export const userJobsController = new JobsController();
