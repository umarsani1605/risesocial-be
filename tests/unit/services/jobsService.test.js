/**
 * JobsService Unit Tests
 * Tests business logic with mocked repository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMockJobWithRelations, getMockSearchResult } from '../../helpers/jobsFixtures.js';

// Mock repository
const mockJobsRepository = {
  searchJobs: vi.fn(),
  findById: vi.fn(),
  findBySlug: vi.fn(),
  getRecommendations: vi.fn(),
  searchCompanies: vi.fn(),
  model: {
    findMany: vi.fn(),
  },
};

vi.mock('../../../src/repositories/jobsRepository.js', () => ({
  jobsRepository: mockJobsRepository,
}));

// Mock logger

// Import after mocking
const { JobsService } = await import('../../../src/services/jobsService.js');

describe('JobsService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new JobsService();
  });

  describe('searchJobs', () => {
    it('should delegate to repository with correct options', async () => {
      const mockResult = getMockSearchResult([getMockJobWithRelations()]);
      mockJobsRepository.searchJobs.mockResolvedValue(mockResult);

      const options = { query: 'Engineer', page: 1, limit: 10 };
      const result = await service.searchJobs(options);

      expect(mockJobsRepository.searchJobs).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockResult);
    });

    it('should return empty result when no jobs found', async () => {
      const mockResult = getMockSearchResult([]);
      mockJobsRepository.searchJobs.mockResolvedValue(mockResult);

      const result = await service.searchJobs({});

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should pass all filter options to repository', async () => {
      const mockResult = getMockSearchResult([]);
      mockJobsRepository.searchJobs.mockResolvedValue(mockResult);

      const options = {
        query: 'Developer',
        location: 'Jakarta',
        industry: 'Technology',
        jobType: 'FULL_TIME',
        page: 2,
        limit: 20,
      };

      await service.searchJobs(options);

      expect(mockJobsRepository.searchJobs).toHaveBeenCalledWith(options);
    });
  });

  describe('getJobById', () => {
    it('should return job when found', async () => {
      const mockJob = getMockJobWithRelations({ id: 1 });
      mockJobsRepository.findById.mockResolvedValue(mockJob);

      const result = await service.getJobById(1);

      expect(mockJobsRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockJob);
    });

    it('should throw error when job not found', async () => {
      mockJobsRepository.findById.mockResolvedValue(null);

      await expect(service.getJobById(999)).rejects.toThrow('Job not found');
    });
  });

  describe('getJobBySlug', () => {
    it('should return job when found by slug', async () => {
      const mockJob = getMockJobWithRelations({ slug: 'test-job' });
      mockJobsRepository.findBySlug.mockResolvedValue(mockJob);

      const result = await service.getJobBySlug('test-job');

      expect(mockJobsRepository.findBySlug).toHaveBeenCalledWith('test-job');
      expect(result).toEqual(mockJob);
    });

    it('should throw 404 error when job not found by slug', async () => {
      mockJobsRepository.findBySlug.mockResolvedValue(null);

      await expect(service.getJobBySlug('non-existent')).rejects.toThrow();
    });
  });

  describe('getFeaturedJobs', () => {
    it('should return featured jobs with default limit', async () => {
      const mockJobs = [getMockJobWithRelations()];
      const mockResult = getMockSearchResult(mockJobs);
      mockJobsRepository.searchJobs.mockResolvedValue(mockResult);

      const result = await service.getFeaturedJobs();

      expect(mockJobsRepository.searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 6,
          sortBy: 'postedDate',
          sortOrder: 'desc',
        })
      );
      expect(result).toEqual(mockJobs);
    });

    it('should return featured jobs with custom limit', async () => {
      const mockJobs = Array(10)
        .fill(null)
        .map((_, i) => getMockJobWithRelations({ id: i }));
      const mockResult = getMockSearchResult(mockJobs);
      mockJobsRepository.searchJobs.mockResolvedValue(mockResult);

      const result = await service.getFeaturedJobs(10);

      expect(mockJobsRepository.searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
        })
      );
      expect(result).toHaveLength(10);
    });
  });

  describe('getJobCategories', () => {
    it('should return unique job categories', async () => {
      const mockCategories = [{ employment_type: 'FULL_TIME' }, { employment_type: 'PART_TIME' }, { employment_type: 'CONTRACT' }];
      mockJobsRepository.model.findMany.mockResolvedValue(mockCategories);

      const result = await service.getJobCategories();

      expect(result).toEqual(['CONTRACT', 'FULL_TIME', 'PART_TIME']);
    });

    it('should filter out null values', async () => {
      const mockCategories = [{ employment_type: 'FULL_TIME' }, { employment_type: null }, { employment_type: 'PART_TIME' }];
      mockJobsRepository.model.findMany.mockResolvedValue(mockCategories);

      const result = await service.getJobCategories();

      expect(result).not.toContain(null);
      expect(result).toHaveLength(2);
    });
  });

  describe('getCompanies', () => {
    it('should delegate to repository with options', async () => {
      const mockResult = {
        data: [{ id: 1, name: 'Test Corp' }],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      mockJobsRepository.searchCompanies.mockResolvedValue(mockResult);

      const options = { page: 1, limit: 20, industry: 'Technology' };
      const result = await service.getCompanies(options);

      expect(mockJobsRepository.searchCompanies).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getJobRecommendations', () => {
    it('should return recommendations based on preferences', async () => {
      const mockJobs = [getMockJobWithRelations()];
      mockJobsRepository.getRecommendations.mockResolvedValue(mockJobs);

      const result = await service.getJobRecommendations(1, { skills: ['JavaScript'] });

      expect(mockJobsRepository.getRecommendations).toHaveBeenCalled();
      expect(result).toEqual(mockJobs);
    });

    it('should use default limit when not specified', async () => {
      mockJobsRepository.getRecommendations.mockResolvedValue([]);

      await service.getJobRecommendations(1, {});

      expect(mockJobsRepository.getRecommendations).toHaveBeenCalledWith(expect.any(Object), 10);
    });
  });

  describe('validateJobData', () => {
    it('should throw error when title is missing', async () => {
      await expect(service.validateJobData({ description: 'Test', company: 'Test', location: 'Test' })).rejects.toThrow('Title is required');
    });

    it('should throw error when title is too short', async () => {
      await expect(
        service.validateJobData({ title: 'AB', description: 'Test description that is long enough', company: 'Test', location: 'Test' })
      ).rejects.toThrow('Title must be at least 3 characters');
    });

    it('should throw error when description is missing', async () => {
      await expect(service.validateJobData({ title: 'Test Job', company: 'Test', location: 'Test' })).rejects.toThrow('Description is required');
    });

    it('should pass validation with valid data', async () => {
      await expect(
        service.validateJobData(
          {
            title: 'Software Engineer',
            description: 'A detailed job description that is at least 50 characters long for validation purposes.',
            company: 'Test Corp',
            location: 'Jakarta',
          },
          true
        )
      ).resolves.not.toThrow();
    });
  });
});
