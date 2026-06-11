/**
 * Unit Tests: CohortPlacementRepository (error paths and mocked scenarios)
 * Complements cohortPlacementRepository.test.js (integration tests) by covering:
 * - transferPlacement throws when the source placement is not found
 * - createPlacement sets notes to null when not provided
 * - All methods propagate database errors
 * - findByCohort includes user and academy_enrollment relations
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
const mockPrisma = {
  $transaction: vi.fn(),
  cohortPlacement: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }),
}));

const { CohortPlacementRepository } = await import('../../../../src/repositories/cohorts/cohortPlacementRepository.js');

describe('CohortPlacementRepository — unit tests (error paths)', () => {
  let repo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new CohortPlacementRepository();
  });

  // ----------------------------------------------------------
  describe('createPlacement', () => {
    it('passes notes=null when notes is undefined', async () => {
      const placement = {
        id: 1,
        academy_enrollment_id: 10,
        cohort_id: 20,
        user_id: 5,
        academy_id: 3,
        notes: null,
      };
      mockPrisma.cohortPlacement.create.mockResolvedValue(placement);

      const result = await repo.createPlacement({
        academyEnrollmentId: 10,
        cohortId: 20,
        userId: 5,
        academyId: 3,
        // notes not provided
      });

      expect(mockPrisma.cohortPlacement.create).toHaveBeenCalledWith({
        data: {
          academy_enrollment_id: 10,
          cohort_id: 20,
          user_id: 5,
          academy_id: 3,
          notes: null,
        },
      });
      expect(result.notes).toBeNull();
    });

    it('passes notes value when provided', async () => {
      const placement = { id: 1, notes: 'Scholarship student', academy_enrollment_id: 10 };
      mockPrisma.cohortPlacement.create.mockResolvedValue(placement);

      await repo.createPlacement({
        academyEnrollmentId: 10,
        cohortId: 20,
        userId: 5,
        academyId: 3,
        notes: 'Scholarship student',
      });

      expect(mockPrisma.cohortPlacement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ notes: 'Scholarship student' }),
      });
    });

    it('propagates database errors', async () => {
      mockPrisma.cohortPlacement.create.mockRejectedValue(new Error('Unique constraint failed'));

      await expect(
        repo.createPlacement({ academyEnrollmentId: 10, cohortId: 20, userId: 5, academyId: 3 }),
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  // ----------------------------------------------------------
  describe('findByEnrollmentId', () => {
    it('queries by academy_enrollment_id', async () => {
      const placement = { id: 1, academy_enrollment_id: 42 };
      mockPrisma.cohortPlacement.findUnique.mockResolvedValue(placement);

      const result = await repo.findByEnrollmentId(42);

      expect(mockPrisma.cohortPlacement.findUnique).toHaveBeenCalledWith({
        where: { academy_enrollment_id: 42 },
      });
      expect(result.academy_enrollment_id).toBe(42);
    });

    it('returns null when not found', async () => {
      mockPrisma.cohortPlacement.findUnique.mockResolvedValue(null);

      const result = await repo.findByEnrollmentId(9999);

      expect(result).toBeNull();
    });

    it('propagates database errors', async () => {
      mockPrisma.cohortPlacement.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(repo.findByEnrollmentId(42)).rejects.toThrow('DB error');
    });
  });

  // ----------------------------------------------------------
  describe('findByUserCohort', () => {
    it('queries using composite unique key', async () => {
      const placement = { id: 1, cohort_id: 5, user_id: 10 };
      mockPrisma.cohortPlacement.findUnique.mockResolvedValue(placement);

      const result = await repo.findByUserCohort(10, 5);

      expect(mockPrisma.cohortPlacement.findUnique).toHaveBeenCalledWith({
        where: { cohort_id_user_id: { cohort_id: 5, user_id: 10 } },
      });
      expect(result).toEqual(placement);
    });

    it('returns null when user not in cohort', async () => {
      mockPrisma.cohortPlacement.findUnique.mockResolvedValue(null);

      const result = await repo.findByUserCohort(99, 99);

      expect(result).toBeNull();
    });
  });

  // ----------------------------------------------------------
  describe('findByCohort', () => {
    it('fetches placements ordered by created_at asc with relations', async () => {
      const placements = [
        {
          id: 1,
          cohort_id: 5,
          user: { id: 10, first_name: 'Alice', last_name: 'Smith', email: 'alice@test.com', avatar: null },
          academy_enrollment: { id: 20, status: 'active', completed_at: null },
        },
      ];
      mockPrisma.cohortPlacement.findMany.mockResolvedValue(placements);

      const result = await repo.findByCohort(5);

      expect(mockPrisma.cohortPlacement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { cohort_id: 5 },
          orderBy: { created_at: 'asc' },
          include: expect.objectContaining({
            user: expect.anything(),
            academy_enrollment: expect.anything(),
          }),
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('returns empty array when no placements in cohort', async () => {
      mockPrisma.cohortPlacement.findMany.mockResolvedValue([]);

      const result = await repo.findByCohort(999);

      expect(result).toEqual([]);
    });

    it('propagates database errors', async () => {
      mockPrisma.cohortPlacement.findMany.mockRejectedValue(new Error('Table does not exist'));

      await expect(repo.findByCohort(5)).rejects.toThrow('Table does not exist');
    });
  });

  // ----------------------------------------------------------
  describe('deletePlacement', () => {
    it('deletes by id and returns deleted record', async () => {
      const deleted = { id: 1, cohort_id: 5, user_id: 10 };
      mockPrisma.cohortPlacement.delete.mockResolvedValue(deleted);

      const result = await repo.deletePlacement(1);

      expect(mockPrisma.cohortPlacement.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(deleted);
    });

    it('propagates error when record not found', async () => {
      mockPrisma.cohortPlacement.delete.mockRejectedValue(new Error('Record not found'));

      await expect(repo.deletePlacement(9999)).rejects.toThrow('Record not found');
    });
  });

  // ----------------------------------------------------------
  describe('transferPlacement', () => {
    it('throws when source placement does not exist', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          cohortPlacement: {
            findUnique: vi.fn().mockResolvedValue(null), // not found
            delete: vi.fn(),
            create: vi.fn(),
          },
        };
        return fn(tx);
      });

      await expect(repo.transferPlacement(999, 5)).rejects.toThrow('CohortPlacement 999 not found');
    });

    it('deletes old and creates new placement atomically', async () => {
      const existingPlacement = {
        id: 1,
        academy_enrollment_id: 10,
        cohort_id: 3,
        user_id: 5,
        academy_id: 2,
        notes: 'original note',
      };
      const newPlacement = { ...existingPlacement, id: 2, cohort_id: 7 };

      let capturedTx;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          cohortPlacement: {
            findUnique: vi.fn().mockResolvedValue(existingPlacement),
            delete: vi.fn().mockResolvedValue(existingPlacement),
            create: vi.fn().mockResolvedValue(newPlacement),
          },
        };
        capturedTx = tx;
        return fn(tx);
      });

      const result = await repo.transferPlacement(1, 7);

      expect(capturedTx.cohortPlacement.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(capturedTx.cohortPlacement.create).toHaveBeenCalledWith({
        data: {
          academy_enrollment_id: 10,
          cohort_id: 7,
          user_id: 5,
          academy_id: 2,
          notes: 'original note',
        },
      });
      expect(result.cohort_id).toBe(7);
    });

    it('preserves all fields from original placement in new placement', async () => {
      const existingPlacement = {
        id: 1,
        academy_enrollment_id: 10,
        cohort_id: 3,
        user_id: 5,
        academy_id: 2,
        notes: 'Transfer note',
      };

      let createArgs;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          cohortPlacement: {
            findUnique: vi.fn().mockResolvedValue(existingPlacement),
            delete: vi.fn().mockResolvedValue(existingPlacement),
            create: vi.fn().mockImplementation((args) => {
              createArgs = args;
              return { ...existingPlacement, cohort_id: 9 };
            }),
          },
        };
        return fn(tx);
      });

      await repo.transferPlacement(1, 9);

      expect(createArgs.data.academy_enrollment_id).toBe(10);
      expect(createArgs.data.user_id).toBe(5);
      expect(createArgs.data.academy_id).toBe(2);
      expect(createArgs.data.notes).toBe('Transfer note');
    });

    it('propagates transaction errors', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(repo.transferPlacement(1, 5)).rejects.toThrow('Transaction failed');
    });
  });
});