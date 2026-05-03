/**
 * Main seeder orchestrator
 * Coordinates execution of all domain seeders in dependency order
 */

import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/01-users.js';
import { seedAcademies } from './seeders/02-academies.js';
import { seedCohorts } from './seeders/03-cohorts.js';
import { seedJobs } from './seeders/04-jobs.js';
import { seedRyls } from './seeders/05-ryls.js';
import { seedPayments } from './seeders/06-payments.js';
import { seedTestimonials } from './seeders/07-testimonials.js';
import { seedPermissions } from './seeders/08-permissions.js';
import { logSummary, logTestCredentials, logClear } from './utils/logger.js';

const prisma = new PrismaClient();

/**
 * Parse CLI arguments
 * @returns {Object} Parsed options
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    domain: null,
    clear: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--domain=')) {
      options.domain = arg.split('=')[1];
    } else if (arg === '--clear') {
      options.clear = true;
    }
  }

  return options;
}

/**
 * Clear all data from database
 * @param {PrismaClient} prisma - Prisma client instance
 */
async function clearAllData(prisma) {
  logClear('Clearing all data from database...');

  // Delete in reverse dependency order
  await prisma.cohortCertificate.deleteMany({});
  await prisma.cohortPlacement.deleteMany({});
  await prisma.academyEnrollment.deleteMany({});
  await prisma.cohortMentor.deleteMany({});
  await prisma.cohortModuleAttachment.deleteMany({});
  await prisma.cohortModule.deleteMany({});
  await prisma.cohort.deleteMany({});

  await prisma.rylsPayment.deleteMany({});
  await prisma.midtransTransaction.deleteMany({});
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});

  await prisma.rylsDraftRegistration.deleteMany({});
  await prisma.rylsFullyFundedSubmission.deleteMany({});
  await prisma.rylsSelfFundedSubmission.deleteMany({});
  await prisma.rylsRegistration.deleteMany({});

  await prisma.userSavedJob.deleteMany({});
  await prisma.jobApplication.deleteMany({});
  await prisma.jobAIInsights.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.jobLocation.deleteMany({});
  await prisma.company.deleteMany({});

  await prisma.testimonial.deleteMany({});
  await prisma.program.deleteMany({});

  await prisma.academyTopic.deleteMany({});
  await prisma.academyTheme.deleteMany({});
  await prisma.academyFaq.deleteMany({});
  await prisma.academyTestimonial.deleteMany({});
  await prisma.academyInstructor.deleteMany({});
  await prisma.academyFeature.deleteMany({});
  await prisma.academyPricing.deleteMany({});
  await prisma.academy.deleteMany({});

  await prisma.fileUpload.deleteMany({});
  await prisma.userAdminPermission.deleteMany({});
  await prisma.adminPermission.deleteMany({});
  await prisma.userSetting.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.user.deleteMany({});

  logClear('✅ All data cleared successfully');
}

/**
 * Main seeding function
 * @param {Object} options - Seeding options
 */
async function main(options = {}) {
  const startTime = Date.now();

  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Handle clear-only mode
    if (options.clear) {
      await clearAllData(prisma);
      return;
    }

    const summary = {};

    // Execute seeders based on domain filter
    const { domain } = options;

    if (!domain || domain === 'users') {
      const stats = await seedUsers(prisma);
      Object.assign(summary, stats);
    }

    if (!domain || domain === 'academies') {
      const stats = await seedAcademies(prisma);
      Object.assign(summary, stats);
    }

    if (!domain || domain === 'cohorts') {
      // Cohorts depend on academies, so seed academies first if not already done
      if (domain === 'cohorts' && !summary.academyCount) {
        const academyStats = await seedAcademies(prisma);
        Object.assign(summary, academyStats);
      }
      const stats = await seedCohorts(prisma);
      Object.assign(summary, stats);
    }

    if (!domain || domain === 'jobs') {
      const stats = await seedJobs(prisma);
      Object.assign(summary, stats);
    }

    if (!domain || domain === 'ryls') {
      const stats = await seedRyls(prisma);
      Object.assign(summary, stats);
    }

    if (!domain || domain === 'payments') {
      const stats = await seedPayments(prisma);
      Object.assign(summary, stats);
    }

    if (!domain || domain === 'testimonials') {
      const stats = await seedTestimonials(prisma);
      Object.assign(summary, stats);
    }

    if (!domain || domain === 'permissions') {
      const stats = await seedPermissions(prisma);
      Object.assign(summary, stats);
    }

    // Log summary
    const duration = Date.now() - startTime;
    logSummary(summary, duration);

    // Log test credentials
    logTestCredentials([
      { role: 'Superadmin', email: 'superadmin@risesocial.org', password: 'password' },
      { role: 'Admin (academy+cohort)', email: 'admin.academy@risesocial.org', password: 'password' },
      { role: 'Admin (finance)', email: 'admin.finance@risesocial.org', password: 'password' },
      { role: 'Admin (jobs viewer)', email: 'admin.jobs@risesocial.org', password: 'password' },
      { role: 'Admin (full viewer)', email: 'admin.viewer@risesocial.org', password: 'password' },
      { role: 'Admin', email: 'admin@risesocial.org', password: 'password' },
      { role: 'User', email: 'user@risesocial.org', password: 'password' },
    ]);

    console.log('\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse CLI arguments and run
const options = parseArgs();
main(options);
