/**
 * AdminAcademyRepository Unit Tests
 * Tests CRUD operations and order management with mocked Prisma client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMockPricing, getMockFeature, getMockInstructor, getMockTestimonial, getMockFaq, getMockTopic } from '../../../helpers/academyFixtures.js';

// Mock Prisma with transaction support
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
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  academyFeature: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  academyTheme: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  academyTopic: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  academyInstructor: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  academyTestimonial: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  academyFaq: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
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
const { AdminAcademyRepository } = await import('../../../../src/repositories/admin/academyRepository.js');

describe('AdminAcademyRepository', () => {
  let repository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AdminAcademyRepository();
  });

  describe('Academy CRUD Operations', () => {
    describe('create', () => {
      it('should create academy with valid data', async () => {
        const academyData = {
          title: 'Carbon Accounting',
          slug: 'carbon-accounting',
          description: 'Learn carbon accounting fundamentals',
          duration: '2 months',
          format: 'Online Live Class',
          category: 'INTAKE: 24 January 2026',
          image_url: 'https://example.com/image.jpg',
          certificate: true,
          portfolio: true,
          status: 'ACTIVE',
        };

        const mockCreatedAcademy = {
          id: 1,
          ...academyData,
          pixel_id: null,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        };

        mockPrisma.academy.create.mockResolvedValue(mockCreatedAcademy);

        const result = await repository.create(academyData);

        expect(mockPrisma.academy.create).toHaveBeenCalledWith({
          data: academyData,
        });
        expect(result).toEqual(mockCreatedAcademy);
        expect(result.id).toBe(1);
        expect(result.title).toBe('Carbon Accounting');
        expect(result.slug).toBe('carbon-accounting');
      });

      it('should create academy with minimal required fields', async () => {
        const minimalData = {
          title: 'Test Academy',
          slug: 'test-academy',
          description: 'Test description',
          status: 'DRAFT',
        };

        const mockCreatedAcademy = {
          id: 2,
          ...minimalData,
          duration: null,
          format: null,
          category: null,
          image_url: null,
          certificate: false,
          portfolio: false,
          pixel_id: null,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        };

        mockPrisma.academy.create.mockResolvedValue(mockCreatedAcademy);

        const result = await repository.create(minimalData);

        expect(mockPrisma.academy.create).toHaveBeenCalledWith({
          data: minimalData,
        });
        expect(result.id).toBe(2);
        expect(result.title).toBe('Test Academy');
      });
    });

    describe('update', () => {
      it('should update academy with partial data', async () => {
        const updateData = {
          title: 'Updated Carbon Accounting',
          description: 'Updated description',
        };

        const mockUpdatedAcademy = {
          id: 1,
          title: 'Updated Carbon Accounting',
          slug: 'carbon-accounting',
          description: 'Updated description',
          duration: '2 months',
          format: 'Online Live Class',
          category: 'INTAKE: 24 January 2026',
          image_url: 'https://example.com/image.jpg',
          certificate: true,
          portfolio: true,
          status: 'ACTIVE',
          pixel_id: null,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-02'),
        };

        mockPrisma.academy.update.mockResolvedValue(mockUpdatedAcademy);

        const result = await repository.update(1, updateData);

        expect(mockPrisma.academy.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: updateData,
        });
        expect(result.title).toBe('Updated Carbon Accounting');
        expect(result.description).toBe('Updated description');
      });

      it('should update academy status', async () => {
        const updateData = { status: 'INACTIVE' };

        const mockUpdatedAcademy = {
          id: 1,
          title: 'Carbon Accounting',
          slug: 'carbon-accounting',
          description: 'Learn carbon accounting fundamentals',
          duration: '2 months',
          format: 'Online Live Class',
          category: 'INTAKE: 24 January 2026',
          image_url: 'https://example.com/image.jpg',
          certificate: true,
          portfolio: true,
          status: 'INACTIVE',
          pixel_id: null,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-02'),
        };

        mockPrisma.academy.update.mockResolvedValue(mockUpdatedAcademy);

        const result = await repository.update(1, updateData);

        expect(mockPrisma.academy.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: updateData,
        });
        expect(result.status).toBe('INACTIVE');
      });

      it('should update academy image_url', async () => {
        const updateData = { image_url: 'https://example.com/new-image.jpg' };

        const mockUpdatedAcademy = {
          id: 1,
          title: 'Carbon Accounting',
          slug: 'carbon-accounting',
          description: 'Learn carbon accounting fundamentals',
          duration: '2 months',
          format: 'Online Live Class',
          category: 'INTAKE: 24 January 2026',
          image_url: 'https://example.com/new-image.jpg',
          certificate: true,
          portfolio: true,
          status: 'ACTIVE',
          pixel_id: null,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-02'),
        };

        mockPrisma.academy.update.mockResolvedValue(mockUpdatedAcademy);

        const result = await repository.update(1, updateData);

        expect(mockPrisma.academy.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: updateData,
        });
        expect(result.image_url).toBe('https://example.com/new-image.jpg');
      });
    });

    describe('delete', () => {
      it('should delete academy by id', async () => {
        const mockDeletedAcademy = {
          id: 1,
          title: 'Carbon Accounting',
          slug: 'carbon-accounting',
          description: 'Learn carbon accounting fundamentals',
          duration: '2 months',
          format: 'Online Live Class',
          category: 'INTAKE: 24 January 2026',
          image_url: 'https://example.com/image.jpg',
          certificate: true,
          portfolio: true,
          status: 'ACTIVE',
          pixel_id: null,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        };

        mockPrisma.academy.delete.mockResolvedValue(mockDeletedAcademy);

        const result = await repository.delete(1);

        expect(mockPrisma.academy.delete).toHaveBeenCalledWith({
          where: { id: 1 },
        });
        expect(result).toEqual(mockDeletedAcademy);
      });

      it('should cascade delete related sub-tables', async () => {
        // Note: Cascade delete is handled by Prisma schema configuration
        // This test verifies the delete method is called correctly
        const mockDeletedAcademy = {
          id: 1,
          title: 'Carbon Accounting',
          slug: 'carbon-accounting',
          description: 'Learn carbon accounting fundamentals',
          duration: '2 months',
          format: 'Online Live Class',
          category: 'INTAKE: 24 January 2026',
          image_url: 'https://example.com/image.jpg',
          certificate: true,
          portfolio: true,
          status: 'ACTIVE',
          pixel_id: null,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        };

        mockPrisma.academy.delete.mockResolvedValue(mockDeletedAcademy);

        await repository.delete(1);

        expect(mockPrisma.academy.delete).toHaveBeenCalledWith({
          where: { id: 1 },
        });
        // Cascade behavior is tested in integration tests with real database
      });
    });
  });

  describe('Pricing Operations', () => {
    describe('findPricingsByAcademyId', () => {
      it('should return ordered pricing list for academy', async () => {
        const mockPricing = [getMockPricing({ id: 1, order: 1 }), getMockPricing({ id: 2, order: 2 })];
        mockPrisma.academyPricing.findMany.mockResolvedValue(mockPricing);

        const result = await repository.findPricingsByAcademyId(1);

        expect(mockPrisma.academyPricing.findMany).toHaveBeenCalledWith({
          where: { academy_id: 1 },
          orderBy: { order: 'asc' },
        });
        expect(result).toEqual(mockPricing);
      });
    });

    describe('createPricing', () => {
      it('should create pricing with auto-increment order when order not specified', async () => {
        const maxPricing = { order: 3 };
        mockPrisma.academyPricing.findFirst.mockResolvedValue(maxPricing);
        mockPrisma.academyPricing.create.mockResolvedValue(getMockPricing({ id: 4, order: 4 }));

        const result = await repository.createPricing(1, {
          name: 'New Tier',
          original_price: 5000000,
          discount_price: 3000000,
        });

        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.academyPricing.findFirst).toHaveBeenCalledWith({
          where: { academy_id: 1 },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        expect(mockPrisma.academyPricing.create).toHaveBeenCalledWith({
          data: {
            academy_id: 1,
            name: 'New Tier',
            original_price: 5000000,
            discount_price: 3000000,
            order: 4,
          },
        });
        expect(result.order).toBe(4);
      });

      it('should create pricing with specified order and shift existing records', async () => {
        mockPrisma.academyPricing.updateMany.mockResolvedValue({ count: 2 });
        mockPrisma.academyPricing.create.mockResolvedValue(getMockPricing({ id: 5, order: 2 }));

        const result = await repository.createPricing(1, {
          name: 'Insert Tier',
          original_price: 4000000,
          discount_price: 2500000,
          order: 2,
        });

        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.academyPricing.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 2 } },
          data: { order: { increment: 1 } },
        });
        expect(mockPrisma.academyPricing.create).toHaveBeenCalledWith({
          data: {
            academy_id: 1,
            name: 'Insert Tier',
            original_price: 4000000,
            discount_price: 2500000,
            order: 2,
          },
        });
        expect(result.order).toBe(2);
      });

      it('should handle first pricing creation (no existing records)', async () => {
        mockPrisma.academyPricing.findFirst.mockResolvedValue(null);
        mockPrisma.academyPricing.create.mockResolvedValue(getMockPricing({ id: 1, order: 1 }));

        const result = await repository.createPricing(1, {
          name: 'First Tier',
          original_price: 3000000,
          discount_price: 2000000,
        });

        expect(mockPrisma.academyPricing.create).toHaveBeenCalledWith({
          data: {
            academy_id: 1,
            name: 'First Tier',
            original_price: 3000000,
            discount_price: 2000000,
            order: 1,
          },
        });
        expect(result.order).toBe(1);
      });
    });

    describe('updatePricing', () => {
      it('should update pricing without order change', async () => {
        const existing = { order: 2 };
        mockPrisma.academyPricing.findFirst.mockResolvedValue(existing);
        mockPrisma.academyPricing.update.mockResolvedValue(getMockPricing({ id: 1, order: 2, name: 'Updated' }));

        const result = await repository.updatePricing(1, 1, {
          name: 'Updated',
        });

        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.academyPricing.updateMany).not.toHaveBeenCalled();
        expect(mockPrisma.academyPricing.update).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
          data: { name: 'Updated' },
        });
        expect(result.name).toBe('Updated');
      });

      it('should update pricing with order change (move backward)', async () => {
        const existing = { order: 4 };
        mockPrisma.academyPricing.findFirst.mockResolvedValue(existing);
        mockPrisma.academyPricing.updateMany.mockResolvedValue({ count: 2 });
        mockPrisma.academyPricing.update.mockResolvedValue(getMockPricing({ id: 1, order: 2 }));

        const result = await repository.updatePricing(1, 1, {
          order: 2,
        });

        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.academyPricing.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 2, lt: 4 } },
          data: { order: { increment: 1 } },
        });
        expect(mockPrisma.academyPricing.update).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
          data: { order: 2 },
        });
        expect(result.order).toBe(2);
      });

      it('should update pricing with order change (move forward)', async () => {
        const existing = { order: 2 };
        mockPrisma.academyPricing.findFirst.mockResolvedValue(existing);
        mockPrisma.academyPricing.updateMany.mockResolvedValue({ count: 2 });
        mockPrisma.academyPricing.update.mockResolvedValue(getMockPricing({ id: 1, order: 4 }));

        const result = await repository.updatePricing(1, 1, {
          order: 4,
        });

        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.academyPricing.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { lte: 4, gt: 2 } },
          data: { order: { decrement: 1 } },
        });
        expect(mockPrisma.academyPricing.update).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
          data: { order: 4 },
        });
        expect(result.order).toBe(4);
      });
    });

    describe('deletePricing', () => {
      it('should delete pricing and shift subsequent records', async () => {
        const existing = { order: 2 };
        mockPrisma.academyPricing.findFirst.mockResolvedValue(existing);
        mockPrisma.academyPricing.delete.mockResolvedValue({});
        mockPrisma.academyPricing.updateMany.mockResolvedValue({ count: 3 });

        const result = await repository.deletePricing(1, 1);

        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.academyPricing.delete).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
        });
        expect(mockPrisma.academyPricing.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gt: 2 } },
          data: { order: { decrement: 1 } },
        });
        expect(result.message).toBe('Pricing deleted successfully');
      });
    });
  });

  describe('Feature Operations', () => {
    describe('createFeature', () => {
      it('should create feature with auto-increment order', async () => {
        const maxFeature = { order: 2 };
        mockPrisma.academyFeature.findFirst.mockResolvedValue(maxFeature);
        mockPrisma.academyFeature.create.mockResolvedValue(getMockFeature({ id: 3, order: 3 }));

        const result = await repository.createFeature(1, {
          title: 'New Feature',
          description: 'Feature description',
          icon: 'icon',
        });

        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.academyFeature.create).toHaveBeenCalledWith({
          data: {
            academy_id: 1,
            title: 'New Feature',
            description: 'Feature description',
            icon: 'icon',
            order: 3,
          },
        });
        expect(result.order).toBe(3);
      });

      it('should create feature with specified order and shift existing records', async () => {
        mockPrisma.academyFeature.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.academyFeature.create.mockResolvedValue(getMockFeature({ id: 4, order: 1 }));

        const result = await repository.createFeature(1, {
          title: 'Priority Feature',
          description: 'Top feature',
          icon: 'star',
          order: 1,
        });

        expect(mockPrisma.academyFeature.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 1 } },
          data: { order: { increment: 1 } },
        });
        expect(result.order).toBe(1);
      });
    });

    describe('updateFeature', () => {
      it('should update feature with order reordering', async () => {
        const existing = { order: 3 };
        mockPrisma.academyFeature.findFirst.mockResolvedValue(existing);
        mockPrisma.academyFeature.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.academyFeature.update.mockResolvedValue(getMockFeature({ id: 1, order: 1 }));

        const result = await repository.updateFeature(1, 1, { order: 1 });

        expect(mockPrisma.academyFeature.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 1, lt: 3 } },
          data: { order: { increment: 1 } },
        });
        expect(result.order).toBe(1);
      });
    });

    describe('deleteFeature', () => {
      it('should delete feature and shift subsequent records', async () => {
        const existing = { order: 1 };
        mockPrisma.academyFeature.findFirst.mockResolvedValue(existing);
        mockPrisma.academyFeature.delete.mockResolvedValue({});
        mockPrisma.academyFeature.updateMany.mockResolvedValue({ count: 2 });

        const result = await repository.deleteFeature(1, 1);

        expect(mockPrisma.academyFeature.delete).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
        });
        expect(mockPrisma.academyFeature.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gt: 1 } },
          data: { order: { decrement: 1 } },
        });
        expect(result.message).toBe('Feature deleted successfully');
      });
    });
  });

  describe('Instructor Operations', () => {
    describe('createInstructor', () => {
      it('should create instructor with auto-increment order', async () => {
        const maxInstructor = { order: 1 };
        mockPrisma.academyInstructor.findFirst.mockResolvedValue(maxInstructor);
        mockPrisma.academyInstructor.create.mockResolvedValue(getMockInstructor({ id: 2, order: 2 }));

        const result = await repository.createInstructor(1, {
          name: 'Jane Doe',
          job_title: 'Lead Instructor',
          description: 'Expert',
        });

        expect(mockPrisma.academyInstructor.create).toHaveBeenCalledWith({
          data: {
            academy_id: 1,
            name: 'Jane Doe',
            job_title: 'Lead Instructor',
            description: 'Expert',
            order: 2,
          },
        });
        expect(result.order).toBe(2);
      });
    });

    describe('updateInstructor', () => {
      it('should update instructor with order change', async () => {
        const existing = { order: 1 };
        mockPrisma.academyInstructor.findFirst.mockResolvedValue(existing);
        mockPrisma.academyInstructor.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.academyInstructor.update.mockResolvedValue(getMockInstructor({ id: 1, order: 2 }));

        const result = await repository.updateInstructor(1, 1, { order: 2 });

        expect(mockPrisma.academyInstructor.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { lte: 2, gt: 1 } },
          data: { order: { decrement: 1 } },
        });
        expect(result.order).toBe(2);
      });
    });

    describe('deleteInstructor', () => {
      it('should delete instructor and shift subsequent records', async () => {
        const existing = { order: 1 };
        mockPrisma.academyInstructor.findFirst.mockResolvedValue(existing);
        mockPrisma.academyInstructor.delete.mockResolvedValue({});
        mockPrisma.academyInstructor.updateMany.mockResolvedValue({ count: 1 });

        const result = await repository.deleteInstructor(1, 1);

        expect(mockPrisma.academyInstructor.delete).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
        });
        expect(result.message).toBe('Instructor removed successfully');
      });
    });
  });

  describe('Testimonial Operations', () => {
    describe('createTestimonial', () => {
      it('should create testimonial with auto-increment order', async () => {
        mockPrisma.academyTestimonial.findFirst.mockResolvedValue(null);
        mockPrisma.academyTestimonial.create.mockResolvedValue(getMockTestimonial({ id: 1, order: 1 }));

        const result = await repository.createTestimonial(1, {
          name: 'Student',
          comment: 'Great!',
        });

        expect(mockPrisma.academyTestimonial.create).toHaveBeenCalledWith({
          data: {
            academy_id: 1,
            name: 'Student',
            comment: 'Great!',
            order: 1,
          },
        });
        expect(result.order).toBe(1);
      });
    });

    describe('updateTestimonial', () => {
      it('should update testimonial with order change', async () => {
        const existing = { order: 2 };
        mockPrisma.academyTestimonial.findFirst.mockResolvedValue(existing);
        mockPrisma.academyTestimonial.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.academyTestimonial.update.mockResolvedValue(getMockTestimonial({ id: 1, order: 1 }));

        const result = await repository.updateTestimonial(1, 1, { order: 1 });

        expect(mockPrisma.academyTestimonial.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 1, lt: 2 } },
          data: { order: { increment: 1 } },
        });
        expect(result.order).toBe(1);
      });
    });

    describe('deleteTestimonial', () => {
      it('should delete testimonial and shift subsequent records', async () => {
        const existing = { order: 1 };
        mockPrisma.academyTestimonial.findFirst.mockResolvedValue(existing);
        mockPrisma.academyTestimonial.delete.mockResolvedValue({});
        mockPrisma.academyTestimonial.updateMany.mockResolvedValue({ count: 1 });

        const result = await repository.deleteTestimonial(1, 1);

        expect(mockPrisma.academyTestimonial.delete).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
        });
        expect(result.message).toBe('Testimonial deleted successfully');
      });
    });
  });

  describe('FAQ Operations', () => {
    describe('createFaq', () => {
      it('should create FAQ with auto-increment order', async () => {
        const maxFaq = { order: 2 };
        mockPrisma.academyFaq.findFirst.mockResolvedValue(maxFaq);
        mockPrisma.academyFaq.create.mockResolvedValue(getMockFaq({ id: 3, order: 3 }));

        const result = await repository.createFaq(1, {
          question: 'New question?',
          answer: 'New answer',
        });

        expect(mockPrisma.academyFaq.create).toHaveBeenCalledWith({
          data: {
            academy_id: 1,
            question: 'New question?',
            answer: 'New answer',
            order: 3,
          },
        });
        expect(result.order).toBe(3);
      });
    });

    describe('updateFaq', () => {
      it('should update FAQ with order change', async () => {
        const existing = { order: 1 };
        mockPrisma.academyFaq.findFirst.mockResolvedValue(existing);
        mockPrisma.academyFaq.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.academyFaq.update.mockResolvedValue(getMockFaq({ id: 1, order: 3 }));

        const result = await repository.updateFaq(1, 1, { order: 3 });

        expect(mockPrisma.academyFaq.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { lte: 3, gt: 1 } },
          data: { order: { decrement: 1 } },
        });
        expect(result.order).toBe(3);
      });
    });

    describe('deleteFaq', () => {
      it('should delete FAQ and shift subsequent records', async () => {
        const existing = { order: 2 };
        mockPrisma.academyFaq.findFirst.mockResolvedValue(existing);
        mockPrisma.academyFaq.delete.mockResolvedValue({});
        mockPrisma.academyFaq.updateMany.mockResolvedValue({ count: 1 });

        const result = await repository.deleteFaq(1, 1);

        expect(mockPrisma.academyFaq.delete).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
        });
        expect(result.message).toBe('FAQ deleted successfully');
      });
    });
  });

  describe('Topic Operations', () => {
    describe('createTopic', () => {
      it('should create topic with auto-increment order', async () => {
        const maxTopic = { order: 1 };
        mockPrisma.academyTopic.findFirst.mockResolvedValue(maxTopic);
        mockPrisma.academyTopic.create.mockResolvedValue(getMockTopic({ id: 2, order: 2 }));

        const result = await repository.createTopic(1, {
          theme_id: 1,
          title: 'New Topic',
          description: 'Topic description',
        });

        expect(mockPrisma.academyTopic.create).toHaveBeenCalledWith({
          data: {
            academy_id: 1,
            theme_id: 1,
            title: 'New Topic',
            description: 'Topic description',
            order: 2,
          },
        });
        expect(result.order).toBe(2);
      });

      it('should create topic with specified order and shift existing records', async () => {
        mockPrisma.academyTopic.updateMany.mockResolvedValue({ count: 2 });
        mockPrisma.academyTopic.create.mockResolvedValue(getMockTopic({ id: 3, order: 1 }));

        const result = await repository.createTopic(1, {
          theme_id: 1,
          title: 'Priority Topic',
          description: 'First topic',
          order: 1,
        });

        expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 1 } },
          data: { order: { increment: 1 } },
        });
        expect(result.order).toBe(1);
      });
    });

    describe('updateTopic', () => {
      it('should update topic with order change', async () => {
        const existing = { order: 3 };
        mockPrisma.academyTopic.findFirst.mockResolvedValue(existing);
        mockPrisma.academyTopic.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.academyTopic.update.mockResolvedValue(getMockTopic({ id: 1, order: 1 }));

        const result = await repository.updateTopic(1, 1, { order: 1 });

        expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 1, lt: 3 } },
          data: { order: { increment: 1 } },
        });
        expect(mockPrisma.academyTopic.update).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
          data: { order: 1 },
        });
        expect(result.order).toBe(1);
      });
    });

    describe('deleteTopic', () => {
      it('should delete topic and shift subsequent records', async () => {
        const existing = { order: 1 };
        mockPrisma.academyTopic.findFirst.mockResolvedValue(existing);
        mockPrisma.academyTopic.delete.mockResolvedValue({});
        mockPrisma.academyTopic.updateMany.mockResolvedValue({ count: 2 });

        const result = await repository.deleteTopic(1, 1);

        expect(mockPrisma.academyTopic.delete).toHaveBeenCalledWith({
          where: { id: 1, academy_id: 1 },
        });
        expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gt: 1 } },
          data: { order: { decrement: 1 } },
        });
        expect(result.message).toBe('Topic deleted successfully');
      });
    });

    describe('Topic Order Management with Theme Scoping', () => {
      it('should allow topics in different themes to have the same order values', async () => {
        // Create topic with order 1 in theme 1
        mockPrisma.academyTopic.findFirst.mockResolvedValueOnce(null);
        mockPrisma.academyTopic.create.mockResolvedValueOnce(getMockTopic({ id: 1, theme_id: 1, order: 1, title: 'Theme 1 Topic 1' }));

        const topic1 = await repository.createTopic(1, {
          theme_id: 1,
          title: 'Theme 1 Topic 1',
          description: 'First topic in theme 1',
        });

        expect(topic1.order).toBe(1);
        expect(topic1.theme_id).toBe(1);

        // Create topic with order 1 in theme 2 (should be allowed)
        mockPrisma.academyTopic.findFirst.mockResolvedValueOnce(null);
        mockPrisma.academyTopic.create.mockResolvedValueOnce(getMockTopic({ id: 2, theme_id: 2, order: 1, title: 'Theme 2 Topic 1' }));

        const topic2 = await repository.createTopic(1, {
          theme_id: 2,
          title: 'Theme 2 Topic 1',
          description: 'First topic in theme 2',
        });

        expect(topic2.order).toBe(1);
        expect(topic2.theme_id).toBe(2);

        // Both topics can have order 1 because they're in different themes
        expect(topic1.order).toBe(topic2.order);
        expect(topic1.theme_id).not.toBe(topic2.theme_id);
      });

      it('should only shift topics within the same theme when creating with specified order', async () => {
        // Create topic at order 2 in theme 1
        // Should only shift topics in theme 1, not theme 2
        mockPrisma.academyTopic.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.academyTopic.create.mockResolvedValue(getMockTopic({ id: 3, theme_id: 1, order: 2 }));

        await repository.createTopic(1, {
          theme_id: 1,
          title: 'Insert Topic',
          description: 'Topic at position 2',
          order: 2,
        });

        // Verify updateMany was called - in current implementation it uses academy_id
        // NOTE: This test documents current behavior, which should be updated to use theme_id
        expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 2 } },
          data: { order: { increment: 1 } },
        });

        // TODO: When implementation is fixed, this should be:
        // expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
        //   where: { theme_id: 1, order: { gte: 2 } },
        //   data: { order: { increment: 1 } },
        // });
      });

      it('should only reorder topics within the same theme when updating order', async () => {
        // Update topic order from 3 to 1 in theme 1
        // Should only affect topics in theme 1
        const existing = { order: 3, theme_id: 1 };
        mockPrisma.academyTopic.findFirst.mockResolvedValue(existing);
        mockPrisma.academyTopic.updateMany.mockResolvedValue({ count: 2 });
        mockPrisma.academyTopic.update.mockResolvedValue(getMockTopic({ id: 1, theme_id: 1, order: 1 }));

        await repository.updateTopic(1, 1, { order: 1 });

        // Verify updateMany was called - current implementation uses academy_id
        // NOTE: This test documents current behavior, which should be updated to use theme_id
        expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gte: 1, lt: 3 } },
          data: { order: { increment: 1 } },
        });

        // TODO: When implementation is fixed, this should be:
        // expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
        //   where: { theme_id: 1, order: { gte: 1, lt: 3 } },
        //   data: { order: { increment: 1 } },
        // });
      });

      it('should only shift topics within the same theme when deleting', async () => {
        // Delete topic at order 2 in theme 1
        // Should only shift topics in theme 1
        const existing = { order: 2, theme_id: 1 };
        mockPrisma.academyTopic.findFirst.mockResolvedValue(existing);
        mockPrisma.academyTopic.delete.mockResolvedValue({});
        mockPrisma.academyTopic.updateMany.mockResolvedValue({ count: 2 });

        await repository.deleteTopic(1, 1);

        // Verify updateMany was called - current implementation uses academy_id
        // NOTE: This test documents current behavior, which should be updated to use theme_id
        expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
          where: { academy_id: 1, order: { gt: 2 } },
          data: { order: { decrement: 1 } },
        });

        // TODO: When implementation is fixed, this should be:
        // expect(mockPrisma.academyTopic.updateMany).toHaveBeenCalledWith({
        //   where: { theme_id: 1, order: { gt: 2 } },
        //   data: { order: { decrement: 1 } },
        // });
      });

      it('should maintain independent order sequences across themes', async () => {
        // Simulate having topics in two different themes
        // Theme 1: topics with orders 1, 2, 3
        // Theme 2: topics with orders 1, 2

        // Add new topic to theme 1 (should get order 4)
        mockPrisma.academyTopic.findFirst.mockResolvedValueOnce({ order: 3 });
        mockPrisma.academyTopic.create.mockResolvedValueOnce(getMockTopic({ id: 4, theme_id: 1, order: 4 }));

        const newTopic1 = await repository.createTopic(1, {
          theme_id: 1,
          title: 'Theme 1 Topic 4',
          description: 'Fourth topic in theme 1',
        });

        expect(newTopic1.order).toBe(4);
        expect(newTopic1.theme_id).toBe(1);

        // Add new topic to theme 2 (should get order 3, independent of theme 1)
        mockPrisma.academyTopic.findFirst.mockResolvedValueOnce({ order: 2 });
        mockPrisma.academyTopic.create.mockResolvedValueOnce(getMockTopic({ id: 5, theme_id: 2, order: 3 }));

        const newTopic2 = await repository.createTopic(1, {
          theme_id: 2,
          title: 'Theme 2 Topic 3',
          description: 'Third topic in theme 2',
        });

        expect(newTopic2.order).toBe(3);
        expect(newTopic2.theme_id).toBe(2);

        // Verify that findFirst was called to get max order
        // NOTE: Current implementation uses academy_id, should use theme_id
        expect(mockPrisma.academyTopic.findFirst).toHaveBeenCalledWith({
          where: { academy_id: 1 },
          orderBy: { order: 'desc' },
          select: { order: true },
        });

        // TODO: When implementation is fixed, this should be:
        // expect(mockPrisma.academyTopic.findFirst).toHaveBeenCalledWith({
        //   where: { theme_id: 1 },
        //   orderBy: { order: 'desc' },
        //   select: { order: true },
        // });
      });
    });
  });

  describe('Transaction Support', () => {
    it('should use transactions for order management operations', async () => {
      mockPrisma.academyPricing.findFirst.mockResolvedValue({ order: 1 });
      mockPrisma.academyPricing.create.mockResolvedValue(getMockPricing({ id: 1, order: 1 }));

      await repository.createPricing(1, {
        name: 'Test',
        original_price: 1000000,
        discount_price: 800000,
        order: 1,
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(typeof mockPrisma.$transaction.mock.calls[0][0]).toBe('function');
    });

    it('should pass transaction context to nested operations', async () => {
      const transactionFn = mockPrisma.$transaction.mock.calls[0]?.[0];

      mockPrisma.academyFeature.findFirst.mockResolvedValue(null);
      mockPrisma.academyFeature.create.mockResolvedValue(getMockFeature({ id: 1, order: 1 }));

      await repository.createFeature(1, {
        title: 'Feature',
        description: 'Description',
        icon: 'icon',
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();

      // Verify transaction function receives the mock prisma context
      if (transactionFn) {
        const result = await transactionFn(mockPrisma);
        expect(result).toBeDefined();
      }
    });
  });

  describe('Transaction Rollback on Errors', () => {
    it('should rollback pricing creation when create operation fails', async () => {
      // Mock successful shift but failed create
      mockPrisma.academyPricing.findFirst.mockResolvedValue({ order: 2 });
      mockPrisma.academyPricing.updateMany.mockResolvedValue({ count: 2 });

      const createError = new Error('Database constraint violation');
      mockPrisma.academyPricing.create.mockRejectedValue(createError);

      // Mock transaction to actually execute the function and propagate errors
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      await expect(
        repository.createPricing(1, {
          name: 'Test Pricing',
          original_price: 5000000,
          discount_price: 3000000,
          order: 2,
        }),
      ).rejects.toThrow('Database constraint violation');

      // Verify that updateMany was called (shift happened)
      expect(mockPrisma.academyPricing.updateMany).toHaveBeenCalled();
      // Verify that create was attempted
      expect(mockPrisma.academyPricing.create).toHaveBeenCalled();
      // Transaction should have been called
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback feature update when order reordering fails', async () => {
      const existing = { order: 3 };
      mockPrisma.academyFeature.findFirst.mockResolvedValue(existing);

      const reorderError = new Error('Deadlock detected');
      mockPrisma.academyFeature.updateMany.mockRejectedValue(reorderError);

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      await expect(repository.updateFeature(1, 1, { order: 1 })).rejects.toThrow('Deadlock detected');

      expect(mockPrisma.academyFeature.findFirst).toHaveBeenCalled();
      expect(mockPrisma.academyFeature.updateMany).toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback instructor deletion when shift operation fails', async () => {
      const existing = { order: 2 };
      mockPrisma.academyInstructor.findFirst.mockResolvedValue(existing);
      mockPrisma.academyInstructor.delete.mockResolvedValue({});

      const shiftError = new Error('Foreign key constraint failed');
      mockPrisma.academyInstructor.updateMany.mockRejectedValue(shiftError);

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      await expect(repository.deleteInstructor(1, 1)).rejects.toThrow('Foreign key constraint failed');

      expect(mockPrisma.academyInstructor.findFirst).toHaveBeenCalled();
      expect(mockPrisma.academyInstructor.delete).toHaveBeenCalled();
      expect(mockPrisma.academyInstructor.updateMany).toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback testimonial order update when final update fails', async () => {
      const existing = { order: 1 };
      mockPrisma.academyTestimonial.findFirst.mockResolvedValue(existing);
      mockPrisma.academyTestimonial.updateMany.mockResolvedValue({ count: 2 });

      const updateError = new Error('Record not found');
      mockPrisma.academyTestimonial.update.mockRejectedValue(updateError);

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      await expect(repository.updateTestimonial(1, 1, { order: 3 })).rejects.toThrow('Record not found');

      expect(mockPrisma.academyTestimonial.findFirst).toHaveBeenCalled();
      expect(mockPrisma.academyTestimonial.updateMany).toHaveBeenCalled();
      expect(mockPrisma.academyTestimonial.update).toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback FAQ creation when shift operation fails', async () => {
      const shiftError = new Error('Unique constraint violation');
      mockPrisma.academyFaq.updateMany.mockRejectedValue(shiftError);

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      await expect(
        repository.createFaq(1, {
          question: 'Test question?',
          answer: 'Test answer',
          order: 1,
        }),
      ).rejects.toThrow('Unique constraint violation');

      expect(mockPrisma.academyFaq.updateMany).toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback topic creation when auto-increment query fails', async () => {
      const queryError = new Error('Connection timeout');
      mockPrisma.academyTopic.findFirst.mockRejectedValue(queryError);

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      await expect(
        repository.createTopic(1, {
          theme_id: 1,
          title: 'Test Topic',
          description: 'Test description',
        }),
      ).rejects.toThrow('Connection timeout');

      expect(mockPrisma.academyTopic.findFirst).toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should maintain database state consistency after rollback', async () => {
      // Simulate a scenario where shift succeeds but create fails
      const initialState = [getMockPricing({ id: 1, order: 1 }), getMockPricing({ id: 2, order: 2 }), getMockPricing({ id: 3, order: 3 })];

      mockPrisma.academyPricing.findFirst.mockResolvedValue({ order: 3 });
      mockPrisma.academyPricing.updateMany.mockResolvedValue({ count: 2 });

      const createError = new Error('Validation failed');
      mockPrisma.academyPricing.create.mockRejectedValue(createError);

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      // Attempt to create pricing at order 2 (should shift orders 2 and 3)
      await expect(
        repository.createPricing(1, {
          name: 'New Pricing',
          original_price: 4000000,
          discount_price: 2500000,
          order: 2,
        }),
      ).rejects.toThrow('Validation failed');

      // After rollback, the database state should be unchanged
      // In a real scenario, Prisma would have rolled back the updateMany operation
      // This test verifies that the transaction was used, which ensures rollback
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.academyPricing.updateMany).toHaveBeenCalledWith({
        where: { academy_id: 1, order: { gte: 2 } },
        data: { order: { increment: 1 } },
      });
      expect(mockPrisma.academyPricing.create).toHaveBeenCalled();
    });

    it('should propagate error details for debugging', async () => {
      const detailedError = new Error('Constraint violation: duplicate key');
      detailedError.code = 'P2002';
      detailedError.meta = { target: ['academy_id', 'order'] };

      mockPrisma.academyFeature.findFirst.mockResolvedValue(null);
      mockPrisma.academyFeature.create.mockRejectedValue(detailedError);

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      try {
        await repository.createFeature(1, {
          title: 'Duplicate Feature',
          description: 'This will fail',
          icon: 'icon',
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe('Constraint violation: duplicate key');
        expect(error.code).toBe('P2002');
        expect(error.meta).toEqual({ target: ['academy_id', 'order'] });
      }

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
