import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection } from '../../helpers/testDb.js';
import { createTestUser } from '../../helpers/userFixtures.js';
import { seedAcademy } from '../../helpers/academyFixtures.js';
import { cohortPlacementRepository } from '../../../src/repositories/cohorts/cohortPlacementRepository.js';

let prisma;
let user;
let academy;
let cohort;
let enrollment;

async function createTransaction(overrides = {}) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return prisma.transaction.create({
    data: {
      transaction_code: `TEST-CP-${timestamp}-${random}`,
      amount: 3889000,
      currency: 'IDR',
      status: 'paid',
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

async function createCohort(overrides = {}) {
  return prisma.cohort.create({
    data: {
      academy_id: academy.id,
      name: `Cohort ${Date.now()}`,
      status: 'not_started',
      ...overrides,
    },
  });
}

async function createEnrollment(overrides = {}) {
  const transaction = await createTransaction();
  return prisma.academyEnrollment.create({
    data: {
      user_id: user.id,
      academy_id: academy.id,
      transaction_id: transaction.id,
      status: 'active',
      ...overrides,
    },
  });
}

describe('CohortPlacementRepository', () => {
  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase();
    user = await createTestUser();
    academy = await seedAcademy();
    cohort = await createCohort();
    enrollment = await createEnrollment();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('createPlacement', () => {
    it('creates a placement record', async () => {
      const placement = await cohortPlacementRepository.createPlacement({
        academyEnrollmentId: enrollment.id,
        cohortId: cohort.id,
        userId: user.id,
        academyId: academy.id,
      });

      expect(placement).toBeDefined();
      expect(placement.academy_enrollment_id).toBe(enrollment.id);
      expect(placement.cohort_id).toBe(cohort.id);
      expect(placement.user_id).toBe(user.id);
      expect(placement.academy_id).toBe(academy.id);
    });

    it('accepts optional notes', async () => {
      const placement = await cohortPlacementRepository.createPlacement({
        academyEnrollmentId: enrollment.id,
        cohortId: cohort.id,
        userId: user.id,
        academyId: academy.id,
        notes: 'Late join',
      });

      expect(placement.notes).toBe('Late join');
    });
  });

  describe('findByEnrollmentId', () => {
    it('returns placement when exists', async () => {
      await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: enrollment.id,
          cohort_id: cohort.id,
          user_id: user.id,
          academy_id: academy.id,
        },
      });

      const found = await cohortPlacementRepository.findByEnrollmentId(enrollment.id);

      expect(found).not.toBeNull();
      expect(found.academy_enrollment_id).toBe(enrollment.id);
    });

    it('returns null when no placement exists', async () => {
      const found = await cohortPlacementRepository.findByEnrollmentId(enrollment.id);

      expect(found).toBeNull();
    });
  });

  describe('findByUserCohort', () => {
    it('returns placement for user in cohort', async () => {
      await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: enrollment.id,
          cohort_id: cohort.id,
          user_id: user.id,
          academy_id: academy.id,
        },
      });

      const found = await cohortPlacementRepository.findByUserCohort(user.id, cohort.id);

      expect(found).not.toBeNull();
      expect(found.user_id).toBe(user.id);
      expect(found.cohort_id).toBe(cohort.id);
    });

    it('returns null when user not in cohort', async () => {
      const found = await cohortPlacementRepository.findByUserCohort(user.id, cohort.id);

      expect(found).toBeNull();
    });
  });

  describe('findByCohort', () => {
    it('returns all placements in a cohort', async () => {
      const user2 = await createTestUser();
      const enrollment2 = await createEnrollment({ user_id: user2.id });

      await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: enrollment.id,
          cohort_id: cohort.id,
          user_id: user.id,
          academy_id: academy.id,
        },
      });
      await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: enrollment2.id,
          cohort_id: cohort.id,
          user_id: user2.id,
          academy_id: academy.id,
        },
      });

      const placements = await cohortPlacementRepository.findByCohort(cohort.id);

      expect(placements).toHaveLength(2);
    });

    it('returns empty array when no placements', async () => {
      const placements = await cohortPlacementRepository.findByCohort(cohort.id);

      expect(placements).toEqual([]);
    });
  });

  describe('deletePlacement', () => {
    it('hard deletes the placement', async () => {
      const placement = await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: enrollment.id,
          cohort_id: cohort.id,
          user_id: user.id,
          academy_id: academy.id,
        },
      });

      await cohortPlacementRepository.deletePlacement(placement.id);

      const found = await prisma.cohortPlacement.findUnique({ where: { id: placement.id } });
      expect(found).toBeNull();
    });
  });

  describe('transferPlacement', () => {
    it('atomically moves placement to new cohort', async () => {
      const newCohort = await createCohort({ name: 'Cohort B' });
      const placement = await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: enrollment.id,
          cohort_id: cohort.id,
          user_id: user.id,
          academy_id: academy.id,
        },
      });

      const transferred = await cohortPlacementRepository.transferPlacement(
        placement.id,
        newCohort.id,
      );

      expect(transferred.cohort_id).toBe(newCohort.id);
      expect(transferred.academy_enrollment_id).toBe(enrollment.id);
      expect(transferred.user_id).toBe(user.id);

      const old = await prisma.cohortPlacement.findUnique({ where: { id: placement.id } });
      expect(old).toBeNull();
    });
  });

  describe('unique constraint: academy_enrollment_id', () => {
    it('rejects duplicate academy_enrollment_id', async () => {
      const cohort2 = await createCohort({ name: 'Cohort C' });
      await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: enrollment.id,
          cohort_id: cohort.id,
          user_id: user.id,
          academy_id: academy.id,
        },
      });

      await expect(
        prisma.cohortPlacement.create({
          data: {
            academy_enrollment_id: enrollment.id,
            cohort_id: cohort2.id,
            user_id: user.id,
            academy_id: academy.id,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('unique constraint: cohort_id + user_id', () => {
    it('rejects duplicate user in same cohort', async () => {
      const enrollment2 = await createEnrollment();
      await prisma.cohortPlacement.create({
        data: {
          academy_enrollment_id: enrollment.id,
          cohort_id: cohort.id,
          user_id: user.id,
          academy_id: academy.id,
        },
      });

      await expect(
        prisma.cohortPlacement.create({
          data: {
            academy_enrollment_id: enrollment2.id,
            cohort_id: cohort.id,
            user_id: user.id,
            academy_id: academy.id,
          },
        }),
      ).rejects.toThrow();
    });
  });
});
