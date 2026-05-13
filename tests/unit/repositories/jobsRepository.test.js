/**
 * JobsRepository Unit Tests
 * Tests data access logic with mocked Prisma client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMockJobWithRelations, getMockSearchResult } from '../../helpers/jobsFixtures.js';

// Mock Prisma
const mockPrisma = {
  job: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createMany: vi.fn(),
  },
  company: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
  jobLocation: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  jobAIInsights: {
    create: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

vi.mock('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

// Mock logger

// Import after mocking
const { JobsRepository } = await import('../../../src/repositories/jobsRepository.js');

describe('JobsRepository', () => {
  let repository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new JobsRepository();
  });

  describe('searchJobs', () => {
    it('should search jobs with no filters', async () => {
      const mockJobs = [getMockJobWithRelations()];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await repository.searchJobs({});

      expect(mockPrisma.job.findMany).toHaveBeenCalled();
      expect(mockPrisma.job.count).toHaveBeenCalled();
      expect(result.data).toEqual(mockJobs);
      expect(result.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should search jobs with query parameter', async () => {
      const mockJobs = [getMockJobWithRelations({ title: 'Engineer' })];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await repository.searchJobs({ query: 'Engineer' });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([expect.objectContaining({ title: expect.any(Object) })]),
          }),
        })
      );
      expect(result.data).toHaveLength(1);
    });

    it('should filter jobs by location', async () => {
      const mockJobs = [getMockJobWithRelations()];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await repository.searchJobs({ location: 'Jakarta' });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: expect.any(Object),
          }),
        })
      );
      expect(result.data).toHaveLength(1);
    });

    it('should filter jobs by remote location', async () => {
      const mockJobs = [getMockJobWithRelations({ location: { is_remote: true } })];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await repository.searchJobs({ location: 'remote' });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: { is_remote: true },
          }),
        })
      );
    });

    it('should filter jobs by industry', async () => {
      const mockJobs = [getMockJobWithRelations()];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await repository.searchJobs({ industry: 'Technology' });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            company: expect.objectContaining({
              industry: expect.any(Object),
            }),
          }),
        })
      );
    });

    it('should filter jobs by jobType', async () => {
      const mockJobs = [getMockJobWithRelations({ employment_type: 'FULL_TIME' })];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await repository.searchJobs({ jobType: 'FULL_TIME' });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employment_type: expect.any(Object),
          }),
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const mockJobs = Array(10)
        .fill(null)
        .map((_, i) => getMockJobWithRelations({ id: i + 1 }));
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);
      mockPrisma.job.count.mockResolvedValue(25);

      const result = await repository.searchJobs({ page: 2, limit: 10 });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
      expect(result.meta).toMatchObject({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should calculate hasNext and hasPrev correctly', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);
      mockPrisma.job.count.mockResolvedValue(30);

      // First page
      let result = await repository.searchJobs({ page: 1, limit: 10 });
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);

      // Middle page
      result = await repository.searchJobs({ page: 2, limit: 10 });
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(true);

      // Last page
      result = await repository.searchJobs({ page: 3, limit: 10 });
      expect(result.meta.hasNext).toBe(false);
      expect(result.meta.hasPrev).toBe(true);
    });

    it('should handle combined filters', async () => {
      const mockJobs = [getMockJobWithRelations()];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await repository.searchJobs({
        query: 'Engineer',
        location: 'Jakarta',
        industry: 'Technology',
        jobType: 'FULL_TIME',
      });

      const callArgs = mockPrisma.job.findMany.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('OR'); // query
      expect(callArgs.where).toHaveProperty('location'); // location
      expect(callArgs.where).toHaveProperty('company'); // industry
      expect(callArgs.where).toHaveProperty('employment_type'); // jobType
    });

    it('should include company and location relations', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);
      mockPrisma.job.count.mockResolvedValue(0);

      await repository.searchJobs({});

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            company: true,
            location: expect.any(Object),
            _count: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('findById', () => {
    it('should find job by ID', async () => {
      const mockJob = getMockJobWithRelations({ id: 1 });
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      const result = await repository.findById(1);

      expect(mockPrisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockJob);
    });

    it('should return null when job not found', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find job by slug', async () => {
      const mockJob = getMockJobWithRelations({ slug: 'test-job' });
      mockPrisma.job.findFirst.mockResolvedValue(mockJob);

      const result = await repository.findBySlug('test-job');

      expect(mockPrisma.job.findFirst).toHaveBeenCalledWith({
        where: { slug: 'test-job' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockJob);
    });
  });

  describe('searchCompanies', () => {
    it('should search companies with pagination', async () => {
      const mockCompanies = [{ id: 1, name: 'Test Corp', _count: { jobs: 5 } }];
      mockPrisma.company.findMany.mockResolvedValue(mockCompanies);
      mockPrisma.company.count.mockResolvedValue(1);

      const result = await repository.searchCompanies({ page: 1, limit: 10 });

      expect(mockPrisma.company.findMany).toHaveBeenCalled();
      expect(result.data).toEqual(mockCompanies);
      expect(result.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
      });
    });

    it('should filter companies by slug', async () => {
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.company.count.mockResolvedValue(0);

      await repository.searchCompanies({ slug: 'test-corp' });

      expect(mockPrisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            slug: 'test-corp',
          }),
        })
      );
    });

    it('should filter companies by industry', async () => {
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.company.count.mockResolvedValue(0);

      await repository.searchCompanies({ industry: 'Technology' });

      expect(mockPrisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            industry: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('slugExists', () => {
    it('should return true when slug exists', async () => {
      mockPrisma.job.count.mockResolvedValue(1);

      const result = await repository.slugExists('existing-slug');

      expect(result).toBe(true);
    });

    it('should return false when slug does not exist', async () => {
      mockPrisma.job.count.mockResolvedValue(0);

      const result = await repository.slugExists('non-existing-slug');

      expect(result).toBe(false);
    });
  });
});
