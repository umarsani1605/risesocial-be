import { jobsService } from '../../services/jobsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

class JobsController {
  constructor() {
    this.jobsService = jobsService;
  }

  createJob = async (req, reply) => {
    try {
      request.log.info('[adminJobsController] createJob start');
      request.log.debug({ body: request.body }, '[adminJobsController] rawBody');

      const jobData = {
        ...request.body,
        postedBy: request.user.id,
      };

      const job = await this.jobsService.createJob(jobData);
      request.log.info('[adminJobsController] createJob success');
      return reply.send(successResponse(job, 'Job created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] createJob error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  updateJob = async (req, reply) => {
    try {
      request.log.info('[adminJobsController] updateJob start');
      request.log.debug({ params: request.params, body: request.body }, '[adminJobsController] raw');

      const { id } = request.params;
      const jobId = Number(id);

      const job = await this.jobsService.updateJob(jobId, request.body);

      if (!job) {
        request.log.info({ id: jobId }, '[adminJobsController] updateJob not_found');
        return reply.send(errorResponse('Job not found', 404));
      }

      request.log.info('[adminJobsController] updateJob success');
      return reply.send(successResponse(job, 'Job updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] updateJob error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  deleteJob = async (req, reply) => {
    try {
      request.log.info('[adminJobsController] deleteJob start');
      request.log.debug({ params: request.params }, '[adminJobsController] rawParams');
      const { id } = request.params;
      const jobId = Number(id);

      const success = await this.jobsService.deleteJob(jobId);

      if (!success) {
        request.log.info({ id: jobId }, '[adminJobsController] deleteJob not_found');
        return reply.send(errorResponse('Job not found', 404));
      }

      request.log.info('[adminJobsController] deleteJob success');
      return reply.send(successResponse(null, 'Job deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminJobsController] deleteJob error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  syncLinkedInJobs = async (req, reply) => {
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

  getJobStatistics = async (req, reply) => {
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

  getAllJobsStatistics = async (req, reply) => {
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

  getJobsStatistics = async (req, reply) => {
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
