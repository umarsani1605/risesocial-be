import prisma from '../lib/prisma.js';
import { BaseRepository } from './base/BaseRepository.js';

/**
 * User Settings repository for notification preferences
 */
export class UserSettingsRepository extends BaseRepository {
  constructor() {
    super(prisma.userSetting);
  }

  /**
   * Find settings by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User settings or null
   */
  async findByUserId(userId) {
    return await this.model.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Create or update user settings
   * @param {number} userId - User ID
   * @param {Object} settingsData - Settings data
   * @returns {Promise<Object>} User settings
   */
  async upsertByUserId(userId, settingsData) {
    return await this.model.upsert({
      where: { user_id: userId },
      update: settingsData,
      create: {
        user_id: userId,
        ...settingsData,
      },
    });
  }

  /**
   * Create default settings for user
   * @param {number} userId - User ID
   * @param {string} userRole - User role for default settings
   * @returns {Promise<Object>} Created settings
   */
  async createDefault(userId, userRole = 'user') {
    return await this.model.create({
      data: {
        user_id: userId,
        job_notification: userRole === 'user',
        program_notification: true,
        promo_notification: userRole === 'user',
      },
    });
  }
}

// Export instance
export const userSettingsRepository = new UserSettingsRepository();
