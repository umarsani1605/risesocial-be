import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createTestApp } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../helpers/testDb.js';
import { seedAcademy, seedAcademyWithRelations, seedMultipleAcademies, resetFixtureState } from '../helpers/academyFixtures.js';

describe('User Academy API E2E Tests', { concurrent: false }, () => {
  let app;
  let prisma;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase();
    resetFixtureState();
  });

  afterAll(async () => {
    await app.close();
    await closeConnection();
  });

  describe('GET /academies', () => {
    it('should return paginated list', async () => {
      await seedMultipleAcademies(5);
      const response = await app.inject({ method: 'GET', url: '/academies?page=1&limit=3' });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3);
    });

    it('should filter by category', async () => {
      await seedAcademy({ category: 'Test' });
      await seedAcademy({ category: 'Other', slug: 'other' });
      const response = await app.inject({ method: 'GET', url: '/academies?category=Test' });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /academies/:slug', () => {
    it('should return academy with relations', async () => {
      const academy = await seedAcademyWithRelations();
      const response = await app.inject({ method: 'GET', url: `/academies/${academy.slug}` });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.id).toBe(academy.id);
    });

    it('should return 404 for non-existent', async () => {
      const response = await app.inject({ method: 'GET', url: '/academies/fake' });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /academies/categories', () => {
    it('should return categories', async () => {
      await seedAcademy({ category: 'A' });
      await seedAcademy({ category: 'B', slug: 'b' });
      const response = await app.inject({ method: 'GET', url: '/academies/categories' });
      expect(response.statusCode).toBe(200);
    });
  });
});
