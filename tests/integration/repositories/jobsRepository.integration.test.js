/**
 * JobsRepository Integration Tests
 * Tests with real database connection
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../../helpers/testDb.js';
import { seedAllJobsData, seedMultipleJobs, getCreatedFixtures } from '../../helpers/jobsFixtures.js';
import { JobsRepository } from '../../../src/repositories/jobsRepository.js';

describe('JobsRepository Integration Tests', () => {
  let repository;
  let prisma;
  let fixtures;

  beforeAll(async () => {
    // Verify we're using test database
    expect(isTestDatabase()).toBe(true);

    prisma = getTestPrisma();
    repository = new JobsRepository();
  });

  beforeEach(async () => {
    // Reset database before each test
    await resetDatabase();
    // Seed test data
    fixtures = await seedAllJobsData();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('searchJobs', () => {
    it('should return all jobs when no filters applied', async () => {
      const result = await repository.searchJobs({});

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta.total).toBe(fixtures.jobs.length);
    });

    it('should search jobs by query (partial match on title)', async () => {
      const result = await repository.searchJobs({ query: 'Engineer' });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((job) => {
        const matchesQuery =
          job.title.toLowerCase().includes('engineer') ||
          job.description.toLowerCase().includes('engineer') ||
          job.company?.name?.toLowerCase().includes('engineer');
        expect(matchesQuery).toBe(true);
      });
    });

    it('should filter jobs by location (city)', async () => {
      const result = await repository.searchJobs({ location: 'Jakarta' });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((job) => {
        expect(job.location?.city).toBe('Jakarta');
      });
    });

    it('should filter jobs by remote location', async () => {
      const result = await repository.searchJobs({ location: 'remote' });

      result.data.forEach((job) => {
        expect(job.location?.is_remote).toBe(true);
      });
    });

    it('should filter jobs by industry', async () => {
      const result = await repository.searchJobs({ industry: 'Technology' });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((job) => {
        expect(job.company?.industry?.toLowerCase()).toContain('technology');
      });
    });

    it('should filter jobs by jobType (employment_type)', async () => {
      const result = await repository.searchJobs({ jobType: 'FULL_TIME' });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((job) => {
        expect(job.employment_type.toUpperCase()).toBe('FULL_TIME');
      });
    });

    it('should filter jobs by CONTRACT type', async () => {
      const result = await repository.searchJobs({ jobType: 'CONTRACT' });

      result.data.forEach((job) => {
        expect(job.employment_type.toUpperCase()).toBe('CONTRACT');
      });
    });

    it('should handle combined filters (AND logic)', async () => {
      const result = await repository.searchJobs({
        location: 'Jakarta',
        industry: 'Technology',
      });

      result.data.forEach((job) => {
        expect(job.location?.city).toBe('Jakarta');
        expect(job.company?.industry?.toLowerCase()).toContain('technology');
      });
    });

    it('should return empty array when no jobs match filters', async () => {
      const result = await repository.searchJobs({
        query: 'NonExistentJobTitle12345',
      });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('pagination', () => {
    beforeEach(async () => {
      // Seed additional jobs for pagination testing
      await seedMultipleJobs(25);
    });

    it('should paginate results correctly', async () => {
      const page1 = await repository.searchJobs({ page: 1, limit: 10 });
      const page2 = await repository.searchJobs({ page: 2, limit: 10 });

      expect(page1.data.length).toBeLessThanOrEqual(10);
      expect(page2.data.length).toBeLessThanOrEqual(10);

      // Ensure different results on different pages
      if (page1.data.length > 0 && page2.data.length > 0) {
        expect(page1.data[0].id).not.toBe(page2.data[0].id);
      }
    });

    it('should calculate meta correctly', async () => {
      const result = await repository.searchJobs({ page: 1, limit: 10 });

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBeGreaterThan(10);
      expect(result.meta.totalPages).toBe(Math.ceil(result.meta.total / 10));
    });

    it('should set hasNext correctly', async () => {
      const page1 = await repository.searchJobs({ page: 1, limit: 10 });

      expect(page1.meta.hasNext).toBe(page1.meta.page * page1.meta.limit < page1.meta.total);
    });

    it('should set hasPrev correctly', async () => {
      const page1 = await repository.searchJobs({ page: 1, limit: 10 });
      const page2 = await repository.searchJobs({ page: 2, limit: 10 });

      expect(page1.meta.hasPrev).toBe(false);
      expect(page2.meta.hasPrev).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find job by ID with relations', async () => {
      const job = fixtures.jobs[0];
      const result = await repository.findById(job.id);

      expect(result).not.toBeNull();
      expect(result.id).toBe(job.id);
      expect(result.company).toBeDefined();
      expect(result.location).toBeDefined();
    });

    it('should return null for non-existent ID', async () => {
      const result = await repository.findById(99999);

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find job by slug', async () => {
      const result = await repository.findBySlug('software-engineer');

      expect(result).not.toBeNull();
      expect(result.slug).toBe('software-engineer');
    });

    it('should return null for non-existent slug', async () => {
      const result = await repository.findBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  describe('searchCompanies', () => {
    it('should return companies with job counts', async () => {
      const result = await repository.searchCompanies({});

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((company) => {
        expect(company._count).toBeDefined();
        expect(company._count.jobs).toBeDefined();
      });
    });

    it('should filter companies by slug', async () => {
      const result = await repository.searchCompanies({ slug: 'green-tech-corp' });

      expect(result.data.length).toBe(1);
      expect(result.data[0].slug).toBe('green-tech-corp');
    });

    it('should filter companies by industry', async () => {
      const result = await repository.searchCompanies({ industry: 'Technology' });

      result.data.forEach((company) => {
        expect(company.industry?.toLowerCase()).toContain('technology');
      });
    });

    it('should paginate companies', async () => {
      const result = await repository.searchCompanies({ page: 1, limit: 2 });

      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
    });
  });

  describe('database cleanup', () => {
    it('should have clean state after resetDatabase', async () => {
      await resetDatabase();

      const jobs = await prisma.job.findMany();
      const companies = await prisma.company.findMany();

      expect(jobs).toHaveLength(0);
      expect(companies).toHaveLength(0);
    });
  });
});
