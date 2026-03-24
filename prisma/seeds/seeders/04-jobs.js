/**
 * Job seeder - seeds companies, locations, jobs, and applications
 */

import { PrismaClient } from '@prisma/client';
import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { companies } from '../data/companies.js';
import { generateJobs, generateJobLocations } from '../data/jobs.js';

/**
 * Seed jobs with companies and locations
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Object>} Statistics object
 */
export async function seedJobs(prisma) {
  try {
    logSeedStart('Jobs');

    // Clear existing data
    await prisma.userSavedJob.deleteMany({});
    await prisma.jobApplication.deleteMany({});
    await prisma.jobAIInsights.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.jobLocation.deleteMany({});
    await prisma.company.deleteMany({});

    // Create companies
    const createdCompanies = [];
    for (const company of companies) {
      const created = await prisma.company.create({
        data: company,
      });
      createdCompanies.push(created);
    }

    // Create locations
    const locations = generateJobLocations();
    const createdLocations = [];
    for (const location of locations) {
      const created = await prisma.jobLocation.create({
        data: location,
      });
      createdLocations.push(created);
    }

    // Generate and create jobs
    const companyIds = createdCompanies.map((c) => c.id);
    const locationIds = createdLocations.map((l) => l.id);
    const jobsData = generateJobs(companyIds, locationIds);

    let aiInsightsCount = 0;
    const createdJobs = [];

    for (const jobData of jobsData) {
      const { ai_insights, ...jobFields } = jobData;

      const job = await prisma.job.create({
        data: jobFields,
      });
      createdJobs.push(job);

      // Create AI insights
      await prisma.jobAIInsights.create({
        data: {
          job_id: job.id,
          ...ai_insights,
        },
      });
      aiInsightsCount++;
    }

    // Create job applications (2 per user)
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true },
    });

    let applicationCount = 0;
    for (const user of users) {
      const jobsToApply = createdJobs.slice(0, 2);
      for (const job of jobsToApply) {
        await prisma.jobApplication.create({
          data: {
            job_id: job.id,
            user_id: user.id,
            status: 'PENDING',
            applied_at: new Date(),
          },
        });
        applicationCount++;
      }
    }

    // Create saved jobs (1 per user)
    let savedJobCount = 0;
    for (const user of users) {
      const jobToSave = createdJobs[savedJobCount % createdJobs.length];
      await prisma.userSavedJob.create({
        data: {
          user_id: user.id,
          job_id: jobToSave.id,
        },
      });
      savedJobCount++;
    }

    const stats = {
      companyCount: createdCompanies.length,
      locationCount: createdLocations.length,
      jobCount: createdJobs.length,
      aiInsightsCount,
      applicationCount,
      savedJobCount,
    };

    logSeedSuccess('Jobs', stats);
    return stats;
  } catch (error) {
    logSeedError('Jobs', error);
    throw error;
  }
}
