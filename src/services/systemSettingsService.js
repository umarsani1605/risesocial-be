import { systemSettingsRepository } from '../repositories/systemSettingsRepository.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * System Settings service untuk business logic
 */
export class SystemSettingsService {
  get logger() {
    return getLogger();
  }
  /**
   * Get setting by key
   * @param {string} key - Setting key
   * @returns {Promise<Object|null>} Setting value or null
   */
  async getSetting(key) {
    this.logger.info({ key }, '[SystemSettingsService] getSetting');
    const setting = await systemSettingsRepository.getSetting(key);
    return setting?.value || null;
  }

  /**
   * Set setting value
   * @param {string} key - Setting key
   * @param {Object} value - Setting value
   * @param {string} description - Setting description
   * @returns {Promise<Object>} Updated setting
   */
  async setSetting(key, value, description = null) {
    this.logger.info({ key, hasValue: value !== undefined }, '[SystemSettingsService] setSetting');
    return await systemSettingsRepository.upsertSetting(key, value, description);
  }

  /**
   * Get LinkedIn rate limit data
   * @returns {Promise<Object|null>} Rate limit data
   */
  async getLinkedInRateLimit() {
    this.logger.info('[SystemSettingsService] getLinkedInRateLimit');
    return await this.getSetting('linkedin_rate_limit');
  }

  /**
   * Update LinkedIn rate limit data
   * @param {Object} rateLimitData - Rate limit data from API response
   * @returns {Promise<Object>} Updated setting
   */
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

  /**
   * Get all settings
   * @returns {Promise<Array>} All settings
   */
  async getAllSettings() {
    this.logger.info('[SystemSettingsService] getAllSettings');
    return await systemSettingsRepository.getAllSettings();
  }

  /**
   * Delete setting by key
   * @param {string} key - Setting key
   * @returns {Promise<Object>} Deleted setting
   */
  async deleteSetting(key) {
    this.logger.info({ key }, '[SystemSettingsService] deleteSetting');
    return await systemSettingsRepository.deleteSetting(key);
  }
}

// Export instance
export const systemSettingsService = new SystemSettingsService();
