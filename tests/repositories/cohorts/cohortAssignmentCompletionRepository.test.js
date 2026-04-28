/**
 * Integration Tests: CohortAssignmentCompletion schema constraints
 *
 * Tests the new CohortAssignmentCompletion model added in migration
 * 20260417030713_add_assignment_title_and_completion_and_grades.
 *
 * Validates:
 *  - Creating completions
 *  - Unique constraint on (cohort_module_id, user_id)
 *  - Cascade delete when the parent module is deleted
 *  - Cascade delete when the parent user is deleted
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection } from '../../helpers/testDb.js';
import { createTestUser } from '../../helpers/userFixtures.js';
import { seedAcademy } from '../../helpers/academyFixtures.js';

let prisma;
let user;
let academy;
let cohort;
let cohortModule;

async function createCohort(overrides = {}) {
  return prisma.cohort.create({
    data: {
      academy_id: academy.id,
      name: `Cohort-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'not_started',
      ...overrides,
    },
  });
}

async function createCohortModule(overrides = {}) {
  return prisma.cohortModule.create({
    data: {
      academy_id: academy.id,
      cohort_id: cohort.id,
      title: `Module-${Date.now()}`,
      order: 1,
      ...overrides,
    },
  });
}

async function createCompletion(overrides = {}) {
  return prisma.cohortAssignmentCompletion.create({
    data: {
      cohort_module_id: cohortModule.id,
      user_id: user.id,
      ...overrides,
    },
  });
}

describe('CohortAssignmentCompletion schema constraints', { concurrent: false }, () => {
  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase();
    user = await createTestUser();
    academy = await seedAcademy();
    cohort = await createCohort();
    cohortModule = await createCohortModule();
  });

  afterAll(async () => {
    await closeConnection();
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('create completion', () => {
    it('creates a completion record with required fields', async () => {
      const completion = await createCompletion();

      expect(completion).toBeDefined();
      expect(completion.id).toBeDefined();
      expect(completion.cohort_module_id).toBe(cohortModule.id);
      expect(completion.user_id).toBe(user.id);
      expect(completion.completed_at).toBeInstanceOf(Date);
      expect(completion.created_at).toBeInstanceOf(Date);
    });

    it('sets completed_at to current timestamp by default', async () => {
      const before = new Date();
      const completion = await createCompletion();
      const after = new Date();

      expect(completion.completed_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(completion.completed_at.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('allows multiple different users to complete the same module', async () => {
      const user2 = await createTestUser();

      const c1 = await createCompletion({ user_id: user.id });
      const c2 = await createCompletion({ user_id: user2.id });

      expect(c1.user_id).toBe(user.id);
      expect(c2.user_id).toBe(user2.id);
    });

    it('allows the same user to complete different modules', async () => {
      const module2 = await createCohortModule({ order: 2 });

      const c1 = await createCompletion({ cohort_module_id: cohortModule.id });
      const c2 = await createCompletion({ cohort_module_id: module2.id });

      expect(c1.cohort_module_id).toBe(cohortModule.id);
      expect(c2.cohort_module_id).toBe(module2.id);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('unique constraint: (cohort_module_id, user_id)', () => {
    it('rejects duplicate completion for the same user and module', async () => {
      await createCompletion();

      await expect(createCompletion()).rejects.toThrow();
    });

    it('allows same user in different modules without conflict', async () => {
      const module2 = await createCohortModule({ order: 2 });

      await expect(
        Promise.all([
          createCompletion({ cohort_module_id: cohortModule.id }),
          createCompletion({ cohort_module_id: module2.id }),
        ]),
      ).resolves.toHaveLength(2);
    });

    it('allows same module with different users without conflict', async () => {
      const user2 = await createTestUser();

      await expect(
        Promise.all([
          createCompletion({ user_id: user.id }),
          createCompletion({ user_id: user2.id }),
        ]),
      ).resolves.toHaveLength(2);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('cascade delete: when cohort module is deleted', () => {
    it('deletes completion when its parent module is deleted', async () => {
      const completion = await createCompletion();

      // Delete the parent module
      await prisma.cohortModule.delete({ where: { id: cohortModule.id } });

      // Completion should be gone
      const found = await prisma.cohortAssignmentCompletion.findUnique({
        where: { id: completion.id },
      });
      expect(found).toBeNull();
    });

    it('only deletes completions belonging to the deleted module', async () => {
      const module2 = await createCohortModule({ order: 2 });
      const user2 = await createTestUser();

      // Completion for module1 (to be deleted)
      await createCompletion({ cohort_module_id: cohortModule.id, user_id: user.id });
      // Completion for module2 (should survive)
      const survives = await createCompletion({ cohort_module_id: module2.id, user_id: user2.id });

      await prisma.cohortModule.delete({ where: { id: cohortModule.id } });

      const found = await prisma.cohortAssignmentCompletion.findUnique({
        where: { id: survives.id },
      });
      expect(found).not.toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('cascade delete: when user is deleted', () => {
    it('deletes completion when its parent user is deleted', async () => {
      const completion = await createCompletion();

      // Delete the user (cascade should remove completion)
      await prisma.user.delete({ where: { id: user.id } });

      const found = await prisma.cohortAssignmentCompletion.findUnique({
        where: { id: completion.id },
      });
      expect(found).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('querying completions', () => {
    it('returns all completions for a given module', async () => {
      const user2 = await createTestUser();
      const user3 = await createTestUser();

      await createCompletion({ user_id: user.id });
      await createCompletion({ user_id: user2.id });
      await createCompletion({ user_id: user3.id });

      const completions = await prisma.cohortAssignmentCompletion.findMany({
        where: { cohort_module_id: cohortModule.id },
      });

      expect(completions).toHaveLength(3);
    });

    it('returns all completions for a given user', async () => {
      const module2 = await createCohortModule({ order: 2 });
      const module3 = await createCohortModule({ order: 3 });

      await createCompletion({ cohort_module_id: cohortModule.id });
      await createCompletion({ cohort_module_id: module2.id });
      await createCompletion({ cohort_module_id: module3.id });

      const completions = await prisma.cohortAssignmentCompletion.findMany({
        where: { user_id: user.id },
      });

      expect(completions).toHaveLength(3);
    });

    it('returns null when completion does not exist', async () => {
      const found = await prisma.cohortAssignmentCompletion.findUnique({
        where: {
          cohort_module_id_user_id: {
            cohort_module_id: cohortModule.id,
            user_id: user.id,
          },
        },
      });

      expect(found).toBeNull();
    });

    it('finds completion by compound unique key', async () => {
      const completion = await createCompletion();

      const found = await prisma.cohortAssignmentCompletion.findUnique({
        where: {
          cohort_module_id_user_id: {
            cohort_module_id: cohortModule.id,
            user_id: user.id,
          },
        },
      });

      expect(found).not.toBeNull();
      expect(found.id).toBe(completion.id);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('CohortModule new fields (session_end_time, assignment_deadline)', () => {
    it('stores session_end_time separately from session_start_time', async () => {
      const startTime = new Date('2026-05-01T09:00:00Z');
      const endTime = new Date('2026-05-01T11:00:00Z');

      const module = await createCohortModule({
        order: 2,
        session_start_time: startTime,
        session_end_time: endTime,
      });

      const found = await prisma.cohortModule.findUnique({ where: { id: module.id } });
      expect(found.session_start_time).toEqual(startTime);
      expect(found.session_end_time).toEqual(endTime);
    });

    it('allows session_end_time to be null', async () => {
      const module = await createCohortModule({
        order: 2,
        session_start_time: new Date('2026-05-01T09:00:00Z'),
        session_end_time: null,
      });

      const found = await prisma.cohortModule.findUnique({ where: { id: module.id } });
      expect(found.session_end_time).toBeNull();
    });

    it('stores assignment_title and assignment_deadline fields', async () => {
      const deadline = new Date('2026-05-08T23:59:00Z');

      const module = await createCohortModule({
        order: 2,
        assignment_title: 'Submit Carbon Report',
        assignment_deadline: deadline,
      });

      const found = await prisma.cohortModule.findUnique({ where: { id: module.id } });
      expect(found.assignment_title).toBe('Submit Carbon Report');
      expect(found.assignment_deadline).toEqual(deadline);
    });

    it('allows assignment fields to be null (optional)', async () => {
      const module = await createCohortModule({ order: 2 });

      const found = await prisma.cohortModule.findUnique({ where: { id: module.id } });
      expect(found.assignment_title).toBeNull();
      expect(found.assignment_deadline).toBeNull();
    });
  });
});