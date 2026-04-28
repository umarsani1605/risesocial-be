import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestApp } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection } from '../helpers/testDb.js';
import { createDraftRegistration } from '../helpers/rylsFixtures.js';

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
      expect(body.data.expiresAt).toBeDefined();
    });

    it('mengembalikan 404 untuk token yang tidak ada', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/ryls/draft/resume/token-tidak-ada',
      });
      expect(res.statusCode).toBe(404);
    });

    it('mengembalikan 404 dan menghapus draft jika sudah expired', async () => {
      await createDraftRegistration({ resume_token: 'exp-e2e', expires_at: new Date(Date.now() - 1000) });
      const res = await app.inject({
        method: 'GET',
        url: '/ryls/draft/resume/exp-e2e',
      });
      expect(res.statusCode).toBe(404);
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'exp-e2e' } })).toBeNull();
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
});
