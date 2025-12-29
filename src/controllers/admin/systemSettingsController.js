import { systemSettingsService } from '../../services/systemSettingsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminSystemSettingsController {
  async getAllSettings(request, reply) {
    request.log.info('[adminSystemSettingsController] getAllSettings start');
    try {
      const settings = await systemSettingsService.getAllSettings();
      request.log.info('[adminSystemSettingsController] getAllSettings success');
      return reply.send(successResponse(settings, 'System settings retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminSystemSettingsController] getAllSettings error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async getSetting(request, reply) {
    try {
      const { key } = request.params;
      request.log.info('[adminSystemSettingsController] getSetting start');
      request.log.debug({ params: request.params }, '[adminSystemSettingsController] rawParams');
      const value = await systemSettingsService.getSetting(key);

      if (value === null) {
        request.log.info({ key }, '[adminSystemSettingsController] getSetting not_found');
        return reply.send(errorResponse('Setting not found', 404));
      }

      request.log.info({ key }, '[adminSystemSettingsController] getSetting success');
      return reply.send(successResponse({ key, value }, 'Setting retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminSystemSettingsController] getSetting error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async setSetting(request, reply) {
    try {
      const { key } = request.params;
      const { value, description } = request.body;

      request.log.info('[adminSystemSettingsController] setSetting start');
      request.log.debug({ body: request.body }, '[adminSystemSettingsController] rawBody');

      if (!value) {
        request.log.info({ key }, '[adminSystemSettingsController] setSetting validation_failed');
        return reply.send(errorResponse('Value is required', 400));
      }

      const setting = await systemSettingsService.setSetting(key, value, description);
      request.log.info({ key }, '[adminSystemSettingsController] setSetting success');
      return reply.send(successResponse(setting, 'Setting updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminSystemSettingsController] setSetting error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async getLinkedInRateLimit(request, reply) {
    try {
      request.log.info('[adminSystemSettingsController] getLinkedInRateLimit start');
      const rateLimit = await systemSettingsService.getLinkedInRateLimit();

      if (!rateLimit) {
        request.log.info('[adminSystemSettingsController] getLinkedInRateLimit no_data');
        return reply.send(successResponse(null, 'No rate limit data available'));
      }

      request.log.info('[adminSystemSettingsController] getLinkedInRateLimit success');
      return reply.send(successResponse(rateLimit, 'LinkedIn rate limit data retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminSystemSettingsController] getLinkedInRateLimit error');
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async deleteSetting(request, reply) {
    try {
      const { key } = request.params;
      request.log.info('[adminSystemSettingsController] deleteSetting start');
      request.log.debug({ params: request.params }, '[adminSystemSettingsController] rawParams');
      const setting = await systemSettingsService.deleteSetting(key);
      request.log.info({ key }, '[adminSystemSettingsController] deleteSetting success');
      return reply.send(successResponse(setting, 'Setting deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminSystemSettingsController] deleteSetting error');
      return reply.send(errorResponse(error.message, 500));
    }
  }
}

export const adminSystemSettingsController = new AdminSystemSettingsController();
