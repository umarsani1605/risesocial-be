/**
 * Admin Testimonials Authentication E2E Tests
 * Verifies that authMiddleware is correctly applied to all admin testimonials routes
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, generateAdminToken, generateUserToken } from '../helpers/testServer.js';

describe('Admin Testimonials Authentication', () => {
  let app;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await generateAdminToken();
    userToken = await generateUserToken();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Requirements', () => {
    it('should return 401 for GET /admin/testimonials without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/testimonials',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for GET /admin/testimonials/:id without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/testimonials/1',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for POST /admin/testimonials without token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/testimonials',
        payload: {
          name: 'Test User',
          country: 'Indonesia',
          text: 'This is a test testimonial',
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for PUT /admin/testimonials/:id without token', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/admin/testimonials/1',
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for DELETE /admin/testimonials/:id without token', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/admin/testimonials/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Authorization with Valid Admin Token', () => {
    it('should allow GET /admin/testimonials with admin token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/testimonials',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      // Should not return 401 (may return 501 Not Implemented or other status)
      expect(response.statusCode).not.toBe(401);
    });

    it('should allow GET /admin/testimonials/:id with admin token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/testimonials/1',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      // Should not return 401 (may return 501 Not Implemented or other status)
      expect(response.statusCode).not.toBe(401);
    });

    it('should allow POST /admin/testimonials with admin token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/testimonials',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        payload: {
          name: 'Test User',
          country: 'Indonesia',
          text: 'This is a test testimonial',
          rating: 5,
        },
      });

      // Should not return 401 (may return 501 Not Implemented or other status)
      expect(response.statusCode).not.toBe(401);
    });

    it('should allow PUT /admin/testimonials/:id with admin token', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/admin/testimonials/1',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        payload: {
          name: 'Updated Name',
        },
      });

      // Should not return 401 (may return 501 Not Implemented or other status)
      expect(response.statusCode).not.toBe(401);
    });

    it('should allow DELETE /admin/testimonials/:id with admin token', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/admin/testimonials/1',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      // Should not return 401 (may return 501 Not Implemented or other status)
      expect(response.statusCode).not.toBe(401);
    });
  });
});
