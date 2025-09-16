import { systemSettingsService } from '../../services/systemSettingsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin System Settings HTTP controllers
 * Handles admin-only system configuration requests
 */
export class AdminSystemSettingsController {
  /**
   * Get all system settings
   * @param {Object} req - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getAllSettings(req, reply) {
    req.log.info('[adminSystemSettingsController] getAllSettings start');
    try {
      const settings = await systemSettingsService.getAllSettings();
      req.log.info('[adminSystemSettingsController] getAllSettings success');
      return reply.send(successResponse(settings, 'System settings retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminSystemSettingsController] getAllSettings error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get setting by key
   * @param {Object} req - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getSetting(req, reply) {
    try {
      const { key } = req.params;
      req.log.info('[adminSystemSettingsController] getSetting start');
      req.log.debug({ params: req.params }, '[adminSystemSettingsController] rawParams');
      const value = await systemSettingsService.getSetting(key);

      if (value === null) {
        req.log.info({ key }, '[adminSystemSettingsController] getSetting not_found');
        return reply.send(errorResponse('Setting not found', 404));
      }

      req.log.info({ key }, '[adminSystemSettingsController] getSetting success');
      return reply.send(successResponse({ key, value }, 'Setting retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminSystemSettingsController] getSetting error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Set setting value
   * @param {Object} req - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async setSetting(req, reply) {
    try {
      const { key } = req.params;
      const { value, description } = req.body;

      req.log.info('[adminSystemSettingsController] setSetting start');
      req.log.debug({ body: req.body }, '[adminSystemSettingsController] rawBody');

      if (!value) {
        req.log.info({ key }, '[adminSystemSettingsController] setSetting validation_failed');
        return reply.send(errorResponse('Value is required', 400));
      }

      const setting = await systemSettingsService.setSetting(key, value, description);
      req.log.info({ key }, '[adminSystemSettingsController] setSetting success');
      return reply.send(successResponse(setting, 'Setting updated successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminSystemSettingsController] setSetting error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Get LinkedIn rate limit data
   * @param {Object} req - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async getLinkedInRateLimit(req, reply) {
    try {
      req.log.info('[adminSystemSettingsController] getLinkedInRateLimit start');
      const rateLimit = await systemSettingsService.getLinkedInRateLimit();

      if (!rateLimit) {
        req.log.info('[adminSystemSettingsController] getLinkedInRateLimit no_data');
        return reply.send(successResponse(null, 'No rate limit data available'));
      }

      req.log.info('[adminSystemSettingsController] getLinkedInRateLimit success');
      return reply.send(successResponse(rateLimit, 'LinkedIn rate limit data retrieved successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminSystemSettingsController] getLinkedInRateLimit error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  /**
   * Delete setting by key
   * @param {Object} req - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async deleteSetting(req, reply) {
    try {
      const { key } = req.params;
      req.log.info('[adminSystemSettingsController] deleteSetting start');
      req.log.debug({ params: req.params }, '[adminSystemSettingsController] rawParams');
      const setting = await systemSettingsService.deleteSetting(key);
      req.log.info({ key }, '[adminSystemSettingsController] deleteSetting success');
      return reply.send(successResponse(setting, 'Setting deleted successfully'));
    } catch (error) {
      req.log.error({ err: error }, '[adminSystemSettingsController] deleteSetting error');
      return reply.send(errorResponse(error.message, 500));
    }
  }
}

// Export instance
export const adminSystemSettingsController = new AdminSystemSettingsController();
