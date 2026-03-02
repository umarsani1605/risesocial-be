/**
 * User Test Fixtures
 * Provides sample data and seeding functions for User testing
 */

import { getTestPrisma } from './testDb.js';
import bcrypt from 'bcryptjs';

// Sample user data with hashed passwords
export const userFixturesData = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@test.com',
    username: 'johndoe',
    password: '$2b$12$4EWx1nSY/bV2zY5TCUynUOg5oAQz1SjvS15yLK3uB81H3UOtDGz82', // password123
    role: 'USER',
    phone: '+62812345678',
    avatar: null,
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@test.com',
    username: 'janesmith',
    password: '$2b$12$4EWx1nSY/bV2zY5TCUynUOg5oAQz1SjvS15yLK3uB81H3UOtDGz82', // password123
    role: 'USER',
    phone: '+62812345679',
    avatar: null,
  },
  {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@test.com',
    username: 'adminuser',
    password: '$2b$12$4EWx1nSY/bV2zY5TCUynUOg5oAQz1SjvS15yLK3uB81H3UOtDGz82', // password123
    role: 'ADMIN',
    phone: '+62812345680',
    avatar: null,
  },
];

// Plain text password for testing login
export const TEST_PASSWORD = 'password123';

let createdUsers = [];

/**
 * Reset fixture state (call before seeding)
 */
export function resetUserFixtureState() {
  createdUsers = [];
}

/**
 * Seed users into test database
 */
export async function seedUsers() {
  const prisma = getTestPrisma();
  createdUsers = [];

  for (const userData of userFixturesData) {
    const created = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(created);
  }

  return createdUsers;
}

/**
 * Seed users with default settings
 */
export async function seedUsersWithSettings() {
  const prisma = getTestPrisma();
  createdUsers = [];

  for (const userData of userFixturesData) {
    const user = await prisma.user.create({
      data: userData,
    });

    // Create default notification preferences
    await prisma.userSetting.create({
      data: {
        user_id: user.id,
        key: 'notification_preferences',
        value: {
          promo_notification: true,
          job_notification: true,
          program_notification: true,
        },
      },
    });

    createdUsers.push(user);
  }

  return createdUsers;
}

/**
 * Get created users (after seeding)
 */
export function getCreatedUsers() {
  return createdUsers;
}

/**
 * Create a custom user with specified overrides
 */
export async function createTestUser(overrides = {}) {
  const prisma = getTestPrisma();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);

  const userData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test.user.${timestamp}.${random}@test.com`,
    username: `testuser${timestamp}${random}`,
    password: await bcrypt.hash('password123', 12),
    role: 'USER',
    phone: `+628123456${timestamp.toString().slice(-3)}`,
    ...overrides,
  };

  const user = await prisma.user.create({
    data: userData,
  });

  return user;
}

/**
 * Get mock user (for unit tests)
 */
export function getMockUser(overrides = {}) {
  return {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@test.com',
    username: 'johndoe',
    role: 'USER',
    phone: '+62812345678',
    avatar: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

/**
 * Get mock user with settings (for unit tests)
 */
export function getMockUserWithSettings(overrides = {}) {
  return {
    ...getMockUser(overrides),
    user_settings: [
      {
        id: 1,
        user_id: 1,
        key: 'notification_preferences',
        value: {
          promo_notification: true,
          job_notification: true,
          program_notification: true,
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  };
}

/**
 * Get mock user settings array (for unit tests)
 */
export function getMockUserSettings() {
  return [
    {
      id: 1,
      user_id: 1,
      key: 'notification_preferences',
      value: {
        promo_notification: true,
        job_notification: true,
        program_notification: true,
      },
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      user_id: 1,
      key: 'theme',
      value: 'light',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
}

/**
 * Get mock notification preferences (for unit tests)
 */
export function getMockNotificationPreferences(overrides = {}) {
  return {
    promo_notification: true,
    job_notification: true,
    program_notification: true,
    ...overrides,
  };
}

/**
 * Get mock paginated users result (for unit tests)
 */
export function getMockPaginatedUsers(users = [], meta = {}) {
  return {
    data: users,
    meta: {
      page: 1,
      limit: 10,
      total: users.length,
      totalPages: Math.ceil(users.length / 10),
      ...meta,
    },
  };
}
