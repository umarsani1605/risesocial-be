/**
 * Admin Jobs API E2E Tests
 * Tests admin CRUD operations with authentication
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createTestApp } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../helpers/testDb.js';
import { seedAllJobsData, seedJobsWithMixedStatus } from '../helpers/jobsFixtures.js';

describe('Admin Jobs API E2E Tests', () => {
  let app;
  let prisma;
  let adminToken;
  let fixtures;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    app = await createTestApp();

    // Create admin user and get token
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: 'hashedpassword',
        name: 'Admin User',
        role: 'admin',
      },
    });

    // Generate admin token (simplified - in real app use proper JWT)
    adminToken = `Bearer admin-token-${adminUser.id}`;
  });

  beforeEach(async () => {
    await resetDatabase();
    fixtures = await seedAllJobsData();
  });

  afterAll(async () => {
    await app.close();
    await closeConnection();
  });

  describe('Authentication Tests (401 errors)', () => {
    it('should return 401 for GET /admin/jobs without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/jobs',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for GET /admin/jobs/:id without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/jobs/1',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for POST /admin/jobs without auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/jobs',
        payload: { title: 'Test Job' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for PUT /admin/jobs/:id without auth', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/admin/jobs/1',
        payload: { title: 'Updated Job' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for DELETE /admin/jobs/:id without auth', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/admin/jobs/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /admin/jobs - List Jobs', () => {
    beforeEach(async () => {
      await seedJobsWithMixedStatus();
    });

    it('should return all jobs with status=all', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/jobs?status=all',
        headers: {
          authorization: adminToken,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Jobs retrieved successfully');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('should return only active jobs with status=active', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/jobs?status=active',
        headers: {
          authorization: adminToken,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      body.data.forEach((job) => {
        expect(job.status).toBe('active');
      });
    });

    it('should return only inactive jobs with status=inactive', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/jobs?status=inactive',
        headers: {
          authorization: adminToken,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      body.data.forEach((job) => {
        expect(job.status).toBe('inactive');
      });
    });
  });

  describe('GET /admin/jobs/:id - Get Job by ID', () => {
    it('should return job successfully', async () => {
      const job = fixtures.jobs[0];

      const response = await app.inject({
        method: 'GET',
        url: `/admin/jobs/${job.id}`,
        headers: {
          authorization: adminToken,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Job retrieved successfully');
      expect(body.data.id).toBe(job.id);
    });

    it('should return 404 for non-existent job', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/jobs/99999',
        headers: {
          authorization: adminToken,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(false);
      expect(body.message).toContain('not found');
    });
  });

  describe('POST /admin/jobs - Create Job', () => {
    it('should create job successfully (201)', async () => {
      const newJob = {
        title: 'New Test Job',
        description: 'This is a test job description with more than 50 characters to meet validation requirements.',
        company: 'Test Company',
        location: 'Test Location',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/admin/jobs',
        headers: {
          authorization: adminToken,
        },
        payload: newJob,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Job created successfully');
      expect(body.data.title).toBe(newJob.title);
    });

    it('should return 400 for validation errors', async () => {
      const invalidJob = {
        title: 'AB', // Too short
      };

      const response = await app.inject({
        method: 'POST',
        url: '/admin/jobs',
        headers: {
          authorization: adminToken,
        },
        payload: invalidJob,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(false);
    });
  });

  describe('PUT /admin/jobs/:id - Update Job', () => {
    it('should update job successfully', async () => {
      const job = fixtures.jobs[0];
      const updates = {
        title: 'Updated Job Title',
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/admin/jobs/${job.id}`,
        headers: {
          authorization: adminToken,
        },
        payload: updates,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Job updated successfully');
      expect(body.data.title).toBe(updates.title);
    });

    it('should return 404 for non-existent job', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/admin/jobs/99999',
        headers: {
          authorization: adminToken,
        },
        payload: { title: 'Updated Title' },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(false);
      expect(body.message).toContain('not found');
    });
  });

  describe('DELETE /admin/jobs/:id - Delete Job', () => {
    it('should delete job successfully', async () => {
      const job = fixtures.jobs[0];

      const response = await app.inject({
        method: 'DELETE',
        url: `/admin/jobs/${job.id}`,
        headers: {
          authorization: adminToken,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Job deleted successfully');

      // Verify job is deleted
      const deletedJob = await prisma.job.findUnique({
        where: { id: job.id },
      });
      expect(deletedJob).toBeNull();
    });

    it('should return 404 for non-existent job', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/admin/jobs/99999',
        headers: {
          authorization: adminToken,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(false);
      expect(body.message).toContain('not found');
    });
  });
});
