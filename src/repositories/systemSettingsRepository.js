import prisma from '../lib/prisma.js';
import { getLogger } from '../lib/loggerContext.js';

export class SystemSettingsRepository {
  get logger() {
    return getLogger();
  }

  async getSetting(key) {
    this.logger.info({ key }, '[systemSettingsRepository] getSetting called');
    return await prisma.systemSetting.findUnique({
      where: { key },
    });
  }

  async upsertSetting(key, value, description = null) {
    this.logger.info({ key }, '[systemSettingsRepository] upsertSetting(update-then-insert) called');
    const data = { value, description, updated_at: new Date() };

    const existing = await prisma.systemSetting.findUnique({ where: { key }, select: { key: true } });
    if (existing) {
      return await prisma.systemSetting.update({ where: { key }, data });
    }

    try {
      return await prisma.systemSetting.create({ data: { key, value, description } });
    } catch (err) {
      this.logger.warn({ key, err }, '[systemSettingsRepository] create system setting failed');
    }
  }

  async getAllSettings() {
    this.logger.info('[systemSettingsRepository] getAllSettings called');
    return await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async deleteSetting(key) {
    this.logger.info({ key }, '[systemSettingsRepository] deleteSetting called');
    return await prisma.systemSetting.delete({
      where: { key },
    });
  }
}

// Export instance
export const systemSettingsRepository = new SystemSettingsRepository();
