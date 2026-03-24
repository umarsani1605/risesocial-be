/**
 * Integration Tests for Shared Academy Service
 * Tests service layer with real repository instances
 * Validates: Requirements 6.1, 6.4, 6.5
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection } from '../../../helpers/testDb.js';
import { seedAcademy, seedAcademyWithRelations, seedMultipleAcademies, resetFixtureState } from '../../../helpers/academyFixtures.js';
import { AcademyService } from '../../../../src/services/shared/academyService.js';
import { AcademyRepository } from '../../../../src/repositories/shared/academyRepository.js';

describe('AcademyService Integration Tests', { concurrent: false }, () => {
  let academyService;
  let academyRepository;

  beforeEach(async () => {
    await resetDatabase();
    resetFixtureState();

    // Use real repository instance (not mocked)
    academyRepository = new AcademyRepository();
    academyService = new AcademyService();
    academyService.academyRepository = academyRepository;
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('getAcademyBySlug', () => {
    it('should retrieve academy with all nested relations through service', async () => {
      // Seed academy with all relations
      const seededAcademy = await seedAcademyWithRelations({
        title: 'Integration Test Academy',
        slug: 'integration-test-academy',
      });

      // Call service method
      const result = await academyService.getAcademyBySlug('integration-test-academy');

      // Verify academy data
      expect(result).toBeDefined();
      expect(result.id).toBe(seededAcademy.id);
      expect(result.title).toBe('Integration Test Academy');
      expect(result.slug).toBe('integration-test-academy');

      // Verify all nested relations are loaded
      expect(result.pricing).toBeDefined();
      expect(Array.isArray(result.pricing)).toBe(true);
      expect(result.pricing.length).toBeGreaterThan(0);

      expect(result.features).toBeDefined();
      expect(Array.isArray(result.features)).toBe(true);
      expect(result.features.length).toBeGreaterThan(0);

      expect(result.themes).toBeDefined();
      expect(Array.isArray(result.themes)).toBe(true);
      expect(result.themes.length).toBeGreaterThan(0);

      // Verify themes include topics
      expect(result.themes[0].topics).toBeDefined();
      expect(Array.isArray(result.themes[0].topics)).toBe(true);

      expect(result.instructors).toBeDefined();
      expect(Array.isArray(result.instructors)).toBe(true);
      expect(result.instructors.length).toBeGreaterThan(0);

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);
      expect(result.testimonials.length).toBeGreaterThan(0);

      expect(result.faqs).toBeDefined();
      expect(Array.isArray(result.faqs)).toBe(true);
      expect(result.faqs.length).toBeGreaterThan(0);
    });

    it('should throw descriptive error when academy not found', async () => {
      // Try to get non-existent academy
      await expect(academyService.getAcademyBySlug('non-existent-slug')).rejects.toThrow('Academy not found');
    });

    it('should verify nested relations are ordered correctly', async () => {
      // Seed academy with relations
      await seedAcademyWithRelations({
        slug: 'ordered-test-academy',
      });

      const result = await academyService.getAcademyBySlug('ordered-test-academy');

      // Verify pricing is ordered
      expect(result.pricing[0].order).toBe(1);
      expect(result.pricing[1].order).toBe(2);

      // Verify features are ordered
      expect(result.features[0].order).toBe(1);
      expect(result.features[1].order).toBe(2);

      // Verify instructors are ordered
      expect(result.instructors[0].order).toBe(1);
      expect(result.instructors[1].order).toBe(2);

      // Verify testimonials are ordered
      expect(result.testimonials[0].order).toBe(1);
      expect(result.testimonials[1].order).toBe(2);

      // Verify FAQs are ordered
      expect(result.faqs[0].order).toBe(1);
      expect(result.faqs[1].order).toBe(2);
      expect(result.faqs[2].order).toBe(3);
    });
  });

  describe('getAllAcademies', () => {
    it('should retrieve paginated academies through service', async () => {
      // Seed multiple academies
      await seedMultipleAcademies(5);

      // Call service method
      const result = await academyService.getAllAcademies({ page: 1, limit: 3 });

      // Verify pagination structure
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(3);

      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(3);
      expect(result.meta.total).toBe(5);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);
    });

    it('should filter academies by category through service', async () => {
      // Seed academies with different categories
      await seedAcademy({ slug: 'academy-1', category: 'INTAKE: 24 January 2026' });
      await seedAcademy({ slug: 'academy-2', category: 'INTAKE: 15 February 2026' });
      await seedAcademy({ slug: 'academy-3', category: 'INTAKE: 24 January 2026' });

      // Filter by category
      const result = await academyService.getAllAcademies({
        category: 'INTAKE: 24 January 2026',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(2);
      expect(result.data.every((a) => a.category === 'INTAKE: 24 January 2026')).toBe(true);
    });

    it('should search academies by title or description through service', async () => {
      // Seed academies with searchable content
      await seedAcademy({ slug: 'carbon-academy', title: 'Carbon Accounting', description: 'Learn carbon fundamentals' });
      await seedAcademy({ slug: 'sustainability-academy', title: 'Sustainability', description: 'Environmental practices' });
      await seedAcademy({ slug: 'carbon-advanced', title: 'Advanced Carbon', description: 'Deep dive into carbon' });

      // Search for "carbon"
      const result = await academyService.getAllAcademies({
        search: 'carbon',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(2);
      expect(result.data.some((a) => a.title.toLowerCase().includes('carbon') || a.description.toLowerCase().includes('carbon'))).toBe(true);
    });
  });

  describe('getCategories', () => {
    it('should retrieve unique categories through service', async () => {
      // Seed academies with duplicate categories
      await seedAcademy({ slug: 'academy-1', category: 'INTAKE: 24 January 2026', status: 'ACTIVE' });
      await seedAcademy({ slug: 'academy-2', category: 'INTAKE: 15 February 2026', status: 'ACTIVE' });
      await seedAcademy({ slug: 'academy-3', category: 'INTAKE: 24 January 2026', status: 'ACTIVE' });
      await seedAcademy({ slug: 'academy-4', category: 'INTAKE: 15 February 2026', status: 'ACTIVE' });

      const categories = await academyService.getCategories();

      // Verify unique categories
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(2);
      expect(categories).toContain('INTAKE: 24 January 2026');
      expect(categories).toContain('INTAKE: 15 February 2026');
    });

    it('should only return categories from active academies', async () => {
      // Seed active and draft academies
      await seedAcademy({ slug: 'active-academy', category: 'Active Category', status: 'ACTIVE' });
      await seedAcademy({ slug: 'draft-academy', category: 'Draft Category', status: 'DRAFT' });

      const categories = await academyService.getCategories();

      // Only active category should be returned
      expect(categories).toContain('Active Category');
      expect(categories).not.toContain('Draft Category');
    });
  });

  describe('Sub-table retrieval methods', () => {
    it('should retrieve ordered pricing for specific academy', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'pricing-test' });

      const pricing = await academyService.getAllPricing(academy.id);

      expect(pricing).toBeDefined();
      expect(Array.isArray(pricing)).toBe(true);
      expect(pricing.length).toBeGreaterThan(0);
      expect(pricing[0].order).toBe(1);
      expect(pricing[1].order).toBe(2);
    });

    it('should retrieve ordered features for specific academy', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'features-test' });

      const features = await academyService.getAllFeatures(academy.id);

      expect(features).toBeDefined();
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
      expect(features[0].order).toBe(1);
      expect(features[1].order).toBe(2);
    });

    it('should retrieve ordered instructors for specific academy', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'instructors-test' });

      const instructors = await academyService.getAllInstructors(academy.id);

      expect(instructors).toBeDefined();
      expect(Array.isArray(instructors)).toBe(true);
      expect(instructors.length).toBeGreaterThan(0);
      expect(instructors[0].order).toBe(1);
      expect(instructors[1].order).toBe(2);
    });

    it('should retrieve ordered themes with topics for specific academy', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'themes-test' });

      const themes = await academyService.getAllThemes(academy.id, true);

      expect(themes).toBeDefined();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0].order).toBe(1);
      expect(themes[0].topics).toBeDefined();
      expect(Array.isArray(themes[0].topics)).toBe(true);
    });

    it('should retrieve ordered testimonials for specific academy', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'testimonials-test' });

      const testimonials = await academyService.getAllTestimonials(academy.id);

      expect(testimonials).toBeDefined();
      expect(Array.isArray(testimonials)).toBe(true);
      expect(testimonials.length).toBeGreaterThan(0);
      expect(testimonials[0].order).toBe(1);
      expect(testimonials[1].order).toBe(2);
    });

    it('should retrieve ordered FAQs for specific academy', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'faqs-test' });

      const faqs = await academyService.getAllFaqs(academy.id);

      expect(faqs).toBeDefined();
      expect(Array.isArray(faqs)).toBe(true);
      expect(faqs.length).toBeGreaterThan(0);
      expect(faqs[0].order).toBe(1);
      expect(faqs[1].order).toBe(2);
      expect(faqs[2].order).toBe(3);
    });
  });

  describe('Error propagation', () => {
    it('should propagate repository errors with descriptive messages', async () => {
      // Try to get academy with invalid slug format that causes error
      await expect(academyService.getAcademyBySlug('non-existent')).rejects.toThrow();
    });

    it('should maintain error type when propagating from repository', async () => {
      // Service should throw Error type from repository
      try {
        await academyService.getAcademyBySlug('non-existent-academy');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Academy not found');
      }
    });
  });
});
