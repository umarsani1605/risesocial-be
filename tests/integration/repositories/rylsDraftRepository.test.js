import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../../helpers/testDb.js';
import { createDraftRegistration } from '../../helpers/rylsFixtures.js';
import { RylsDraftRepository } from '../../../src/repositories/rylsDraftRepository.js';

describe('RylsDraftRepository Integration Tests', { concurrent: false }, () => {
  let repo;
  let prisma;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    repo = new RylsDraftRepository();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('createDraft', () => {
    it('menyimpan draft baru ke DB dengan semua field', async () => {
      const result = await repo.createDraft({
        email: 'a@test.com',
        resumeToken: 'tok-create',
        currentStep: 1,
        formData: { step1: { fullName: 'X' } },
        scholarshipType: 'FULLY_FUNDED',
      });
      expect(result.id).toBeDefined();
      expect(result.resume_token).toBe('tok-create');
      expect(result.email).toBe('a@test.com');
      expect(result.current_step).toBe(1);
    });
  });

  describe('findByResumeToken', () => {
    it('mengembalikan draft yang ada', async () => {
      const created = await createDraftRegistration({ resume_token: 'find-me' });
      const found = await repo.findByResumeToken('find-me');
      expect(found).not.toBeNull();
      expect(found.id).toBe(created.id);
    });

    it('mengembalikan null jika token tidak ada', async () => {
      const result = await repo.findByResumeToken('token-tidak-ada');
      expect(result).toBeNull();
    });
  });

  describe('updateByToken', () => {
    it('memperbarui current_step, form_data, dan scholarship_type', async () => {
      await createDraftRegistration({ resume_token: 'upd-tok' });
      await repo.updateByToken('upd-tok', {
        currentStep: 2,
        formData: { step2: { passportNumber: 'A123' } },
        scholarshipType: 'SELF_FUNDED',
      });
      const updated = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'upd-tok' } });
      expect(updated.current_step).toBe(2);
      expect(updated.scholarship_type).toBe('SELF_FUNDED');
    });
  });

  describe('deleteByToken', () => {
    it('menghapus draft dari DB', async () => {
      await createDraftRegistration({ resume_token: 'del-tok' });
      await repo.deleteByToken('del-tok');
      const result = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'del-tok' } });
      expect(result).toBeNull();
    });
  });

  describe('getDrafts', () => {
    it('mengembalikan array data dan total', async () => {
      await createDraftRegistration({ resume_token: 'pg-1', email: 'pg1@test.com' });
      await createDraftRegistration({ resume_token: 'pg-2', email: 'pg2@test.com' });
      const result = await repo.getDrafts({ page: 1, limit: 10 });
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });

    it('menghormati limit pagination', async () => {
      await createDraftRegistration({ resume_token: 'lim-1' });
      await createDraftRegistration({ resume_token: 'lim-2' });
      await createDraftRegistration({ resume_token: 'lim-3' });
      const result = await repo.getDrafts({ page: 1, limit: 2 });
      expect(result.data.length).toBe(2);
    });

    it('urutan updated_at descending', async () => {
      await createDraftRegistration({ resume_token: 'ord-1' });
      await createDraftRegistration({ resume_token: 'ord-2' });
      const result = await repo.getDrafts({ page: 1, limit: 10 });
      const times = result.data.map((d) => new Date(d.updated_at).getTime());
      expect(times[0]).toBeGreaterThanOrEqual(times[1]);
    });
  });

  describe('getDraftsForExport', () => {
    it('mengembalikan semua draft dengan field export yang dibutuhkan', async () => {
      await createDraftRegistration({
        resume_token: 'export-active',
        email: 'active@test.com',
        current_step: 2,
        form_data: { step1: { fullName: 'Active User' } },
      });
      await createDraftRegistration({
        resume_token: 'export-second',
        email: 'second@test.com',
      });

      const drafts = await repo.getDraftsForExport();

      expect(drafts).toHaveLength(2);
      expect(drafts[0]).not.toHaveProperty('resume_token');
    });

    it('mengurutkan hasil berdasarkan updated_at descending', async () => {
      await createDraftRegistration({ resume_token: 'export-order-1', email: 'order1@test.com' });
      await createDraftRegistration({ resume_token: 'export-order-2', email: 'order2@test.com' });

      await prisma.rylsDraftRegistration.update({
        where: { resume_token: 'export-order-1' },
        data: { updated_at: new Date(Date.now() - 10_000) },
      });
      await prisma.rylsDraftRegistration.update({
        where: { resume_token: 'export-order-2' },
        data: { updated_at: new Date() },
      });

      const drafts = await repo.getDraftsForExport();

      expect(drafts[0].email).toBe('order2@test.com');
      expect(drafts[1].email).toBe('order1@test.com');
    });
  });
});
