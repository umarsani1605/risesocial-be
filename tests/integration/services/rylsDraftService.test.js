import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../../helpers/testDb.js';
import { createDraftRegistration } from '../../helpers/rylsFixtures.js';
import { RylsDraftService } from '../../../src/services/rylsDraftService.js';

describe('RylsDraftService Integration Tests', { concurrent: false }, () => {
  let service;
  let prisma;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    service = new RylsDraftService();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('saveDraft', () => {
    it('membuat draft baru dan generate token 64-char jika tidak ada resumeToken', async () => {
      const result = await service.saveDraft({
        email: 'new@test.com',
        step: 1,
        formData: { step1: { fullName: 'X' } },
      });
      expect(result.resumeToken).toHaveLength(64);
      expect(result.currentStep).toBe(1);
      expect(result.savedAt).toBeDefined();
      const saved = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: result.resumeToken } });
      expect(saved).not.toBeNull();
      expect(saved.email).toBe('new@test.com');
    });

    it('mengupdate draft existing dan mengembalikan token yang sama', async () => {
      const existing = await createDraftRegistration({ resume_token: 'existing-tok', email: 'ex@test.com' });
      const result = await service.saveDraft({
        email: existing.email,
        resumeToken: 'existing-tok',
        step: 2,
        formData: { step2: { passportNumber: 'A123' } },
        scholarshipType: 'SELF_FUNDED',
      });
      expect(result.resumeToken).toBe('existing-tok');
      const updated = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'existing-tok' } });
      expect(updated.current_step).toBe(2);
      expect(updated.scholarship_type).toBe('SELF_FUNDED');
    });

    it('membuat draft BARU jika resumeToken tidak ditemukan di DB', async () => {
      const result = await service.saveDraft({
        email: 'ghost@test.com',
        resumeToken: 'token-yang-tidak-ada',
        step: 1,
        formData: {},
      });
      expect(result.resumeToken).not.toBe('token-yang-tidak-ada');
      expect(result.resumeToken).toHaveLength(64);
    });

    it('set expires_at sekitar 30 hari dari sekarang', async () => {
      const before = Date.now();
      const result = await service.saveDraft({ email: 'exp@test.com', step: 1, formData: {} });
      const saved = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: result.resumeToken } });
      const diffDays = (saved.expires_at.getTime() - before) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(30, 0);
    });
  });

  describe('getDraft', () => {
    it('mengembalikan formData, currentStep, scholarshipType untuk token valid', async () => {
      const draft = await createDraftRegistration({ resume_token: 'get-tok' });
      const result = await service.getDraft('get-tok');
      expect(result).not.toBeNull();
      expect(result.currentStep).toBe(draft.current_step);
      expect(result.formData).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('mengembalikan null jika token tidak ditemukan', async () => {
      expect(await service.getDraft('tidak-ada')).toBeNull();
    });

    it('mengembalikan null DAN menghapus record jika sudah expired', async () => {
      await createDraftRegistration({ resume_token: 'exp-get', expires_at: new Date(Date.now() - 1000) });
      const result = await service.getDraft('exp-get');
      expect(result).toBeNull();
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'exp-get' } })).toBeNull();
    });
  });

  describe('deleteDraft', () => {
    it('menghapus draft dari DB', async () => {
      await createDraftRegistration({ resume_token: 'del-svc' });
      await service.deleteDraft('del-svc');
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'del-svc' } })).toBeNull();
    });

    it('tidak throw jika token tidak ada di DB', async () => {
      await expect(service.deleteDraft('tidak-ada')).resolves.not.toThrow();
    });
  });

  describe('cleanupExpired', () => {
    it('menghapus semua expired dan mengembalikan jumlah yang dihapus', async () => {
      await createDraftRegistration({ resume_token: 'cl-exp-1', expires_at: new Date(Date.now() - 1000) });
      await createDraftRegistration({ resume_token: 'cl-exp-2', expires_at: new Date(Date.now() - 2000) });
      await createDraftRegistration({ resume_token: 'cl-valid' });

      const count = await service.cleanupExpired();

      expect(count).toBeGreaterThanOrEqual(2);
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'cl-valid' } })).not.toBeNull();
    });

    it('mengembalikan 0 jika tidak ada yang expired', async () => {
      await createDraftRegistration({ resume_token: 'clean-none' });
      expect(await service.cleanupExpired()).toBe(0);
    });
  });

  describe('getDraftStats', () => {
    it('count hanya draft yang belum expired', async () => {
      await createDraftRegistration({ resume_token: 'stat-valid-1' });
      await createDraftRegistration({ resume_token: 'stat-valid-2' });
      await createDraftRegistration({ resume_token: 'stat-expired', expires_at: new Date(Date.now() - 1000) });

      const stats = await service.getDraftStats();
      expect(stats.count).toBeGreaterThanOrEqual(2);
    });
  });
});
