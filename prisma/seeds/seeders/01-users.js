/**
 * User seeder - seeds users, user settings, and system settings
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password.js';
import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { users } from '../data/users.js';

/**
 * Seed users with settings
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Object>} Statistics object
 */
export async function seedUsers(prisma) {
  try {
    logSeedStart('Users');

    // Clear existing data
    await prisma.userSetting.deleteMany({});
    await prisma.systemSetting.deleteMany({});
    await prisma.user.deleteMany({});

    // Hash passwords for all users
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const { settings, ...userData } = user;
        return {
          ...userData,
          password: await hashPassword(user.password),
          userSettings: settings,
        };
      }),
    );

    // Create users
    const createdUsers = [];
    for (const userData of usersWithHashedPasswords) {
      const { userSettings, ...userDataOnly } = userData;
      const user = await prisma.user.create({
        data: userDataOnly,
      });
      createdUsers.push({ ...user, userSettings });
    }

    // Create user settings
    let settingsCount = 0;
    for (const user of createdUsers) {
      for (const setting of user.userSettings) {
        await prisma.userSetting.create({
          data: {
            user_id: user.id,
            key: setting.key,
            value: setting.value,
          },
        });
        settingsCount++;
      }
    }

    // Create system settings
    const systemSettings = [
      {
        key: 'job_board_enabled',
        value: true,
        description: 'Enable or disable the job board feature',
      },
      {
        key: 'job_board_auto_refresh_hours',
        value: 24,
        description: 'Hours between automatic job board refresh',
      },
      {
        key: 'payment_gateway',
        value: 'midtrans',
        description: 'Active payment gateway provider',
      },
      {
        key: 'payment_currency',
        value: 'IDR',
        description: 'Default payment currency',
      },
      {
        key: 'midtrans_environment',
        value: 'sandbox',
        description: 'Midtrans environment (sandbox or production)',
      },
    ];

    for (const setting of systemSettings) {
      await prisma.systemSetting.create({
        data: setting,
      });
    }

    const stats = {
      userCount: createdUsers.length,
      settingsCount,
      systemSettingsCount: systemSettings.length,
    };

    logSeedSuccess('Users', stats);
    return stats;
  } catch (error) {
    logSeedError('Users', error);
    throw error;
  }
}
