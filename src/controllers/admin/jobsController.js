import { JobsService } from '../../services/jobsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin Jobs Controller
 * Handles job management operations for administrators
 */
class JobsController {
  constructor() {
    this.jobsService = new JobsService();
  }

  /**
   * Create new job (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  createJob = async (req, reply) => {
    try {
      req.log.info('[adminJobsController] createJob start');
      req.log.debug({ body: req.body }, '[adminJobsController] rawBody');

      const jobData = {
        ...req.body,
        postedBy: req.user.id,
      };

      const job = await this.jobsService.createJob(jobData);
      req.log.info('[adminJobsController] createJob success');
      return reply.send(successResponse(job, 'Job created successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminJobsController] createJob error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Update job (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  updateJob = async (req, reply) => {
    try {
      req.log.info('[adminJobsController] updateJob start');
      req.log.debug({ params: req.params, body: req.body }, '[adminJobsController] raw');

      const { id } = req.params;
      const jobId = parseInt(id);

      const job = await this.jobsService.updateJob(jobId, req.body);

      if (!job) {
        req.log.info({ id: jobId }, '[adminJobsController] updateJob not_found');
        return reply.send(errorResponse('Job not found', 404));
      }

      req.log.info('[adminJobsController] updateJob success');
      return reply.send(successResponse(job, 'Job updated successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminJobsController] updateJob error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Delete job (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  deleteJob = async (req, reply) => {
    try {
      req.log.info('[adminJobsController] deleteJob start');
      req.log.debug({ params: req.params }, '[adminJobsController] rawParams');
      const { id } = req.params;
      const jobId = parseInt(id);

      if (isNaN(jobId)) {
        return reply.send(errorResponse('Invalid job ID', 400));
      }

      const success = await this.jobsService.deleteJob(jobId);

      req.log.info('[adminJobsController] deleteJob success');
      return reply.send(successResponse(null, 'Job deleted successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminJobsController] deleteJob error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Sync jobs from LinkedIn API (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  syncLinkedInJobs = async (req, reply) => {
    try {
      req.log.info('[adminJobsController] syncLinkedInJobs start');
      req.log.debug({ body: req.body }, '[adminJobsController] rawBody');

      const { filter = {} } = req.body || {};
      const options = { filter };

      req.log.debug({ options }, '[adminJobsController] options');
      req.log.info('[adminJobsController] call jobsService.syncJobsFromLinkedIn');

      const result = await this.jobsService.syncJobsFromLinkedIn(options);

      req.log.info({ result }, '[adminJobsController] syncJobsFromLinkedIn result');
      req.log.info({ total: result.totalJobs, saved: result.savedJobs, skipped: result.skippedJobs }, '[adminJobsController] service ok');

      return reply.send(successResponse(result, 'LinkedIn jobs sync completed successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminJobsController] syncLinkedInJobs error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get job statistics by ID (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getJobStatistics = async (req, reply) => {
    try {
      req.log.info('[adminJobsController] getJobStatistics start');
      req.log.debug({ params: req.params }, '[adminJobsController] rawParams');
      const { id } = req.params;
      const jobId = parseInt(id);

      if (isNaN(jobId)) {
        return reply.send(errorResponse('Invalid job ID', 400));
      }

      const stats = await this.jobsService.getJobStatistics(jobId);
      req.log.info('[adminJobsController] getJobStatistics success');
      return reply.send(successResponse(stats, 'Job statistics retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminJobsController] getJobStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get all jobs statistics (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getAllJobsStatistics = async (req, reply) => {
    try {
      req.log.info('[adminJobsController] getAllJobsStatistics start');
      const stats = await this.jobsService.getAllJobsStatistics();
      req.log.info('[adminJobsController] getAllJobsStatistics success');
      return reply.send(successResponse(stats, 'All jobs statistics retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminJobsController] getAllJobsStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  };

  /**
   * Get jobs statistics overview (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} reply - Fastify reply object
   */
  getJobsStatistics = async (req, reply) => {
    try {
      req.log.info('[adminJobsController] getJobsStatistics start');
      const stats = await this.jobsService.getJobsStatistics();
      req.log.info('[adminJobsController] getJobsStatistics success');
      return reply.send(successResponse(stats, 'Jobs statistics retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminJobsController] getJobsStatistics error');
      return reply.send(errorResponse(error.message, 500));
    }
  };
}

export default JobsController;
