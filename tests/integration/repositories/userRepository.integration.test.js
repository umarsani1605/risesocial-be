/**
 * UserRepository Integration Tests
 * Tests with real database connection
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../../helpers/testDb.js';
import { seedUsers, seedUsersWithSettings } from '../../helpers/userFixtures.js';
import { UserRepository } from '../../../src/repositories/userRepository.js';

describe('UserRepository Integration Tests', () => {
  let repository;
  let prisma;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    repository = new UserRepository();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const users = await seedUsers();
      const result = await repository.findByEmail(users[0].email);

      expect(result).not.toBeNull();
      expect(result.email).toBe(users[0].email);
      expect(result.first_name).toBe(users[0].first_name);
    });

    it('should return null for non-existent email', async () => {
      const result = await repository.findByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });

    it('should include relations when specified', async () => {
      const users = await seedUsersWithSettings();
      const result = await repository.findByEmail(users[0].email, {
        include: { user_settings: true },
      });

      expect(result).not.toBeNull();
      expect(result.user_settings).toBeDefined();
      expect(Array.isArray(result.user_settings)).toBe(true);
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const users = await seedUsers();
      const result = await repository.findByUsername(users[0].username);

      expect(result).not.toBeNull();
      expect(result.username).toBe(users[0].username);
    });

    it('should return null for non-existent username', async () => {
      const result = await repository.findByUsername('nonexistentuser');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const users = await seedUsers();
      const result = await repository.findById(users[0].id);

      expect(result).not.toBeNull();
      expect(result.id).toBe(users[0].id);
    });

    it('should return null for non-existent ID', async () => {
      const result = await repository.findById(99999);

      expect(result).toBeNull();
    });

    it('should include relations when specified', async () => {
      const users = await seedUsersWithSettings();
      const result = await repository.findById(users[0].id, {
        include: { user_settings: true },
      });

      expect(result).not.toBeNull();
      expect(result.user_settings).toBeDefined();
    });
  });

  describe('createWithSettings', () => {
    it('should create user with default notification settings', async () => {
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test.create@test.com',
        username: 'testcreate',
        password: 'hashedpassword123',
        role: 'USER',
      };

      const result = await repository.createWithSettings(userData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(userData.email);

      // Verify notification settings were created
      const settings = await prisma.userSetting.findFirst({
        where: {
          user_id: result.id,
          key: 'notification_preferences',
        },
      });

      expect(settings).not.toBeNull();
      expect(settings.value).toEqual({
        job_notification: true,
        program_notification: true,
      });
    });

    it('should fail with duplicate email', async () => {
      const users = await seedUsers();
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: users[0].email, // Duplicate email
        username: 'uniqueusername',
        password: 'hashedpassword123',
        role: 'USER',
      };

      await expect(repository.createWithSettings(userData)).rejects.toThrow();
    });

    it('should fail with duplicate username', async () => {
      const users = await seedUsers();
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'unique@test.com',
        username: users[0].username, // Duplicate username
        password: 'hashedpassword123',
        role: 'USER',
      };

      await expect(repository.createWithSettings(userData)).rejects.toThrow();
    });
  });

  describe('findManyWithPagination', () => {
    beforeEach(async () => {
      await seedUsers();
    });

    it('should return paginated users', async () => {
      const result = await repository.findManyWithPagination({
        page: 1,
        limit: 2,
      });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.total).toBeGreaterThan(0);
    });

    it('should filter by role', async () => {
      const result = await repository.findManyWithPagination({
        role: 'ADMIN',
      });

      expect(result.data).toBeDefined();
      result.data.forEach((user) => {
        expect(user.role).toBe('ADMIN');
      });
    });

    it('should search by name', async () => {
      const result = await repository.findManyWithPagination({
        search: 'John',
      });

      expect(result.data).toBeDefined();
      result.data.forEach((user) => {
        const matchesSearch =
          user.first_name.toLowerCase().includes('john') ||
          user.last_name.toLowerCase().includes('john') ||
          user.email.toLowerCase().includes('john') ||
          user.username.toLowerCase().includes('john');
        expect(matchesSearch).toBe(true);
      });
    });

    it('should search by email', async () => {
      const result = await repository.findManyWithPagination({
        search: 'doe@test',
      });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should include user_settings', async () => {
      await resetDatabase();
      await seedUsersWithSettings();

      const result = await repository.findManyWithPagination({
        page: 1,
        limit: 10,
      });

      expect(result.data[0].user_settings).toBeDefined();
    });

    it('should calculate pagination meta correctly', async () => {
      const result = await repository.findManyWithPagination({
        page: 1,
        limit: 2,
      });

      expect(result.meta.totalPages).toBe(Math.ceil(result.meta.total / 2));
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const users = await seedUsers();
      const updateData = {
        first_name: 'Updated',
        phone: '+62999999999',
      };

      const result = await repository.update(users[0].id, updateData);

      expect(result).toBeDefined();
      expect(result.first_name).toBe('Updated');
      expect(result.phone).toBe('+62999999999');
      expect(result.last_name).toBe(users[0].last_name); // Unchanged
    });

    it('should update password', async () => {
      const users = await seedUsers();
      const newPassword = 'newhashed123';

      const result = await repository.update(users[0].id, {
        password: newPassword,
      });

      expect(result.password).toBe(newPassword);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const users = await seedUsers();
      await repository.delete(users[0].id);

      const result = await repository.findById(users[0].id);
      expect(result).toBeNull();
    });

    it('should cascade delete user settings', async () => {
      const users = await seedUsersWithSettings();
      const userId = users[0].id;

      // Verify settings exist
      const settingsBefore = await prisma.userSetting.findMany({
        where: { user_id: userId },
      });
      expect(settingsBefore.length).toBeGreaterThan(0);

      // Delete user
      await repository.delete(userId);

      // Verify settings are deleted
      const settingsAfter = await prisma.userSetting.findMany({
        where: { user_id: userId },
      });
      expect(settingsAfter.length).toBe(0);
    });
  });

  describe('emailExists', () => {
    it('should return true for existing email', async () => {
      const users = await seedUsers();
      const result = await repository.emailExists(users[0].email);

      expect(result).toBe(true);
    });

    it('should return false for non-existent email', async () => {
      const result = await repository.emailExists('nonexistent@test.com');

      expect(result).toBe(false);
    });
  });

  describe('usernameExists', () => {
    it('should return true for existing username', async () => {
      const users = await seedUsers();
      const result = await repository.usernameExists(users[0].username);

      expect(result).toBe(true);
    });

    it('should return false for non-existent username', async () => {
      const result = await repository.usernameExists('nonexistentuser');

      expect(result).toBe(false);
    });
  });

  describe('database cleanup', () => {
    it('should have clean state after resetDatabase', async () => {
      await seedUsers();
      await resetDatabase();

      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });
  });
});
