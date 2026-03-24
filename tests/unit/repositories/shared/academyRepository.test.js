/**
 * AcademyRepository Unit Tests
 * Tests data access logic with mocked Prisma client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMockAcademy, getMockAcademyWithRelations } from '../../../helpers/academyFixtures.js';

// Mock Prisma
const mockPrisma = {
  academy: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  academyPricing: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  academyFeature: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  academyTheme: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  academyTopic: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  academyInstructor: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  academyTestimonial: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  academyFaq: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

// Mock logger
vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

// Import after mocking
const { AcademyRepository } = await import('../../../../src/repositories/shared/academyRepository.js');

describe('AcademyRepository', () => {
  let repository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AcademyRepository();
  });

  describe('findBySlug', () => {
    it('should return academy with all nested relations for valid slug', async () => {
      const mockAcademy = getMockAcademyWithRelations({ slug: 'carbon-accounting' });
      mockPrisma.academy.findUnique.mockResolvedValue(mockAcademy);

      const result = await repository.findBySlug('carbon-accounting');

      expect(mockPrisma.academy.findUnique).toHaveBeenCalledWith({
        where: { slug: 'carbon-accounting' },
        include: expect.objectContaining({
          pricing: { orderBy: { order: 'asc' } },
          features: { orderBy: { order: 'asc' } },
          themes: expect.objectContaining({
            orderBy: { order: 'asc' },
            include: expect.objectContaining({
              topics: expect.any(Object),
            }),
          }),
          instructors: { orderBy: { order: 'asc' } },
          testimonials: { orderBy: { order: 'asc' } },
          faqs: { orderBy: { order: 'asc' } },
        }),
      });
      expect(result).toEqual(mockAcademy);
      expect(result.pricing).toBeDefined();
      expect(result.features).toBeDefined();
      expect(result.themes).toBeDefined();
      expect(result.instructors).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(result.faqs).toBeDefined();
    });

    it('should return null for non-existent slug', async () => {
      mockPrisma.academy.findUnique.mockResolvedValue(null);

      const result = await repository.findBySlug('non-existent-slug');

      expect(mockPrisma.academy.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'non-existent-slug' },
        }),
      );
      expect(result).toBeNull();
    });

    it('should include all nested relations with correct ordering', async () => {
      const mockAcademy = getMockAcademyWithRelations();
      mockPrisma.academy.findUnique.mockResolvedValue(mockAcademy);

      await repository.findBySlug('test-slug');

      const callArgs = mockPrisma.academy.findUnique.mock.calls[0][0];
      expect(callArgs.include.pricing).toEqual({ orderBy: { order: 'asc' } });
      expect(callArgs.include.features).toEqual({ orderBy: { order: 'asc' } });
      expect(callArgs.include.instructors).toEqual({ orderBy: { order: 'asc' } });
      expect(callArgs.include.testimonials).toEqual({ orderBy: { order: 'asc' } });
      expect(callArgs.include.faqs).toEqual({ orderBy: { order: 'asc' } });
      expect(callArgs.include.themes.orderBy).toEqual({ order: 'asc' });
      expect(callArgs.include.themes.include.topics).toBeDefined();
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results without filters', async () => {
      const mockAcademies = [getMockAcademy({ id: 1 }), getMockAcademy({ id: 2 })];
      mockPrisma.academy.findMany.mockResolvedValue(mockAcademies);
      mockPrisma.academy.count.mockResolvedValue(2);

      const result = await repository.findWithPagination({});

      expect(mockPrisma.academy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 10,
        }),
      );
      expect(mockPrisma.academy.count).toHaveBeenCalledWith({ where: {} });
      expect(result.data).toEqual(mockAcademies);
      expect(result.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should filter by category', async () => {
      const mockAcademies = [getMockAcademy({ category: 'INTAKE: 24 January 2026' })];
      mockPrisma.academy.findMany.mockResolvedValue(mockAcademies);
      mockPrisma.academy.count.mockResolvedValue(1);

      const result = await repository.findWithPagination({ category: 'INTAKE: 24 January 2026' });

      expect(mockPrisma.academy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'INTAKE: 24 January 2026' },
        }),
      );
      expect(result.data).toEqual(mockAcademies);
    });

    it('should filter by search parameter', async () => {
      const mockAcademies = [getMockAcademy({ title: 'Carbon Accounting' })];
      mockPrisma.academy.findMany.mockResolvedValue(mockAcademies);
      mockPrisma.academy.count.mockResolvedValue(1);

      const result = await repository.findWithPagination({ search: 'Carbon' });

      expect(mockPrisma.academy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ title: { contains: 'Carbon', mode: 'insensitive' } }, { description: { contains: 'Carbon', mode: 'insensitive' } }],
          },
        }),
      );
      expect(result.data).toEqual(mockAcademies);
    });

    it('should calculate pagination metadata correctly', async () => {
      mockPrisma.academy.findMany.mockResolvedValue([]);
      mockPrisma.academy.count.mockResolvedValue(25);

      const result = await repository.findWithPagination({ page: 2, limit: 10 });

      expect(mockPrisma.academy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
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
      mockPrisma.academy.findMany.mockResolvedValue([]);
      mockPrisma.academy.count.mockResolvedValue(30);

      // First page
      let result = await repository.findWithPagination({ page: 1, limit: 10 });
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);

      // Middle page
      result = await repository.findWithPagination({ page: 2, limit: 10 });
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(true);

      // Last page
      result = await repository.findWithPagination({ page: 3, limit: 10 });
      expect(result.meta.hasNext).toBe(false);
      expect(result.meta.hasPrev).toBe(true);
    });

    it('should include relations when includeRelations is true', async () => {
      mockPrisma.academy.findMany.mockResolvedValue([]);
      mockPrisma.academy.count.mockResolvedValue(0);

      await repository.findWithPagination({ includeRelations: true });

      expect(mockPrisma.academy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            pricing: { orderBy: { order: 'asc' } },
            features: { orderBy: { order: 'asc' } },
            instructors: { orderBy: { order: 'asc' } },
          }),
        }),
      );
    });

    it('should not include relations when includeRelations is false', async () => {
      mockPrisma.academy.findMany.mockResolvedValue([]);
      mockPrisma.academy.count.mockResolvedValue(0);

      await repository.findWithPagination({ includeRelations: false });

      expect(mockPrisma.academy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {},
        }),
      );
    });

    it('should handle combined filters', async () => {
      mockPrisma.academy.findMany.mockResolvedValue([]);
      mockPrisma.academy.count.mockResolvedValue(0);

      await repository.findWithPagination({
        category: 'INTAKE: 24 January 2026',
        search: 'Carbon',
        page: 2,
        limit: 5,
      });

      const callArgs = mockPrisma.academy.findMany.mock.calls[0][0];
      expect(callArgs.where.category).toBe('INTAKE: 24 January 2026');
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.skip).toBe(5);
      expect(callArgs.take).toBe(5);
    });
  });

  describe('getCategories', () => {
    it('should return unique category list', async () => {
      const mockResult = [{ category: 'INTAKE: 24 January 2026' }, { category: 'INTAKE: 15 March 2026' }, { category: 'INTAKE: 10 May 2026' }];
      mockPrisma.academy.findMany.mockResolvedValue(mockResult);

      const result = await repository.getCategories();

      expect(mockPrisma.academy.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        select: { category: true },
        distinct: ['category'],
      });
      expect(result).toEqual(['INTAKE: 24 January 2026', 'INTAKE: 15 March 2026', 'INTAKE: 10 May 2026']);
    });

    it('should filter out null categories', async () => {
      const mockResult = [{ category: 'INTAKE: 24 January 2026' }, { category: null }, { category: 'INTAKE: 15 March 2026' }];
      mockPrisma.academy.findMany.mockResolvedValue(mockResult);

      const result = await repository.getCategories();

      expect(result).toEqual(['INTAKE: 24 January 2026', 'INTAKE: 15 March 2026']);
      expect(result).not.toContain(null);
    });

    it('should only return categories from ACTIVE academies', async () => {
      mockPrisma.academy.findMany.mockResolvedValue([]);

      await repository.getCategories();

      expect(mockPrisma.academy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE' },
        }),
      );
    });
  });

  describe('slugExists', () => {
    it('should return true when slug exists', async () => {
      mockPrisma.academy.count.mockResolvedValue(1);

      const result = await repository.slugExists('existing-slug');

      expect(mockPrisma.academy.count).toHaveBeenCalledWith({
        where: { slug: 'existing-slug' },
      });
      expect(result).toBe(true);
    });

    it('should return false when slug does not exist', async () => {
      mockPrisma.academy.count.mockResolvedValue(0);

      const result = await repository.slugExists('non-existing-slug');

      expect(result).toBe(false);
    });

    it('should exclude specific ID when excludeId is provided', async () => {
      mockPrisma.academy.count.mockResolvedValue(0);

      const result = await repository.slugExists('test-slug', 5);

      expect(mockPrisma.academy.count).toHaveBeenCalledWith({
        where: { slug: 'test-slug', id: { not: 5 } },
      });
      expect(result).toBe(false);
    });

    it('should return false when slug exists but belongs to excluded ID', async () => {
      mockPrisma.academy.count.mockResolvedValue(0);

      const result = await repository.slugExists('test-slug', 10);

      expect(result).toBe(false);
    });
  });

  describe('findPricingsByAcademyId', () => {
    it('should return ordered pricing list for academy', async () => {
      const mockPricing = [
        { id: 1, academy_id: 1, name: 'Tier 1', order: 1 },
        { id: 2, academy_id: 1, name: 'Tier 2', order: 2 },
      ];
      mockPrisma.academyPricing.findMany.mockResolvedValue(mockPricing);

      const result = await repository.findPricingsByAcademyId(1);

      expect(mockPrisma.academyPricing.findMany).toHaveBeenCalledWith({
        where: { academy_id: 1 },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockPricing);
    });
  });

  describe('findFeaturesByAcademyId', () => {
    it('should return ordered features list for academy', async () => {
      const mockFeatures = [
        { id: 1, academy_id: 1, title: 'Feature 1', order: 1 },
        { id: 2, academy_id: 1, title: 'Feature 2', order: 2 },
      ];
      mockPrisma.academyFeature.findMany.mockResolvedValue(mockFeatures);

      const result = await repository.findFeaturesByAcademyId(1);

      expect(mockPrisma.academyFeature.findMany).toHaveBeenCalledWith({
        where: { academy_id: 1 },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockFeatures);
    });
  });

  describe('findInstructorsByAcademyId', () => {
    it('should return ordered instructors list for academy', async () => {
      const mockInstructors = [
        { id: 1, academy_id: 1, name: 'Instructor 1', order: 1 },
        { id: 2, academy_id: 1, name: 'Instructor 2', order: 2 },
      ];
      mockPrisma.academyInstructor.findMany.mockResolvedValue(mockInstructors);

      const result = await repository.findInstructorsByAcademyId(1);

      expect(mockPrisma.academyInstructor.findMany).toHaveBeenCalledWith({
        where: { academy_id: 1 },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockInstructors);
    });
  });

  describe('findTestimonialsByAcademyId', () => {
    it('should return ordered testimonials list for academy', async () => {
      const mockTestimonials = [
        { id: 1, academy_id: 1, name: 'Student 1', order: 1 },
        { id: 2, academy_id: 1, name: 'Student 2', order: 2 },
      ];
      mockPrisma.academyTestimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await repository.findTestimonialsByAcademyId(1);

      expect(mockPrisma.academyTestimonial.findMany).toHaveBeenCalledWith({
        where: { academy_id: 1 },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockTestimonials);
    });
  });

  describe('findFaqsByAcademyId', () => {
    it('should return ordered FAQs list for academy', async () => {
      const mockFaqs = [
        { id: 1, academy_id: 1, question: 'Question 1?', order: 1 },
        { id: 2, academy_id: 1, question: 'Question 2?', order: 2 },
      ];
      mockPrisma.academyFaq.findMany.mockResolvedValue(mockFaqs);

      const result = await repository.findFaqsByAcademyId(1);

      expect(mockPrisma.academyFaq.findMany).toHaveBeenCalledWith({
        where: { academy_id: 1 },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockFaqs);
    });
  });
});
