import prisma from '../lib/prisma.js';

/**
 * User Settings Repository
 * Handles UserSetting key-value operations
 */
export class UserSettingsRepository {
  /**
   * Get all user settings by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User settings array
   */
  async getUserSettings(userId) {
    try {
      const settings = await prisma.userSetting.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          key: true,
          value: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { key: 'asc' },
      });
      return settings;
    } catch (error) {
      throw new Error(`Failed to get user settings: ${error.message}`);
    }
  }

  /**
   * Get specific user setting by key
   * @param {number} userId - User ID
   * @param {string} key - Setting key
   * @returns {Promise<Object|null>} User setting or null
   */
  async getUserSettingByKey(userId, key) {
    try {
      const setting = await prisma.userSetting.findUnique({
        where: {
          user_id_key: {
            user_id: userId,
            key: key,
          },
        },
      });
      return setting;
    } catch (error) {
      throw new Error(`Failed to get user setting by key: ${error.message}`);
    }
  }

  /**
   * Create or update user setting
   * @param {number} userId - User ID
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   * @returns {Promise<Object>} Created/updated setting
   */
  async upsertUserSetting(userId, key, value) {
    try {
      const setting = await prisma.userSetting.upsert({
        where: {
          user_id_key: {
            user_id: userId,
            key: key,
          },
        },
        update: {
          value: value,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          key: key,
          value: value,
        },
      });
      return setting;
    } catch (error) {
      throw new Error(`Failed to upsert user setting: ${error.message}`);
    }
  }

  /**
   * Update multiple user settings
   * @param {number} userId - User ID
   * @param {Array} settings - Array of {key, value} objects
   * @returns {Promise<Array>} Updated settings
   */
  async updateUserSettings(userId, settings) {
    try {
      const results = [];

      for (const setting of settings) {
        const result = await this.upsertUserSetting(userId, setting.key, setting.value);
        results.push(result);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to update user settings: ${error.message}`);
    }
  }

  /**
   * Delete user setting by key
   * @param {number} userId - User ID
   * @param {string} key - Setting key
   * @returns {Promise<Object>} Deleted setting
   */
  async deleteUserSetting(userId, key) {
    try {
      const setting = await prisma.userSetting.delete({
        where: {
          user_id_key: {
            user_id: userId,
            key: key,
          },
        },
      });
      return setting;
    } catch (error) {
      throw new Error(`Failed to delete user setting: ${error.message}`);
    }
  }
}

// Export instance
export const userSettingsRepository = new UserSettingsRepository();
