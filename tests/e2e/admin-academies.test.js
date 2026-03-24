import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createTestApp, generateAdminToken } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../helpers/testDb.js';
import {
  seedAcademy,
  seedAcademyWithRelations,
  seedAcademyWithMultipleThemes,
  resetFixtureState,
} from '../helpers/academyFixtures.js';

describe('Admin Academy API E2E Tests', { concurrent: false }, () => {
  let app;
  let prisma;
  let adminToken;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    app = await createTestApp();
    adminToken = await generateAdminToken(1, 'admin@test.com');
  });

  beforeEach(async () => {
    await resetDatabase();
    resetFixtureState();
  });

  afterAll(async () => {
    await app.close();
    await closeConnection();
  });

  describe('GET /admin/academies', () => {
    it('should return all academies', async () => {
      await seedAcademy();
      await seedAcademy({ slug: 'test-2', title: 'Test 2' });

      const response = await app.inject({
        method: 'GET',
        url: '/admin/academies',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /admin/academies/:slug', () => {
    it('should return academy by slug', async () => {
      const academy = await seedAcademyWithRelations();

      const response = await app.inject({
        method: 'GET',
        url: `/admin/academies/${academy.slug}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(academy.id);
    });
  });

  describe('DELETE /admin/academies/:id', () => {
    it('should delete academy', async () => {
      const academy = await seedAcademy();

      const response = await app.inject({
        method: 'DELETE',
        url: `/admin/academies/${academy.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
    });
  });

  // ─── GET sub-resource list endpoints ────────────────────────────────────────

  describe('GET /admin/academies/:id/pricing', () => {
    it('should return 200 with pricing array', async () => {
      const academy = await seedAcademyWithRelations();

      const response = await app.inject({
        method: 'GET',
        url: `/admin/academies/${academy.id}/pricing`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /admin/academies/:id/features', () => {
    it('should return 200 with features array', async () => {
      const academy = await seedAcademyWithRelations();

      const response = await app.inject({
        method: 'GET',
        url: `/admin/academies/${academy.id}/features`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /admin/academies/:id/instructors', () => {
    it('should return 200 with instructors array', async () => {
      const academy = await seedAcademyWithRelations();

      const response = await app.inject({
        method: 'GET',
        url: `/admin/academies/${academy.id}/instructors`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /admin/academies/:id/topics', () => {
    it('should return 200 with topics array', async () => {
      const academy = await seedAcademyWithRelations();

      const response = await app.inject({
        method: 'GET',
        url: `/admin/academies/${academy.id}/topics`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /admin/academies/:id/testimonials', () => {
    it('should return 200 with testimonials array', async () => {
      const academy = await seedAcademyWithRelations();

      const response = await app.inject({
        method: 'GET',
        url: `/admin/academies/${academy.id}/testimonials`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /admin/academies/:id/faqs', () => {
    it('should return 200 with FAQs array', async () => {
      const academy = await seedAcademyWithRelations();

      const response = await app.inject({
        method: 'GET',
        url: `/admin/academies/${academy.id}/faqs`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  // ─── Theme CRUD endpoints ────────────────────────────────────────────────────

  describe('GET /admin/academies/:id/themes', () => {
    it('should return 200 with themes array including nested topics', async () => {
      const academy = await seedAcademyWithMultipleThemes(2, 2);

      const response = await app.inject({
        method: 'GET',
        url: `/admin/academies/${academy.id}/themes`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(Array.isArray(body.data[0].topics)).toBe(true);
    });
  });

  describe('POST /admin/academies/:id/themes', () => {
    it('should create a new theme and return 201', async () => {
      const academy = await seedAcademy();

      const response = await app.inject({
        method: 'POST',
        url: `/admin/academies/${academy.id}/themes`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { title: 'Carbon Basics', description: 'Introduction to carbon' },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Carbon Basics');
      expect(body.data.order).toBe(1);
    });

    it('should auto-increment order when creating multiple themes', async () => {
      const academy = await seedAcademy();

      await app.inject({
        method: 'POST',
        url: `/admin/academies/${academy.id}/themes`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { title: 'Theme A' },
      });

      const res2 = await app.inject({
        method: 'POST',
        url: `/admin/academies/${academy.id}/themes`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { title: 'Theme B' },
      });

      const body2 = JSON.parse(res2.payload);
      expect(body2.data.order).toBe(2);
    });

    it('should return 404 when academy does not exist', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/academies/99999/themes',
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { title: 'Ghost Theme' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /admin/academies/:id/themes/:themeId', () => {
    it('should update theme title and return 200', async () => {
      const academy = await seedAcademyWithMultipleThemes(1, 0);
      const themes = academy.themes;

      const response = await app.inject({
        method: 'PUT',
        url: `/admin/academies/${academy.id}/themes/${themes[0].id}`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { title: 'Updated Title' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Updated Title');
    });
  });

  describe('DELETE /admin/academies/:id/themes/:themeId', () => {
    it('should delete theme and cascade delete its topics', async () => {
      const academy = await seedAcademyWithMultipleThemes(2, 3);
      const themeToDelete = academy.themes[0];

      const response = await app.inject({
        method: 'DELETE',
        url: `/admin/academies/${academy.id}/themes/${themeToDelete.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);

      // Verify cascade: topics of deleted theme should be gone
      const remainingTopics = await prisma.academyTopic.findMany({
        where: { theme_id: themeToDelete.id },
      });
      expect(remainingTopics).toHaveLength(0);

      // Remaining theme should have order shifted down
      const remainingThemes = await prisma.academyTheme.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });
      expect(remainingThemes).toHaveLength(1);
      expect(remainingThemes[0].order).toBe(1);
    });
  });

  // ─── Topic endpoints with theme_id ──────────────────────────────────────────

  describe('POST /admin/academies/:id/topics (with theme_id)', () => {
    it('should create topic under a valid theme', async () => {
      const academy = await seedAcademyWithMultipleThemes(1, 0);
      const themeId = academy.themes[0].id;

      const response = await app.inject({
        method: 'POST',
        url: `/admin/academies/${academy.id}/topics`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { theme_id: themeId, title: 'New Topic' },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.data.theme_id).toBe(themeId);
      expect(body.data.title).toBe('New Topic');
    });

    it('should return 404 when theme_id does not belong to academy', async () => {
      const academy = await seedAcademy();

      const response = await app.inject({
        method: 'POST',
        url: `/admin/academies/${academy.id}/topics`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { theme_id: 99999, title: 'Orphan Topic' },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
