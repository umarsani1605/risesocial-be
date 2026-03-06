/**
 * Jobs Test Fixtures
 * Provides sample data and seeding functions for Jobs testing
 */

import { getTestPrisma } from './testDb.js';

// Sample Location Data
export const locationFixtures = [
  {
    city: 'Jakarta',
    region: 'DKI Jakarta',
    country: 'Indonesia',
    timezone: 'Asia/Jakarta',
    is_remote: false,
  },
  {
    city: 'Singapore',
    region: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    is_remote: false,
  },
  {
    city: 'Remote',
    region: 'Global',
    country: 'Global',
    timezone: null,
    is_remote: true,
  },
];

// Sample Company Data
export const companyFixtures = [
  {
    name: 'Green Tech Corp',
    slug: 'green-tech-corp',
    industry: 'Technology',
    headquarters: 'Jakarta',
    description: 'Leading green technology company',
  },
  {
    name: 'Eco Solutions',
    slug: 'eco-solutions',
    industry: 'Environmental Services',
    headquarters: 'Singapore',
    description: 'Environmental consulting firm',
  },
  {
    name: 'Solar Power Inc',
    slug: 'solar-power-inc',
    industry: 'Renewable Energy',
    headquarters: 'Jakarta',
    description: 'Solar energy provider',
  },
];

// Job fixtures will be created dynamically with proper foreign keys
export const jobFixturesTemplate = [
  {
    title: 'Software Engineer',
    slug: 'software-engineer',
    description: 'Full stack development role for green tech applications',
    employment_type: 'FULL_TIME',
    seniority_level: 'MID_LEVEL',
    status: 'active',
    posted_date: new Date('2025-01-01'),
    companyIndex: 0, // green-tech-corp
    locationIndex: 0, // Jakarta
  },
  {
    title: 'Environmental Consultant',
    slug: 'environmental-consultant',
    description: 'Consulting on environmental sustainability projects',
    employment_type: 'FULL_TIME',
    seniority_level: 'SENIOR',
    status: 'active',
    posted_date: new Date('2025-01-02'),
    companyIndex: 1, // eco-solutions
    locationIndex: 1, // Singapore
  },
  {
    title: 'Solar Panel Technician',
    slug: 'solar-panel-technician',
    description: 'Installation and maintenance of solar panels',
    employment_type: 'CONTRACT',
    seniority_level: 'ENTRY_LEVEL',
    status: 'active',
    posted_date: new Date('2025-01-03'),
    companyIndex: 2, // solar-power-inc
    locationIndex: 0, // Jakarta
  },
  {
    title: 'Remote Developer',
    slug: 'remote-developer',
    description: 'Remote software development position',
    employment_type: 'FULL_TIME',
    seniority_level: 'MID_LEVEL',
    status: 'active',
    posted_date: new Date('2025-01-04'),
    companyIndex: 0, // green-tech-corp
    locationIndex: 2, // Remote
  },
  {
    title: 'Part-time Data Analyst',
    slug: 'part-time-data-analyst',
    description: 'Part-time data analysis for environmental data',
    employment_type: 'PART_TIME',
    seniority_level: 'JUNIOR',
    status: 'active',
    posted_date: new Date('2025-01-05'),
    companyIndex: 1, // eco-solutions
    locationIndex: 1, // Singapore
  },
];

// Store created IDs for reference
let createdLocations = [];
let createdCompanies = [];
let createdJobs = [];

/**
 * Reset fixture state (call before seeding)
 */
export function resetFixtureState() {
  createdLocations = [];
  createdCompanies = [];
  createdJobs = [];
}

/**
 * Seed locations into test database
 */
export async function seedLocations() {
  const prisma = getTestPrisma();
  createdLocations = [];

  for (const location of locationFixtures) {
    const created = await prisma.jobLocation.upsert({
      where: {
        city_region_country: {
          city: location.city,
          region: location.region,
          country: location.country,
        },
      },
      update: location,
      create: location,
    });
    createdLocations.push(created);
  }

  return createdLocations;
}

/**
 * Seed companies into test database
 */
export async function seedCompanies() {
  const prisma = getTestPrisma();
  createdCompanies = [];

  for (const company of companyFixtures) {
    const created = await prisma.company.upsert({
      where: { slug: company.slug },
      update: company,
      create: company,
    });
    createdCompanies.push(created);
  }

  return createdCompanies;
}

/**
 * Seed jobs into test database
 */
export async function seedJobs() {
  const prisma = getTestPrisma();
  createdJobs = [];

  // Ensure locations and companies are seeded first
  if (createdLocations.length === 0) {
    await seedLocations();
  }
  if (createdCompanies.length === 0) {
    await seedCompanies();
  }

  for (const jobTemplate of jobFixturesTemplate) {
    const { companyIndex, locationIndex, ...jobData } = jobTemplate;
    const company = createdCompanies[companyIndex];
    const location = createdLocations[locationIndex];

    const created = await prisma.job.upsert({
      where: {
        company_id_slug: {
          company_id: company.id,
          slug: jobData.slug,
        },
      },
      update: {
        ...jobData,
        company_id: company.id,
        location_id: location.id,
      },
      create: {
        ...jobData,
        company_id: company.id,
        location_id: location.id,
      },
    });
    createdJobs.push(created);
  }

  return createdJobs;
}

/**
 * Seed all jobs-related data (locations, companies, jobs)
 */
export async function seedAllJobsData() {
  resetFixtureState();
  await seedLocations();
  await seedCompanies();
  await seedJobs();

  return {
    locations: createdLocations,
    companies: createdCompanies,
    jobs: createdJobs,
  };
}

/**
 * Get created fixtures (after seeding)
 */
export function getCreatedFixtures() {
  return {
    locations: createdLocations,
    companies: createdCompanies,
    jobs: createdJobs,
  };
}

// For backward compatibility
export const jobFixtures = jobFixturesTemplate;

/**
 * Create a custom job with specified overrides
 * @param {Object} overrides - Fields to override
 * @returns {Object} Job data
 */
export function createJobData(overrides = {}) {
  const slug = `test-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    title: `Test Job`,
    slug,
    description: 'Test job description',
    employment_type: 'FULL_TIME',
    seniority_level: 'MID_LEVEL',
    status: 'active',
    posted_date: new Date(),
    ...overrides,
  };
}

/**
 * Create multiple jobs for pagination testing
 * @param {number} count - Number of jobs to create
 * @param {Object} baseOverrides - Base overrides for all jobs
 * @returns {Array} Array of created jobs
 */
export async function seedMultipleJobs(count, baseOverrides = {}) {
  const prisma = getTestPrisma();
  const jobs = [];

  // Ensure we have at least one company and location
  if (createdCompanies.length === 0) {
    await seedCompanies();
  }
  if (createdLocations.length === 0) {
    await seedLocations();
  }

  const company = createdCompanies[0];
  const location = createdLocations[0];

  for (let i = 0; i < count; i++) {
    const slug = `pagination-test-job-${Date.now()}-${i}`;
    const jobData = {
      title: `Pagination Test Job ${i + 1}`,
      slug,
      description: 'Test job for pagination',
      employment_type: 'FULL_TIME',
      seniority_level: 'MID_LEVEL',
      status: 'active',
      posted_date: new Date(),
      company_id: company.id,
      location_id: location.id,
      ...baseOverrides,
    };

    const created = await prisma.job.create({
      data: jobData,
    });

    jobs.push(created);
  }

  return jobs;
}

/**
 * Get mock job with company and location (for unit tests)
 */
export function getMockJobWithRelations(overrides = {}) {
  return {
    id: 1,
    title: 'Software Engineer',
    slug: 'software-engineer',
    description: 'Full stack development role',
    employment_type: 'FULL_TIME',
    seniority_level: 'MID_LEVEL',
    status: 'active',
    posted_date: new Date('2025-01-01'),
    company: {
      id: 1,
      name: 'Green Tech Corp',
      slug: 'green-tech-corp',
      industry: 'Technology',
    },
    location: {
      id: 1,
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      is_remote: false,
    },
    _count: {
      applications: 0,
    },
    ...overrides,
  };
}

/**
 * Get mock search result (for unit tests)
 */
export function getMockSearchResult(jobs = [], meta = {}) {
  return {
    data: jobs,
    meta: {
      page: 1,
      limit: 10,
      total: jobs.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      ...meta,
    },
  };
}

/**
 * Seed jobs with mixed status (active and inactive) for admin testing
 * @returns {Array} Array of created jobs with mixed statuses
 */
export async function seedJobsWithMixedStatus() {
  const prisma = getTestPrisma();
  const jobs = [];

  // Ensure we have at least one company and location
  if (createdCompanies.length === 0) {
    await seedCompanies();
  }
  if (createdLocations.length === 0) {
    await seedLocations();
  }

  const company = createdCompanies[0];
  const location = createdLocations[0];

  // Create 3 active jobs
  for (let i = 0; i < 3; i++) {
    const slug = `active-job-${Date.now()}-${i}`;
    const jobData = {
      title: `Active Job ${i + 1}`,
      slug,
      description: 'Active test job for admin testing',
      employment_type: 'FULL_TIME',
      seniority_level: 'MID_LEVEL',
      status: 'active',
      posted_date: new Date(),
      company_id: company.id,
      location_id: location.id,
    };

    const created = await prisma.job.create({
      data: jobData,
    });

    jobs.push(created);
  }

  // Create 2 inactive jobs
  for (let i = 0; i < 2; i++) {
    const slug = `inactive-job-${Date.now()}-${i}`;
    const jobData = {
      title: `Inactive Job ${i + 1}`,
      slug,
      description: 'Inactive test job for admin testing',
      employment_type: 'FULL_TIME',
      seniority_level: 'MID_LEVEL',
      status: 'inactive',
      posted_date: new Date(),
      company_id: company.id,
      location_id: location.id,
    };

    const created = await prisma.job.create({
      data: jobData,
    });

    jobs.push(created);
  }

  return jobs;
}

/**
 * Seed featured jobs for testing featured filter
 * @returns {Array} Array of created featured jobs
 */
export async function seedFeaturedJobs() {
  const prisma = getTestPrisma();
  const jobs = [];

  // Ensure we have at least one company and location
  if (createdCompanies.length === 0) {
    await seedCompanies();
  }
  if (createdLocations.length === 0) {
    await seedLocations();
  }

  const company = createdCompanies[0];
  const location = createdLocations[0];

  // Create 3 featured jobs
  for (let i = 0; i < 3; i++) {
    const slug = `featured-job-${Date.now()}-${i}`;
    const jobData = {
      title: `Featured Job ${i + 1}`,
      slug,
      description: 'Featured test job',
      employment_type: 'FULL_TIME',
      seniority_level: 'MID_LEVEL',
      status: 'active',
      featured: true,
      posted_date: new Date(),
      company_id: company.id,
      location_id: location.id,
    };

    const created = await prisma.job.create({
      data: jobData,
    });

    jobs.push(created);
  }

  // Create 2 non-featured jobs
  for (let i = 0; i < 2; i++) {
    const slug = `non-featured-job-${Date.now()}-${i}`;
    const jobData = {
      title: `Non-Featured Job ${i + 1}`,
      slug,
      description: 'Non-featured test job',
      employment_type: 'FULL_TIME',
      seniority_level: 'MID_LEVEL',
      status: 'active',
      featured: false,
      posted_date: new Date(),
      company_id: company.id,
      location_id: location.id,
    };

    const created = await prisma.job.create({
      data: jobData,
    });

    jobs.push(created);
  }

  return jobs;
}
