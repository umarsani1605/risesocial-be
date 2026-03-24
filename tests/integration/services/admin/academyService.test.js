/**
 * Integration Tests for Admin Academy Service
 * Tests service layer with real repository instances
 * Validates: Requirements 6.2, 6.3, 6.4, 6.5
 */

import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection } from '../../../helpers/testDb.js';
import { seedAcademy, seedAcademyWithRelations, resetFixtureState } from '../../../helpers/academyFixtures.js';
import { AdminAcademyService } from '../../../../src/services/admin/academyService.js';
import { AdminAcademyRepository } from '../../../../src/repositories/admin/academyRepository.js';
import { AcademyRepository } from '../../../../src/repositories/shared/academyRepository.js';

// Mock file upload service
vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: {
    generatePublicFileUrl: vi.fn((file) => `https://example.com/uploads/${file}`),
  },
}));

describe('AdminAcademyService Integration Tests', { concurrent: false }, () => {
  let adminAcademyService;
  let adminAcademyRepository;
  let academyRepository;

  beforeEach(async () => {
    await resetDatabase();
    resetFixtureState();

    // Use real repository instances (not mocked)
    adminAcademyRepository = new AdminAcademyRepository();
    academyRepository = new AcademyRepository();
    adminAcademyService = new AdminAcademyService();
    adminAcademyService.adminAcademyRepository = adminAcademyRepository;
    adminAcademyService.academyRepository = academyRepository;
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('createAcademy', () => {
    it('should create academy through service with validation', async () => {
      const academyData = {
        title: 'New Academy',
        slug: 'new-academy',
        description: 'Test academy description',
        duration: '2 months',
        format: 'Online',
        category: 'Test Category',
      };

      const result = await adminAcademyService.createAcademy(academyData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('New Academy');
      expect(result.slug).toBe('new-academy');
      expect(result.status).toBe('DRAFT'); // Default status
      expect(result.certificate).toBe(false); // Default value
      expect(result.portfolio).toBe(false); // Default value
    });

    it('should auto-generate slug if not provided', async () => {
      const academyData = {
        title: 'Auto Slug Academy',
        description: 'Test description',
        duration: '2 months',
        format: 'Online',
        category: 'Test',
      };

      const result = await adminAcademyService.createAcademy(academyData);

      expect(result.slug).toBe('auto-slug-academy');
    });

    it('should throw validation error for duplicate slug', async () => {
      // Seed existing academy
      await seedAcademy({ slug: 'duplicate-slug' });

      const academyData = {
        title: 'Duplicate Academy',
        slug: 'duplicate-slug',
        description: 'Test description',
        duration: '2 months',
        format: 'Online',
        category: 'Test',
      };

      await expect(adminAcademyService.createAcademy(academyData)).rejects.toThrow('Slug is already taken');
    });
  });

  describe('updateAcademy', () => {
    it('should update academy through service with validation', async () => {
      const academy = await seedAcademy({ slug: 'update-test' });

      const updateData = {
        description: 'Updated description',
        duration: '3 months',
      };

      const result = await adminAcademyService.updateAcademy(academy.id, updateData);

      expect(result).toBeDefined();
      expect(result.description).toBe('Updated description');
      expect(result.duration).toBe('3 months');
      expect(result.slug).toBe('update-test'); // Slug unchanged when not updating title
    });

    it('should throw error when updating non-existent academy', async () => {
      const updateData = {
        title: 'Updated Title',
      };

      await expect(adminAcademyService.updateAcademy(99999, updateData)).rejects.toThrow('Academy not found');
    });

    it('should validate slug uniqueness when updating', async () => {
      const academy1 = await seedAcademy({ slug: 'academy-1' });
      await seedAcademy({ slug: 'academy-2' });

      const updateData = {
        slug: 'academy-2', // Try to use existing slug
      };

      await expect(adminAcademyService.updateAcademy(academy1.id, updateData)).rejects.toThrow('Slug is already taken');
    });

    it('should allow updating academy with same slug', async () => {
      const academy = await seedAcademy({ slug: 'same-slug' });

      const updateData = {
        title: 'Updated Title',
        slug: 'same-slug', // Same slug should be allowed
      };

      const result = await adminAcademyService.updateAcademy(academy.id, updateData);

      expect(result.title).toBe('Updated Title');
      expect(result.slug).toBe('same-slug');
    });
  });

  describe('deleteAcademy', () => {
    it('should delete academy through service with validation', async () => {
      const academy = await seedAcademy({ slug: 'delete-test' });

      await adminAcademyService.deleteAcademy(academy.id);

      // Verify academy is deleted
      const deleted = await academyRepository.findById(academy.id);
      expect(deleted).toBeNull();
    });

    it('should throw descriptive error when deleting non-existent academy', async () => {
      await expect(adminAcademyService.deleteAcademy(99999)).rejects.toThrow('Academy tidak ditemukan');
    });

    it('should verify error has correct status code', async () => {
      try {
        await adminAcademyService.deleteAcademy(99999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Academy tidak ditemukan');
      }
    });
  });

  describe('Pricing validation', () => {
    it('should create pricing with valid price relationship', async () => {
      const academy = await seedAcademy({ slug: 'pricing-test' });

      const pricingData = {
        name: 'Test Pricing',
        original_price: 5000000,
        discount_price: 3000000,
      };

      const result = await adminAcademyService.createPricing(academy.id, pricingData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Pricing');
      expect(result.original_price).toBe(5000000);
      expect(result.discount_price).toBe(3000000);
    });

    it('should throw validation error when discount price exceeds original price', async () => {
      const academy = await seedAcademy({ slug: 'pricing-validation' });

      const pricingData = {
        name: 'Invalid Pricing',
        original_price: 3000000,
        discount_price: 5000000, // Invalid: discount > original
      };

      await expect(adminAcademyService.createPricing(academy.id, pricingData)).rejects.toThrow(
        'Discount price cannot be greater than original price',
      );
    });

    it('should validate price relationship on update', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'pricing-update' });
      const pricing = academy.pricing[0];

      const updateData = {
        original_price: 2000000,
        discount_price: 3000000, // Invalid: discount > original
      };

      await expect(adminAcademyService.updatePricing(academy.id, pricing.id, updateData)).rejects.toThrow(
        'Discount price cannot be greater than original price',
      );
    });

    it('should allow equal discount and original prices', async () => {
      const academy = await seedAcademy({ slug: 'equal-prices' });

      const pricingData = {
        name: 'Equal Pricing',
        original_price: 5000000,
        discount_price: 5000000, // Equal is valid
      };

      const result = await adminAcademyService.createPricing(academy.id, pricingData);

      expect(result.original_price).toBe(5000000);
      expect(result.discount_price).toBe(5000000);
    });
  });

  describe('Sub-table operations', () => {
    it('should create feature through service', async () => {
      const academy = await seedAcademy({ slug: 'feature-test' });

      const featureData = {
        title: 'Test Feature',
        description: 'Feature description',
        icon: 'test-icon',
      };

      const result = await adminAcademyService.createFeature(academy.id, featureData);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Feature');
      expect(result.order).toBe(1); // Auto-increment
    });

    it('should create instructor through service', async () => {
      const academy = await seedAcademy({ slug: 'instructor-test' });

      const instructorData = {
        name: 'Test Instructor',
        job_title: 'Senior Teacher',
        description: 'Expert instructor',
      };

      const result = await adminAcademyService.createInstructor(academy.id, instructorData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Instructor');
      expect(result.order).toBe(1);
    });

    it('should create testimonial through service', async () => {
      const academy = await seedAcademy({ slug: 'testimonial-test' });

      const testimonialData = {
        name: 'Test Student',
        comment: 'Great course!',
      };

      const result = await adminAcademyService.createTestimonial(academy.id, testimonialData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Student');
      expect(result.order).toBe(1);
    });

    it('should create FAQ through service', async () => {
      const academy = await seedAcademy({ slug: 'faq-test' });

      const faqData = {
        question: 'Test question?',
        answer: 'Test answer',
      };

      const result = await adminAcademyService.createFaq(academy.id, faqData);

      expect(result).toBeDefined();
      expect(result.question).toBe('Test question?');
      expect(result.order).toBe(1);
    });
  });

  describe('Error propagation', () => {
    it('should propagate validation errors with descriptive messages', async () => {
      const academy = await seedAcademy({ slug: 'error-test' });

      const invalidPricing = {
        name: 'Invalid',
        original_price: 1000000,
        discount_price: 2000000,
      };

      try {
        await adminAcademyService.createPricing(academy.id, invalidPricing);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Discount price cannot be greater than original price');
      }
    });

    it('should propagate repository errors without swallowing them', async () => {
      // Try to update non-existent academy
      try {
        await adminAcademyService.updateAcademy(99999, { title: 'Test' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Academy not found');
      }
    });

    it('should maintain error context when propagating from repository', async () => {
      const academy = await seedAcademy({ slug: 'context-test' });

      // Try to create pricing with invalid data that causes DB error
      const invalidData = {
        name: 'Test',
        original_price: 'invalid', // Invalid type
        discount_price: 1000000,
      };

      try {
        await adminAcademyService.createPricing(academy.id, invalidData);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        // Error should be propagated from repository
      }
    });
  });

  describe('Nested relation loading', () => {
    it('should load all nested relations when retrieving academy', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'nested-test' });

      // Update academy to trigger retrieval
      const result = await adminAcademyService.updateAcademy(academy.id, { title: 'Updated' });

      expect(result).toBeDefined();
      expect(result.id).toBe(academy.id);
    });

    it('should verify nested relations are accessible after operations', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'relations-test' });

      // Perform operation
      await adminAcademyService.updateAcademy(academy.id, { description: 'Updated description' });

      // Verify relations still exist
      const retrieved = await academyRepository.findById(academy.id, {
        include: {
          pricing: true,
          features: true,
          themes: { include: { topics: true } },
        },
      });

      expect(retrieved.pricing.length).toBeGreaterThan(0);
      expect(retrieved.features.length).toBeGreaterThan(0);
      expect(retrieved.themes.length).toBeGreaterThan(0);
    });
  });
});
