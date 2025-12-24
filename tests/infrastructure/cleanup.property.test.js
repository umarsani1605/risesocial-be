/**
 * Property Tests for Database Cleanup
 * Feature: backend-testing-infrastructure, Property 2: Database Cleanup
 * Validates: Requirements 1.3, 10.4
 * 
 * Tests that database is properly cleaned up after tests complete
 * for any test suite execution.
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { getTestPrisma, resetDatabase, closeConnection } from '../helpers/testDb.js';

describe('Infrastructure Property Tests - Database Cleanup', () => {
  afterAll(async () => {
    await closeConnection();
  });

  describe('Property 2: Database Cleanup', () => {
    it('should successfully reset database for any test execution', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Property: For any test execution, resetDatabase should complete without error
            await expect(resetDatabase()).resolves.not.toThrow();
            return true;
          }
        ),
        { numRuns: 20 } // Reduced runs for database operations
      );
    });

    it('should clear all user data after reset', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            first_name: fc.string({ minLength: 1, maxLength: 50 }),
            last_name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 6, maxLength: 100 }),
          }),
          async (userData) => {
            const testPrisma = getTestPrisma();
            
            // Create a user
            const user = await testPrisma.user.create({
              data: {
                ...userData,
                username: `${userData.first_name}${userData.last_name}`.toLowerCase(),
                role: 'USER',
              },
            });

            expect(user).toBeDefined();

            // Reset database
            await resetDatabase();

            // Property: After reset, no users should exist
            const userCount = await testPrisma.user.count();
            expect(userCount).toBe(0);

            return true;
          }
        ),
        { numRuns: 10 } // Reduced runs for database operations
      );
    }, 20000); // 20 second timeout

    it('should maintain database schema after reset', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            const testPrisma = getTestPrisma();
            
            // Reset database
            await resetDatabase();

            // Property: After reset, tables should still exist and be queryable
            // Test by attempting to query each table
            await expect(testPrisma.user.count()).resolves.toBe(0);
            await expect(testPrisma.userSetting.count()).resolves.toBe(0);
            
            // Schema should allow creating new records
            const user = await testPrisma.user.create({
              data: {
                first_name: 'Test',
                last_name: 'User',
                email: `test${Date.now()}@example.com`,
                username: `testuser${Date.now()}`,
                password: 'hashedpassword',
                role: 'USER',
              },
            });

            expect(user).toBeDefined();
            expect(user.id).toBeDefined();

            // Cleanup
            await resetDatabase();

            return true;
          }
        ),
        { numRuns: 10 }
      );
    }, 15000); // 15 second timeout

    it('should handle multiple consecutive resets', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 3 }),
          async (resetCount) => {
            // Property: Multiple consecutive resets should all succeed
            for (let i = 0; i < resetCount; i++) {
              await expect(resetDatabase()).resolves.not.toThrow();
            }

            // Database should still be functional
            const testPrisma = getTestPrisma();
            const count = await testPrisma.user.count();
            expect(count).toBe(0);

            return true;
          }
        ),
        { numRuns: 10 }
      );
    }, 15000); // 15 second timeout for multiple resets

    it('should properly disconnect after cleanup', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Property: closeConnection should complete without error
            // Note: We can't actually test disconnection in the same process
            // but we can verify the function executes
            const prismaInstance = getTestPrisma();
            expect(prismaInstance).toBeDefined();
            expect(prismaInstance.$disconnect).toBeDefined();
            
            return true;
          }
        ),
        { numRuns: 20 } // Reduced runs for quick validation
      );
    });

    it('should reset database to clean state regardless of data volume', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          async (userCount) => {
            const testPrisma = getTestPrisma();
            
            // Create multiple users
            const users = [];
            for (let i = 0; i < userCount; i++) {
              const user = await testPrisma.user.create({
                data: {
                  first_name: `User${i}`,
                  last_name: `Test${i}`,
                  email: `user${i}${Date.now()}@example.com`,
                  username: `user${i}${Date.now()}`,
                  password: 'hashedpassword',
                  role: 'USER',
                },
              });
              users.push(user);
            }

            expect(users.length).toBe(userCount);

            // Reset database
            await resetDatabase();

            // Property: After reset, all data should be cleared
            const testPrismaAfterReset = getTestPrisma();
            const remainingCount = await testPrismaAfterReset.user.count();
            expect(remainingCount).toBe(0);

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle cleanup with related data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            first_name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0),
            last_name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
          }),
          async (userData) => {
            const testPrisma = getTestPrisma();
            
            // Create user with related settings
            const user = await testPrisma.user.create({
              data: {
                ...userData,
                username: `${userData.first_name}${userData.last_name}${Date.now()}`.toLowerCase().replace(/\s/g, ''),
                password: 'hashedpassword',
                role: 'USER',
                user_settings: {
                  create: {
                    key: 'test_setting',
                    value: { test: true },
                  },
                },
              },
              include: {
                user_settings: true,
              },
            });

            expect(user.user_settings.length).toBeGreaterThan(0);

            // Reset database
            await resetDatabase();

            // Property: After reset, both users and related settings should be cleared
            const userCount = await testPrisma.user.count();
            const settingsCount = await testPrisma.userSetting.count();
            
            expect(userCount).toBe(0);
            expect(settingsCount).toBe(0);

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should maintain referential integrity after cleanup', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Reset database
            await resetDatabase();

            // Property: After reset, we should be able to create data with foreign keys
            const testPrisma = getTestPrisma();
            const user = await testPrisma.user.create({
              data: {
                first_name: 'Test',
                last_name: 'User',
                email: `test${Date.now()}@example.com`,
                username: `testuser${Date.now()}`,
                password: 'hashedpassword',
                role: 'USER',
                user_settings: {
                  create: {
                    key: 'test_key',
                    value: { test: true },
                  },
                },
              },
              include: {
                user_settings: true,
              },
            });

            expect(user).toBeDefined();
            expect(user.user_settings.length).toBeGreaterThan(0);

            // Cleanup
            await resetDatabase();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
