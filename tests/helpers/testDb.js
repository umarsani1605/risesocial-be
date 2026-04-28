/**
 * Test Database Helper
 * Provides utilities for database operations in tests
 */

import { PrismaClient } from '@prisma/client';

let testPrisma = null;

/**
 * Verify we're using a test database (safety check)
 * Throws error if not using test database
 */
function verifyTestDatabase() {
  const dbUrl = process.env.DATABASE_URL || '';
  const nodeEnv = process.env.NODE_ENV || '';

  // Check if database URL contains '_test' or NODE_ENV is 'test'
  const isTestDb = dbUrl.includes('_test') || dbUrl.includes('test');
  const isTestEnv = nodeEnv === 'test';

  if (!isTestDb && !isTestEnv) {
    throw new Error(
      'SAFETY CHECK FAILED: Not using test database!\n' +
        'DATABASE_URL must contain "_test" or "test" in the name.\n' +
        `Current DATABASE_URL: ${dbUrl}\n` +
        'This prevents accidental data loss in production/development databases.',
    );
  }

  // Additional check: prevent using production-like database names
  const productionKeywords = ['production', 'prod', 'live', 'main'];
  const hasProductionKeyword = productionKeywords.some((keyword) => dbUrl.toLowerCase().includes(keyword));

  if (hasProductionKeyword) {
    throw new Error(
      'SAFETY CHECK FAILED: Database URL contains production keywords!\n' +
        `Current DATABASE_URL: ${dbUrl}\n` +
        'Tests should never run against production databases.',
    );
  }
}

/**
 * Get or create test Prisma client
 * @returns {PrismaClient}
 */
export function getTestPrisma() {
  // Verify test database before creating client
  verifyTestDatabase();

  if (!testPrisma) {
    testPrisma = new PrismaClient({
      log: ['error'],
      errorFormat: 'minimal',
    });
  }
  return testPrisma;
}

/**
 * Reset database by truncating all tables
 * Clears test data while preserving schema
 */
export async function resetDatabase() {
  // Safety check before resetting
  verifyTestDatabase();

  const prisma = getTestPrisma();

  // Tables in order to respect foreign key constraints
  const tablesToTruncate = [
    'ryls_payments',
    'ryls_self_funded_submissions',
    'ryls_fully_funded_submissions',
    'file_uploads',
    'ryls_registrations',
    'job_applications',
    'user_saved_jobs',
    'job_ai_insights',
    'jobs',
    'job_locations',
    'companies',
    'cohort_certificates',
    'cohort_placements',
    'cohort_enrollments',
    'cohort_module_attachments',
    'cohort_modules',
    'cohort_mentors',
    'cohorts',
    'academy_enrollments',
    'academy_faqs',
    'academy_testimonials',
    'academy_instructors',
    'academy_topics',
    'academy_themes',
    'academy_features',
    'academy_pricing',
    'academies',
    'user_settings',
    'users',
    'testimonials',
    'programs',
    'system_settings',
  ];

  for (const table of tablesToTruncate) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
    } catch (error) {
      // Table might not exist, skip silently
      if (!error.message.includes('does not exist')) {
        console.warn(`Warning: Could not truncate ${table}:`, error.message);
      }
    }
  }
}

/**
 * Close database connection
 * Should be called after all tests complete
 */
export async function closeConnection() {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }
}

/**
 * Check if using test database (safety check)
 * @returns {boolean}
 */
export function isTestDatabase() {
  const dbUrl = process.env.DATABASE_URL || '';
  return dbUrl.includes('_test') || dbUrl.includes('test') || process.env.NODE_ENV === 'test';
}

export default {
  getTestPrisma,
  resetDatabase,
  closeConnection,
  isTestDatabase,
};
