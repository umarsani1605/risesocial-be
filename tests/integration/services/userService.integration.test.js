import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection } from '../../helpers/testDb.js';
import { userService } from '../../../src/services/userService.js';

/**
 * Integration Tests for UserService
 * Tests with real database connections
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

describe('UserService Integration Tests', () => {
  let prisma;

  beforeEach(async () => {
    prisma = getTestPrisma();
    await resetDatabase();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('User Creation', () => {
    it('should create user and persist to database', async () => {
      // Arrange
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        password: 'password123',
      };

      // Act
      const createdUser = await userService.createUser(userData);

      // Assert - verify user was created
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe('john.doe@test.com');
      expect(createdUser).not.toHaveProperty('password');

      // Verify data is actually in database
      const userInDb = await prisma.user.findUnique({
        where: { email: 'john.doe@test.com' },
      });

      expect(userInDb).toBeDefined();
      expect(userInDb.first_name).toBe('John');
      expect(userInDb.last_name).toBe('Doe');
      expect(userInDb.email).toBe('john.doe@test.com');
    });

    it('should create user with default settings', async () => {
      // Arrange
      const userData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@test.com',
        password: 'password123',
      };

      // Act
      const createdUser = await userService.createUser(userData);

      // Assert - verify default settings were created
      const settings = await prisma.userSetting.findMany({
        where: { user_id: createdUser.id },
      });

      expect(settings.length).toBeGreaterThan(0);
      
      const notificationSettings = settings.find(s => s.key === 'notification_preferences');
      expect(notificationSettings).toBeDefined();
      expect(notificationSettings.value).toHaveProperty('promo_notification');
    });

    it('should prevent duplicate email registration', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'duplicate@test.com',
        password: 'password123',
      };

      // Act - create first user
      await userService.createUser(userData);

      // Assert - second user with same email should fail
      await expect(
        userService.createUser({
          ...userData,
          first_name: 'Another',
        })
      ).rejects.toThrow('Email is already registered');
    });
  });

  describe('User Retrieval', () => {
    it('should retrieve user from database', async () => {
      // Arrange - create a user first
      const userData = {
        first_name: 'Retrieve',
        last_name: 'Test',
        email: 'retrieve@test.com',
        password: 'password123',
      };
      const createdUser = await userService.createUser(userData);

      // Act - retrieve the user
      const retrievedUser = await userService.getUserById(createdUser.id);

      // Assert
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.id).toBe(createdUser.id);
      expect(retrievedUser.email).toBe('retrieve@test.com');
      expect(retrievedUser).not.toHaveProperty('password');
    });

    it('should throw error when user not found', async () => {
      // Act & Assert
      await expect(userService.getUserById(99999)).rejects.toThrow('User not found');
    });
  });

  describe('User Update', () => {
    it('should update user data in database', async () => {
      // Arrange - create a user
      const userData = {
        first_name: 'Original',
        last_name: 'Name',
        email: 'update@test.com',
        password: 'password123',
      };
      const createdUser = await userService.createUser(userData);

      // Act - update the user
      const updatedUser = await userService.updateUser(createdUser.id, {
        first_name: 'Updated',
        last_name: 'Name',
      });

      // Assert
      expect(updatedUser.first_name).toBe('Updated');

      // Verify in database
      const userInDb = await prisma.user.findUnique({
        where: { id: createdUser.id },
      });
      expect(userInDb.first_name).toBe('Updated');
    });
  });

  describe('User Deletion', () => {
    it('should delete user from database', async () => {
      // Arrange - create a user
      const userData = {
        first_name: 'Delete',
        last_name: 'Me',
        email: 'delete@test.com',
        password: 'password123',
      };
      const createdUser = await userService.createUser(userData);

      // Act - delete the user
      await userService.deleteUser(createdUser.id);

      // Assert - user should not exist in database
      const userInDb = await prisma.user.findUnique({
        where: { id: createdUser.id },
      });
      expect(userInDb).toBeNull();
    });

    it('should cascade delete user settings', async () => {
      // Arrange - create a user
      const userData = {
        first_name: 'Cascade',
        last_name: 'Delete',
        email: 'cascade@test.com',
        password: 'password123',
      };
      const createdUser = await userService.createUser(userData);

      // Verify settings exist
      const settingsBefore = await prisma.userSetting.findMany({
        where: { user_id: createdUser.id },
      });
      expect(settingsBefore.length).toBeGreaterThan(0);

      // Act - delete the user
      await userService.deleteUser(createdUser.id);

      // Assert - settings should also be deleted (cascade)
      const settingsAfter = await prisma.userSetting.findMany({
        where: { user_id: createdUser.id },
      });
      expect(settingsAfter.length).toBe(0);
    });
  });

  describe('Data Cleanup', () => {
    it('should clean up test data after each test', async () => {
      // This test verifies that resetDatabase() works correctly
      // Create some data
      await userService.createUser({
        first_name: 'Cleanup',
        last_name: 'Test',
        email: 'cleanup@test.com',
        password: 'password123',
      });

      // Reset database
      await resetDatabase();

      // Verify data is gone
      const users = await prisma.user.findMany();
      expect(users.length).toBe(0);
    });
  });
});
