import { systemSettingsRepository } from '../../repositories/admin/systemSettingsRepository.js';

export class SystemSettingsService {

  async getSetting(key) {
    const setting = await systemSettingsRepository.getSetting(key);
    return setting?.value || null;
  }

  async setSetting(key, value, description = null) {
    return await systemSettingsRepository.upsertSetting(key, value, description);
  }

  async getLinkedInRateLimit() {
    return await this.getSetting('linkedin_rate_limit');
  }

  async updateLinkedInRateLimit(rateLimitData) {
    const data = {
      ...rateLimitData,
      last_updated: new Date().toISOString(),
    };

    return await this.setSetting('linkedin_rate_limit', data, 'LinkedIn API rate limit data');
  }

  async getAllSettings() {
    return await systemSettingsRepository.getAllSettings();
  }

  async deleteSetting(key) {
    return await systemSettingsRepository.deleteSetting(key);
  }
}

export const systemSettingsService = new SystemSettingsService();
