import prisma from '../lib/prisma.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * System Settings repository untuk data access operations
 */
export class SystemSettingsRepository {
  get logger() {
    return getLogger();
  }

  /**
   * Get setting by key
   * @param {string} key - Setting key
   * @returns {Promise<Object|null>} Setting or null
   */
  async getSetting(key) {
    this.logger.info({ key }, '[systemSettingsRepository] getSetting called');
    return await prisma.systemSetting.findUnique({
      where: { key },
    });
  }

  /**
   * Create or update setting
   * @param {string} key - Setting key
   * @param {Object} value - Setting value
   * @param {string} description - Setting description
   * @returns {Promise<Object>} Created/updated setting
   */
  async upsertSetting(key, value, description = null) {
    this.logger.info({ key }, '[systemSettingsRepository] upsertSetting called');
    return await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        description,
        updated_at: new Date(),
      },
      create: {
        key,
        value,
        description,
      },
    });
  }

  /**
   * Get all settings
   * @returns {Promise<Array>} All settings
   */
  async getAllSettings() {
    this.logger.info('[systemSettingsRepository] getAllSettings called');
    return await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Delete setting by key
   * @param {string} key - Setting key
   * @returns {Promise<Object>} Deleted setting
   */
  async deleteSetting(key) {
    this.logger.info({ key }, '[systemSettingsRepository] deleteSetting called');
    return await prisma.systemSetting.delete({
      where: { key },
    });
  }
}

// Export instance
export const systemSettingsRepository = new SystemSettingsRepository();
