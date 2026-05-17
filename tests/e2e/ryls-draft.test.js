import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestApp, generateAdminToken, generateSuperadminToken } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection } from '../helpers/testDb.js';
import { createDraftRegistration, createFileUpload } from '../helpers/rylsFixtures.js';
import * as XLSX from 'xlsx';

// testServer.js registers userRylsRegistrationRoutes with prefix '/ryls'
// so draft routes are at /ryls/draft, /ryls/draft/resume/:token, /ryls/draft/:token

describe('RYLS Draft E2E — User Routes', () => {
  let app;
  let prisma;

  beforeEach(async () => {
    app = await createTestApp();
    prisma = getTestPrisma();
    await resetDatabase();
  });

  afterAll(async () => {
    if (app) await app.close();
    await closeConnection();
  });

  describe('POST /ryls/draft', () => {
    it('membuat draft baru dan mengembalikan token 64-char saat tidak ada resumeToken', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/draft',
        payload: { email: 'test@test.com', step: 1, formData: { step1: { fullName: 'Test' } } },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.data.resumeToken).toHaveLength(64);
      expect(body.data.currentStep).toBe(1);
    });

    it('menyimpan draft ke DB setelah create', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/draft',
        payload: { email: 'db@test.com', step: 1, formData: { step1: { fullName: 'DB Test' } } },
      });
      const { resumeToken } = JSON.parse(res.body).data;
      const saved = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: resumeToken } });
      expect(saved).not.toBeNull();
      expect(saved.email).toBe('db@test.com');
    });

    it('mengupdate draft dan mengembalikan token yang sama jika resumeToken valid', async () => {
      const draft = await createDraftRegistration({ resume_token: 'upd-e2e', email: 'upd@test.com' });
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/draft',
        payload: {
          email: draft.email,
          resumeToken: 'upd-e2e',
          step: 2,
          formData: { step2: { passportNumber: 'A1' } },
        },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.resumeToken).toBe('upd-e2e');
      const updated = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'upd-e2e' } });
      expect(updated.current_step).toBe(2);
    });

    it('membuat draft BARU jika resumeToken tidak ada di DB', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/draft',
        payload: { email: 'ghost@test.com', resumeToken: 'token-hantu', step: 1, formData: {} },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.resumeToken).not.toBe('token-hantu');
    });

    it('mengembalikan 400 jika email tidak dikirim', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/draft',
        payload: { step: 1, formData: {} },
      });
      expect(res.statusCode).toBe(400);
    });

    it('mengembalikan 400 jika step tidak dikirim', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/draft',
        payload: { email: 'x@test.com', formData: {} },
      });
      expect(res.statusCode).toBe(400);
    });

    it('mengembalikan 400 jika step di luar range (0)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/draft',
        payload: { email: 'x@test.com', step: 0, formData: {} },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /ryls/draft/resume/:token', () => {
    it('mengembalikan formData dan currentStep untuk token valid', async () => {
      const draft = await createDraftRegistration({ resume_token: 'get-e2e' });
      const res = await app.inject({
        method: 'GET',
        url: '/ryls/draft/resume/get-e2e',
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.currentStep).toBe(draft.current_step);
      expect(body.data.formData).toBeDefined();
      expect(body.data.email).toBe(draft.email);
    });

    it('mengembalikan 404 untuk token yang tidak ada', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/ryls/draft/resume/token-tidak-ada',
      });
      expect(res.statusCode).toBe(404);
    });

    it('draft lama tetap bisa di-resume selama token valid', async () => {
      await createDraftRegistration({ resume_token: 'exp-e2e', created_at: new Date('2025-01-01T00:00:00.000Z') });
      const res = await app.inject({
        method: 'GET',
        url: '/ryls/draft/resume/exp-e2e',
      });
      expect(res.statusCode).toBe(200);
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'exp-e2e' } })).not.toBeNull();
    });
  });

  describe('DELETE /ryls/draft/:token', () => {
    it('menghapus draft dari DB', async () => {
      await createDraftRegistration({ resume_token: 'del-e2e' });
      const res = await app.inject({
        method: 'DELETE',
        url: '/ryls/draft/del-e2e',
      });
      expect(res.statusCode).toBe(200);
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'del-e2e' } })).toBeNull();
    });

    it('mengembalikan 404 untuk token yang tidak ada', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/ryls/draft/tidak-ada',
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /ryls/submit — auto-delete draft', () => {
    it('menghapus draft dari DB setelah submit registrasi berhasil', async () => {
      const draftRes = await app.inject({
        method: 'POST',
        url: '/ryls/draft',
        payload: { email: 'autodel@test.com', step: 1, formData: { step1: { fullName: 'Test' } } },
      });
      const { resumeToken } = JSON.parse(draftRes.body).data;
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: resumeToken } })).not.toBeNull();

      const essayFile = await createFileUpload();
      const submitRes = await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          resumeToken,
          step1: {
            fullName: 'Auto Del',
            email: 'autodel@test.com',
            residence: 'Jakarta',
            nationality: 'Indonesian',
            whatsapp: '081234567890',
            institution: 'UI',
            dateOfBirth: '2000-01-01',
            gender: 'MALE',
            discoverSource: 'FRIENDS',
            scholarshipType: 'FULLY_FUNDED',
          },
          essayTopic: 'Test Essay',
          essayFileId: essayFile.id,
        },
      });
      expect(submitRes.statusCode).toBe(201);
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: resumeToken } })).toBeNull();
    });

    it('submit tanpa resumeToken tetap sukses', async () => {
      const essayFile = await createFileUpload();
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          step1: {
            fullName: 'No Draft',
            email: `nodraft+${Date.now()}@test.com`,
            residence: 'Jakarta',
            nationality: 'Indonesian',
            whatsapp: '081234567890',
            institution: 'UI',
            dateOfBirth: '2000-01-01',
            gender: 'MALE',
            discoverSource: 'FRIENDS',
            scholarshipType: 'FULLY_FUNDED',
          },
          essayTopic: 'Test',
          essayFileId: essayFile.id,
        },
      });
      expect(res.statusCode).toBe(201);
    });

    it('submit tetap sukses jika resumeToken tidak ada di DB (stale token)', async () => {
      const essayFile = await createFileUpload();
      const res = await app.inject({
        method: 'POST',
        url: '/ryls/submit',
        payload: {
          resumeToken: 'token-yang-sudah-tidak-ada',
          step1: {
            fullName: 'Stale Token',
            email: `stale+${Date.now()}@test.com`,
            residence: 'Jakarta',
            nationality: 'Indonesian',
            whatsapp: '081234567890',
            institution: 'UI',
            dateOfBirth: '2000-01-01',
            gender: 'MALE',
            discoverSource: 'FRIENDS',
            scholarshipType: 'FULLY_FUNDED',
          },
          essayTopic: 'Test',
          essayFileId: essayFile.id,
        },
      });
      expect(res.statusCode).toBe(201);
    });
  });

  describe('Admin: Draft Endpoints', () => {
    let adminToken;
    let noPermissionAdminToken;

    beforeEach(async () => {
      const superadminUser = await prisma.user.create({
        data: {
          username: `superadmin_draft_${Date.now()}`,
          first_name: 'Super',
          last_name: 'Admin',
          email: `superadmin.draft.${Date.now()}@test.com`,
          password: 'hashed',
          role: 'SUPERADMIN',
        },
      });
      adminToken = await generateSuperadminToken(superadminUser.id, superadminUser.email);

      const noPermissionAdmin = await prisma.user.create({
        data: {
          username: `admin_no_perm_draft_${Date.now()}`,
          first_name: 'No',
          last_name: 'Perm',
          email: `admin.no.perm.draft.${Date.now()}@test.com`,
          password: 'hashed',
          role: 'ADMIN',
        },
      });
      noPermissionAdminToken = await generateAdminToken(noPermissionAdmin.id, noPermissionAdmin.email);
    });

    it('GET /admin/ryls/drafts — mengembalikan 401 tanpa auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/ryls/drafts' });
      expect(res.statusCode).toBe(401);
    });

    it('GET /admin/ryls/drafts — mengembalikan list draft dengan pagination', async () => {
      await createDraftRegistration({ resume_token: `adm-1-${Date.now()}`, email: 'a1@test.com' });
      await createDraftRegistration({ resume_token: `adm-2-${Date.now()}`, email: 'a2@test.com' });

      const res = await app.inject({
        method: 'GET',
        url: '/admin/ryls/drafts',
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.drafts.length).toBeGreaterThanOrEqual(2);
      expect(body.data).toHaveProperty('pagination');
      expect(body.data.pagination).toHaveProperty('total');
    });

    it('GET /admin/ryls/drafts — support query param page dan limit', async () => {
      for (let i = 0; i < 5; i++) {
        await createDraftRegistration({ resume_token: `page-tok-${i}-${Date.now()}` });
      }
      const res = await app.inject({
        method: 'GET',
        url: '/admin/ryls/drafts?page=1&limit=2',
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.drafts.length).toBeLessThanOrEqual(2);
    });

    it('GET /admin/ryls/drafts/stats — mengembalikan 401 tanpa auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/ryls/drafts/stats' });
      expect(res.statusCode).toBe(401);
    });

    it('GET /admin/ryls/drafts/stats — mengembalikan count semua draft', async () => {
      await createDraftRegistration({ resume_token: `stat-tok-${Date.now()}` });

      const res = await app.inject({
        method: 'GET',
        url: '/admin/ryls/drafts/stats',
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toHaveProperty('count');
      expect(body.data.count).toBeGreaterThanOrEqual(1);
    });

    it('GET /admin/ryls/drafts/export-excel — mengembalikan 401 tanpa auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/ryls/drafts/export-excel' });
      expect(res.statusCode).toBe(401);
    });

    it('GET /admin/ryls/drafts/export-excel — mengembalikan 403 tanpa permission admin.ryls', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/ryls/drafts/export-excel',
        headers: { authorization: `Bearer ${noPermissionAdminToken}` },
      });

      expect(res.statusCode).toBe(403);
    });

    it('GET /admin/ryls/drafts/export-excel — export semua draft dengan filename yang benar', async () => {
      const completeDraft = await createDraftRegistration({
        resume_token: `active-complete-${Date.now()}`,
        email: 'active-complete@test.com',
        current_step: 3,
        form_data: { step1: { fullName: 'Active Complete' } },
        scholarship_type: 'SELF_FUNDED',
      });
      const partialDraft = await createDraftRegistration({
        resume_token: `active-partial-${Date.now()}`,
        email: 'active-partial@test.com',
        current_step: 1,
        form_data: {},
        scholarship_type: null,
      });
      await createDraftRegistration({
        resume_token: `second-draft-${Date.now()}`,
        email: 'second@test.com',
        form_data: { step1: { fullName: 'Expired User' } },
      });

      await prisma.rylsDraftRegistration.update({
        where: { id: completeDraft.id },
        data: { updated_at: new Date('2026-05-14T10:00:00.000Z') },
      });
      await prisma.rylsDraftRegistration.update({
        where: { id: partialDraft.id },
        data: { updated_at: new Date('2026-05-14T11:00:00.000Z') },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/admin/ryls/drafts/export-excel',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('spreadsheetml');
      expect(res.headers['content-disposition']).toMatch(/^attachment; filename="ryls-drafts-\d{4}-\d{2}-\d{2}\.xlsx"$/);

      const workbook = XLSX.read(res.rawPayload, { type: 'buffer' });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Drafts, { header: 1 });

      expect(rows[0]).toEqual(['Email', 'Full Name', 'Current Step', 'Scholarship Type', 'Updated At']);
      expect(rows).toHaveLength(4);
      expect(rows[1][0]).toBe('active-partial@test.com');
      expect(rows[1][1]).toBe('-');
      expect(rows[1][3]).toBe('-');
      expect(rows[2][0]).toBe('active-complete@test.com');
      expect(rows[2][1]).toBe('Active Complete');
      expect(rows[2][3]).toBe('SELF_FUNDED');
      expect(rows[3][0]).toBe('second@test.com');
    });
  });
});
