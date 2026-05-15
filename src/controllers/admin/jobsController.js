import { jobsService } from '../../services/shared/jobsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

class JobsController {
  constructor() {
    this.jobsService = jobsService;
  }

  getJobs = async (request, reply) => {
    try {
      const options = { ...request.query };

      if (options.page !== undefined) {
        options.page = parseInt(options.page);
      }
      if (options.limit !== undefined) {
        options.limit = parseInt(options.limit);
      }

      const result = await this.jobsService.getJobsForAdmin(options);

      return reply.send(successResponse(result.data, 'Jobs retrieved successfully', result.meta));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
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
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  createJob = async (request, reply) => {
    try {

      const userId = request.user.userId;
      const job = await this.jobsService.createJob(request.body, userId);

      return reply.status(201).send(successResponse(job, 'Job created successfully'));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  updateJob = async (request, reply) => {
    try {

      const { id } = request.params;
      const jobId = Number(id);

      const job = await this.jobsService.updateJob(jobId, request.body);

      if (!job) {
        return reply.status(404).send(errorResponse('Job not found', 404));
      }

      return reply.send(successResponse(job, 'Job updated successfully'));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  deleteJob = async (request, reply) => {
    try {

      const { id } = request.params;
      const jobId = Number(id);

      await this.jobsService.deleteJob(jobId);

      return reply.send(successResponse(null, 'Job deleted successfully'));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  syncLinkedInJobs = async (request, reply) => {
    try {

      const { filter = {} } = request.body || {};
      const options = { filter };


      const result = await this.jobsService.syncJobsFromLinkedIn(options);


      return reply.send(successResponse(result, 'LinkedIn jobs sync completed successfully'));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  getJobStatistics = async (request, reply) => {
    try {
      const { id } = request.params;
      const jobId = Number(id);

      const stats = await this.jobsService.getJobStatistics(jobId);
      return reply.send(successResponse(stats, 'Job statistics retrieved successfully'));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  getAllJobsStatistics = async (request, reply) => {
    try {
      const stats = await this.jobsService.getAllJobsStatistics();
      return reply.send(successResponse(stats, 'All jobs statistics retrieved successfully'));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  getJobsStatistics = async (request, reply) => {
    try {
      const stats = await this.jobsService.getJobsStatistics();
      return reply.send(successResponse(stats, 'Jobs statistics retrieved successfully'));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };
}

export const adminJobsController = new JobsController();
