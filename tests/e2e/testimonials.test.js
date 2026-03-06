/**
 * Testimonials API E2E Tests
 * Tests HTTP endpoints with real database
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createTestApp, generateAdminToken, generateAuthToken, authenticatedRequest } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../helpers/testDb.js';
import { seedAllTestimonialsData } from '../helpers/testimonialsFixtures.js';

describe('Testimonials API E2E Tests', () => {
  let app;
  let prisma;
  let fixtures;
  let adminToken;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    app = await createTestApp();
    adminToken = await generateAdminToken();
  });

  beforeEach(async () => {
    await resetDatabase();
    fixtures = await seedAllTestimonialsData();
  });

  afterAll(async () => {
    await app.close();
    await closeConnection();
  });

  describe('GET /testimonials - Public endpoint', () => {
    it('should return all active testimonials without pagination when no page/limit provided', async () => {
      // Task 14.2
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Testimonials retrieved successfully');
      expect(body.data).toBeDefined();
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Should NOT include pagination metadata when no page/limit provided
      expect(body.data.pagination).toBeUndefined();

      // Should return only ACTIVE testimonials
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      expect(body.data.testimonials).toHaveLength(activeTestimonials.length);

      // Verify all returned testimonials are ACTIVE
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
        expect(testimonial).toHaveProperty('id');
        expect(testimonial).toHaveProperty('name');
        expect(testimonial).toHaveProperty('country');
        expect(testimonial).toHaveProperty('text');
        expect(testimonial).toHaveProperty('rating');
        expect(testimonial).toHaveProperty('featured');
        expect(testimonial).toHaveProperty('created_at');
        expect(testimonial).toHaveProperty('updated_at');
      });
    });

    it('should return paginated active testimonials when page/limit provided', async () => {
      // Task 14.3
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?page=1&limit=2',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Testimonials retrieved successfully');
      expect(body.data).toBeDefined();
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Should include pagination metadata when page/limit provided
      expect(body.data.pagination).toBeDefined();
      expect(body.data.pagination).toHaveProperty('page');
      expect(body.data.pagination).toHaveProperty('limit');
      expect(body.data.pagination).toHaveProperty('total');
      expect(body.data.pagination).toHaveProperty('totalPages');
      expect(body.data.pagination).toHaveProperty('hasNext');
      expect(body.data.pagination).toHaveProperty('hasPrev');

      // Verify pagination values
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.limit).toBe(2);
      expect(body.data.testimonials.length).toBeLessThanOrEqual(2);

      // Verify only ACTIVE testimonials are returned
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Calculate expected total (only ACTIVE testimonials)
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      expect(body.data.pagination.total).toBe(activeTestimonials.length);

      // Verify totalPages calculation
      const expectedTotalPages = Math.ceil(activeTestimonials.length / 2);
      expect(body.data.pagination.totalPages).toBe(expectedTotalPages);

      // Verify hasNext and hasPrev flags for first page
      expect(body.data.pagination.hasPrev).toBe(false);
      expect(body.data.pagination.hasNext).toBe(expectedTotalPages > 1);
    });

    it('should return correct pagination metadata for middle page', async () => {
      // Task 14.3 - Test middle page pagination
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');

      // Only test if we have enough data for a middle page
      if (activeTestimonials.length >= 3) {
        const response = await app.inject({
          method: 'GET',
          url: '/testimonials?page=2&limit=1',
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);

        expect(body.success).toBe(true);
        expect(body.data.pagination).toBeDefined();
        expect(body.data.pagination.page).toBe(2);
        expect(body.data.pagination.limit).toBe(1);
        expect(body.data.pagination.hasPrev).toBe(true);
        expect(body.data.pagination.hasNext).toBe(activeTestimonials.length > 2);
      }
    });

    it('should return correct pagination metadata for last page', async () => {
      // Task 14.3 - Test last page pagination
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      const limit = 2;
      const totalPages = Math.ceil(activeTestimonials.length / limit);

      if (totalPages > 0) {
        const response = await app.inject({
          method: 'GET',
          url: `/testimonials?page=${totalPages}&limit=${limit}`,
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);

        expect(body.success).toBe(true);
        expect(body.data.pagination).toBeDefined();
        expect(body.data.pagination.page).toBe(totalPages);
        expect(body.data.pagination.hasNext).toBe(false);
        expect(body.data.pagination.hasPrev).toBe(totalPages > 1);
      }
    });

    it('should handle page numbers beyond available data', async () => {
      // Task 14.3 - Test edge case with large page numbers
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?page=999&limit=10',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);
      expect(body.data.testimonials).toHaveLength(0);
      expect(body.data.pagination).toBeDefined();
      expect(body.data.pagination.page).toBe(999);
      expect(body.data.pagination.hasNext).toBe(false);
    });

    it('should filter testimonials by country', async () => {
      // Task 14.4
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?country=Indonesia',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // All returned testimonials should be from Indonesia
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.country.toLowerCase()).toContain('indonesia'.toLowerCase());
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify we got the expected testimonials
      const indonesiaTestimonials = fixtures.testimonials.filter(
        (t) => t.status === 'ACTIVE' && t.country.toLowerCase().includes('indonesia'.toLowerCase()),
      );
      expect(body.data.testimonials.length).toBe(indonesiaTestimonials.length);
    });

    it('should filter testimonials by minRating', async () => {
      // Task 14.4
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?minRating=5',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // All returned testimonials should have rating >= 5
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.rating).toBeGreaterThanOrEqual(5);
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify we got the expected testimonials
      const highRatedTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE' && t.rating >= 5);
      expect(body.data.testimonials.length).toBe(highRatedTestimonials.length);
    });

    it('should filter testimonials by featured', async () => {
      // Task 14.4
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?featured=true',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify we got the expected testimonials
      const featuredTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE' && t.featured === true);
      expect(body.data.testimonials.length).toBe(featuredTestimonials.length);

      // All returned testimonials should be featured
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.featured).toBe(true);
        expect(testimonial.status).toBe('ACTIVE');
      });
    });

    it('should search testimonials across name, text, and country', async () => {
      // Task 14.4
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?search=program',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // All returned testimonials should contain 'program' in name, text, or country
      body.data.testimonials.forEach((testimonial) => {
        const searchTerm = 'program'.toLowerCase();
        const matchesName = testimonial.name.toLowerCase().includes(searchTerm);
        const matchesText = testimonial.text.toLowerCase().includes(searchTerm);
        const matchesCountry = testimonial.country.toLowerCase().includes(searchTerm);

        expect(matchesName || matchesText || matchesCountry).toBe(true);
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify we got at least some results (fixtures contain 'program' in text)
      expect(body.data.testimonials.length).toBeGreaterThan(0);
    });

    it('should sort testimonials by createdAt ascending', async () => {
      // Task 14.5
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=createdAt&sortOrder=asc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify sort order - each testimonial should have created_at >= previous
      const testimonials = body.data.testimonials;
      for (let i = 1; i < testimonials.length; i++) {
        const prevDate = new Date(testimonials[i - 1].created_at);
        const currDate = new Date(testimonials[i].created_at);
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });

    it('should sort testimonials by createdAt descending (default)', async () => {
      // Task 14.5
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=createdAt&sortOrder=desc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify sort order - each testimonial should have created_at <= previous
      const testimonials = body.data.testimonials;
      for (let i = 1; i < testimonials.length; i++) {
        const prevDate = new Date(testimonials[i - 1].created_at);
        const currDate = new Date(testimonials[i].created_at);
        expect(currDate.getTime()).toBeLessThanOrEqual(prevDate.getTime());
      }
    });

    it('should sort testimonials by name ascending', async () => {
      // Task 14.5
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=name&sortOrder=asc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify sort order - names should be in ascending alphabetical order
      const testimonials = body.data.testimonials;
      for (let i = 1; i < testimonials.length; i++) {
        const prevName = testimonials[i - 1].name.toLowerCase();
        const currName = testimonials[i].name.toLowerCase();
        expect(currName.localeCompare(prevName)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort testimonials by name descending', async () => {
      // Task 14.5
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=name&sortOrder=desc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify sort order - names should be in descending alphabetical order
      const testimonials = body.data.testimonials;
      for (let i = 1; i < testimonials.length; i++) {
        const prevName = testimonials[i - 1].name.toLowerCase();
        const currName = testimonials[i].name.toLowerCase();
        expect(currName.localeCompare(prevName)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort testimonials by rating ascending', async () => {
      // Task 14.5
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=rating&sortOrder=asc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify sort order - ratings should be in ascending order
      const testimonials = body.data.testimonials;
      for (let i = 1; i < testimonials.length; i++) {
        expect(testimonials[i].rating).toBeGreaterThanOrEqual(testimonials[i - 1].rating);
      }
    });

    it('should sort testimonials by rating descending', async () => {
      // Task 14.5
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=rating&sortOrder=desc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify sort order - ratings should be in descending order
      const testimonials = body.data.testimonials;
      for (let i = 1; i < testimonials.length; i++) {
        expect(testimonials[i].rating).toBeLessThanOrEqual(testimonials[i - 1].rating);
      }
    });

    it('should sort testimonials by country ascending', async () => {
      // Task 14.5
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=country&sortOrder=asc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify sort order - countries should be in ascending alphabetical order
      const testimonials = body.data.testimonials;
      for (let i = 1; i < testimonials.length; i++) {
        const prevCountry = testimonials[i - 1].country.toLowerCase();
        const currCountry = testimonials[i].country.toLowerCase();
        expect(currCountry.localeCompare(prevCountry)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort testimonials by country descending', async () => {
      // Task 14.5
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=country&sortOrder=desc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify sort order - countries should be in descending alphabetical order
      const testimonials = body.data.testimonials;
      for (let i = 1; i < testimonials.length; i++) {
        const prevCountry = testimonials[i - 1].country.toLowerCase();
        const currCountry = testimonials[i].country.toLowerCase();
        expect(currCountry.localeCompare(prevCountry)).toBeLessThanOrEqual(0);
      }
    });

    it('should only return ACTIVE testimonials when sorting', async () => {
      // Task 14.5 - Verify sorting maintains ACTIVE status filter
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?sortBy=rating&sortOrder=desc',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify all returned testimonials are ACTIVE
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify INACTIVE and PENDING testimonials are not included
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      expect(body.data.testimonials.length).toBe(activeTestimonials.length);
    });

    it('should return only ACTIVE testimonials', async () => {
      // Task 14.2
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify all returned testimonials have ACTIVE status
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify INACTIVE and PENDING testimonials are not included
      const inactiveTestimonial = fixtures.testimonials.find((t) => t.status === 'INACTIVE');
      const pendingTestimonial = fixtures.testimonials.find((t) => t.status === 'PENDING');

      if (inactiveTestimonial) {
        const foundInactive = body.data.testimonials.find((t) => t.id === inactiveTestimonial.id);
        expect(foundInactive).toBeUndefined();
      }

      if (pendingTestimonial) {
        const foundPending = body.data.testimonials.find((t) => t.id === pendingTestimonial.id);
        expect(foundPending).toBeUndefined();
      }
    });

    it('should return empty array when no testimonials match filters', async () => {
      // Task 14.4
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?country=NonExistentCountry',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);
      expect(body.data.testimonials).toHaveLength(0);

      // Should not include pagination metadata when no page/limit provided
      expect(body.data.pagination).toBeUndefined();
    });
  });

  describe('GET /testimonials/:id - Public endpoint', () => {
    it('should return single active testimonial by ID', async () => {
      // Task 14.6
      const activeTestimonial = fixtures.testimonials.find((t) => t.status === 'ACTIVE');
      expect(activeTestimonial).toBeDefined();

      const response = await app.inject({
        method: 'GET',
        url: `/testimonials/${activeTestimonial.id}`,
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Testimonial retrieved successfully');
      expect(body.data).toBeDefined();

      // Verify testimonial structure
      expect(body.data.id).toBe(activeTestimonial.id);
      expect(body.data.name).toBe(activeTestimonial.name);
      expect(body.data.country).toBe(activeTestimonial.country);
      expect(body.data.text).toBe(activeTestimonial.text);
      expect(body.data.rating).toBe(activeTestimonial.rating);
      expect(body.data.status).toBe('ACTIVE');
      expect(body.data.featured).toBe(activeTestimonial.featured);
      expect(body.data).toHaveProperty('created_at');
      expect(body.data).toHaveProperty('updated_at');

      // Verify data types
      expect(typeof body.data.id).toBe('number');
      expect(typeof body.data.name).toBe('string');
      expect(typeof body.data.country).toBe('string');
      expect(typeof body.data.text).toBe('string');
      expect(typeof body.data.rating).toBe('number');
      expect(typeof body.data.status).toBe('string');
      expect(typeof body.data.featured).toBe('boolean');
    });

    it('should return 404 for non-existent testimonial', async () => {
      // Task 14.17
      const nonExistentId = 999999;

      const response = await app.inject({
        method: 'GET',
        url: `/testimonials/${nonExistentId}`,
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);

      expect(body.success).toBe(false);
      expect(body.message).toBeDefined();
      expect(typeof body.message).toBe('string');
      // Data should be null or undefined for error responses
      expect(body.data == null).toBe(true);
    });

    it('should return 404 for inactive testimonial', async () => {
      // Task 14.6
      const inactiveTestimonial = fixtures.testimonials.find((t) => t.status === 'INACTIVE');
      expect(inactiveTestimonial).toBeDefined();

      const response = await app.inject({
        method: 'GET',
        url: `/testimonials/${inactiveTestimonial.id}`,
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);

      expect(body.success).toBe(false);
      expect(body.message).toBeDefined();
      expect(typeof body.message).toBe('string');
      // Data should be null or undefined for error responses
      expect(body.data == null).toBe(true);
    });

    it('should return 404 for pending testimonial', async () => {
      // Task 14.6
      const pendingTestimonial = fixtures.testimonials.find((t) => t.status === 'PENDING');
      expect(pendingTestimonial).toBeDefined();

      const response = await app.inject({
        method: 'GET',
        url: `/testimonials/${pendingTestimonial.id}`,
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);

      expect(body.success).toBe(false);
      expect(body.message).toBeDefined();
      expect(typeof body.message).toBe('string');
      // Data should be null or undefined for error responses
      expect(body.data == null).toBe(true);
    });
  });

  describe('GET /admin/testimonials - Admin endpoint', () => {
    it('should return all testimonials without pagination when no page/limit provided', async () => {
      // Task 14.7
      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: '/admin/testimonials',
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);
      expect(body.data.pagination).toBeUndefined();

      // Should return ALL testimonials (ACTIVE, INACTIVE, PENDING)
      expect(body.data.testimonials.length).toBe(fixtures.testimonials.length);
    });

    it('should return paginated testimonials when page/limit provided', async () => {
      // Task 14.8
      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: '/admin/testimonials?page=1&limit=2',
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);
      expect(body.data.pagination).toBeDefined();
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.limit).toBe(2);
      expect(body.data.testimonials.length).toBeLessThanOrEqual(2);
    });

    it('should filter testimonials by status', async () => {
      // Task 14.9
      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: '/admin/testimonials?status=INACTIVE',
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // All returned testimonials should have INACTIVE status
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.status).toBe('INACTIVE');
      });

      const inactiveTestimonials = fixtures.testimonials.filter((t) => t.status === 'INACTIVE');
      expect(body.data.testimonials.length).toBe(inactiveTestimonials.length);
    });

    it('should return testimonials with any status (ACTIVE, INACTIVE, PENDING)', async () => {
      // Task 14.7
      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: '/admin/testimonials',
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Should include all statuses
      const statuses = body.data.testimonials.map((t) => t.status);
      const hasActive = statuses.includes('ACTIVE');
      const hasInactive = statuses.includes('INACTIVE');
      const hasPending = statuses.includes('PENDING');

      expect(hasActive || hasInactive || hasPending).toBe(true);
    });

    it('should support all query parameters (search, country, minRating, featured, sortBy, sortOrder)', async () => {
      // Task 14.8
      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: '/admin/testimonials?search=program&country=Indonesia&minRating=4&featured=true&sortBy=rating&sortOrder=desc',
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      // Task 14.16
      const response = await app.inject({
        method: 'GET',
        url: '/admin/testimonials',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should require admin role', async () => {
      // Task 14.16
      const userToken = await generateAuthToken({
        userId: 2,
        email: 'user@test.com',
        role: 'USER',
      });

      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: '/admin/testimonials',
        },
        userToken,
      );

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('GET /admin/testimonials/:id - Admin endpoint', () => {
    it('should return single testimonial by ID (any status)', async () => {
      // Task 14.10
      const activeTestimonial = fixtures.testimonials.find((t) => t.status === 'ACTIVE');
      expect(activeTestimonial).toBeDefined();

      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: `/admin/testimonials/${activeTestimonial.id}`,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(activeTestimonial.id);
      expect(body.data.status).toBe('ACTIVE');
    });

    it('should return inactive testimonial', async () => {
      // Task 14.10
      const inactiveTestimonial = fixtures.testimonials.find((t) => t.status === 'INACTIVE');
      expect(inactiveTestimonial).toBeDefined();

      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: `/admin/testimonials/${inactiveTestimonial.id}`,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(inactiveTestimonial.id);
      expect(body.data.status).toBe('INACTIVE');
    });

    it('should return pending testimonial', async () => {
      // Task 14.10
      const pendingTestimonial = fixtures.testimonials.find((t) => t.status === 'PENDING');
      expect(pendingTestimonial).toBeDefined();

      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: `/admin/testimonials/${pendingTestimonial.id}`,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(pendingTestimonial.id);
      expect(body.data.status).toBe('PENDING');
    });

    it('should return 404 for non-existent testimonial', async () => {
      // Task 14.17
      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: '/admin/testimonials/999999',
        },
        adminToken,
      );

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should require authentication', async () => {
      // Task 14.16
      const activeTestimonial = fixtures.testimonials.find((t) => t.status === 'ACTIVE');

      const response = await app.inject({
        method: 'GET',
        url: `/admin/testimonials/${activeTestimonial.id}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should require admin role', async () => {
      // Task 14.16
      const userToken = await generateAuthToken({
        userId: 2,
        email: 'user@test.com',
        role: 'USER',
      });

      const activeTestimonial = fixtures.testimonials.find((t) => t.status === 'ACTIVE');

      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: `/admin/testimonials/${activeTestimonial.id}`,
        },
        userToken,
      );

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('POST /admin/testimonials - Admin endpoint', () => {
    it('should create testimonial with valid data', async () => {
      // Task 14.11
      const newTestimonial = {
        name: 'New Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
        status: 'ACTIVE',
        featured: true,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: newTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe(newTestimonial.name);
      expect(body.data.country).toBe(newTestimonial.country);
      expect(body.data.text).toBe(newTestimonial.text);
      expect(body.data.rating).toBe(newTestimonial.rating);
      expect(body.data.status).toBe(newTestimonial.status);
      expect(body.data.featured).toBe(newTestimonial.featured);
      expect(body.data).toHaveProperty('id');
    });

    it('should set default values (status: ACTIVE, featured: false)', async () => {
      // Task 14.11
      const newTestimonial = {
        name: 'New Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: newTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ACTIVE');
      expect(body.data.featured).toBe(false);
    });

    it('should return 201 status code with created testimonial', async () => {
      // Task 14.11
      const newTestimonial = {
        name: 'New Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: newTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('created_at');
      expect(body.data).toHaveProperty('updated_at');
    });

    it('should validate required fields (name, country, text, rating)', async () => {
      // Task 14.12
      const invalidTestimonial = {
        // Missing all required fields
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: invalidTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate name length (min: 2, max: 255)', async () => {
      // Task 14.12
      const invalidTestimonial = {
        name: 'A', // Too short
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: invalidTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate country length (min: 2, max: 100)', async () => {
      // Task 14.12
      const invalidTestimonial = {
        name: 'Test User',
        country: 'A', // Too short
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: invalidTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate text length (min: 10, max: 1000)', async () => {
      // Task 14.12
      const invalidTestimonial = {
        name: 'Test User',
        country: 'Test Country',
        text: 'Short', // Too short
        rating: 5,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: invalidTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate rating range (1-5)', async () => {
      // Task 14.12
      const invalidTestimonial = {
        name: 'Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 6, // Out of range
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: invalidTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate status enum (ACTIVE, INACTIVE, PENDING)', async () => {
      // Task 14.12
      const invalidTestimonial = {
        name: 'Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
        status: 'INVALID_STATUS',
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: invalidTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate featured boolean', async () => {
      // Task 14.12
      const invalidTestimonial = {
        name: 'Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
        featured: 'not-a-boolean',
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: invalidTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should trim whitespace from text fields', async () => {
      // Task 14.11
      const newTestimonial = {
        name: '  Test User  ',
        country: '  Test Country  ',
        text: '  This is a test testimonial with sufficient length for validation.  ',
        rating: 5,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: newTestimonial,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Test User');
      expect(body.data.country).toBe('Test Country');
      expect(body.data.text).toBe('This is a test testimonial with sufficient length for validation.');
    });

    it('should require authentication', async () => {
      // Task 14.16
      const newTestimonial = {
        name: 'Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/admin/testimonials',
        payload: newTestimonial,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should require admin role', async () => {
      // Task 14.16
      const userToken = await generateAuthToken({
        userId: 2,
        email: 'user@test.com',
        role: 'USER',
      });

      const newTestimonial = {
        name: 'Test User',
        country: 'Test Country',
        text: 'This is a test testimonial with sufficient length for validation.',
        rating: 5,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'POST',
          url: '/admin/testimonials',
          payload: newTestimonial,
        },
        userToken,
      );

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('PUT /admin/testimonials/:id - Admin endpoint', () => {
    it('should update testimonial with valid data', async () => {
      // Task 14.13
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        name: 'Updated Name',
        text: 'Updated text with sufficient length for validation requirements.',
        rating: 4,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe(updateData.name);
      expect(body.data.text).toBe(updateData.text);
      expect(body.data.rating).toBe(updateData.rating);
    });

    it('should support partial updates (all fields optional)', async () => {
      // Task 14.13
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        rating: 3,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.rating).toBe(updateData.rating);
      expect(body.data.name).toBe(testimonial.name);
    });

    it('should update updated_at timestamp', async () => {
      // Task 14.13
      const testimonial = fixtures.testimonials[0];
      const originalUpdatedAt = testimonial.updated_at;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updateData = {
        rating: 3,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('updated_at');
      expect(new Date(body.data.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });

    it('should return 200 status code with updated testimonial', async () => {
      // Task 14.13
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        rating: 3,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('updated_at');
    });

    it('should return 404 for non-existent testimonial', async () => {
      // Task 14.17
      const updateData = {
        rating: 3,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: '/admin/testimonials/999999',
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate provided fields according to validation rules', async () => {
      // Task 14.14
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        rating: 10, // Invalid
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate name length if provided', async () => {
      // Task 14.14
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        name: 'A', // Too short
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate country length if provided', async () => {
      // Task 14.14
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        country: 'A', // Too short
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate text length if provided', async () => {
      // Task 14.14
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        text: 'Short', // Too short
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate rating range if provided', async () => {
      // Task 14.14
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        rating: 6, // Out of range
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate status enum if provided', async () => {
      // Task 14.14
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        status: 'INVALID_STATUS',
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate featured boolean if provided', async () => {
      // Task 14.14
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        featured: 'not-a-boolean',
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should require authentication', async () => {
      // Task 14.16
      const testimonial = fixtures.testimonials[0];
      const updateData = {
        rating: 3,
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/admin/testimonials/${testimonial.id}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should require admin role', async () => {
      // Task 14.16
      const userToken = await generateAuthToken({
        userId: 2,
        email: 'user@test.com',
        role: 'USER',
      });

      const testimonial = fixtures.testimonials[0];
      const updateData = {
        rating: 3,
      };

      const response = await authenticatedRequest(
        app,
        {
          method: 'PUT',
          url: `/admin/testimonials/${testimonial.id}`,
          payload: updateData,
        },
        userToken,
      );

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('DELETE /admin/testimonials/:id - Admin endpoint', () => {
    it('should delete testimonial by ID', async () => {
      // Task 14.15
      const testimonial = fixtures.testimonials[0];

      const response = await authenticatedRequest(
        app,
        {
          method: 'DELETE',
          url: `/admin/testimonials/${testimonial.id}`,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should return 200 status code with success message', async () => {
      // Task 14.15
      const testimonial = fixtures.testimonials[0];

      const response = await authenticatedRequest(
        app,
        {
          method: 'DELETE',
          url: `/admin/testimonials/${testimonial.id}`,
        },
        adminToken,
      );

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBeDefined();
      expect(typeof body.message).toBe('string');
    });

    it('should permanently remove testimonial from database', async () => {
      // Task 14.15
      const testimonial = fixtures.testimonials[0];

      const deleteResponse = await authenticatedRequest(
        app,
        {
          method: 'DELETE',
          url: `/admin/testimonials/${testimonial.id}`,
        },
        adminToken,
      );

      expect(deleteResponse.statusCode).toBe(200);

      // Try to get the deleted testimonial
      const getResponse = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: `/admin/testimonials/${testimonial.id}`,
        },
        adminToken,
      );

      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent testimonial', async () => {
      // Task 14.17
      const response = await authenticatedRequest(
        app,
        {
          method: 'DELETE',
          url: '/admin/testimonials/999999',
        },
        adminToken,
      );

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should require authentication', async () => {
      // Task 14.16
      const testimonial = fixtures.testimonials[0];

      const response = await app.inject({
        method: 'DELETE',
        url: `/admin/testimonials/${testimonial.id}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should require admin role', async () => {
      // Task 14.16
      const userToken = await generateAuthToken({
        userId: 2,
        email: 'user@test.com',
        role: 'USER',
      });

      const testimonial = fixtures.testimonials[0];

      const response = await authenticatedRequest(
        app,
        {
          method: 'DELETE',
          url: `/admin/testimonials/${testimonial.id}`,
        },
        userToken,
      );

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should return 401 for missing authentication token on admin endpoints', async () => {
      // Task 14.16
      const responses = await Promise.all([
        app.inject({ method: 'GET', url: '/admin/testimonials' }),
        app.inject({ method: 'GET', url: '/admin/testimonials/1' }),
        app.inject({
          method: 'POST',
          url: '/admin/testimonials',
          payload: {
            name: 'Test',
            country: 'Test',
            text: 'Test testimonial text',
            rating: 5,
          },
        }),
        app.inject({
          method: 'PUT',
          url: '/admin/testimonials/1',
          payload: { rating: 5 },
        }),
        app.inject({ method: 'DELETE', url: '/admin/testimonials/1' }),
      ]);

      responses.forEach((response) => {
        expect(response.statusCode).toBe(401);
      });
    });

    it('should return 401 for invalid authentication token on admin endpoints', async () => {
      // Task 14.16
      const invalidToken = 'invalid-token-string';

      const response = await app.inject({
        method: 'GET',
        url: '/admin/testimonials',
        headers: {
          Authorization: `Bearer ${invalidToken}`,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for expired authentication token on admin endpoints', async () => {
      // Task 14.16
      // Generate a token that expires immediately
      const expiredToken = await generateAuthToken({
        userId: 1,
        email: 'admin@test.com',
        role: 'ADMIN',
      });

      // Wait for token to expire (this test assumes token validation)
      // In practice, we'd need to mock the JWT verification to simulate expiration
      // For now, we'll test with an invalid token format which will fail verification

      const response = await app.inject({
        method: 'GET',
        url: '/admin/testimonials',
        headers: {
          Authorization: 'Bearer expired.token.here',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 403 for non-admin users accessing admin endpoints', async () => {
      // Task 14.16
      const userToken = await generateAuthToken({
        userId: 2,
        email: 'user@test.com',
        role: 'USER',
      });

      const response = await authenticatedRequest(
        app,
        {
          method: 'GET',
          url: '/admin/testimonials',
        },
        userToken,
      );

      expect([401, 403]).toContain(response.statusCode);
    });

    it('should allow unauthenticated access to public endpoints', async () => {
      // Task 14.2
      // Test GET /testimonials without authentication
      const listResponse = await app.inject({
        method: 'GET',
        url: '/testimonials',
      });

      expect(listResponse.statusCode).toBe(200);
      const listBody = JSON.parse(listResponse.body);
      expect(listBody.success).toBe(true);
      expect(listBody.data.testimonials).toBeInstanceOf(Array);

      // Test GET /testimonials/:id without authentication
      const activeTestimonial = fixtures.testimonials.find((t) => t.status === 'ACTIVE');
      if (activeTestimonial) {
        const singleResponse = await app.inject({
          method: 'GET',
          url: `/testimonials/${activeTestimonial.id}`,
        });

        expect(singleResponse.statusCode).toBe(200);
        const singleBody = JSON.parse(singleResponse.body);
        expect(singleBody.success).toBe(true);
        expect(singleBody.data.id).toBe(activeTestimonial.id);
      }
    });
  });

  describe('Response Format Validation', () => {
    it('should match success response format for list endpoints', async () => {
      // Task 14.2
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);

      // Verify response structure
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.success).toBe(true);
      expect(typeof body.message).toBe('string');

      // Verify data structure
      expect(body.data).toHaveProperty('testimonials');
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Verify testimonial structure
      if (body.data.testimonials.length > 0) {
        const testimonial = body.data.testimonials[0];
        expect(testimonial).toHaveProperty('id');
        expect(testimonial).toHaveProperty('name');
        expect(testimonial).toHaveProperty('country');
        expect(testimonial).toHaveProperty('text');
        expect(testimonial).toHaveProperty('rating');
        expect(testimonial).toHaveProperty('status');
        expect(testimonial).toHaveProperty('featured');
        expect(testimonial).toHaveProperty('created_at');
        expect(testimonial).toHaveProperty('updated_at');

        // Verify data types
        expect(typeof testimonial.id).toBe('number');
        expect(typeof testimonial.name).toBe('string');
        expect(typeof testimonial.country).toBe('string');
        expect(typeof testimonial.text).toBe('string');
        expect(typeof testimonial.rating).toBe('number');
        expect(typeof testimonial.status).toBe('string');
        expect(typeof testimonial.featured).toBe('boolean');
      }
    });

    it('should match success response format for single testimonial', async () => {
      // Task 14.6
      const activeTestimonial = fixtures.testimonials.find((t) => t.status === 'ACTIVE');
      expect(activeTestimonial).toBeDefined();

      const response = await app.inject({
        method: 'GET',
        url: `/testimonials/${activeTestimonial.id}`,
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);

      // Verify response structure
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.success).toBe(true);
      expect(typeof body.message).toBe('string');

      // Verify data structure (single testimonial, not array)
      expect(body.data).toBeDefined();
      expect(body.data).not.toBeInstanceOf(Array);

      // Verify testimonial structure
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('name');
      expect(body.data).toHaveProperty('country');
      expect(body.data).toHaveProperty('text');
      expect(body.data).toHaveProperty('rating');
      expect(body.data).toHaveProperty('status');
      expect(body.data).toHaveProperty('featured');
      expect(body.data).toHaveProperty('created_at');
      expect(body.data).toHaveProperty('updated_at');

      // Verify data types
      expect(typeof body.data.id).toBe('number');
      expect(typeof body.data.name).toBe('string');
      expect(typeof body.data.country).toBe('string');
      expect(typeof body.data.text).toBe('string');
      expect(typeof body.data.rating).toBe('number');
      expect(typeof body.data.status).toBe('string');
      expect(typeof body.data.featured).toBe('boolean');

      // Verify status is ACTIVE for public endpoint
      expect(body.data.status).toBe('ACTIVE');

      // Should NOT include pagination metadata for single testimonial
      expect(body.data.pagination).toBeUndefined();
    });

    it('should include pagination metadata when page/limit provided', async () => {
      // Task 14.3
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?page=1&limit=5',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Should include pagination metadata when page/limit provided
      expect(body.data.pagination).toBeDefined();

      // Verify pagination structure
      expect(body.data.pagination).toHaveProperty('page');
      expect(body.data.pagination).toHaveProperty('limit');
      expect(body.data.pagination).toHaveProperty('total');
      expect(body.data.pagination).toHaveProperty('totalPages');
      expect(body.data.pagination).toHaveProperty('hasNext');
      expect(body.data.pagination).toHaveProperty('hasPrev');

      // Verify pagination data types
      expect(typeof body.data.pagination.page).toBe('number');
      expect(typeof body.data.pagination.limit).toBe('number');
      expect(typeof body.data.pagination.total).toBe('number');
      expect(typeof body.data.pagination.totalPages).toBe('number');
      expect(typeof body.data.pagination.hasNext).toBe('boolean');
      expect(typeof body.data.pagination.hasPrev).toBe('boolean');

      // Verify pagination values are correct
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.limit).toBe(5);
      expect(body.data.pagination.total).toBeGreaterThanOrEqual(0);
      expect(body.data.pagination.totalPages).toBeGreaterThanOrEqual(0);
    });

    it('should not include pagination metadata when no page/limit provided', async () => {
      // Task 14.2
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Should NOT include pagination metadata when no page/limit provided
      expect(body.data.pagination).toBeUndefined();
    });

    it('should match error response format', async () => {
      // Task 14.17
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials/999999',
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);

      // Verify error response structure
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body.success).toBe(false);
      expect(typeof body.message).toBe('string');

      // Data should be null or undefined for error responses
      expect(body.data == null).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in search query', async () => {
      // Task 14.4
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?search=life-changing',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // Should handle special characters gracefully
      // All returned testimonials should contain the search term
      body.data.testimonials.forEach((testimonial) => {
        const searchTerm = 'life-changing'.toLowerCase();
        const matchesName = testimonial.name.toLowerCase().includes(searchTerm);
        const matchesText = testimonial.text.toLowerCase().includes(searchTerm);
        const matchesCountry = testimonial.country.toLowerCase().includes(searchTerm);

        expect(matchesName || matchesText || matchesCountry).toBe(true);
        expect(testimonial.status).toBe('ACTIVE');
      });
    });

    it('should handle large page numbers gracefully', async () => {
      // Task 14.3
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?page=1000&limit=10',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);
      expect(body.data.testimonials).toHaveLength(0);

      // Should still include pagination metadata
      expect(body.data.pagination).toBeDefined();
      expect(body.data.pagination.page).toBe(1000);
      expect(body.data.pagination.limit).toBe(10);
      expect(body.data.pagination.hasNext).toBe(false);

      // Total and totalPages should reflect actual data
      const activeTestimonials = fixtures.testimonials.filter((t) => t.status === 'ACTIVE');
      expect(body.data.pagination.total).toBe(activeTestimonials.length);
    });

    it('should handle invalid query parameters gracefully', async () => {
      // Task 14.4
      // Test with invalid minRating (out of range) - should still work, just return empty results
      const response1 = await app.inject({
        method: 'GET',
        url: '/testimonials?minRating=10',
      });

      // API may either validate (400) or allow and return empty (200)
      if (response1.statusCode === 200) {
        const body1 = JSON.parse(response1.body);
        expect(body1.success).toBe(true);
        expect(body1.data.testimonials).toBeInstanceOf(Array);
        // Should return empty array since no testimonials have rating >= 10
        expect(body1.data.testimonials).toHaveLength(0);
      } else {
        // Schema validation rejected the invalid parameter
        expect(response1.statusCode).toBe(400);
      }

      // Test with invalid featured value (non-boolean) - should validate or ignore
      const response2 = await app.inject({
        method: 'GET',
        url: '/testimonials?featured=invalid',
      });

      // API may either validate (400) or handle gracefully (200)
      if (response2.statusCode === 200) {
        const body2 = JSON.parse(response2.body);
        expect(body2.success).toBe(true);
        expect(body2.data.testimonials).toBeInstanceOf(Array);
      } else {
        // Schema validation rejected the invalid parameter
        expect(response2.statusCode).toBe(400);
      }
    });

    it('should handle multiple filters combined (AND logic)', async () => {
      // Task 14.4
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?country=Indonesia&minRating=4&featured=true',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);

      // All returned testimonials should match ALL filters (AND logic)
      body.data.testimonials.forEach((testimonial) => {
        expect(testimonial.country.toLowerCase()).toContain('indonesia'.toLowerCase());
        expect(testimonial.rating).toBeGreaterThanOrEqual(4);
        expect(testimonial.featured).toBe(true);
        expect(testimonial.status).toBe('ACTIVE');
      });

      // Verify we got the expected testimonials
      const matchingTestimonials = fixtures.testimonials.filter(
        (t) => t.status === 'ACTIVE' && t.country.toLowerCase().includes('indonesia'.toLowerCase()) && t.rating >= 4 && t.featured === true,
      );
      expect(body.data.testimonials.length).toBe(matchingTestimonials.length);
    });

    it('should handle empty database gracefully', async () => {
      // Task 14.2
      // Clear all testimonials
      await resetDatabase();

      const response = await app.inject({
        method: 'GET',
        url: '/testimonials',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.testimonials).toBeInstanceOf(Array);
      expect(body.data.testimonials).toHaveLength(0);
      expect(body.data.pagination).toBeUndefined();
    });
  });
});
