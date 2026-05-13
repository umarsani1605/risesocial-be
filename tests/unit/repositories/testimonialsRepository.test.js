/**
 * TestimonialsRepository Unit Tests
 * Tests data access logic with mocked Prisma client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMockTestimonial, getMockPaginatedResult, getMockResultWithoutPagination } from '../../helpers/testimonialsFixtures.js';

// Mock Prisma
const mockPrisma = {
  testimonial: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

// Mock logger

// Import after mocking
const { userTestimonialsRepository } = await import('../../../src/repositories/user/testimonialsRepository.js');
const { adminTestimonialsRepository } = await import('../../../src/repositories/admin/testimonialsRepository.js');

describe('TestimonialsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findMany', () => {
    it('should find testimonials with no filters', async () => {
      const mockTestimonials = [getMockTestimonial(), getMockTestimonial({ id: 2, name: 'Jane Doe' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await userTestimonialsRepository.findMany();

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual({ testimonials: mockTestimonials });
    });

    it('should filter testimonials by country', async () => {
      const mockTestimonials = [getMockTestimonial({ country: 'Indonesia' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await userTestimonialsRepository.findMany({ country: 'Indonesia' });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          country: { contains: 'Indonesia', mode: 'insensitive' },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should filter testimonials by minRating', async () => {
      const mockTestimonials = [getMockTestimonial({ rating: 5 }), getMockTestimonial({ id: 2, rating: 4 })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await userTestimonialsRepository.findMany({ minRating: '4' });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          rating: { gte: 4 },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should filter testimonials by featured', async () => {
      const mockTestimonials = [getMockTestimonial({ featured: true })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await userTestimonialsRepository.findMany({ featured: true });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          featured: true,
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should filter testimonials by search term', async () => {
      const mockTestimonials = [getMockTestimonial({ name: 'John Doe', text: 'Great program' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await userTestimonialsRepository.findMany({ search: 'John' });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: 'John', mode: 'insensitive' } },
            { text: { contains: 'John', mode: 'insensitive' } },
            { country: { contains: 'John', mode: 'insensitive' } },
          ],
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should default to ACTIVE status when no status filter provided', async () => {
      const mockTestimonials = [getMockTestimonial({ status: 'ACTIVE' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await userTestimonialsRepository.findMany({});

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should handle pagination correctly', async () => {
      const mockTestimonials = [getMockTestimonial(), getMockTestimonial({ id: 2, name: 'Jane Doe' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);
      mockPrisma.testimonial.count.mockResolvedValue(25);

      const result = await userTestimonialsRepository.findMany({}, 2, 10);

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(mockPrisma.testimonial.count).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
      });
      expect(result).toEqual({
        testimonials: mockTestimonials,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      });
    });

    it('should fetch all testimonials when no pagination params provided', async () => {
      const mockTestimonials = [
        getMockTestimonial(),
        getMockTestimonial({ id: 2, name: 'Jane Doe' }),
        getMockTestimonial({ id: 3, name: 'Bob Smith' }),
      ];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await userTestimonialsRepository.findMany({});

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
      });
      expect(mockPrisma.testimonial.count).not.toHaveBeenCalled();
      expect(result).toEqual({
        testimonials: mockTestimonials,
      });
      expect(result.pagination).toBeUndefined();
    });

    it('should calculate hasNext and hasPrev correctly', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test first page (hasPrev: false, hasNext: true)
      mockPrisma.testimonial.count.mockResolvedValue(25);
      const firstPage = await userTestimonialsRepository.findMany({}, 1, 10);
      expect(firstPage.pagination.hasNext).toBe(true);
      expect(firstPage.pagination.hasPrev).toBe(false);

      // Test middle page (hasPrev: true, hasNext: true)
      const middlePage = await userTestimonialsRepository.findMany({}, 2, 10);
      expect(middlePage.pagination.hasNext).toBe(true);
      expect(middlePage.pagination.hasPrev).toBe(true);

      // Test last page (hasPrev: true, hasNext: false)
      const lastPage = await userTestimonialsRepository.findMany({}, 3, 10);
      expect(lastPage.pagination.hasNext).toBe(false);
      expect(lastPage.pagination.hasPrev).toBe(true);

      // Test single page (hasPrev: false, hasNext: false)
      mockPrisma.testimonial.count.mockResolvedValue(5);
      const singlePage = await userTestimonialsRepository.findMany({}, 1, 10);
      expect(singlePage.pagination.hasNext).toBe(false);
      expect(singlePage.pagination.hasPrev).toBe(false);
    });

    it('should sort by createdAt', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test descending (default)
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'createdAt', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
      });

      // Test ascending
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'createdAt', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'asc' },
      });
    });

    it('should sort by name', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test ascending
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'name', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      });

      // Test descending
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'name', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'desc' },
      });
    });

    it('should sort by rating', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test descending
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'rating', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { rating: 'desc' },
      });

      // Test ascending
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'rating', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { rating: 'asc' },
      });
    });

    it('should sort by country', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test ascending
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'country', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { country: 'asc' },
      });

      // Test descending
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'country', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { country: 'desc' },
      });
    });

    it('should sort by featured', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test descending (featured first)
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'featured', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { featured: 'desc' },
      });

      // Test ascending (non-featured first)
      await userTestimonialsRepository.findMany({}, undefined, undefined, 'featured', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { featured: 'asc' },
      });
    });

    it('should handle combined filters', async () => {
      const mockTestimonials = [
        getMockTestimonial({
          country: 'Indonesia',
          rating: 5,
          featured: true,
          name: 'John Doe',
        }),
      ];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await userTestimonialsRepository.findMany({
        country: 'Indonesia',
        minRating: '4',
        featured: true,
        search: 'John',
      });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          country: { contains: 'Indonesia', mode: 'insensitive' },
          rating: { gte: 4 },
          featured: true,
          OR: [
            { name: { contains: 'John', mode: 'insensitive' } },
            { text: { contains: 'John', mode: 'insensitive' } },
            { country: { contains: 'John', mode: 'insensitive' } },
          ],
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });
  });

  describe('findManyForAdmin', () => {
    it('should find testimonials with no filters', async () => {
      const mockTestimonials = [
        getMockTestimonial(),
        getMockTestimonial({ id: 2, name: 'Jane Doe', status: 'INACTIVE' }),
        getMockTestimonial({ id: 3, name: 'Bob Smith', status: 'PENDING' }),
      ];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany();

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual({ testimonials: mockTestimonials });
    });

    it('should filter testimonials by status', async () => {
      const mockTestimonials = [getMockTestimonial({ status: 'INACTIVE' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany({ status: 'INACTIVE' });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          status: 'INACTIVE',
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should filter testimonials by country', async () => {
      const mockTestimonials = [getMockTestimonial({ country: 'Indonesia' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany({ country: 'Indonesia' });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          country: { contains: 'Indonesia', mode: 'insensitive' },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should filter testimonials by minRating', async () => {
      const mockTestimonials = [getMockTestimonial({ rating: 5 }), getMockTestimonial({ id: 2, rating: 4 })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany({ minRating: '4' });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          rating: { gte: 4 },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should filter testimonials by featured', async () => {
      const mockTestimonials = [getMockTestimonial({ featured: true })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany({ featured: true });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          featured: true,
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should filter testimonials by search term', async () => {
      const mockTestimonials = [getMockTestimonial({ name: 'John Doe', text: 'Great program' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany({ search: 'John' });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'John', mode: 'insensitive' } },
            { text: { contains: 'John', mode: 'insensitive' } },
            { country: { contains: 'John', mode: 'insensitive' } },
          ],
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should not default to ACTIVE status (return all statuses)', async () => {
      const mockTestimonials = [
        getMockTestimonial({ status: 'ACTIVE' }),
        getMockTestimonial({ id: 2, status: 'INACTIVE' }),
        getMockTestimonial({ id: 3, status: 'PENDING' }),
      ];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany({});

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
      expect(result.testimonials).toHaveLength(3);
      expect(result.testimonials.map((t) => t.status)).toEqual(['ACTIVE', 'INACTIVE', 'PENDING']);
    });

    it('should handle pagination correctly', async () => {
      const mockTestimonials = [getMockTestimonial(), getMockTestimonial({ id: 2, name: 'Jane Doe' })];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);
      mockPrisma.testimonial.count.mockResolvedValue(25);

      const result = await adminTestimonialsRepository.findMany({}, 2, 10);

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(mockPrisma.testimonial.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual({
        testimonials: mockTestimonials,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      });
    });

    it('should fetch all testimonials when no pagination params provided', async () => {
      const mockTestimonials = [
        getMockTestimonial(),
        getMockTestimonial({ id: 2, name: 'Jane Doe', status: 'INACTIVE' }),
        getMockTestimonial({ id: 3, name: 'Bob Smith', status: 'PENDING' }),
      ];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany({});

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
      });
      expect(mockPrisma.testimonial.count).not.toHaveBeenCalled();
      expect(result).toEqual({
        testimonials: mockTestimonials,
      });
      expect(result.pagination).toBeUndefined();
    });

    it('should calculate hasNext and hasPrev correctly', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test first page (hasPrev: false, hasNext: true)
      mockPrisma.testimonial.count.mockResolvedValue(25);
      const firstPage = await adminTestimonialsRepository.findMany({}, 1, 10);
      expect(firstPage.pagination.hasNext).toBe(true);
      expect(firstPage.pagination.hasPrev).toBe(false);

      // Test middle page (hasPrev: true, hasNext: true)
      const middlePage = await adminTestimonialsRepository.findMany({}, 2, 10);
      expect(middlePage.pagination.hasNext).toBe(true);
      expect(middlePage.pagination.hasPrev).toBe(true);

      // Test last page (hasPrev: true, hasNext: false)
      const lastPage = await adminTestimonialsRepository.findMany({}, 3, 10);
      expect(lastPage.pagination.hasNext).toBe(false);
      expect(lastPage.pagination.hasPrev).toBe(true);

      // Test single page (hasPrev: false, hasNext: false)
      mockPrisma.testimonial.count.mockResolvedValue(5);
      const singlePage = await adminTestimonialsRepository.findMany({}, 1, 10);
      expect(singlePage.pagination.hasNext).toBe(false);
      expect(singlePage.pagination.hasPrev).toBe(false);
    });

    it('should sort by createdAt', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test descending (default)
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'createdAt', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
      });

      // Test ascending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'createdAt', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'asc' },
      });
    });

    it('should sort by name', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test ascending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'name', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });

      // Test descending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'name', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'desc' },
      });
    });

    it('should sort by rating', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test descending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'rating', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { rating: 'desc' },
      });

      // Test ascending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'rating', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { rating: 'asc' },
      });
    });

    it('should sort by country', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test ascending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'country', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { country: 'asc' },
      });

      // Test descending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'country', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { country: 'desc' },
      });
    });

    it('should sort by featured', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test descending (featured first)
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'featured', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { featured: 'desc' },
      });

      // Test ascending (non-featured first)
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'featured', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { featured: 'asc' },
      });
    });

    it('should sort by status', async () => {
      const mockTestimonials = [getMockTestimonial()];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      // Test descending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'status', 'desc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { status: 'desc' },
      });

      // Test ascending
      await adminTestimonialsRepository.findMany({}, undefined, undefined, 'status', 'asc');
      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { status: 'asc' },
      });
    });

    it('should handle combined filters', async () => {
      const mockTestimonials = [
        getMockTestimonial({
          status: 'INACTIVE',
          country: 'Indonesia',
          rating: 5,
          featured: true,
          name: 'John Doe',
        }),
      ];
      mockPrisma.testimonial.findMany.mockResolvedValue(mockTestimonials);

      const result = await adminTestimonialsRepository.findMany({
        status: 'INACTIVE',
        country: 'Indonesia',
        minRating: '4',
        featured: true,
        search: 'John',
      });

      expect(mockPrisma.testimonial.findMany).toHaveBeenCalledWith({
        where: {
          status: 'INACTIVE',
          country: { contains: 'Indonesia', mode: 'insensitive' },
          rating: { gte: 4 },
          featured: true,
          OR: [
            { name: { contains: 'John', mode: 'insensitive' } },
            { text: { contains: 'John', mode: 'insensitive' } },
            { country: { contains: 'John', mode: 'insensitive' } },
          ],
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result.testimonials).toEqual(mockTestimonials);
    });
  });

  describe('findById', () => {
    it('should find testimonial by ID', async () => {
      const mockTestimonial = getMockTestimonial({ id: 42, name: 'Test User' });
      mockPrisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);

      const result = await userTestimonialsRepository.findById(42);

      expect(mockPrisma.testimonial.findUnique).toHaveBeenCalledWith({
        where: { id: 42 },
      });
      expect(result).toEqual(mockTestimonial);
    });

    it('should return null when testimonial not found', async () => {
      mockPrisma.testimonial.findUnique.mockResolvedValue(null);

      const result = await userTestimonialsRepository.findById(999);

      expect(mockPrisma.testimonial.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create testimonial with valid data', async () => {
      const testimonialData = {
        name: 'John Doe',
        country: 'Indonesia',
        text: 'This is a great program that helped me learn about sustainability.',
        rating: 5,
        status: 'ACTIVE',
        featured: true,
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const mockCreatedTestimonial = getMockTestimonial({
        ...testimonialData,
        id: 1,
        created_at: new Date('2025-01-15T10:00:00.000Z'),
        updated_at: new Date('2025-01-15T10:00:00.000Z'),
      });

      mockPrisma.testimonial.create.mockResolvedValue(mockCreatedTestimonial);

      const result = await adminTestimonialsRepository.create(testimonialData);

      expect(mockPrisma.testimonial.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'John Doe',
          country: 'Indonesia',
          text: 'This is a great program that helped me learn about sustainability.',
          rating: 5,
          status: 'ACTIVE',
          featured: true,
          avatar_url: 'https://example.com/avatar.jpg',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      });
      expect(result).toEqual(mockCreatedTestimonial);
      expect(result.id).toBe(1);
      expect(result.name).toBe('John Doe');
    });

    it('should set created_at and updated_at timestamps', async () => {
      const testimonialData = {
        name: 'Jane Smith',
        country: 'Singapore',
        text: 'Excellent learning experience with practical applications.',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
        avatar_url: null,
      };

      const mockCreatedTestimonial = getMockTestimonial({
        ...testimonialData,
        id: 2,
        created_at: new Date('2025-01-15T11:00:00.000Z'),
        updated_at: new Date('2025-01-15T11:00:00.000Z'),
      });

      mockPrisma.testimonial.create.mockResolvedValue(mockCreatedTestimonial);

      await adminTestimonialsRepository.create(testimonialData);

      const createCall = mockPrisma.testimonial.create.mock.calls[0][0];
      expect(createCall.data.created_at).toBeInstanceOf(Date);
      expect(createCall.data.updated_at).toBeInstanceOf(Date);
      expect(createCall.data.created_at.getTime()).toBeCloseTo(Date.now(), -2);
      expect(createCall.data.updated_at.getTime()).toBeCloseTo(Date.now(), -2);
    });

    it('should throw error on database failure', async () => {
      const testimonialData = {
        name: 'Test User',
        country: 'Test Country',
        text: 'Test testimonial text with sufficient length.',
        rating: 5,
        status: 'ACTIVE',
        featured: false,
        avatar_url: null,
      };

      const dbError = new Error('Database connection failed');
      mockPrisma.testimonial.create.mockRejectedValue(dbError);

      await expect(adminTestimonialsRepository.create(testimonialData)).rejects.toThrow('Failed to create testimonial: Database connection failed');

      expect(mockPrisma.testimonial.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...testimonialData,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      });
    });
  });

  describe('update', () => {
    it('should update testimonial with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        text: 'Updated testimonial text with sufficient length for validation.',
        rating: 4,
        featured: false,
      };

      const mockUpdatedTestimonial = getMockTestimonial({
        id: 1,
        ...updateData,
        updated_at: new Date('2025-01-15T12:00:00.000Z'),
      });

      mockPrisma.testimonial.update.mockResolvedValue(mockUpdatedTestimonial);

      const result = await adminTestimonialsRepository.update(1, updateData);

      expect(mockPrisma.testimonial.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          ...updateData,
          updated_at: expect.any(Date),
        }),
      });
      expect(result).toEqual(mockUpdatedTestimonial);
      expect(result.name).toBe('Updated Name');
      expect(result.rating).toBe(4);
    });

    it('should update updated_at timestamp', async () => {
      const updateData = {
        status: 'INACTIVE',
      };

      const mockUpdatedTestimonial = getMockTestimonial({
        id: 5,
        status: 'INACTIVE',
        updated_at: new Date('2025-01-15T13:00:00.000Z'),
      });

      mockPrisma.testimonial.update.mockResolvedValue(mockUpdatedTestimonial);

      await adminTestimonialsRepository.update(5, updateData);

      const updateCall = mockPrisma.testimonial.update.mock.calls[0][0];
      expect(updateCall.data.updated_at).toBeInstanceOf(Date);
      expect(updateCall.data.updated_at.getTime()).toBeCloseTo(Date.now(), -2);
    });

    it('should return null when testimonial not found (P2025)', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const notFoundError = new Error('Record not found');
      notFoundError.code = 'P2025';
      mockPrisma.testimonial.update.mockRejectedValue(notFoundError);

      const result = await adminTestimonialsRepository.update(999, updateData);

      expect(mockPrisma.testimonial.update).toHaveBeenCalledWith({
        where: { id: 999 },
        data: expect.objectContaining({
          ...updateData,
          updated_at: expect.any(Date),
        }),
      });
      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const dbError = new Error('Database connection failed');
      mockPrisma.testimonial.update.mockRejectedValue(dbError);

      await expect(adminTestimonialsRepository.update(1, updateData)).rejects.toThrow('Failed to update testimonial: Database connection failed');

      expect(mockPrisma.testimonial.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          ...updateData,
          updated_at: expect.any(Date),
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete testimonial successfully', async () => {
      const mockDeletedTestimonial = getMockTestimonial({ id: 1 });
      mockPrisma.testimonial.delete.mockResolvedValue(mockDeletedTestimonial);

      const result = await adminTestimonialsRepository.delete(1);

      expect(mockPrisma.testimonial.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBe(true);
    });

    it('should return false when testimonial not found (P2025)', async () => {
      const notFoundError = new Error('Record not found');
      notFoundError.code = 'P2025';
      mockPrisma.testimonial.delete.mockRejectedValue(notFoundError);

      const result = await adminTestimonialsRepository.delete(999);

      expect(mockPrisma.testimonial.delete).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBe(false);
    });

    it('should throw error on database failure', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.testimonial.delete.mockRejectedValue(dbError);

      await expect(adminTestimonialsRepository.delete(1)).rejects.toThrow('Failed to delete testimonial: Database connection failed');

      expect(mockPrisma.testimonial.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('delete', () => {
    it('should return false when testimonial not found (P2025)', async () => {
      const notFoundError = new Error('Record not found');
      notFoundError.code = 'P2025';
      mockPrisma.testimonial.delete.mockRejectedValue(notFoundError);

      const result = await adminTestimonialsRepository.delete(999);

      expect(mockPrisma.testimonial.delete).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBe(false);
    });

    it('should throw error on database failure', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.testimonial.delete.mockRejectedValue(dbError);

      await expect(adminTestimonialsRepository.delete(1)).rejects.toThrow('Failed to delete testimonial: Database connection failed');

      expect(mockPrisma.testimonial.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
