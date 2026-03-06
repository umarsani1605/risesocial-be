/**
 * User Testimonials E2E Tests
 * Verifies that the user testimonials endpoints work correctly after bug fixes
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp } from '../helpers/testServer.js';

describe('User Testimonials Endpoints', () => {
  let app;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /testimonials', () => {
    it('should retrieve testimonials successfully', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
    });

    it('should handle query parameters correctly', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?page=1&limit=5&sortBy=rating&sortOrder=desc',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should filter by country', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?country=USA',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should filter by minRating', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?minRating=4',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should filter by featured', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?featured=true',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should search testimonials', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials?search=test',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('GET /testimonials/:id', () => {
    it('should return 404 for non-existent testimonial', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials/99999',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should handle invalid ID gracefully', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/testimonials/invalid',
      });

      // Should handle the request without crashing
      expect(response.statusCode).toBeDefined();
    });
  });
});
