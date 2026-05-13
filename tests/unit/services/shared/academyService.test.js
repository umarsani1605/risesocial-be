/**
 * AcademyService Unit Tests
 * Tests business logic with mocked repository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMockAcademy, getMockAcademyWithRelations, getMockPaginationResult } from '../../../helpers/academyFixtures.js';

// Mock repository
const mockRepository = {
  findBySlug: vi.fn(),
  findWithPagination: vi.fn(),
  getCategories: vi.fn(),
  findPricingsByAcademyId: vi.fn(),
  findFeaturesByAcademyId: vi.fn(),
  findInstructorsByAcademyId: vi.fn(),
  findTestimonialsByAcademyId: vi.fn(),
  findFaqsByAcademyId: vi.fn(),
  findById: vi.fn(),
  model: {
    findMany: vi.fn(),
  },
};

vi.mock('../../../../src/repositories/shared/academyRepository.js', () => ({
  academyRepository: mockRepository,
}));

// Mock logger

// Mock Prisma
const mockPrisma = {
  academyTopic: {
    findMany: vi.fn(),
  },
};

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

// Import after mocking
const { AcademyService } = await import('../../../../src/services/shared/academyService.js');

describe('AcademyService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AcademyService();
  });

  describe('getAcademyBySlug', () => {
    it('should delegate to repository correctly', async () => {
      const mockAcademy = getMockAcademyWithRelations({ slug: 'carbon-accounting' });
      mockRepository.findBySlug.mockResolvedValue(mockAcademy);

      const result = await service.getAcademyBySlug('carbon-accounting');

      expect(mockRepository.findBySlug).toHaveBeenCalledWith('carbon-accounting');
      expect(result).toEqual(mockAcademy);
    });

    it('should throw error when academy not found', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);

      await expect(service.getAcademyBySlug('non-existent-slug')).rejects.toThrow('Academy not found');

      expect(mockRepository.findBySlug).toHaveBeenCalledWith('non-existent-slug');
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findBySlug.mockRejectedValue(error);

      await expect(service.getAcademyBySlug('test-slug')).rejects.toThrow('Database connection failed');
    });
  });

  describe('getAllAcademies', () => {
    it('should delegate pagination options to repository', async () => {
      const mockResult = getMockPaginationResult([getMockAcademy()], {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      mockRepository.findWithPagination.mockResolvedValue(mockResult);

      const result = await service.getAllAcademies({ page: 1, limit: 10 });

      expect(mockRepository.findWithPagination).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(mockResult);
    });

    it('should delegate with category filter', async () => {
      const mockResult = getMockPaginationResult([getMockAcademy({ category: 'INTAKE: 24 January 2026' })]);
      mockRepository.findWithPagination.mockResolvedValue(mockResult);

      const result = await service.getAllAcademies({ category: 'INTAKE: 24 January 2026' });

      expect(mockRepository.findWithPagination).toHaveBeenCalledWith({ category: 'INTAKE: 24 January 2026' });
      expect(result).toEqual(mockResult);
    });

    it('should delegate with search parameter', async () => {
      const mockResult = getMockPaginationResult([getMockAcademy({ title: 'Carbon Accounting' })]);
      mockRepository.findWithPagination.mockResolvedValue(mockResult);

      const result = await service.getAllAcademies({ search: 'Carbon' });

      expect(mockRepository.findWithPagination).toHaveBeenCalledWith({ search: 'Carbon' });
      expect(result).toEqual(mockResult);
    });

    it('should handle empty options', async () => {
      const mockResult = getMockPaginationResult([]);
      mockRepository.findWithPagination.mockResolvedValue(mockResult);

      const result = await service.getAllAcademies();

      expect(mockRepository.findWithPagination).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResult);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.findWithPagination.mockRejectedValue(error);

      await expect(service.getAllAcademies()).rejects.toThrow('Database error');
    });
  });

  describe('getCategories', () => {
    it('should return sorted unique categories', async () => {
      const mockCategories = ['INTAKE: 24 January 2026', 'INTAKE: 15 March 2026', 'INTAKE: 10 May 2026'];
      mockRepository.getCategories.mockResolvedValue(mockCategories);

      const result = await service.getCategories();

      expect(mockRepository.getCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.getCategories.mockRejectedValue(error);

      await expect(service.getCategories()).rejects.toThrow('Database error');
    });
  });

  describe('getAllPricing', () => {
    it('should return ordered pricing list for specific academy', async () => {
      const mockPricing = [
        { id: 1, academy_id: 1, name: 'Tier 1', order: 1 },
        { id: 2, academy_id: 1, name: 'Tier 2', order: 2 },
      ];
      mockRepository.findPricingsByAcademyId.mockResolvedValue(mockPricing);

      const result = await service.getAllPricing(1);

      expect(mockRepository.findPricingsByAcademyId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPricing);
    });

    it('should return all pricing when academyId is null', async () => {
      const mockAcademies = [
        {
          id: 1,
          pricing: [
            { id: 1, academy_id: 1, name: 'Tier 1', order: 1 },
            { id: 2, academy_id: 1, name: 'Tier 2', order: 2 },
          ],
        },
        {
          id: 2,
          pricing: [{ id: 3, academy_id: 2, name: 'Tier 1', order: 1 }],
        },
      ];
      mockRepository.model.findMany.mockResolvedValue(mockAcademies);

      const result = await service.getAllPricing(null);

      expect(mockRepository.model.findMany).toHaveBeenCalledWith({
        include: { pricing: { orderBy: { order: 'asc' } } },
      });
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Tier 1');
      expect(result[1].name).toBe('Tier 2');
      expect(result[2].name).toBe('Tier 1');
    });

    it('should parse academyId as integer', async () => {
      mockRepository.findPricingsByAcademyId.mockResolvedValue([]);

      await service.getAllPricing('5');

      expect(mockRepository.findPricingsByAcademyId).toHaveBeenCalledWith(5);
    });
  });

  describe('getAllFeatures', () => {
    it('should return ordered features list for specific academy', async () => {
      const mockFeatures = [
        { id: 1, academy_id: 1, title: 'Feature 1', order: 1 },
        { id: 2, academy_id: 1, title: 'Feature 2', order: 2 },
      ];
      mockRepository.findFeaturesByAcademyId.mockResolvedValue(mockFeatures);

      const result = await service.getAllFeatures(1);

      expect(mockRepository.findFeaturesByAcademyId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFeatures);
    });

    it('should return all features when academyId is null', async () => {
      const mockAcademies = [
        {
          id: 1,
          features: [
            { id: 1, academy_id: 1, title: 'Feature 1', order: 1 },
            { id: 2, academy_id: 1, title: 'Feature 2', order: 2 },
          ],
        },
        {
          id: 2,
          features: [{ id: 3, academy_id: 2, title: 'Feature 3', order: 1 }],
        },
      ];
      mockRepository.model.findMany.mockResolvedValue(mockAcademies);

      const result = await service.getAllFeatures(null);

      expect(mockRepository.model.findMany).toHaveBeenCalledWith({
        include: { features: { orderBy: { order: 'asc' } } },
      });
      expect(result).toHaveLength(3);
    });

    it('should parse academyId as integer', async () => {
      mockRepository.findFeaturesByAcademyId.mockResolvedValue([]);

      await service.getAllFeatures('10');

      expect(mockRepository.findFeaturesByAcademyId).toHaveBeenCalledWith(10);
    });
  });

  describe('getAllInstructors', () => {
    it('should return ordered instructors list for specific academy', async () => {
      const mockInstructors = [
        { id: 1, academy_id: 1, name: 'Instructor 1', order: 1 },
        { id: 2, academy_id: 1, name: 'Instructor 2', order: 2 },
      ];
      mockRepository.findInstructorsByAcademyId.mockResolvedValue(mockInstructors);

      const result = await service.getAllInstructors(1);

      expect(mockRepository.findInstructorsByAcademyId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInstructors);
    });

    it('should return all instructors when academyId is null', async () => {
      const mockAcademies = [
        {
          id: 1,
          instructors: [{ id: 1, academy_id: 1, name: 'Instructor 1', order: 1 }],
        },
      ];
      mockRepository.model.findMany.mockResolvedValue(mockAcademies);

      const result = await service.getAllInstructors(null);

      expect(mockRepository.model.findMany).toHaveBeenCalledWith({
        include: { instructors: { orderBy: { order: 'asc' } } },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllThemes', () => {
    it('should return ordered themes for specific academy without topics', async () => {
      const mockAcademy = {
        id: 1,
        themes: [
          { id: 1, academy_id: 1, title: 'Theme 1', order: 1 },
          { id: 2, academy_id: 1, title: 'Theme 2', order: 2 },
        ],
      };
      mockRepository.findById.mockResolvedValue(mockAcademy);

      const result = await service.getAllThemes(1, false);

      expect(mockRepository.findById).toHaveBeenCalledWith(1, {
        include: {
          themes: {
            orderBy: { order: 'asc' },
            include: undefined,
          },
        },
      });
      expect(result).toEqual(mockAcademy.themes);
    });

    it('should return ordered themes with topics when includeTopics is true', async () => {
      const mockAcademy = {
        id: 1,
        themes: [
          {
            id: 1,
            academy_id: 1,
            title: 'Theme 1',
            order: 1,
            topics: [{ id: 1, theme_id: 1, title: 'Topic 1', order: 1 }],
          },
        ],
      };
      mockRepository.findById.mockResolvedValue(mockAcademy);

      const result = await service.getAllThemes(1, true);

      expect(mockRepository.findById).toHaveBeenCalledWith(1, {
        include: {
          themes: {
            orderBy: { order: 'asc' },
            include: {
              topics: { orderBy: { order: 'asc' } },
            },
          },
        },
      });
      expect(result).toEqual(mockAcademy.themes);
      expect(result[0].topics).toBeDefined();
    });

    it('should return empty array when academy not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getAllThemes(999);

      expect(result).toEqual([]);
    });

    it('should return all themes when academyId is null', async () => {
      const mockAcademies = [
        {
          id: 1,
          themes: [{ id: 1, academy_id: 1, title: 'Theme 1', order: 1 }],
        },
      ];
      mockRepository.model.findMany.mockResolvedValue(mockAcademies);

      const result = await service.getAllThemes(null, false);

      expect(mockRepository.model.findMany).toHaveBeenCalledWith({
        include: {
          themes: {
            orderBy: { order: 'asc' },
            include: undefined,
          },
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllTopics', () => {
    it('should return topics for specific theme', async () => {
      const mockTopics = [
        { id: 1, theme_id: 1, title: 'Topic 1', order: 1 },
        { id: 2, theme_id: 1, title: 'Topic 2', order: 2 },
      ];
      mockPrisma.academyTopic.findMany.mockResolvedValue(mockTopics);

      const result = await service.getAllTopics(null, 1);

      expect(mockPrisma.academyTopic.findMany).toHaveBeenCalledWith({
        where: { theme_id: 1 },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockTopics);
    });

    it('should return topics for specific academy', async () => {
      const mockTopics = [
        { id: 1, academy_id: 1, title: 'Topic 1', order: 1 },
        { id: 2, academy_id: 1, title: 'Topic 2', order: 2 },
      ];
      mockPrisma.academyTopic.findMany.mockResolvedValue(mockTopics);

      const result = await service.getAllTopics(1, null);

      expect(mockPrisma.academyTopic.findMany).toHaveBeenCalledWith({
        where: { academy_id: 1 },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockTopics);
    });

    it('should return all topics when no filters provided', async () => {
      const mockTopics = [
        { id: 1, academy_id: 1, title: 'Topic 1', order: 1 },
        { id: 2, academy_id: 2, title: 'Topic 2', order: 1 },
      ];
      mockPrisma.academyTopic.findMany.mockResolvedValue(mockTopics);

      const result = await service.getAllTopics(null, null);

      expect(mockPrisma.academyTopic.findMany).toHaveBeenCalledWith({
        orderBy: [{ academy_id: 'asc' }, { order: 'asc' }],
      });
      expect(result).toEqual(mockTopics);
    });

    it('should prioritize themeId over academyId', async () => {
      mockPrisma.academyTopic.findMany.mockResolvedValue([]);

      await service.getAllTopics(1, 5);

      expect(mockPrisma.academyTopic.findMany).toHaveBeenCalledWith({
        where: { theme_id: 5 },
        orderBy: { order: 'asc' },
      });
    });

    it('should parse IDs as integers', async () => {
      mockPrisma.academyTopic.findMany.mockResolvedValue([]);

      await service.getAllTopics('10', '20');

      expect(mockPrisma.academyTopic.findMany).toHaveBeenCalledWith({
        where: { theme_id: 20 },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('getAllTestimonials', () => {
    it('should return ordered testimonials list for specific academy', async () => {
      const mockTestimonials = [
        { id: 1, academy_id: 1, name: 'Student 1', order: 1 },
        { id: 2, academy_id: 1, name: 'Student 2', order: 2 },
      ];
      mockRepository.findTestimonialsByAcademyId.mockResolvedValue(mockTestimonials);

      const result = await service.getAllTestimonials(1);

      expect(mockRepository.findTestimonialsByAcademyId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTestimonials);
    });

    it('should return all testimonials when academyId is null', async () => {
      const mockAcademies = [
        {
          id: 1,
          testimonials: [{ id: 1, academy_id: 1, name: 'Student 1', order: 1 }],
        },
      ];
      mockRepository.model.findMany.mockResolvedValue(mockAcademies);

      const result = await service.getAllTestimonials(null);

      expect(mockRepository.model.findMany).toHaveBeenCalledWith({
        include: { testimonials: { orderBy: { order: 'asc' } } },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllFaqs', () => {
    it('should return ordered FAQs list for specific academy', async () => {
      const mockFaqs = [
        { id: 1, academy_id: 1, question: 'Question 1?', order: 1 },
        { id: 2, academy_id: 1, question: 'Question 2?', order: 2 },
      ];
      mockRepository.findFaqsByAcademyId.mockResolvedValue(mockFaqs);

      const result = await service.getAllFaqs(1);

      expect(mockRepository.findFaqsByAcademyId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFaqs);
    });

    it('should return all FAQs when academyId is null', async () => {
      const mockAcademies = [
        {
          id: 1,
          faqs: [{ id: 1, academy_id: 1, question: 'Question 1?', order: 1 }],
        },
      ];
      mockRepository.model.findMany.mockResolvedValue(mockAcademies);

      const result = await service.getAllFaqs(null);

      expect(mockRepository.model.findMany).toHaveBeenCalledWith({
        include: { faqs: { orderBy: { order: 'asc' } } },
      });
      expect(result).toHaveLength(1);
    });
  });
});
