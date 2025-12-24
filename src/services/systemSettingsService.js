import { systemSettingsRepository } from '../repositories/systemSettingsRepository.js';
import { getLogger } from '../lib/loggerContext.js';

export class SystemSettingsService {
  get logger() {
    return getLogger();
  }
    async getSetting(key) {
    this.logger.info({ key }, '[SystemSettingsService] getSetting');
    const setting = await systemSettingsRepository.getSetting(key);
    return setting?.value || null;
  }

    async setSetting(key, value, description = null) {
    this.logger.info({ key, hasValue: value !== undefined }, '[SystemSettingsService] setSetting');
    return await systemSettingsRepository.upsertSetting(key, value, description);
  }

    async getLinkedInRateLimit() {
    this.logger.info('[SystemSettingsService] getLinkedInRateLimit');
    return await this.getSetting('linkedin_rate_limit');
  }

    async updateLinkedInRateLimit(rateLimitData) {
    this.logger.info(
      {
        jobsRemaining: rateLimitData?.jobs?.remaining,
        requestsRemaining: rateLimitData?.requests?.remaining,
      },
      '[SystemSettingsService] updateLinkedInRateLimit'
    );
    const data = {
      ...rateLimitData,
      last_updated: new Date().toISOString(),
    };

    return await this.setSetting('linkedin_rate_limit', data, 'LinkedIn API rate limit data');
  }

    async getAllSettings() {
    this.logger.info('[SystemSettingsService] getAllSettings');
    return await systemSettingsRepository.getAllSettings();
  }

    async deleteSetting(key) {
    this.logger.info({ key }, '[SystemSettingsService] deleteSetting');
    return await systemSettingsRepository.deleteSetting(key);
  }
}

// Export instance
export const systemSettingsService = new SystemSettingsService();
