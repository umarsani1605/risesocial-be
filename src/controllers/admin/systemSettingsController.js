import { systemSettingsService } from '../../services/admin/systemSettingsService.js';
import { emailService } from '../../services/shared/emailService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminSystemSettingsController {
  async sendTestEmailTemplates(request, reply) {
    try {
      const recipient = 'umarsani361@gmail.com';
      const templates = [{
        template: 'certificateReady',
        send: () => emailService.sendCertificateReady({
          to: recipient,
          name: 'Umar Sani',
          cohortName: 'Batch Test 1',
          academyTitle: 'Rise Social Test Academy',
          certCode: 'CERT-TEST-2026-0001',
          certificateUrl: 'https://api-dev.risesocial.org/uploads/certificates/3/005-RISE-V-2026.pdf',
        }),
      }];

      const settled = await Promise.allSettled(templates.map((item) => item.send()));
      const results = settled.map((result, index) => ({
        template: templates[index].template,
        status: result.status === 'fulfilled' ? 'sent' : 'failed',
        error: result.status === 'rejected' ? result.reason?.message ?? 'Unknown error' : undefined,
      }));

      return reply.send(successResponse({
        recipient,
        results,
      }, 'Email template test finished'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async getAllSettings(request, reply) {
    try {
      const settings = await systemSettingsService.getAllSettings();
      return reply.send(successResponse(settings, 'System settings retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async getPublicSiteSettings(request, reply) {
    try {
      const settings = await systemSettingsService.getPublicSiteSettings();
      return reply.send(successResponse(settings, 'Public site settings retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async getSetting(request, reply) {
    try {
      const { key } = request.params;
      const value = await systemSettingsService.getSetting(key);

      if (value === null) {
        return reply.send(errorResponse('Setting not found', 404));
      }

      return reply.send(successResponse({ key, value }, 'Setting retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async setSetting(request, reply) {
    try {
      const { key } = request.params;
      const { value, description } = request.body;


      if (!value) {
        return reply.send(errorResponse('Value is required', 400));
      }

      const setting = await systemSettingsService.setSetting(key, value, description);
      return reply.send(successResponse(setting, 'Setting updated successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async getLinkedInRateLimit(request, reply) {
    try {
      const rateLimit = await systemSettingsService.getLinkedInRateLimit();

      if (!rateLimit) {
        return reply.send(successResponse(null, 'No rate limit data available'));
      }

      return reply.send(successResponse(rateLimit, 'LinkedIn rate limit data retrieved successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }

  async deleteSetting(request, reply) {
    try {
      const { key } = request.params;
      const setting = await systemSettingsService.deleteSetting(key);
      return reply.send(successResponse(setting, 'Setting deleted successfully'));
    } catch (error) {
      return reply.send(errorResponse(error.message, 500));
    }
  }
}

export const adminSystemSettingsController = new AdminSystemSettingsController();
