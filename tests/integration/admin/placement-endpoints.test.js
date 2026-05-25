import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { getTestPrisma, resetDatabase, closeConnection } from '../../helpers/testDb.js';
import { createTestUser } from '../../helpers/userFixtures.js';
import { seedAcademy } from '../../helpers/academyFixtures.js';

// Build minimal Fastify app with placement routes
async function buildApp() {
  const app = Fastify({ logger: false });
  await app.register(jwt, { secret: process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-purposes-only' });

  // Register placement routes
  const { default: placementRoutes } = await import('../../../src/routes/admin/placementRoutes.js');
  await app.register(placementRoutes, { prefix: '/admin/academy-enrollments' });

  const { default: cohortPlacementRoutes } = await import('../../../src/routes/admin/cohortPlacementRoutes.js');
  await app.register(cohortPlacementRoutes, { prefix: '/admin/cohort-placements' });

  await app.ready();
  return app;
}

function makeAdminToken(app, overrides = {}) {
  return app.jwt.sign({ userId: 999, role: 'ADMIN', ...overrides });
}

// --- DB setup ---
let prisma;
let app;
let adminToken;
let user;
let academy;

async function createTransaction(status = 'paid') {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prisma.transaction.create({
    data: {
      transaction_code: `AE01${rand}`,
      amount: 3000000,
      currency: 'IDR',
      status,
      provider: 'midtrans',
      customer_name: 'Test User',
      customer_email: 'test@test.com',
      product_type: 'academy_enrollment',
      product_type_id: 0,
      user_id: user.id,
    },
  });
}

async function createEnrollment(txStatus = 'paid') {
  const tx = await createTransaction(txStatus);
  const enrollment = await prisma.academyEnrollment.create({
    data: {
      user_id: user.id,
      academy_id: academy.id,
      transaction_id: tx.id,
    },
  });
  await prisma.transaction.update({ where: { id: tx.id }, data: { product_type_id: enrollment.id } });
  return enrollment;
}

async function createCohort(status = 'not_started') {
  return prisma.cohort.create({
    data: {
      academy_id: academy.id,
      name: `Cohort ${Date.now()}`,
      status,
    },
  });
}

// ============================================================
describe('Admin Placement Endpoints (RS-28)', () => {
  beforeAll(async () => {
    prisma = getTestPrisma();
    app = await buildApp();
  });

  beforeEach(async () => {
    await resetDatabase();
    user = await createTestUser();
    academy = await seedAcademy();
    adminToken = makeAdminToken(app);
  });

  afterAll(async () => {
    await app.close();
    await closeConnection();
  });

  // ----------------------------------------------------------
  describe('GET /admin/academy-enrollments', () => {
    it('returns 401 without token', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/academy-enrollments' });
      expect(res.statusCode).toBe(401);
    });

    it('returns 403 for non-admin user', async () => {
      const userToken = app.jwt.sign({ userId: user.id, role: 'USER' });
      const res = await app.inject({
        method: 'GET', url: '/admin/academy-enrollments',
        headers: { authorization: `Bearer ${userToken}` },
      });
      expect(res.statusCode).toBe(403);
    });

    it('returns paginated enrollments for admin', async () => {
      await createEnrollment('paid');

      const res = await app.inject({
        method: 'GET', url: '/admin/academy-enrollments',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
    });

    it('filters by placed=false returns unplaced enrollments', async () => {
      await createEnrollment('paid');

      const res = await app.inject({
        method: 'GET', url: '/admin/academy-enrollments?placed=false',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveLength(1);
    });

    it('filters by placed=true returns empty when no placements exist', async () => {
      await createEnrollment('paid');

      const res = await app.inject({
        method: 'GET', url: '/admin/academy-enrollments?placed=true',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveLength(0);
    });

    it('does not return pending academy transactions', async () => {
      await createEnrollment('pending');
      await createEnrollment('paid');

      const res = await app.inject({
        method: 'GET', url: '/admin/academy-enrollments',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].transaction.status).toBe('paid');
    });
  });

  // ----------------------------------------------------------
  describe('GET /admin/academy-enrollments/:id', () => {
    it('returns enrollment detail', async () => {
      const enrollment = await createEnrollment();

      const res = await app.inject({
        method: 'GET', url: `/admin/academy-enrollments/${enrollment.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().data.id).toBe(enrollment.id);
    });

    it('returns 404 for non-existent enrollment', async () => {
      const res = await app.inject({
        method: 'GET', url: '/admin/academy-enrollments/999999',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  // ----------------------------------------------------------
  describe('POST /admin/academy-enrollments/:id/assign', () => {
    it('creates placement for active enrollment', async () => {
      const enrollment = await createEnrollment('paid');
      const cohort = await createCohort('not_started');

      const res = await app.inject({
        method: 'POST',
        url: `/admin/academy-enrollments/${enrollment.id}/assign`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { cohort_id: cohort.id },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.cohort_id).toBe(cohort.id);
      expect(body.data.academy_enrollment_id).toBe(enrollment.id);
    });

    it('returns 400 when cohort_id is missing', async () => {
      const enrollment = await createEnrollment('paid');

      const res = await app.inject({
        method: 'POST',
        url: `/admin/academy-enrollments/${enrollment.id}/assign`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });

    it('returns 422 when cohort is completed', async () => {
      const enrollment = await createEnrollment('paid');
      const cohort = await createCohort('completed');

      const res = await app.inject({
        method: 'POST',
        url: `/admin/academy-enrollments/${enrollment.id}/assign`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: { cohort_id: cohort.id },
      });

      expect(res.statusCode).toBe(422);
    });
  });

  // ----------------------------------------------------------
  describe('POST /admin/cohort-placements/:id/drop', () => {
    it('drops placement, enrollment record remains', async () => {
      const enrollment = await createEnrollment('paid');
      const cohort = await createCohort();
      const placement = await prisma.cohortPlacement.create({
        data: { academy_enrollment_id: enrollment.id, cohort_id: cohort.id, user_id: user.id, academy_id: academy.id },
      });

      const res = await app.inject({
        method: 'POST',
        url: `/admin/cohort-placements/${placement.id}/drop`,
        headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
        payload: {},
      });

      expect(res.statusCode).toBe(200);

      const deletedPlacement = await prisma.cohortPlacement.findUnique({ where: { id: placement.id } });
      expect(deletedPlacement).toBeNull();

      const stillExists = await prisma.academyEnrollment.findUnique({ where: { id: enrollment.id } });
      expect(stillExists).not.toBeNull();
    });
  });
});
