import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection } from '../../helpers/testDb.js';
import { createTestUser } from '../../helpers/userFixtures.js';
import { seedAcademy } from '../../helpers/academyFixtures.js';
import { academyEnrollmentRepository } from '../../../src/repositories/cohorts/academyEnrollmentRepository.js';

let prisma;
let user;
let academy;

async function createTransaction(overrides = {}) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return prisma.transaction.create({
    data: {
      transaction_code: `TEST-AE-${timestamp}-${random}`,
      amount: 3889000,
      currency: 'IDR',
      status: 'pending',
      provider: 'midtrans',
      customer_name: 'Test User',
      customer_email: 'test@test.com',
      product_type: 'academy',
      product_type_id: academy.id,
      user_id: user.id,
      ...overrides,
    },
  });
}

describe('AcademyEnrollmentRepository', () => {
  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase();
    user = await createTestUser();
    academy = await seedAcademy();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('createPendingEnrollment', () => {
    it('creates enrollment without status field', async () => {
      const transaction = await createTransaction();

      const enrollment = await academyEnrollmentRepository.createPendingEnrollment(
        user.id,
        academy.id,
        transaction.id,
      );

      expect(enrollment).toBeDefined();
      expect(enrollment.user_id).toBe(user.id);
      expect(enrollment.academy_id).toBe(academy.id);
      expect(enrollment.transaction_id).toBe(transaction.id);
      expect(enrollment.completed_at).toBeNull();
      expect(enrollment.notes).toBeNull();
    });
  });

  describe('findActiveByUserAcademy', () => {
    it('returns enrollment when transaction is pending', async () => {
      const transaction = await createTransaction({ status: 'pending' });
      await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      const found = await academyEnrollmentRepository.findActiveByUserAcademy(user.id, academy.id);

      expect(found).not.toBeNull();
      expect(found.transaction.status).toBe('pending');
    });

    it('returns enrollment when transaction is paid and not completed', async () => {
      const transaction = await createTransaction({ status: 'paid' });
      await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      const found = await academyEnrollmentRepository.findActiveByUserAcademy(user.id, academy.id);

      expect(found).not.toBeNull();
      expect(found.transaction.status).toBe('paid');
    });

    it('returns null when enrollment is completed (completed_at set)', async () => {
      const transaction = await createTransaction({ status: 'paid' });
      await prisma.academyEnrollment.create({
        data: {
          user_id: user.id,
          academy_id: academy.id,
          transaction_id: transaction.id,
          completed_at: new Date(),
        },
      });

      const found = await academyEnrollmentRepository.findActiveByUserAcademy(user.id, academy.id);

      expect(found).toBeNull();
    });

    it('returns null when transaction is failed', async () => {
      const transaction = await createTransaction({ status: 'failed' });
      await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      const found = await academyEnrollmentRepository.findActiveByUserAcademy(user.id, academy.id);

      expect(found).toBeNull();
    });

    it('returns null when transaction is cancelled', async () => {
      const transaction = await createTransaction({ status: 'cancelled' });
      await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      const found = await academyEnrollmentRepository.findActiveByUserAcademy(user.id, academy.id);

      expect(found).toBeNull();
    });

    it('returns null when no enrollments exist', async () => {
      const found = await academyEnrollmentRepository.findActiveByUserAcademy(user.id, academy.id);

      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns enrollment with transaction relation', async () => {
      const transaction = await createTransaction();
      const enrollment = await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      const found = await academyEnrollmentRepository.findById(enrollment.id);

      expect(found).not.toBeNull();
      expect(found.id).toBe(enrollment.id);
      expect(found.transaction).toBeDefined();
      expect(found.transaction.id).toBe(transaction.id);
      expect(found.transaction.transaction_code).toBeDefined();
    });

    it('returns null for non-existent id', async () => {
      const found = await academyEnrollmentRepository.findById(999999);

      expect(found).toBeNull();
    });
  });

  describe('getNextSequenceNumber', () => {
    it('returns 1 when no enrollments exist', async () => {
      const sequence = await academyEnrollmentRepository.getNextSequenceNumber(prisma);

      expect(sequence).toBe(1);
    });

    it('returns last id + 1 when enrollments exist', async () => {
      const transaction = await createTransaction();
      const enrollment = await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      const sequence = await academyEnrollmentRepository.getNextSequenceNumber(prisma);

      expect(sequence).toBe(enrollment.id + 1);
    });
  });

  describe('markCompleted', () => {
    it('sets completed_at timestamp', async () => {
      const transaction = await createTransaction({ status: 'paid' });
      const enrollment = await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      const updated = await academyEnrollmentRepository.markCompleted(enrollment.id);

      expect(updated.completed_at).toBeInstanceOf(Date);
    });

    it('accepts notes when completing', async () => {
      const transaction = await createTransaction({ status: 'paid' });
      const enrollment = await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      const updated = await academyEnrollmentRepository.markCompleted(enrollment.id, { notes: 'Course finished' });

      expect(updated.completed_at).toBeInstanceOf(Date);
      expect(updated.notes).toBe('Course finished');
    });
  });

  describe('unique constraint on transaction_id', () => {
    it('rejects duplicate transaction_id', async () => {
      const transaction = await createTransaction();
      await prisma.academyEnrollment.create({
        data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
      });

      await expect(
        prisma.academyEnrollment.create({
          data: { user_id: user.id, academy_id: academy.id, transaction_id: transaction.id },
        }),
      ).rejects.toThrow();
    });
  });
});
