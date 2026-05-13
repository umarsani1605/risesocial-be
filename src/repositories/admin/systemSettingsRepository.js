import prisma from '../../config/database.js';

export class SystemSettingsRepository {

  async getSetting(key) {
    return await prisma.systemSetting.findUnique({
      where: { key },
    });
  }

  async upsertSetting(key, value, description = null) {
    const data = { value, description, updated_at: new Date() };

    const existing = await prisma.systemSetting.findUnique({ where: { key }, select: { key: true } });
    if (existing) {
      return await prisma.systemSetting.update({ where: { key }, data });
    }

    try {
      return await prisma.systemSetting.create({ data: { key, value, description } });
    } catch (err) {
    }
  }

  async getAllSettings() {
    return await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async deleteSetting(key) {
    return await prisma.systemSetting.delete({
      where: { key },
    });
  }
}

export const systemSettingsRepository = new SystemSettingsRepository();
