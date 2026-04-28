/**
 * Edge Case Tests: AcademyPaymentService
 *
 * Covers additional boundary and regression cases for the refactored
 * payment service that uses the new 3-layer payment architecture
 * (Transaction → MidtransTransaction → AcademyEnrollment).
 *
 * Specifically tests syncTransactionStatus for all Midtrans status values
 * that should map to a 'cancelled' enrollment status, and validates
 * edge cases in createTransaction.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockMidtransService = {
  createSnapTransaction: vi.fn(),
  cancelTransaction: vi.fn(),
  getTransactionStatus: vi.fn(),
};

const mockAcademyPaymentRepository = {
  getNextSequenceNumber: vi.fn(),
  findEnrollmentWithTransaction: vi.fn(),
};

const mockAcademyEnrollmentRepository = {
  findActiveByUserAcademy: vi.fn(),
};

const mockPrisma = {
  $transaction: vi.fn(),
  academy: { findFirst: vi.fn() },
  user: { findUnique: vi.fn() },
  transaction: { findFirst: vi.fn(), update: vi.fn() },
};

vi.mock('../../../../src/services/shared/MidtransService.js', () => ({
  midtransService: mockMidtransService,
}));

vi.mock('../../../../src/repositories/user/academyPaymentRepository.js', () => ({
  academyPaymentRepository: mockAcademyPaymentRepository,
}));

vi.mock('../../../../src/repositories/cohorts/academyEnrollmentRepository.js', () => ({
  academyEnrollmentRepository: mockAcademyEnrollmentRepository,
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() }),
}));

const { AcademyPaymentService } = await import('../../../../src/services/user/academyPaymentService.js');

// --- Fixtures ---

const baseAcademy = {
  id: 1,
  title: 'ESG Academy',
  status: 'ACTIVE',
  pricing: [{ id: 10, name: 'Standard', original_price: 5000000, discount_price: 0 }],
};

const baseUser = {
  id: 100,
  first_name: 'Andi',
  last_name: 'Wijaya',
  email: 'andi@example.com',
  phone: '081298765432',
};

const baseSnapResult = {
  token: 'new-snap-token',
  redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/new-snap-token',
};

const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

function makeTx() {
  return {
    transaction: { create: vi.fn().mockResolvedValue({ id: 20 }), update: vi.fn().mockResolvedValue({}) },
    transactionItem: { create: vi.fn().mockResolvedValue({}) },
    midtransTransaction: { create: vi.fn().mockResolvedValue({}) },
    academyEnrollment: {
      create: vi.fn().mockResolvedValue({ id: 50 }),
      update: vi.fn().mockResolvedValue({ id: 50 }),
    },
  };
}

function makeSyncTx(enrollmentStatus = 'pending') {
  const capturedTx = {
    transaction: { update: vi.fn().mockResolvedValue({}) },
    midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
    academyEnrollment: {
      findFirst: vi.fn().mockResolvedValue({ id: 50, status: enrollmentStatus }),
      update: vi.fn().mockResolvedValue({}),
    },
  };
  return capturedTx;
}

// ============================================================
describe('AcademyPaymentService - edge cases', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AcademyPaymentService();
    mockPrisma.academy.findFirst.mockResolvedValue(baseAcademy);
    mockPrisma.user.findUnique.mockResolvedValue(baseUser);
    mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue(null);
    mockAcademyPaymentRepository.getNextSequenceNumber.mockResolvedValue(5);
    mockMidtransService.createSnapTransaction.mockResolvedValue(baseSnapResult);
    mockMidtransService.cancelTransaction.mockResolvedValue({});
    mockPrisma.transaction.findFirst.mockResolvedValue({ id: 20, user_id: 100 });
  });

  // ----------------------------------------------------------
  describe('createTransaction - pricing edge cases', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation(async (fn) => fn(makeTx()));
    });

    it('uses original_price when discount_price is 0', async () => {
      // baseAcademy already has discount_price: 0
      const result = await service.createTransaction(100, 1, 10);

      expect(result.amount).toBe(5000000);
    });

    it('uses discount_price when it is non-zero', async () => {
      mockPrisma.academy.findFirst.mockResolvedValue({
        ...baseAcademy,
        pricing: [{ id: 10, name: 'Promo', original_price: 5000000, discount_price: 2500000 }],
      });

      const result = await service.createTransaction(100, 1, 10);

      expect(result.amount).toBe(2500000);
    });

    it('includes enrollment_id in the returned result', async () => {
      const result = await service.createTransaction(100, 1, 10);

      expect(result).toHaveProperty('enrollment_id');
      expect(typeof result.enrollment_id).toBe('number');
    });

    it('includes transaction_code in the returned result', async () => {
      const result = await service.createTransaction(100, 1, 10);

      expect(result).toHaveProperty('transaction_code');
      expect(typeof result.transaction_code).toBe('string');
      expect(result.transaction_code.length).toBeGreaterThan(0);
    });

    it('includes redirect_url from Midtrans snap result', async () => {
      const result = await service.createTransaction(100, 1, 10);

      expect(result.redirect_url).toBe(baseSnapResult.redirectUrl);
    });

    it('does not create AcademyEnrollment when academy status is not ACTIVE', async () => {
      mockPrisma.academy.findFirst.mockResolvedValue(null); // not active or not found

      await expect(service.createTransaction(100, 1, 10)).rejects.toThrow();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('handles pending enrollment with no expired_at (null expiry)', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue({
        id: 99,
        status: 'pending',
        transaction: {
          id: 5,
          transaction_code: 'AE05ABCD9999',
          amount: 5000000,
          expired_at: null, // no expiry set — treated as valid or expired depending on impl
          midtrans_data: { snap_token: 'token-no-expiry', redirect_url: 'https://old.url' },
        },
      });

      // When expired_at is null, the token could be considered valid or not depending on implementation.
      // The test should not throw — we're verifying graceful handling, not the exact result.
      const result = await service.createTransaction(100, 1, 10);
      expect(result).toHaveProperty('enrollment_id');
    });
  });

  // ----------------------------------------------------------
  describe('syncTransactionStatus - Midtrans status → enrollment status mapping', () => {
    const setupSyncMock = (midtransStatus) => {
      mockMidtransService.getTransactionStatus.mockResolvedValue({
        transaction_status: midtransStatus,
        transaction_id: 'mid-txn-test',
        payment_type: 'bank_transfer',
        fraud_status: 'accept',
      });
    };

    const captureAndRunSync = async () => {
      let capturedTx;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        capturedTx = makeSyncTx('pending');
        return fn(capturedTx);
      });
      await service.syncTransactionStatus('AE05ABCD9999', 100);
      return capturedTx;
    };

    it('maps "settlement" status to enrollment status "active"', async () => {
      setupSyncMock('settlement');
      const tx = await captureAndRunSync();

      expect(tx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'active' }) }),
      );
    });

    it('maps "capture" status to enrollment status "active"', async () => {
      setupSyncMock('capture');
      const tx = await captureAndRunSync();

      expect(tx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'active' }) }),
      );
    });

    it('maps "expire" status to enrollment status "cancelled"', async () => {
      setupSyncMock('expire');
      const tx = await captureAndRunSync();

      expect(tx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'cancelled' }) }),
      );
    });

    it('maps "deny" status to enrollment status "cancelled"', async () => {
      setupSyncMock('deny');
      const tx = await captureAndRunSync();

      expect(tx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'cancelled' }) }),
      );
    });

    it('maps "cancel" status to enrollment status "cancelled"', async () => {
      setupSyncMock('cancel');
      const tx = await captureAndRunSync();

      expect(tx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'cancelled' }) }),
      );
    });

    it('throws when transaction is not found in database', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.syncTransactionStatus('DOES-NOT-EXIST', 100)).rejects.toThrow();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws when transaction belongs to a different user', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null); // findFirst with user_id filter returns null

      await expect(service.syncTransactionStatus('AE05ABCD9999', 999)).rejects.toThrow();
    });

    it('calls Midtrans getTransactionStatus with the transaction code', async () => {
      setupSyncMock('settlement');
      mockPrisma.$transaction.mockImplementation(async (fn) => fn(makeSyncTx()));

      await service.syncTransactionStatus('AE05CODE1234', 100);

      expect(mockMidtransService.getTransactionStatus).toHaveBeenCalledWith('AE05CODE1234');
    });
  });

  // ----------------------------------------------------------
  describe('checkEnrollment - boundary cases', () => {
    it('returns snap_token as null when transaction has no midtrans_data', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue({
        id: 50,
        status: 'pending',
        transaction: {
          id: 5,
          status: 'pending',
          transaction_code: 'AE05ABCD1234',
          expired_at: futureDate,
          midtrans_data: null, // no midtrans data yet
        },
      });

      const result = await service.checkEnrollment(100, 1);

      // When midtrans_data is absent, snap_token should be null or undefined
      expect(result.snap_token == null).toBe(true);
    });

    it('returns hasPendingPayment true when enrollment status is pending regardless of token', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue({
        id: 50,
        status: 'pending',
        transaction: {
          id: 5,
          status: 'pending',
          transaction_code: 'AE05ABCD1234',
          expired_at: pastDate, // expired token
          midtrans_data: { snap_token: 'old-expired-token' },
        },
      });

      const result = await service.checkEnrollment(100, 1);

      expect(result.hasPendingPayment).toBe(true);
    });

    it('returns enrolled=false when enrollment is null (no record)', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue(null);

      const result = await service.checkEnrollment(100, 1);

      expect(result.enrolled).toBe(false);
    });
  });

  // ----------------------------------------------------------
  describe('getPaymentStatus - boundary cases', () => {
    it('returns currency from the enrollment transaction', async () => {
      mockAcademyPaymentRepository.findEnrollmentWithTransaction.mockResolvedValue({
        id: 50,
        status: 'active',
        created_at: new Date(),
        transaction: {
          status: 'paid',
          transaction_code: 'AE05ABCD1234',
          amount: 5000000,
          currency: 'IDR',
          payment_method: 'bank_transfer',
          paid_at: new Date(),
        },
      });

      const result = await service.getPaymentStatus(50, 100);

      expect(result.hasPayment).toBe(true);
      expect(result.currency).toBe('IDR');
    });

    it('returns payment_method from the transaction', async () => {
      mockAcademyPaymentRepository.findEnrollmentWithTransaction.mockResolvedValue({
        id: 50,
        status: 'active',
        created_at: new Date(),
        transaction: {
          status: 'paid',
          transaction_code: 'AE05ABCD1234',
          amount: 5000000,
          currency: 'IDR',
          payment_method: 'gopay',
          paid_at: new Date(),
        },
      });

      const result = await service.getPaymentStatus(50, 100);

      expect(result.payment_method).toBe('gopay');
    });
  });
});
