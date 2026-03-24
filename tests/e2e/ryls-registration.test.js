/**
 * E2E Tests: RYLS Registration Feature
 * Tests complete HTTP flows for user registration and admin management
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestApp, generateAdminToken } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection } from '../helpers/testDb.js';
import { createFileUpload, createFullyFundedRegistration, createSelfFundedRegistration } from '../helpers/rylsFixtures.js';

describe('RYLS Registration E2E Tests', () => {
  let app;
  let prisma;
  let adminToken;

  beforeEach(async () => {
    app = await createTestApp();
    prisma = getTestPrisma();
    await resetDatabase();

    const adminUser = await prisma.user.create({
      data: {
        username: 'admin_ryls',
        first_name: 'Admin',
        last_name: 'RYLS',
        email: 'admin.ryls@test.com',
        password: 'hashed_password',
        role: 'ADMIN',
      },
    });

    adminToken = await generateAdminToken(adminUser.id, adminUser.email);
  });

  afterAll(async () => {
    if (app) await app.close();
    await closeConnection();
  });

  // ============================================================
  // POST /ryls/submit
  // ============================================================
  describe('POST /ryls/submit', () => {
    it('should submit fully funded registration successfully', async () => {
      const essayFile = await createFileUpload();

      const response = await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          step1: {
            fullName: 'Budi Santoso',
            email: 'budi@example.com',
            residence: 'Jakarta',
            nationality: 'Indonesian',
            whatsapp: '081234567890',
            institution: 'Universitas Indonesia',
            dateOfBirth: '2000-05-15',
            gender: 'MALE',
            discoverSource: 'RISE_INSTAGRAM',
            scholarshipType: 'FULLY_FUNDED',
          },
          essayTopic: 'Sustainable Leadership',
          essayFileId: essayFile.id,
          essayDescription: 'My vision for sustainable leadership.',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('registrationId');
      expect(body.data).toHaveProperty('submissionId');
      expect(body.data.scholarshipType).toBe('FULLY_FUNDED');
      expect(body.data.email).toBe('budi@example.com');
      expect(body.data.submission).toHaveProperty('essayTopic', 'Sustainable Leadership');
    });

    it('should return 400 for missing step1', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          essayTopic: 'Some topic',
          essayFileId: 1,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for missing required step1 fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          step1: {
            fullName: 'Budi',
            // missing email, residence, etc.
          },
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should save registration to database', async () => {
      const essayFile = await createFileUpload();

      await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          step1: {
            fullName: 'Test User',
            email: 'test.db@example.com',
            residence: 'Bandung',
            nationality: 'Indonesian',
            whatsapp: '082345678901',
            institution: 'ITB',
            dateOfBirth: '1999-01-01',
            gender: 'FEMALE',
            discoverSource: 'FRIENDS',
            scholarshipType: 'FULLY_FUNDED',
          },
          essayTopic: 'Innovation',
          essayFileId: essayFile.id,
        },
      });

      const saved = await prisma.rylsRegistration.findFirst({ where: { email: 'test.db@example.com' } });
      expect(saved).not.toBeNull();
      expect(saved.scholarship_type).toBe('FULLY_FUNDED');

      const submission = await prisma.rylsFullyFundedSubmission.findFirst({ where: { registration_id: saved.id } });
      expect(submission).not.toBeNull();
      expect(submission.essay_topic).toBe('Innovation');
    });
  });

  // ============================================================
  // POST /ryls/submit (Self-Funded)
  // ============================================================
  describe('POST /ryls/submit (Self-Funded)', () => {
    it('should submit self-funded registration successfully', async () => {
      const headshotFile = await createFileUpload({ original_name: 'headshot.jpg', mime_type: 'image/jpeg' });

      const response = await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          step1: {
            fullName: 'Siti Rahayu',
            email: 'siti@example.com',
            residence: 'Surabaya',
            nationality: 'Indonesian',
            whatsapp: '083456789012',
            institution: 'Universitas Airlangga',
            dateOfBirth: '2001-07-10',
            gender: 'FEMALE',
            discoverSource: 'FRIENDS',
            scholarshipType: 'SELF_FUNDED',
          },
          passportNumber: 'A1234567',
          needVisa: 'YES',
          headshotFileId: headshotFile.id,
          readPolicies: 'YES',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.scholarshipType).toBe('SELF_FUNDED');
      expect(body.data.submission.passportNumber).toBe('A1234567');
      expect(body.data.submission.needVisa).toBe(true);
      expect(body.data.submission.readPolicies).toBe(true);
    });

    it('should return 400 for missing passportNumber', async () => {
      const headshotFile = await createFileUpload({ original_name: 'headshot.jpg', mime_type: 'image/jpeg' });

      const response = await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          step1: {
            fullName: 'Test',
            email: 'test@example.com',
            residence: 'Jakarta',
            nationality: 'Indonesian',
            whatsapp: '081234567890',
            institution: 'UI',
            dateOfBirth: '2000-01-01',
            gender: 'MALE',
            discoverSource: 'RISE_INSTAGRAM',
            scholarshipType: 'SELF_FUNDED',
          },
          // missing passportNumber
          needVisa: 'NO',
          headshotFileId: headshotFile.id,
          readPolicies: 'YES',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should save self-funded submission to database', async () => {
      const headshotFile = await createFileUpload({ original_name: 'headshot.jpg', mime_type: 'image/jpeg' });

      await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          step1: {
            fullName: 'Ahmad Fauzi',
            email: 'ahmad.sf.db@example.com',
            residence: 'Yogyakarta',
            nationality: 'Indonesian',
            whatsapp: '084567890123',
            institution: 'UGM',
            dateOfBirth: '2000-03-20',
            gender: 'MALE',
            discoverSource: 'OTHER_INSTAGRAM',
            scholarshipType: 'SELF_FUNDED',
          },
          passportNumber: 'B9876543',
          needVisa: 'NO',
          headshotFileId: headshotFile.id,
          readPolicies: 'YES',
        },
      });

      const reg = await prisma.rylsRegistration.findFirst({ where: { email: 'ahmad.sf.db@example.com' } });
      expect(reg).not.toBeNull();
      expect(reg.scholarship_type).toBe('SELF_FUNDED');

      const sub = await prisma.rylsSelfFundedSubmission.findFirst({ where: { registration_id: reg.id } });
      expect(sub.passport_number).toBe('B9876543');
      expect(sub.need_visa).toBe(false);
      expect(sub.read_policies).toBe(true);
    });
  });

  // ============================================================
  // GET /ryls/submission/:submissionId
  // ============================================================
  describe('GET /ryls/submission/:submissionId', () => {
    it('should return registration by id', async () => {
      const { registration } = await createFullyFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: `/ryls/submission/${registration.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(registration.id);
      expect(body.data.email).toBe(registration.email);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ryls/submission/99999',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  // ============================================================
  // GET /ryls/check-email/:email
  // ============================================================
  describe('GET /ryls/check-email/:email', () => {
    it('should return exists=true for registered email', async () => {
      const { registration } = await createFullyFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: `/ryls/check-email/${registration.email}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.exists).toBe(true);
    });

    it('should return exists=false for unregistered email', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ryls/check-email/notregistered@example.com',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.exists).toBe(false);
    });
  });

  // ============================================================
  // GET /ryls/health
  // ============================================================
  describe('GET /ryls/health', () => {
    it('should return healthy status', async () => {
      const response = await app.inject({ method: 'GET', url: '/ryls/health' });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.status).toBe('ok');
      expect(body.data).toHaveProperty('timestamp');
    });
  });

  // ============================================================
  // Admin: GET /admin/ryls/
  // ============================================================
  describe('Admin: GET /admin/ryls/', () => {
    it('should return 401 without auth token', async () => {
      const response = await app.inject({ method: 'GET', url: '/admin/ryls/' });
      expect(response.statusCode).toBe(401);
    });

    it('should return paginated registrations', async () => {
      await createFullyFundedRegistration();
      await createSelfFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('registrations');
      expect(body.data).toHaveProperty('pagination');
      expect(body.data.registrations.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by scholarshipType', async () => {
      await createFullyFundedRegistration();
      await createSelfFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/?scholarshipType=FULLY_FUNDED',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      const types = body.data.registrations.map((r) => r.scholarship_type);
      expect(types.every((t) => t === 'FULLY_FUNDED')).toBe(true);
    });

    it('should support search by name', async () => {
      await createFullyFundedRegistration({ full_name: 'UniqueSearchName', email: `unique+${Date.now()}@test.com` });

      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/?search=UniqueSearchName',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.registrations.some((r) => r.full_name === 'UniqueSearchName')).toBe(true);
    });
  });

  // ============================================================
  // Admin: GET /admin/ryls/stats
  // ============================================================
  describe('Admin: GET /admin/ryls/stats', () => {
    it('should return 401 without auth', async () => {
      const response = await app.inject({ method: 'GET', url: '/admin/ryls/stats' });
      expect(response.statusCode).toBe(401);
    });

    it('should return statistics', async () => {
      await createFullyFundedRegistration();
      await createSelfFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/stats',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('totalRegistrations');
      expect(body.data).toHaveProperty('scholarshipBreakdown');
      expect(body.data.scholarshipBreakdown).toHaveProperty('fullyFunded');
      expect(body.data.scholarshipBreakdown).toHaveProperty('selfFunded');
      expect(body.data).toHaveProperty('demographicBreakdown');
    });
  });

  // ============================================================
  // Admin: GET /admin/ryls/date-range
  // ============================================================
  describe('Admin: GET /admin/ryls/date-range', () => {
    it('should return 400 without date params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/date-range',
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return registrations in date range', async () => {
      await createFullyFundedRegistration();

      const today = new Date().toISOString().split('T')[0];
      const response = await app.inject({
        method: 'GET',
        url: `/admin/ryls/date-range?startDate=2020-01-01&endDate=${today}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  // ============================================================
  // Admin: GET /admin/ryls/:id
  // ============================================================
  describe('Admin: GET /admin/ryls/:id', () => {
    it('should return registration with relations', async () => {
      const { registration } = await createFullyFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: `/admin/ryls/${registration.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(registration.id);
      expect(body.data).toHaveProperty('fully_funded_submission');
    });

    it('should return 404 for non-existent id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/99999',
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  // ============================================================
  // Admin: DELETE /admin/ryls/:id
  // ============================================================
  describe('Admin: DELETE /admin/ryls/:id', () => {
    it('should delete registration', async () => {
      const { registration } = await createFullyFundedRegistration();

      const response = await app.inject({
        method: 'DELETE',
        url: `/admin/ryls/${registration.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);

      const deleted = await prisma.rylsRegistration.findUnique({ where: { id: registration.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent id', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/admin/ryls/99999',
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should cascade delete submission', async () => {
      const { registration, submission } = await createFullyFundedRegistration();

      await app.inject({
        method: 'DELETE',
        url: `/admin/ryls/${registration.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const deletedSubmission = await prisma.rylsFullyFundedSubmission.findUnique({ where: { id: submission.id } });
      expect(deletedSubmission).toBeNull();
    });
  });

  // ============================================================
  // Admin: GET /admin/ryls/export
  // ============================================================
  describe('Admin: GET /admin/ryls/export', () => {
    it('should return 401 without auth', async () => {
      const response = await app.inject({ method: 'GET', url: '/admin/ryls/export' });
      expect(response.statusCode).toBe(401);
    });

    it('should export as CSV by default', async () => {
      await createFullyFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/export',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('should export as JSON when format=json', async () => {
      await createFullyFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/export?format=json',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  // ============================================================
  // Admin: GET /admin/ryls/export-excel
  // ============================================================
  describe('Admin: GET /admin/ryls/export-excel', () => {
    it('should return Excel file', async () => {
      await createFullyFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: '/admin/ryls/export-excel',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('spreadsheetml');
    });
  });

  // ============================================================
  // Legacy Endpoint 404 Tests
  // ============================================================
  describe('Legacy Endpoint 404 Tests', () => {
    it('should return 404 for POST /ryls/submit/fully-funded', async () => {
      const essayFile = await createFileUpload();

      const response = await app.inject({
        method: 'POST',
        url: '/ryls/submit/fully-funded',
        payload: {
          step1: {
            fullName: 'Test User',
            email: 'test@example.com',
            residence: 'Jakarta',
            nationality: 'Indonesian',
            whatsapp: '081234567890',
            institution: 'UI',
            dateOfBirth: '2000-01-01',
            gender: 'MALE',
            discoverSource: 'RISE_INSTAGRAM',
            scholarshipType: 'FULLY_FUNDED',
          },
          essayTopic: 'Test Topic',
          essayFileId: essayFile.id,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for POST /ryls/submit/self-funded', async () => {
      const headshotFile = await createFileUpload({ original_name: 'headshot.jpg', mime_type: 'image/jpeg' });

      const response = await app.inject({
        method: 'POST',
        url: '/ryls/submit/self-funded',
        payload: {
          step1: {
            fullName: 'Test User',
            email: 'test@example.com',
            residence: 'Jakarta',
            nationality: 'Indonesian',
            whatsapp: '081234567890',
            institution: 'UI',
            dateOfBirth: '2000-01-01',
            gender: 'MALE',
            discoverSource: 'RISE_INSTAGRAM',
            scholarshipType: 'SELF_FUNDED',
          },
          passportNumber: 'A1234567',
          needVisa: 'YES',
          headshotFileId: headshotFile.id,
          readPolicies: 'YES',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
