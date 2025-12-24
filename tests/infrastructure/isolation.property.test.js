/**
 * Property Tests for Database Isolation
 * Feature: backend-testing-infrastructure, Property 6: Test Database Isolation
 * Validates: Requirements 10.1, 10.5
 * 
 * Tests that only the test database is used, never production,
 * for any test execution.
 */

import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { getTestPrisma, closeConnection, isTestDatabase } from '../helpers/testDb.js';

describe('Infrastructure Property Tests - Database Isolation', () => {
  afterAll(async () => {
    await closeConnection();
  });

  describe('Property 6: Test Database Isolation', () => {
    it('should always use test database for any test execution', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Property: For any test execution, only test database should be used
            const isTest = isTestDatabase();
            expect(isTest).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify DATABASE_URL contains test identifier', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            const dbUrl = process.env.DATABASE_URL || '';
            
            // Property: DATABASE_URL must contain '_test' or 'test'
            const hasTestIdentifier = dbUrl.includes('_test') || dbUrl.includes('test');
            expect(hasTestIdentifier).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should prevent production database keywords in DATABASE_URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            const dbUrl = process.env.DATABASE_URL || '';
            const productionKeywords = ['production', 'prod', 'live', 'main'];
            
            // Property: DATABASE_URL must NOT contain production keywords
            const hasProductionKeyword = productionKeywords.some(keyword => 
              dbUrl.toLowerCase().includes(keyword)
            );
            expect(hasProductionKeyword).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use test database when creating Prisma client', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Property: getTestPrisma should always verify test database before creating client
            const prisma = getTestPrisma();
            
            expect(prisma).toBeDefined();
            expect(prisma.$connect).toBeDefined();
            
            // Verify we're still using test database
            expect(isTestDatabase()).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain test database isolation across multiple operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }),
          async (operationCount) => {
            // Property: Multiple database operations should all use test database
            for (let i = 0; i < operationCount; i++) {
              const prisma = getTestPrisma();
              
              // Perform a simple query
              const count = await prisma.user.count();
              expect(count).toBeGreaterThanOrEqual(0);
              
              // Verify still using test database
              expect(isTestDatabase()).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should verify NODE_ENV is set to test', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            const nodeEnv = process.env.NODE_ENV || '';
            
            // Property: NODE_ENV should be 'test' for test execution
            expect(nodeEnv).toBe('test');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-test database URLs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'postgresql://user:pass@localhost:5432/production',
            'postgresql://user:pass@localhost:5432/risesocial',
            'postgresql://user:pass@localhost:5432/main_db',
            'postgresql://user:pass@localhost:5432/live_db',
            'postgresql://user:pass@localhost:5432/prod_db'
          ),
          async (fakeDbUrl) => {
            // Property: Non-test database URLs should be rejected
            // We test this by checking if the URL would pass our validation
            const hasTestIdentifier = fakeDbUrl.includes('_test') || fakeDbUrl.includes('test');
            const productionKeywords = ['production', 'prod', 'live', 'main'];
            const hasProductionKeyword = productionKeywords.some(keyword => 
              fakeDbUrl.toLowerCase().includes(keyword)
            );
            
            // These URLs should NOT be valid for testing
            const isValidTestUrl = hasTestIdentifier && !hasProductionKeyword;
            expect(isValidTestUrl).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should accept valid test database URLs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'postgresql://user:pass@localhost:5432/risesocial_test',
            'postgresql://user:pass@localhost:5432/test_db',
            'postgresql://user:pass@localhost:5432/myapp_test',
            'postgresql://user:pass@localhost:5432/testing'
          ),
          async (testDbUrl) => {
            // Property: Valid test database URLs should be accepted
            const hasTestIdentifier = testDbUrl.includes('_test') || testDbUrl.includes('test');
            const productionKeywords = ['production', 'prod', 'live', 'main'];
            const hasProductionKeyword = productionKeywords.some(keyword => 
              testDbUrl.toLowerCase().includes(keyword)
            );
            
            // These URLs should be valid for testing
            const isValidTestUrl = hasTestIdentifier && !hasProductionKeyword;
            expect(isValidTestUrl).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain isolation when performing database writes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            first_name: fc.string({ minLength: 1, maxLength: 50 }),
            last_name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
          }),
          async (userData) => {
            const testPrisma = getTestPrisma();
            
            // Property: Database writes should only affect test database
            // Verify we're using test database before write
            expect(isTestDatabase()).toBe(true);
            
            // Perform write operation
            const user = await testPrisma.user.create({
              data: {
                ...userData,
                username: `${userData.first_name}${Date.now()}`.toLowerCase(),
                password: 'hashedpassword',
                role: 'USER',
              },
            });
            
            expect(user).toBeDefined();
            
            // Verify still using test database after write
            expect(isTestDatabase()).toBe(true);
            
            // Cleanup
            await testPrisma.user.delete({ where: { id: user.id } });
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain isolation across concurrent operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            const testPrisma = getTestPrisma();
            
            // Property: Concurrent operations should all use test database
            const operations = [
              testPrisma.user.count(),
              testPrisma.userSetting.count(),
              Promise.resolve(isTestDatabase()),
            ];
            
            const results = await Promise.all(operations);
            
            // All operations should complete successfully
            expect(results[0]).toBeGreaterThanOrEqual(0); // user count
            expect(results[1]).toBeGreaterThanOrEqual(0); // settings count
            expect(results[2]).toBe(true); // still using test database
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
