/**
 * Unit Tests: AcademyEnrollmentRepository (error paths and mocked scenarios)
 * Complements academyEnrollmentRepository.test.js (integration tests) by covering:
 * - Error propagation from Prisma calls
 * - updateStatus auto-sets completed_at only for 'completed' status
 * - updateStatus does NOT overwrite provided completed_at
 * - findActiveByUserAcademy filters correctly (only pending/active)
 * - getNextSequenceNumber returns 1 when no records exist
 * - findById includes placement and academy relations
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
const mockPrisma = {
  academyEnrollment: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }),
}));

const { AcademyEnrollmentRepository } = await import('../../../../src/repositories/cohorts/academyEnrollmentRepository.js');

describe('AcademyEnrollmentRepository — unit tests (error paths & mocked behavior)', () => {
  let repo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new AcademyEnrollmentRepository();
  });

  // ----------------------------------------------------------
  describe('createPendingEnrollment', () => {
    it('creates enrollment with correct fields', async () => {
      const enrollment = { id: 1, user_id: 10, academy_id: 5, transaction_id: 20, status: 'pending' };
      mockPrisma.academyEnrollment.create.mockResolvedValue(enrollment);

      const result = await repo.createPendingEnrollment(10, 5, 20);

      expect(mockPrisma.academyEnrollment.create).toHaveBeenCalledWith({
        data: {
          user_id: 10,
          academy_id: 5,
          transaction_id: 20,
          status: 'pending',
        },
      });
      expect(result.status).toBe('pending');
    });

    it('propagates database errors', async () => {
      mockPrisma.academyEnrollment.create.mockRejectedValue(new Error('Unique constraint failed on transaction_id'));

      await expect(repo.createPendingEnrollment(10, 5, 20)).rejects.toThrow('Unique constraint failed on transaction_id');
    });
  });

  // ----------------------------------------------------------
  describe('findActiveByUserAcademy', () => {
    it('queries with status filter for pending and active', async () => {
      mockPrisma.academyEnrollment.findFirst.mockResolvedValue(null);

      await repo.findActiveByUserAcademy(10, 5);

      expect(mockPrisma.academyEnrollment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: 10,
            academy_id: 5,
            status: { in: ['pending', 'active'] },
          }),
        }),
      );
    });

    it('includes transaction with midtrans_data in query', async () => {
      mockPrisma.academyEnrollment.findFirst.mockResolvedValue(null);

      await repo.findActiveByUserAcademy(10, 5);

      const callArgs = mockPrisma.academyEnrollment.findFirst.mock.calls[0][0];
      expect(callArgs.include).toHaveProperty('transaction');
      expect(callArgs.include.transaction.select).toHaveProperty('midtrans_data');
    });

    it('orders results by created_at desc (most recent first)', async () => {
      mockPrisma.academyEnrollment.findFirst.mockResolvedValue(null);

      await repo.findActiveByUserAcademy(10, 5);

      const callArgs = mockPrisma.academyEnrollment.findFirst.mock.calls[0][0];
      expect(callArgs.orderBy).toEqual({ created_at: 'desc' });
    });

    it('propagates database errors', async () => {
      mockPrisma.academyEnrollment.findFirst.mockRejectedValue(new Error('Connection timeout'));

      await expect(repo.findActiveByUserAcademy(10, 5)).rejects.toThrow('Connection timeout');
    });
  });

  // ----------------------------------------------------------
  describe('findById', () => {
    it('includes transaction, placement, academy, and user relations', async () => {
      const enrollment = {
        id: 1,
        user_id: 10,
        transaction: { id: 20 },
        placement: null,
        academy: { id: 5, title: 'Test Academy', slug: 'test-academy' },
        user: { id: 10, first_name: 'Alice', last_name: 'Smith', email: 'alice@test.com' },
      };
      mockPrisma.academyEnrollment.findUnique.mockResolvedValue(enrollment);

      const result = await repo.findById(1);

      expect(mockPrisma.academyEnrollment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.objectContaining({
          transaction: true,
          placement: true,
          academy: expect.anything(),
          user: expect.anything(),
        }),
      });
      expect(result.id).toBe(1);
    });

    it('returns null when enrollment does not exist', async () => {
      mockPrisma.academyEnrollment.findUnique.mockResolvedValue(null);

      const result = await repo.findById(9999);

      expect(result).toBeNull();
    });

    it('propagates database errors', async () => {
      mockPrisma.academyEnrollment.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(repo.findById(1)).rejects.toThrow('DB error');
    });
  });

  // ----------------------------------------------------------
  describe('getNextSequenceNumber', () => {
    it('returns 1 when no enrollments exist', async () => {
      const mockTx = {
        academyEnrollment: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const result = await repo.getNextSequenceNumber(mockTx);

      expect(result).toBe(1);
    });

    it('returns last id + 1 when enrollments exist', async () => {
      const mockTx = {
        academyEnrollment: {
          findFirst: vi.fn().mockResolvedValue({ id: 42 }),
        },
      };

      const result = await repo.getNextSequenceNumber(mockTx);

      expect(result).toBe(43);
    });

    it('queries by orderBy id desc to find last enrollment', async () => {
      const mockTx = {
        academyEnrollment: {
          findFirst: vi.fn().mockResolvedValue({ id: 10 }),
        },
      };

      await repo.getNextSequenceNumber(mockTx);

      expect(mockTx.academyEnrollment.findFirst).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
    });

    it('propagates errors from transaction context', async () => {
      const mockTx = {
        academyEnrollment: {
          findFirst: vi.fn().mockRejectedValue(new Error('TX error')),
        },
      };

      await expect(repo.getNextSequenceNumber(mockTx)).rejects.toThrow('TX error');
    });
  });

  // ----------------------------------------------------------
  describe('updateStatus', () => {
    it('updates status to active without setting completed_at', async () => {
      const updated = { id: 1, status: 'active', completed_at: null };
      mockPrisma.academyEnrollment.update.mockResolvedValue(updated);

      const result = await repo.updateStatus(1, 'active');

      expect(mockPrisma.academyEnrollment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'active' },
      });
      expect(result.status).toBe('active');
    });

    it('auto-sets completed_at when status is completed and not provided', async () => {
      const updated = { id: 1, status: 'completed', completed_at: new Date() };
      mockPrisma.academyEnrollment.update.mockResolvedValue(updated);

      await repo.updateStatus(1, 'completed');

      const callArgs = mockPrisma.academyEnrollment.update.mock.calls[0][0];
      expect(callArgs.data.completed_at).toBeInstanceOf(Date);
    });

    it('does NOT overwrite completed_at when explicitly provided via extra', async () => {
      const explicitDate = new Date('2026-01-01T00:00:00Z');
      const updated = { id: 1, status: 'completed', completed_at: explicitDate };
      mockPrisma.academyEnrollment.update.mockResolvedValue(updated);

      await repo.updateStatus(1, 'completed', { completed_at: explicitDate });

      const callArgs = mockPrisma.academyEnrollment.update.mock.calls[0][0];
      expect(callArgs.data.completed_at).toBe(explicitDate);
    });

    it('includes extra fields in update data', async () => {
      const updated = { id: 1, status: 'cancelled', notes: 'User requested' };
      mockPrisma.academyEnrollment.update.mockResolvedValue(updated);

      await repo.updateStatus(1, 'cancelled', { notes: 'User requested' });

      const callArgs = mockPrisma.academyEnrollment.update.mock.calls[0][0];
      expect(callArgs.data.notes).toBe('User requested');
      expect(callArgs.data.status).toBe('cancelled');
    });

    it('does NOT set completed_at for cancelled status', async () => {
      const updated = { id: 1, status: 'cancelled', completed_at: null };
      mockPrisma.academyEnrollment.update.mockResolvedValue(updated);

      await repo.updateStatus(1, 'cancelled');

      const callArgs = mockPrisma.academyEnrollment.update.mock.calls[0][0];
      expect(callArgs.data).not.toHaveProperty('completed_at');
    });

    it('propagates database errors', async () => {
      mockPrisma.academyEnrollment.update.mockRejectedValue(new Error('Record not found'));

      await expect(repo.updateStatus(9999, 'active')).rejects.toThrow('Record not found');
    });
  });
});