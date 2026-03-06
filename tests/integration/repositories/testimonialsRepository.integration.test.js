/**
 * TestimonialsRepository Integration Tests
 * Tests with real database connection
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../../helpers/testDb.js';
import { seedAllTestimonialsData, createMultipleTestimonials } from '../../helpers/testimonialsFixtures.js';
import { userTestimonialsRepository } from '../../../src/repositories/user/testimonialsRepository.js';
import { adminTestimonialsRepository } from '../../../src/repositories/admin/testimonialsRepository.js';

describe('TestimonialsRepository Integration Tests', () => {
  let prisma;
  let fixtures;

  beforeAll(async () => {
    // Verify we're using test database
    expect(isTestDatabase()).toBe(true);

    prisma = getTestPrisma();
  });

  beforeEach(async () => {
    // Reset database before each test
    await resetDatabase();
    // Seed test data
    fixtures = await seedAllTestimonialsData();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('findMany', () => {
    it('should return all active testimonials when no filters applied', async () => {
      const result = await userTestimonialsRepository.findMany();

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // Should only return ACTIVE testimonials
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      expect(result.testimonials.length).toBe(activeTestimonials.length);

      // Verify all returned testimonials are ACTIVE
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
      });
    });

    it('should filter testimonials by country (case-insensitive)', async () => {
      // Filter by 'indonesia' (lowercase)
      const result = await userTestimonialsRepository.findMany({ country: 'indonesia' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should contain 'indonesia' in country (case-insensitive)
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.country.toLowerCase()).toContain('indonesia');
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify we got the expected testimonials
      const expectedCount = fixtures.testimonials.filter((t) => t.status === 'ACTIVE' && t.country.toLowerCase().includes('indonesia')).length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should filter testimonials by minRating', async () => {
      // Filter by minRating 5
      const result = await userTestimonialsRepository.findMany({ minRating: 5 });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should have rating >= 5
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.rating).toBeGreaterThanOrEqual(5);
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify we got the expected testimonials
      const expectedCount = fixtures.testimonials.filter((t) => t.status === 'ACTIVE' && t.rating >= 5).length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should filter testimonials by featured flag', async () => {
      // Filter by featured = true
      const result = await userTestimonialsRepository.findMany({ featured: 'true' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should be featured
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.featured).toBe(true);
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify we got the expected testimonials
      const expectedCount = fixtures.testimonials.filter((t) => t.status === 'ACTIVE' && t.featured === true).length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should search testimonials by query (name, text, country)', async () => {
      // Search for 'program' which should appear in text
      const result = await userTestimonialsRepository.findMany({ search: 'program' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should contain 'program' in name, text, or country
      result.testimonials.forEach((testimonial) => {
        const searchTerm = 'program';
        const matchesName = testimonial.name.toLowerCase().includes(searchTerm);
        const matchesText = testimonial.text.toLowerCase().includes(searchTerm);
        const matchesCountry = testimonial.country.toLowerCase().includes(searchTerm);

        expect(matchesName || matchesText || matchesCountry).toBe(true);
        expect(testimonial.status).toBe('ACTIVE');
      });

      expect(result.testimonials.length).toBeGreaterThan(0);
    });

    it('should sort testimonials by different fields', async () => {
      // Test sorting by name ascending
      const resultNameAsc = await userTestimonialsRepository.findMany({}, undefined, undefined, 'name', 'asc');
      expect(resultNameAsc.testimonials.length).toBeGreaterThan(1);

      for (let i = 1; i < resultNameAsc.testimonials.length; i++) {
        expect(resultNameAsc.testimonials[i].name >= resultNameAsc.testimonials[i - 1].name).toBe(true);
      }

      // Test sorting by rating descending
      const resultRatingDesc = await userTestimonialsRepository.findMany({}, undefined, undefined, 'rating', 'desc');
      expect(resultRatingDesc.testimonials.length).toBeGreaterThan(1);

      for (let i = 1; i < resultRatingDesc.testimonials.length; i++) {
        expect(resultRatingDesc.testimonials[i].rating <= resultRatingDesc.testimonials[i - 1].rating).toBe(true);
      }

      // Test sorting by country ascending
      const resultCountryAsc = await userTestimonialsRepository.findMany({}, undefined, undefined, 'country', 'asc');
      expect(resultCountryAsc.testimonials.length).toBeGreaterThan(1);

      for (let i = 1; i < resultCountryAsc.testimonials.length; i++) {
        expect(resultCountryAsc.testimonials[i].country >= resultCountryAsc.testimonials[i - 1].country).toBe(true);
      }
    });

    it('should return empty array when no testimonials match filters', async () => {
      // Search for something that doesn't exist
      const result = await userTestimonialsRepository.findMany({ search: 'nonexistentxyz123' });

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);
      expect(result.testimonials.length).toBe(0);
    });
  });

  describe('findMany - pagination', () => {
    it('should return all testimonials when no pagination params provided', async () => {
      // Call findMany without page/limit parameters
      const result = await userTestimonialsRepository.findMany();

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // Should NOT have pagination metadata when no pagination params provided
      expect(result.pagination).toBeUndefined();

      // Should return all ACTIVE testimonials
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      expect(result.testimonials.length).toBe(activeTestimonials.length);

      // Verify all returned testimonials are ACTIVE
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
      });
    });

    it('should paginate results correctly when page and limit provided', async () => {
      // Get total count of active testimonials
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      const totalActive = activeTestimonials.length;

      // Test first page with limit 2
      const page1 = await userTestimonialsRepository.findMany({}, 1, 2);

      expect(page1).toBeDefined();
      expect(page1.testimonials).toBeDefined();
      expect(Array.isArray(page1.testimonials)).toBe(true);
      expect(page1.testimonials.length).toBe(2);

      // Should have pagination metadata
      expect(page1.pagination).toBeDefined();
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.limit).toBe(2);
      expect(page1.pagination.total).toBe(totalActive);

      // Test second page with limit 2
      const page2 = await userTestimonialsRepository.findMany({}, 2, 2);

      expect(page2).toBeDefined();
      expect(page2.testimonials).toBeDefined();
      expect(Array.isArray(page2.testimonials)).toBe(true);
      expect(page2.testimonials.length).toBe(2);

      expect(page2.pagination).toBeDefined();
      expect(page2.pagination.page).toBe(2);
      expect(page2.pagination.limit).toBe(2);

      // Verify pages contain different testimonials
      const page1Ids = page1.testimonials.map((t) => t.id);
      const page2Ids = page2.testimonials.map((t) => t.id);
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap.length).toBe(0); // No overlap between pages
    });

    it('should calculate pagination metadata correctly', async () => {
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      const totalActive = activeTestimonials.length;

      // Test with limit 2
      const result = await userTestimonialsRepository.findMany({}, 1, 2);

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(totalActive);

      // totalPages should be CEILING(total / limit)
      const expectedTotalPages = Math.ceil(totalActive / 2);
      expect(result.pagination.totalPages).toBe(expectedTotalPages);

      // Test with different limit
      const result2 = await userTestimonialsRepository.findMany({}, 1, 3);
      const expectedTotalPages2 = Math.ceil(totalActive / 3);
      expect(result2.pagination.totalPages).toBe(expectedTotalPages2);
    });

    it('should set hasNext correctly', async () => {
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      const totalActive = activeTestimonials.length;
      const limit = 2;
      const totalPages = Math.ceil(totalActive / limit);

      // First page should have hasNext = true (if there are more pages)
      const firstPage = await userTestimonialsRepository.findMany({}, 1, limit);
      if (totalPages > 1) {
        expect(firstPage.pagination.hasNext).toBe(true);
      } else {
        expect(firstPage.pagination.hasNext).toBe(false);
      }

      // Last page should have hasNext = false
      const lastPage = await userTestimonialsRepository.findMany({}, totalPages, limit);
      expect(lastPage.pagination.hasNext).toBe(false);

      // Middle page should have hasNext = true (if there are enough pages)
      if (totalPages > 2) {
        const middlePage = await userTestimonialsRepository.findMany({}, 2, limit);
        expect(middlePage.pagination.hasNext).toBe(true);
      }
    });

    it('should set hasPrev correctly', async () => {
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      const totalActive = activeTestimonials.length;
      const limit = 2;
      const totalPages = Math.ceil(totalActive / limit);

      // First page should have hasPrev = false
      const firstPage = await userTestimonialsRepository.findMany({}, 1, limit);
      expect(firstPage.pagination.hasPrev).toBe(false);

      // Second page should have hasPrev = true (if there are at least 2 pages)
      if (totalPages >= 2) {
        const secondPage = await userTestimonialsRepository.findMany({}, 2, limit);
        expect(secondPage.pagination.hasPrev).toBe(true);
      }

      // Last page should have hasPrev = true (if there are multiple pages)
      if (totalPages > 1) {
        const lastPage = await userTestimonialsRepository.findMany({}, totalPages, limit);
        expect(lastPage.pagination.hasPrev).toBe(true);
      }
    });
  });

  describe('findManyForAdmin', () => {
    it('should return testimonials with any status (ACTIVE, INACTIVE, PENDING)', async () => {
      const result = await adminTestimonialsRepository.findMany();

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // Should return ALL testimonials regardless of status
      expect(result.testimonials.length).toBe(fixtures.testimonials.length);

      // Verify we have testimonials with different statuses
      const statuses = result.testimonials.map((t) => t.status);
      const uniqueStatuses = [...new Set(statuses)];

      // Should have at least 2 different statuses in our fixtures
      expect(uniqueStatuses.length).toBeGreaterThan(1);

      // Verify we have ACTIVE, INACTIVE, and PENDING testimonials in fixtures
      const hasActive = result.testimonials.some((t) => t.status === 'ACTIVE');
      const hasInactive = result.testimonials.some((t) => t.status === 'INACTIVE');

      expect(hasActive).toBe(true);
      expect(hasInactive).toBe(true);
    });

    it('should filter by status ACTIVE', async () => {
      const result = await adminTestimonialsRepository.findMany({ status: 'ACTIVE' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should be ACTIVE
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify count matches expected
      const expectedCount = fixtures.testimonials.filter((t) => t.status === 'ACTIVE').length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should filter by status INACTIVE', async () => {
      const result = await adminTestimonialsRepository.findMany({ status: 'INACTIVE' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should be INACTIVE
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('INACTIVE');
      });

      // Verify count matches expected
      const expectedCount = fixtures.testimonials.filter((t) => t.status === 'INACTIVE').length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should filter by status PENDING', async () => {
      const result = await adminTestimonialsRepository.findMany({ status: 'PENDING' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should be PENDING
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('PENDING');
      });

      // Verify count matches expected
      const expectedCount = fixtures.testimonials.filter((t) => t.status === 'PENDING').length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should support country filter (case-insensitive)', async () => {
      // Filter by 'singapore' (lowercase)
      const result = await adminTestimonialsRepository.findMany({ country: 'singapore' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should contain 'singapore' in country (case-insensitive)
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.country.toLowerCase()).toContain('singapore');
      });

      // Verify we got the expected testimonials (any status)
      const expectedCount = fixtures.testimonials.filter((t) => t.country.toLowerCase().includes('singapore')).length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should support minRating filter', async () => {
      // Filter by minRating 4
      const result = await adminTestimonialsRepository.findMany({ minRating: 4 });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should have rating >= 4
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.rating).toBeGreaterThanOrEqual(4);
      });

      // Verify we got the expected testimonials (any status)
      const expectedCount = fixtures.testimonials.filter((t) => t.rating >= 4).length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should support featured filter', async () => {
      // Filter by featured = true
      const result = await adminTestimonialsRepository.findMany({ featured: 'true' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should be featured
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.featured).toBe(true);
      });

      // Verify we got the expected testimonials (any status)
      const expectedCount = fixtures.testimonials.filter((t) => t.featured === true).length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should support search filter (name, text, country)', async () => {
      // Search for 'program' which should appear in text
      const result = await adminTestimonialsRepository.findMany({ search: 'program' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should contain 'program' in name, text, or country
      result.testimonials.forEach((testimonial) => {
        const searchTerm = 'program';
        const matchesName = testimonial.name.toLowerCase().includes(searchTerm);
        const matchesText = testimonial.text.toLowerCase().includes(searchTerm);
        const matchesCountry = testimonial.country.toLowerCase().includes(searchTerm);

        expect(matchesName || matchesText || matchesCountry).toBe(true);
      });

      expect(result.testimonials.length).toBeGreaterThan(0);
    });

    it('should support sorting by different fields', async () => {
      // Test sorting by name ascending
      const resultNameAsc = await adminTestimonialsRepository.findMany({}, undefined, undefined, 'name', 'asc');
      expect(resultNameAsc.testimonials.length).toBeGreaterThan(1);

      for (let i = 1; i < resultNameAsc.testimonials.length; i++) {
        expect(resultNameAsc.testimonials[i].name >= resultNameAsc.testimonials[i - 1].name).toBe(true);
      }

      // Test sorting by rating descending
      const resultRatingDesc = await adminTestimonialsRepository.findMany({}, undefined, undefined, 'rating', 'desc');
      expect(resultRatingDesc.testimonials.length).toBeGreaterThan(1);

      for (let i = 1; i < resultRatingDesc.testimonials.length; i++) {
        expect(resultRatingDesc.testimonials[i].rating <= resultRatingDesc.testimonials[i - 1].rating).toBe(true);
      }

      // Test sorting by status ascending
      const resultStatusAsc = await adminTestimonialsRepository.findMany({}, undefined, undefined, 'status', 'asc');
      expect(resultStatusAsc.testimonials.length).toBeGreaterThan(1);

      for (let i = 1; i < resultStatusAsc.testimonials.length; i++) {
        expect(resultStatusAsc.testimonials[i].status >= resultStatusAsc.testimonials[i - 1].status).toBe(true);
      }
    });

    it('should return all testimonials when no pagination params provided', async () => {
      // Call findManyForAdmin without page/limit parameters
      const result = await adminTestimonialsRepository.findMany();

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // Should NOT have pagination metadata when no pagination params provided
      expect(result.pagination).toBeUndefined();

      // Should return ALL testimonials (any status)
      expect(result.testimonials.length).toBe(fixtures.testimonials.length);
    });

    it('should paginate results correctly when page and limit provided', async () => {
      // Get total count of all testimonials
      const totalTestimonials = fixtures.testimonials.length;

      // Test first page with limit 2
      const page1 = await adminTestimonialsRepository.findMany({}, 1, 2);

      expect(page1).toBeDefined();
      expect(page1.testimonials).toBeDefined();
      expect(Array.isArray(page1.testimonials)).toBe(true);
      expect(page1.testimonials.length).toBe(2);

      // Should have pagination metadata
      expect(page1.pagination).toBeDefined();
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.limit).toBe(2);
      expect(page1.pagination.total).toBe(totalTestimonials);

      // Test second page with limit 2
      const page2 = await adminTestimonialsRepository.findMany({}, 2, 2);

      expect(page2).toBeDefined();
      expect(page2.testimonials).toBeDefined();
      expect(Array.isArray(page2.testimonials)).toBe(true);
      expect(page2.testimonials.length).toBe(2);

      expect(page2.pagination).toBeDefined();
      expect(page2.pagination.page).toBe(2);
      expect(page2.pagination.limit).toBe(2);

      // Verify pages contain different testimonials
      const page1Ids = page1.testimonials.map((t) => t.id);
      const page2Ids = page2.testimonials.map((t) => t.id);
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap.length).toBe(0); // No overlap between pages
    });

    it('should calculate pagination metadata correctly', async () => {
      const totalTestimonials = fixtures.testimonials.length;

      // Test with limit 2
      const result = await adminTestimonialsRepository.findMany({}, 1, 2);

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(totalTestimonials);

      // totalPages should be CEILING(total / limit)
      const expectedTotalPages = Math.ceil(totalTestimonials / 2);
      expect(result.pagination.totalPages).toBe(expectedTotalPages);

      // Test with different limit
      const result2 = await adminTestimonialsRepository.findMany({}, 1, 3);
      const expectedTotalPages2 = Math.ceil(totalTestimonials / 3);
      expect(result2.pagination.totalPages).toBe(expectedTotalPages2);
    });

    it('should combine status filter with other filters', async () => {
      // Filter by status ACTIVE and country 'indonesia'
      const result = await adminTestimonialsRepository.findMany({ status: 'ACTIVE', country: 'indonesia' });

      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should be ACTIVE and contain 'indonesia'
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
        expect(testimonial.country.toLowerCase()).toContain('indonesia');
      });

      // Verify count matches expected
      const expectedCount = fixtures.testimonials.filter((t) => t.status === 'ACTIVE' && t.country.toLowerCase().includes('indonesia')).length;
      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should combine status filter with pagination', async () => {
      // Filter by status ACTIVE with pagination
      const result = await adminTestimonialsRepository.findMany({ status: 'ACTIVE' }, 1, 2);

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);
      expect(result.testimonials.length).toBeLessThanOrEqual(2);

      // Should have pagination metadata
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);

      // All returned testimonials should be ACTIVE
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Total should match ACTIVE testimonials count
      const expectedTotal = fixtures.testimonials.filter((t) => t.status === 'ACTIVE').length;
      expect(result.pagination.total).toBe(expectedTotal);
    });
  });

  describe('findById', () => {
    it.todo('should find testimonial by ID');

    it.todo('should return null for non-existent ID');
  });

  describe('create', () => {
    it('should create testimonial with all fields', async () => {
      const testimonialData = {
        name: 'Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length to meet validation requirements.',
        rating: 5,
        status: 'ACTIVE',
        featured: true,
      };

      const created = await adminTestimonialsRepository.create(testimonialData);

      // Verify the testimonial was created
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(typeof created.id).toBe('number');

      // Verify all fields match
      expect(created.name).toBe(testimonialData.name);
      expect(created.country).toBe(testimonialData.country);
      expect(created.text).toBe(testimonialData.text);
      expect(created.rating).toBe(testimonialData.rating);
      expect(created.status).toBe(testimonialData.status);
      expect(created.featured).toBe(testimonialData.featured);

      // Verify data persists in database
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });

      expect(fromDb).toBeDefined();
      expect(fromDb.name).toBe(testimonialData.name);
      expect(fromDb.country).toBe(testimonialData.country);
      expect(fromDb.text).toBe(testimonialData.text);
      expect(fromDb.rating).toBe(testimonialData.rating);
      expect(fromDb.status).toBe(testimonialData.status);
      expect(fromDb.featured).toBe(testimonialData.featured);
    });

    it('should set timestamps automatically', async () => {
      const testimonialData = {
        name: 'Timestamp Test User',
        country: 'Test Country',
        text: 'Testing automatic timestamp generation for created testimonials.',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
      };

      const beforeCreate = new Date();
      const created = await adminTestimonialsRepository.create(testimonialData);
      const afterCreate = new Date();

      // Verify timestamps exist
      expect(created.created_at).toBeDefined();
      expect(created.updated_at).toBeDefined();
      expect(created.created_at instanceof Date).toBe(true);
      expect(created.updated_at instanceof Date).toBe(true);

      // Verify timestamps are within reasonable range
      expect(created.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
      expect(created.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime() + 1000);
      expect(created.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
      expect(created.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime() + 1000);

      // Verify created_at and updated_at are the same (or very close) on creation
      const timeDiff = Math.abs(created.updated_at.getTime() - created.created_at.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second

      // Verify timestamps persist in database
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });

      expect(fromDb.created_at).toBeDefined();
      expect(fromDb.updated_at).toBeDefined();
      expect(fromDb.created_at.getTime()).toBe(created.created_at.getTime());
      expect(fromDb.updated_at.getTime()).toBe(created.updated_at.getTime());
    });

    it('should return created testimonial with ID', async () => {
      const testimonialData = {
        name: 'ID Test User',
        country: 'Test Country',
        text: 'Testing that created testimonial has a valid ID assigned by database.',
        rating: 3,
        status: 'PENDING',
        featured: false,
      };

      const created = await adminTestimonialsRepository.create(testimonialData);

      // Verify ID exists and is a positive integer
      expect(created.id).toBeDefined();
      expect(typeof created.id).toBe('number');
      expect(created.id).toBeGreaterThan(0);
      expect(Number.isInteger(created.id)).toBe(true);

      // Create another testimonial and verify IDs are different
      const testimonialData2 = {
        name: 'Second ID Test User',
        country: 'Test Country 2',
        text: 'Testing that each testimonial gets a unique ID from the database.',
        rating: 5,
        status: 'ACTIVE',
        featured: true,
      };

      const created2 = await adminTestimonialsRepository.create(testimonialData2);

      expect(created2.id).toBeDefined();
      expect(created2.id).not.toBe(created.id);
      expect(created2.id).toBeGreaterThan(created.id);
    });

    it('should create testimonial with minimal required fields', async () => {
      const testimonialData = {
        name: 'Minimal Fields User',
        country: 'Test Country',
        text: 'Testing testimonial creation with only required fields specified.',
        rating: 4,
      };

      const created = await adminTestimonialsRepository.create(testimonialData);

      // Verify testimonial was created
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();

      // Verify required fields
      expect(created.name).toBe(testimonialData.name);
      expect(created.country).toBe(testimonialData.country);
      expect(created.text).toBe(testimonialData.text);
      expect(created.rating).toBe(testimonialData.rating);

      // Verify data persists in database
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });

      expect(fromDb).toBeDefined();
      expect(fromDb.name).toBe(testimonialData.name);
      expect(fromDb.country).toBe(testimonialData.country);
      expect(fromDb.text).toBe(testimonialData.text);
      expect(fromDb.rating).toBe(testimonialData.rating);
    });

    it('should create testimonial with default values for optional fields', async () => {
      const testimonialData = {
        name: 'Default Values User',
        country: 'Test Country',
        text: 'Testing testimonial creation with minimal required fields only.',
        rating: 5,
      };

      const created = await adminTestimonialsRepository.create(testimonialData);

      // Verify testimonial was created
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();

      // Verify required fields
      expect(created.name).toBe(testimonialData.name);
      expect(created.country).toBe(testimonialData.country);
      expect(created.text).toBe(testimonialData.text);
      expect(created.rating).toBe(testimonialData.rating);

      // Verify timestamps are set
      expect(created.created_at).toBeDefined();
      expect(created.updated_at).toBeDefined();

      // Verify data persists in database with all fields
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });

      expect(fromDb).toBeDefined();
      expect(fromDb.id).toBe(created.id);
      expect(fromDb.name).toBe(testimonialData.name);
      expect(fromDb.country).toBe(testimonialData.country);
      expect(fromDb.text).toBe(testimonialData.text);
      expect(fromDb.rating).toBe(testimonialData.rating);
      expect(fromDb.created_at).toBeDefined();
      expect(fromDb.updated_at).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update testimonial successfully', async () => {
      // Create a testimonial first
      const testimonialData = {
        name: 'Original Name',
        country: 'Original Country',
        text: 'Original text with sufficient length for validation requirements.',
        rating: 3,
        status: 'ACTIVE',
        featured: false,
      };

      const created = await adminTestimonialsRepository.create(testimonialData);
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();

      // Update the testimonial
      const updateData = {
        name: 'Updated Name',
        country: 'Updated Country',
        text: 'Updated text with sufficient length for validation requirements.',
        rating: 5,
        status: 'INACTIVE',
        featured: true,
      };

      const updated = await adminTestimonialsRepository.update(created.id, updateData);

      // Verify the update was successful
      expect(updated).toBeDefined();
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe(updateData.name);
      expect(updated.country).toBe(updateData.country);
      expect(updated.text).toBe(updateData.text);
      expect(updated.rating).toBe(updateData.rating);
      expect(updated.status).toBe(updateData.status);
      expect(updated.featured).toBe(updateData.featured);

      // Verify data persists in database
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });

      expect(fromDb).toBeDefined();
      expect(fromDb.name).toBe(updateData.name);
      expect(fromDb.country).toBe(updateData.country);
      expect(fromDb.text).toBe(updateData.text);
      expect(fromDb.rating).toBe(updateData.rating);
      expect(fromDb.status).toBe(updateData.status);
      expect(fromDb.featured).toBe(updateData.featured);
    });

    it('should update only provided fields', async () => {
      // Create a testimonial first
      const testimonialData = {
        name: 'Original Name',
        country: 'Original Country',
        text: 'Original text with sufficient length for validation requirements.',
        rating: 3,
        status: 'ACTIVE',
        featured: false,
      };

      const created = await adminTestimonialsRepository.create(testimonialData);
      expect(created).toBeDefined();

      // Update only the name field
      const partialUpdate = {
        name: 'Partially Updated Name',
      };

      const updated = await adminTestimonialsRepository.update(created.id, partialUpdate);

      // Verify only the name was updated
      expect(updated).toBeDefined();
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe(partialUpdate.name);
      // Other fields should remain unchanged
      expect(updated.country).toBe(testimonialData.country);
      expect(updated.text).toBe(testimonialData.text);
      expect(updated.rating).toBe(testimonialData.rating);
      expect(updated.status).toBe(testimonialData.status);
      expect(updated.featured).toBe(testimonialData.featured);

      // Verify data persists in database
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });

      expect(fromDb).toBeDefined();
      expect(fromDb.name).toBe(partialUpdate.name);
      expect(fromDb.country).toBe(testimonialData.country);
      expect(fromDb.text).toBe(testimonialData.text);
      expect(fromDb.rating).toBe(testimonialData.rating);
      expect(fromDb.status).toBe(testimonialData.status);
      expect(fromDb.featured).toBe(testimonialData.featured);
    });

    it('should update updated_at timestamp', async () => {
      // Create a testimonial first
      const testimonialData = {
        name: 'Timestamp Test User',
        country: 'Test Country',
        text: 'Testing that updated_at timestamp is updated when testimonial is modified.',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
      };

      const created = await adminTestimonialsRepository.create(testimonialData);
      expect(created).toBeDefined();
      expect(created.created_at).toBeDefined();
      expect(created.updated_at).toBeDefined();

      const originalCreatedAt = created.created_at;
      const originalUpdatedAt = created.updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Update the testimonial
      const updateData = {
        name: 'Updated Timestamp Test User',
      };

      const beforeUpdate = new Date();
      const updated = await adminTestimonialsRepository.update(created.id, updateData);
      const afterUpdate = new Date();

      // Verify updated_at was changed
      expect(updated).toBeDefined();
      expect(updated.updated_at).toBeDefined();
      expect(updated.updated_at instanceof Date).toBe(true);

      // updated_at should be different from original
      expect(updated.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      // updated_at should be within reasonable range
      expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime() - 1000);
      expect(updated.updated_at.getTime()).toBeLessThanOrEqual(afterUpdate.getTime() + 1000);

      // created_at should remain unchanged
      expect(updated.created_at.getTime()).toBe(originalCreatedAt.getTime());

      // Verify timestamp persists in database
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });

      expect(fromDb).toBeDefined();
      expect(fromDb.updated_at).toBeDefined();
      expect(fromDb.updated_at.getTime()).toBe(updated.updated_at.getTime());
      expect(fromDb.created_at.getTime()).toBe(originalCreatedAt.getTime());
    });

    it('should return null for non-existent ID', async () => {
      // Try to update a testimonial that doesn't exist
      const nonExistentId = 999999;
      const updateData = {
        name: 'This Should Not Work',
        text: 'Attempting to update a non-existent testimonial record.',
      };

      const result = await adminTestimonialsRepository.update(nonExistentId, updateData);

      // Should return null for non-existent ID
      expect(result).toBeNull();

      // Verify no testimonial with this ID exists in database
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: nonExistentId },
      });

      expect(fromDb).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete testimonial successfully', async () => {
      // Create a testimonial first
      const testimonialData = {
        name: 'To Be Deleted',
        country: 'Test Country',
        text: 'This testimonial will be deleted as part of the integration test.',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
      };

      const created = await adminTestimonialsRepository.create(testimonialData);
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();

      // Verify testimonial exists in database
      const beforeDelete = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });
      expect(beforeDelete).toBeDefined();
      expect(beforeDelete.id).toBe(created.id);

      // Delete the testimonial
      const result = await adminTestimonialsRepository.delete(created.id);

      // Should return true for successful deletion
      expect(result).toBe(true);

      // Verify testimonial is removed from database
      const afterDelete = await prisma.testimonial.findUnique({
        where: { id: created.id },
      });
      expect(afterDelete).toBeNull();
    });

    it('should return false for non-existent ID', async () => {
      // Try to delete a testimonial that doesn't exist
      const nonExistentId = 999999;

      const result = await adminTestimonialsRepository.delete(nonExistentId);

      // Should return false for non-existent ID
      expect(result).toBe(false);

      // Verify no testimonial with this ID exists in database
      const fromDb = await prisma.testimonial.findUnique({
        where: { id: nonExistentId },
      });
      expect(fromDb).toBeNull();
    });

    it('should verify testimonial is removed from database', async () => {
      // Create multiple testimonials
      const testimonial1Data = {
        name: 'First Testimonial',
        country: 'Country 1',
        text: 'First testimonial to test deletion and database state verification.',
        rating: 5,
        status: 'ACTIVE',
        featured: true,
      };

      const testimonial2Data = {
        name: 'Second Testimonial',
        country: 'Country 2',
        text: 'Second testimonial that should remain after first is deleted.',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
      };

      const created1 = await adminTestimonialsRepository.create(testimonial1Data);
      const created2 = await adminTestimonialsRepository.create(testimonial2Data);

      expect(created1).toBeDefined();
      expect(created2).toBeDefined();

      // Verify both testimonials exist
      const allBefore = await prisma.testimonial.findMany({
        where: {
          id: {
            in: [created1.id, created2.id],
          },
        },
      });
      expect(allBefore.length).toBe(2);

      // Delete the first testimonial
      const deleteResult = await adminTestimonialsRepository.delete(created1.id);
      expect(deleteResult).toBe(true);

      // Verify first testimonial is removed
      const deleted = await prisma.testimonial.findUnique({
        where: { id: created1.id },
      });
      expect(deleted).toBeNull();

      // Verify second testimonial still exists
      const remaining = await prisma.testimonial.findUnique({
        where: { id: created2.id },
      });
      expect(remaining).toBeDefined();
      expect(remaining.id).toBe(created2.id);
      expect(remaining.name).toBe(testimonial2Data.name);

      // Verify only one testimonial remains in the set
      const allAfter = await prisma.testimonial.findMany({
        where: {
          id: {
            in: [created1.id, created2.id],
          },
        },
      });
      expect(allAfter.length).toBe(1);
      expect(allAfter[0].id).toBe(created2.id);
    });
  });

  describe('complex filter combinations', () => {
    it('should handle combined filters (country + minRating)', async () => {
      // Test combining country filter with minRating filter
      // Looking for testimonials from Indonesia with rating >= 4
      const result = await userTestimonialsRepository.findMany({
        country: 'indonesia',
        minRating: 4,
      });

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should match both filters
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.country.toLowerCase()).toContain('indonesia');
        expect(testimonial.rating).toBeGreaterThanOrEqual(4);
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify count matches expected
      const expectedCount = fixtures.testimonials.filter(
        (t) => t.status === 'ACTIVE' && t.country.toLowerCase().includes('indonesia') && t.rating >= 4,
      ).length;
      expect(result.testimonials.length).toBe(expectedCount);

      // Should have at least some results based on our fixtures
      if (expectedCount > 0) {
        expect(result.testimonials.length).toBeGreaterThan(0);
      }
    });

    it('should handle combined filters (featured + search)', async () => {
      // Test combining featured filter with search query
      // Looking for featured testimonials that contain 'program' in text
      const result = await userTestimonialsRepository.findMany({
        featured: 'true',
        search: 'program',
      });

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should match both filters
      result.testimonials.forEach((testimonial) => {
        expect(testimonial.featured).toBe(true);
        expect(testimonial.status).toBe('ACTIVE');

        // Should contain 'program' in name, text, or country
        const searchTerm = 'program';
        const matchesName = testimonial.name.toLowerCase().includes(searchTerm);
        const matchesText = testimonial.text.toLowerCase().includes(searchTerm);
        const matchesCountry = testimonial.country.toLowerCase().includes(searchTerm);

        expect(matchesName || matchesText || matchesCountry).toBe(true);
      });

      // Verify count matches expected
      const expectedCount = fixtures.testimonials.filter((t) => {
        if (t.status !== 'ACTIVE' || t.featured !== true) return false;

        const searchTerm = 'program';
        const matchesName = t.name.toLowerCase().includes(searchTerm);
        const matchesText = t.text.toLowerCase().includes(searchTerm);
        const matchesCountry = t.country.toLowerCase().includes(searchTerm);

        return matchesName || matchesText || matchesCountry;
      }).length;

      expect(result.testimonials.length).toBe(expectedCount);
    });

    it('should handle all filters together', async () => {
      // Test combining all filters: country, minRating, featured, search
      // This is a comprehensive test of the filter system
      const result = await userTestimonialsRepository.findMany({
        country: 'indonesia',
        minRating: 4,
        featured: 'true',
        search: 'program',
      });

      expect(result).toBeDefined();
      expect(result.testimonials).toBeDefined();
      expect(Array.isArray(result.testimonials)).toBe(true);

      // All returned testimonials should match ALL filters
      result.testimonials.forEach((testimonial) => {
        // Country filter
        expect(testimonial.country.toLowerCase()).toContain('indonesia');

        // MinRating filter
        expect(testimonial.rating).toBeGreaterThanOrEqual(4);

        // Featured filter
        expect(testimonial.featured).toBe(true);

        // Status filter (always ACTIVE for public endpoint)
        expect(testimonial.status).toBe('ACTIVE');

        // Search filter
        const searchTerm = 'program';
        const matchesName = testimonial.name.toLowerCase().includes(searchTerm);
        const matchesText = testimonial.text.toLowerCase().includes(searchTerm);
        const matchesCountry = testimonial.country.toLowerCase().includes(searchTerm);

        expect(matchesName || matchesText || matchesCountry).toBe(true);
      });

      // Verify count matches expected
      const expectedCount = fixtures.testimonials.filter((t) => {
        if (t.status !== 'ACTIVE') return false;
        if (!t.country.toLowerCase().includes('indonesia')) return false;
        if (t.rating < 4) return false;
        if (t.featured !== true) return false;

        const searchTerm = 'program';
        const matchesName = t.name.toLowerCase().includes(searchTerm);
        const matchesText = t.text.toLowerCase().includes(searchTerm);
        const matchesCountry = t.country.toLowerCase().includes(searchTerm);

        return matchesName || matchesText || matchesCountry;
      }).length;

      expect(result.testimonials.length).toBe(expectedCount);

      // This is a very restrictive filter combination, so it's okay if no results
      // The important thing is that the query executes without error
    });
  });

  describe('database connection and setup', () => {
    it('should verify test database connection is working', async () => {
      // Verify we can query the database
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
      expect(result[0].test).toBe(1);
    });

    it('should verify seedAllTestimonialsData() function works', async () => {
      // Reset and seed
      await resetDatabase();
      const seededData = await seedAllTestimonialsData();

      // Verify seeded data structure
      expect(seededData).toBeDefined();
      expect(seededData.testimonials).toBeDefined();
      expect(Array.isArray(seededData.testimonials)).toBe(true);
      expect(seededData.testimonials.length).toBeGreaterThan(0);

      // Verify data was actually inserted into database
      const dbTestimonials = await prisma.testimonial.findMany();
      expect(dbTestimonials.length).toBe(seededData.testimonials.length);

      // Verify each testimonial has required fields
      seededData.testimonials.forEach((testimonial) => {
        expect(testimonial.id).toBeDefined();
        expect(testimonial.name).toBeDefined();
        expect(testimonial.country).toBeDefined();
        expect(testimonial.text).toBeDefined();
        expect(testimonial.rating).toBeDefined();
        expect(testimonial.status).toBeDefined();
        expect(testimonial.created_at).toBeDefined();
        expect(testimonial.updated_at).toBeDefined();
      });
    });

    it('should verify database reset works correctly', async () => {
      // Seed data first
      await seedAllTestimonialsData();
      let testimonials = await prisma.testimonial.findMany();
      expect(testimonials.length).toBeGreaterThan(0);

      // Reset database
      await resetDatabase();
      testimonials = await prisma.testimonial.findMany();
      expect(testimonials).toHaveLength(0);
    });
  });

  describe('database cleanup', () => {
    // TODO: Task 13.11 - Cleanup test data after each test
    it('should have clean state after resetDatabase', async () => {
      await resetDatabase();

      const testimonials = await prisma.testimonial.findMany();

      expect(testimonials).toHaveLength(0);
    });
  });
});
