/**
 * Shared AcademyRepository Integration Tests
 * Tests with real database connection
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../../../helpers/testDb.js';
import { seedAcademyWithRelations, seedMultipleAcademies, resetFixtureState } from '../../../helpers/academyFixtures.js';
import { AcademyRepository } from '../../../../src/repositories/shared/academyRepository.js';

describe('Shared AcademyRepository Integration Tests', { concurrent: false }, () => {
  let repository;
  let prisma;

  beforeAll(async () => {
    // Verify we're using test database
    expect(isTestDatabase()).toBe(true);

    prisma = getTestPrisma();
    repository = new AcademyRepository();
  });

  beforeEach(async () => {
    // Reset database before each test
    await resetDatabase();
    // Reset fixture state
    resetFixtureState();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('findBySlug', () => {
    it('should return academy with all nested relations', async () => {
      // Seed academy with all relations
      const seededAcademy = await seedAcademyWithRelations({
        slug: 'carbon-accounting-test',
        title: 'Carbon Accounting Test',
      });

      // Find by slug
      const result = await repository.findBySlug('carbon-accounting-test');

      // Verify academy is returned
      expect(result).not.toBeNull();
      expect(result.id).toBe(seededAcademy.id);
      expect(result.slug).toBe('carbon-accounting-test');
      expect(result.title).toBe('Carbon Accounting Test');

      // Verify all nested relations are included
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
      expect(result.themes[0].topics.length).toBeGreaterThan(0);

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

    it('should return sub-tables ordered correctly', async () => {
      // Seed academy with relations
      await seedAcademyWithRelations({
        slug: 'order-test',
      });

      // Find by slug
      const result = await repository.findBySlug('order-test');

      // Verify pricing is ordered
      expect(result.pricing[0].order).toBe(1);
      expect(result.pricing[1].order).toBe(2);

      // Verify features are ordered
      expect(result.features[0].order).toBe(1);
      expect(result.features[1].order).toBe(2);
      expect(result.features[2].order).toBe(3);

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

      // Verify themes are ordered
      expect(result.themes[0].order).toBe(1);

      // Verify topics within theme are ordered
      expect(result.themes[0].topics[0].order).toBe(1);
    });

    it('should return null for non-existent slug', async () => {
      const result = await repository.findBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  describe('findWithPagination', () => {
    beforeEach(async () => {
      // Seed multiple academies for pagination testing
      await seedMultipleAcademies(15, {
        category: 'INTAKE: 24 January 2026',
      });
    });

    it('should return paginated results with correct boundaries', async () => {
      // Get first page
      const page1 = await repository.findWithPagination({
        page: 1,
        limit: 5,
      });

      expect(page1.data).toBeDefined();
      expect(Array.isArray(page1.data)).toBe(true);
      expect(page1.data.length).toBe(5);

      // Get second page
      const page2 = await repository.findWithPagination({
        page: 2,
        limit: 5,
      });

      expect(page2.data.length).toBe(5);

      // Ensure different results on different pages
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });

    it('should calculate pagination metadata correctly', async () => {
      const result = await repository.findWithPagination({
        page: 1,
        limit: 5,
      });

      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(15);
      expect(result.meta.totalPages).toBe(3); // 15 / 5 = 3
      expect(result.meta.hasNext).toBe(true); // page 1 has next
      expect(result.meta.hasPrev).toBe(false); // page 1 has no prev
    });

    it('should handle last page correctly', async () => {
      const result = await repository.findWithPagination({
        page: 3,
        limit: 5,
      });

      expect(result.data.length).toBe(5);
      expect(result.meta.hasNext).toBe(false); // last page has no next
      expect(result.meta.hasPrev).toBe(true); // last page has prev
    });

    it('should handle page exceeding total pages', async () => {
      const result = await repository.findWithPagination({
        page: 10,
        limit: 5,
      });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(15);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNext).toBe(false);
    });

    it('should filter by category', async () => {
      // Seed academies with different categories
      await resetDatabase();
      resetFixtureState();

      await seedMultipleAcademies(5, { category: 'INTAKE: January 2026' });
      await seedMultipleAcademies(3, { category: 'INTAKE: February 2026' });

      // Filter by category
      const result = await repository.findWithPagination({
        category: 'INTAKE: January 2026',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(5);
      result.data.forEach((academy) => {
        expect(academy.category).toBe('INTAKE: January 2026');
      });
    });

    it('should search by title', async () => {
      // Seed academies with specific titles
      await resetDatabase();
      resetFixtureState();

      await seedMultipleAcademies(3, { title: 'Carbon Accounting Course' });
      await seedMultipleAcademies(2, { title: 'Data Science Bootcamp' });

      // Search by title
      const result = await repository.findWithPagination({
        search: 'Carbon',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(3);
      result.data.forEach((academy) => {
        expect(academy.title.toLowerCase()).toContain('carbon');
      });
    });

    it('should search by description', async () => {
      // Seed academies with specific descriptions
      await resetDatabase();
      resetFixtureState();

      await seedMultipleAcademies(2, {
        title: 'Academy A',
        description: 'Learn about sustainability and carbon footprint',
      });
      await seedMultipleAcademies(3, {
        title: 'Academy B',
        description: 'Master data analysis techniques',
      });

      // Search by description
      const result = await repository.findWithPagination({
        search: 'sustainability',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(2);
      result.data.forEach((academy) => {
        expect(academy.description.toLowerCase()).toContain('sustainability');
      });
    });

    it('should handle combined filters', async () => {
      // Seed academies with different attributes
      await resetDatabase();
      resetFixtureState();

      await seedMultipleAcademies(3, {
        title: 'Carbon Accounting',
        category: 'INTAKE: January 2026',
      });
      await seedMultipleAcademies(2, {
        title: 'Data Science',
        category: 'INTAKE: January 2026',
      });
      await seedMultipleAcademies(2, {
        title: 'Carbon Accounting',
        category: 'INTAKE: February 2026',
      });

      // Filter by category and search
      const result = await repository.findWithPagination({
        category: 'INTAKE: January 2026',
        search: 'Carbon',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(3);
      result.data.forEach((academy) => {
        expect(academy.category).toBe('INTAKE: January 2026');
        expect(academy.title.toLowerCase()).toContain('carbon');
      });
    });

    it('should return empty array when no academies match filters', async () => {
      const result = await repository.findWithPagination({
        search: 'NonExistentAcademy12345',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      // Seed academies with different categories
      await seedMultipleAcademies(3, { category: 'INTAKE: January 2026', status: 'ACTIVE' });
      await seedMultipleAcademies(2, { category: 'INTAKE: February 2026', status: 'ACTIVE' });
      await seedMultipleAcademies(2, { category: 'INTAKE: January 2026', status: 'ACTIVE' }); // Duplicate

      const result = await repository.getCategories();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2); // Only 2 unique categories
      expect(result).toContain('INTAKE: January 2026');
      expect(result).toContain('INTAKE: February 2026');
    });

    it('should only return categories from active academies', async () => {
      // Seed active and archived academies
      await seedMultipleAcademies(2, { category: 'INTAKE: January 2026', status: 'ACTIVE' });
      await seedMultipleAcademies(1, { category: 'INTAKE: March 2026', status: 'ARCHIVED' });

      const result = await repository.getCategories();

      expect(result).toContain('INTAKE: January 2026');
      expect(result).not.toContain('INTAKE: March 2026');
    });

    it('should return empty array when no active academies', async () => {
      await resetDatabase();
      resetFixtureState();

      const result = await repository.getCategories();

      expect(result).toHaveLength(0);
    });
  });

  describe('slugExists', () => {
    it('should return true for existing slug', async () => {
      await seedAcademyWithRelations({ slug: 'existing-slug' });

      const result = await repository.slugExists('existing-slug');

      expect(result).toBe(true);
    });

    it('should return false for non-existent slug', async () => {
      const result = await repository.slugExists('non-existent-slug');

      expect(result).toBe(false);
    });

    it('should exclude specified ID when checking slug existence', async () => {
      const academy = await seedAcademyWithRelations({ slug: 'test-slug' });

      // Should return false when excluding the academy's own ID
      const result = await repository.slugExists('test-slug', academy.id);

      expect(result).toBe(false);
    });

    it('should return true when slug exists on different academy', async () => {
      const academy1 = await seedAcademyWithRelations({ slug: 'test-slug-1' });
      await seedAcademyWithRelations({ slug: 'test-slug-2' });

      // Should return true because test-slug-2 exists and we're excluding academy1
      const result = await repository.slugExists('test-slug-2', academy1.id);

      expect(result).toBe(true);
    });
  });

  describe('database cleanup', () => {
    it('should have clean state after resetDatabase', async () => {
      // Seed some data
      await seedAcademyWithRelations();

      // Reset database
      await resetDatabase();

      // Verify all tables are empty
      const academies = await prisma.academy.findMany();
      const pricing = await prisma.academyPricing.findMany();
      const features = await prisma.academyFeature.findMany();
      const themes = await prisma.academyTheme.findMany();
      const topics = await prisma.academyTopic.findMany();
      const instructors = await prisma.academyInstructor.findMany();
      const testimonials = await prisma.academyTestimonial.findMany();
      const faqs = await prisma.academyFaq.findMany();

      expect(academies).toHaveLength(0);
      expect(pricing).toHaveLength(0);
      expect(features).toHaveLength(0);
      expect(themes).toHaveLength(0);
      expect(topics).toHaveLength(0);
      expect(instructors).toHaveLength(0);
      expect(testimonials).toHaveLength(0);
      expect(faqs).toHaveLength(0);
    });
  });
});
