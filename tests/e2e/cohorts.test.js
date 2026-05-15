/**
 * E2E Tests: Cohort Feature
 * Tests complete HTTP flows against real test database
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestApp, generateAdminToken, generateUserToken } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection } from '../helpers/testDb.js';

describe('Cohort E2E Tests', () => {
  let app;
  let prisma;
  let adminToken;
  let userToken;

  // Seed data
  let academy;
  let adminUser;
  let regularUser;

  beforeEach(async () => {
    app = await createTestApp();
    prisma = getTestPrisma();
    await resetDatabase();

    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        username: 'admin_cohort',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@cohorttest.com',
        password: 'hashed_password',
        role: 'ADMIN',
      },
    });

    // Create regular user
    regularUser = await prisma.user.create({
      data: {
        username: 'user_cohort',
        first_name: 'Regular',
        last_name: 'User',
        email: 'user@cohorttest.com',
        password: 'hashed_password',
        role: 'USER',
      },
    });

    // Create academy
    academy = await prisma.academy.create({
      data: {
        title: 'Carbon Academy',
        slug: 'carbon-academy',
        status: 'ACTIVE',
      },
    });

    adminToken = await generateAdminToken(adminUser.id, adminUser.email);
    userToken = await generateUserToken(regularUser.id, regularUser.email);
  });

  afterAll(async () => {
    if (app) await app.close();
    await closeConnection();
  });

  // ============================================================
  // POST /admin/cohorts
  // ============================================================
  describe('POST /admin/cohorts', () => {
    it('should create cohort successfully with admin token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/cohorts',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          academy_id: academy.id,
          name: 'Batch 1',
          description: 'First batch',
          start_date: '2026-04-01',
          end_date: '2026-06-30',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Batch 1');
      expect(body.data.academy_id).toBe(academy.id);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/cohorts',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { name: 'Missing academy_id' }, // no academy_id
      });

      // Fastify schema validation rejects missing required field
      expect(response.statusCode).toBe(400);
    });

    it('should return 404 when academy does not exist', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/cohorts',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { academy_id: 99999, name: 'Batch 1' },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should return 400 when start_date >= end_date', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/admin/cohorts',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          academy_id: academy.id,
          name: 'Bad Dates',
          start_date: '2026-06-01',
          end_date: '2026-05-01',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // ============================================================
  // GET /cohorts
  // ============================================================
  describe('GET /cohorts', () => {
    it('should return empty list when no cohorts exist (public endpoint)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/cohorts',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
      expect(body.meta.total).toBe(0);
    });

    it('should return cohort list with enrollment_count', async () => {
      await prisma.cohort.create({
        data: { academy_id: academy.id, name: 'Batch 1', status: 'not_started' },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/cohorts',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Batch 1');
      expect(body.data[0]).toHaveProperty('enrollment_count');
    });
  });

  // ============================================================
  // GET /cohorts/:id/modules
  // ============================================================
  describe('GET /cohorts/:id/modules', () => {
    let cohort;

    beforeEach(async () => {
      cohort = await prisma.cohort.create({
        data: { academy_id: academy.id, name: 'Batch 1', status: 'ongoing' },
      });
    });

    it('should return 403 when user is not enrolled', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/cohorts/${cohort.id}/modules`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should return modules with computed_status when enrolled', async () => {
      // Create paid transaction + AcademyEnrollment + CohortPlacement for user
      const tx = await prisma.transaction.create({
        data: {
          transaction_code: `TEST${Date.now()}`,
          amount: 1500000,
          currency: 'IDR',
          status: 'paid',
          provider: 'midtrans',
          customer_name: 'Regular User',
          customer_email: regularUser.email,
          product_type: 'academy_enrollment',
          product_type_id: 0,
          user_id: regularUser.id,
        },
      });
      const enrollment = await prisma.academyEnrollment.create({
        data: { user_id: regularUser.id, academy_id: academy.id, transaction_id: tx.id },
      });
      await prisma.cohortPlacement.create({
        data: { academy_enrollment_id: enrollment.id, cohort_id: cohort.id, user_id: regularUser.id, academy_id: academy.id },
      });

      // Create a published module
      await prisma.cohortModule.create({
        data: {
          cohort_id: cohort.id,
          academy_id: academy.id,
          title: 'Session 1',
          is_published: true,
          order: 1,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/cohorts/${cohort.id}/modules`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toBe('Session 1');
      expect(body.data[0]).toHaveProperty('computed_status');
    });
  });

  // ============================================================
  // GET /certificates/verify/:code
  // ============================================================
  describe('GET /certificates/verify/:code', () => {
    it('should return 404 for non-existent certificate code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/certificates/verify/CERT-INVALID-2026-9999',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should return certificate details for valid code (public)', async () => {
      // Create cohort and enrollment
      const cohort = await prisma.cohort.create({
        data: { academy_id: academy.id, name: 'Batch 1', status: 'completed' },
      });

      // Create paid transaction + AcademyEnrollment + CohortPlacement for certificate
      const tx = await prisma.transaction.create({
        data: {
          transaction_code: `CERT${Date.now()}`,
          amount: 1500000,
          currency: 'IDR',
          status: 'paid',
          provider: 'midtrans',
          customer_name: 'Regular User',
          customer_email: regularUser.email,
          product_type: 'academy_enrollment',
          product_type_id: 0,
          user_id: regularUser.id,
        },
      });
      const academyEnrollment = await prisma.academyEnrollment.create({
        data: { user_id: regularUser.id, academy_id: academy.id, transaction_id: tx.id, completed_at: new Date() },
      });
      const placement = await prisma.cohortPlacement.create({
        data: { academy_enrollment_id: academyEnrollment.id, cohort_id: cohort.id, user_id: regularUser.id, academy_id: academy.id },
      });

      await prisma.cohortCertificate.create({
        data: {
          academy_id: academy.id,
          cohort_id: cohort.id,
          placement_id: placement.id,
          user_id: regularUser.id,
          certificate_code: 'CERT-CARB-2026-0001',
          student_name: 'Regular User',
          academy_title: 'Carbon Academy',
          cohort_name: 'Batch 1',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/certificates/verify/CERT-CARB-2026-0001',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.certificate_code).toBe('CERT-CARB-2026-0001');
      expect(body.data.student_name).toBe('Regular User');
      expect(body.data.academy_title).toBe('Carbon Academy');
    });
  });
});
