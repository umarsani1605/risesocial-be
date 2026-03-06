import prisma from '../../config/database.js';

export class UserSettingsRepository {
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

export const userSettingsRepository = new UserSettingsRepository();
