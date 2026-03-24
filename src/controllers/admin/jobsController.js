import { jobsService } from '../../services/shared/jobsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

class JobsController {
  constructor() {
    this.jobsService = jobsService;
  }

  getJobs = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] getJobs start');
      request.log.debug({ query: request.query }, '[adminJobsController] rawQuery');

      const { status = 'all', ...otherParams } = request.query;

      const options = {
        status,
        ...otherParams,
      };

      if (options.page !== undefined) {
        options.page = parseInt(options.page);
      }
      if (options.limit !== undefined) {
        options.limit = parseInt(options.limit);
      }

      const result = await this.jobsService.getJobsForAdmin(options);

      request.log.info('[adminJobsController] getJobs success');
      return reply.send(successResponse(result.data, 'Jobs retrieved successfully', result.meta));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] getJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobById = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] getJobById start');
      request.log.debug({ params: request.params }, '[adminJobsController] rawParams');

      const { id } = request.params;
      const jobId = Number(id);

      const job = await this.jobsService.getJobById(jobId);

      if (!job) {
        request.log.info({ id: jobId }, '[adminJobsController] getJobById not_found');
        return reply.send(errorResponse('Job not found', 404));
      }

      request.log.info('[adminJobsController] getJobById success');
      return reply.send(successResponse(job, 'Job retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] getJobById error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  createJob = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] createJob start');
      request.log.debug({ body: request.body }, '[adminJobsController] rawBody');

      const userId = request.user.userId;
      const job = await this.jobsService.createJob(request.body, userId);

      request.log.info('[adminJobsController] createJob success');
      return reply.status(201).send(successResponse(job, 'Job created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] createJob error');
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  updateJob = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] updateJob start');
      request.log.debug({ params: request.params, body: request.body }, '[adminJobsController] raw');

      const { id } = request.params;
      const jobId = Number(id);

      const job = await this.jobsService.updateJob(jobId, request.body);

      if (!job) {
        request.log.info({ id: jobId }, '[adminJobsController] updateJob not_found');
        return reply.status(404).send(errorResponse('Job not found', 404));
      }

      request.log.info('[adminJobsController] updateJob success');
      return reply.send(successResponse(job, 'Job updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] updateJob error');
      const statusCode = error.message === 'Job not found' ? 404 : 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  deleteJob = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] deleteJob start');
      request.log.debug({ params: request.params }, '[adminJobsController] rawParams');

      const { id } = request.params;
      const jobId = Number(id);

      await this.jobsService.deleteJob(jobId);

      request.log.info('[adminJobsController] deleteJob success');
      return reply.send(successResponse(null, 'Job deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] deleteJob error');
      const statusCode = error.message === 'Job not found' ? 404 : 500;
      return reply.status(statusCode).send(errorResponse(error.message, statusCode));
    }
  };

  syncLinkedInJobs = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] syncLinkedInJobs start');
      request.log.debug({ body: request.body }, '[adminJobsController] rawBody');

      const { filter = {} } = request.body || {};
      const options = { filter };

      request.log.debug({ options }, '[adminJobsController] options');
      request.log.info('[adminJobsController] call jobsService.syncJobsFromLinkedIn');

      const result = await this.jobsService.syncJobsFromLinkedIn(options);

      request.log.info({ result }, '[adminJobsController] syncJobsFromLinkedIn result');
      request.log.info({ total: result.totalJobs, saved: result.savedJobs, skipped: result.skippedJobs }, '[adminJobsController] service ok');

      return reply.send(successResponse(result, 'LinkedIn jobs sync completed successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] syncLinkedInJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobStatistics = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] getJobStatistics start');
      request.log.debug({ params: request.params }, '[adminJobsController] rawParams');
      const { id } = request.params;
      const jobId = Number(id);

      const stats = await this.jobsService.getJobStatistics(jobId);
      request.log.info('[adminJobsController] getJobStatistics success');
      return reply.send(successResponse(stats, 'Job statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] getJobStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getAllJobsStatistics = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] getAllJobsStatistics start');
      const stats = await this.jobsService.getAllJobsStatistics();
      request.log.info('[adminJobsController] getAllJobsStatistics success');
      return reply.send(successResponse(stats, 'All jobs statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] getAllJobsStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  getJobsStatistics = async (request, reply) => {
    try {
      request.log.info('[adminJobsController] getJobsStatistics start');
      const stats = await this.jobsService.getJobsStatistics();
      request.log.info('[adminJobsController] getJobsStatistics success');
      return reply.send(successResponse(stats, 'Jobs statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] getJobsStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  };
}

export const adminJobsController = new JobsController();
