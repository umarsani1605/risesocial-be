/**
 * Additional Unit Tests: AcademyPaymentService
 * Covers edge cases not in academyPaymentService.test.js:
 * - syncTransactionStatus with pending midtrans status (enrollment stays same)
 * - syncTransactionStatus with cancel/deny status (enrollment → cancelled)
 * - createTransaction when existing enrollment has null expired_at (treated as expired)
 * - checkEnrollment when expired_at is null (snap_token should be null)
 * - createTransaction with very long academy title (item name truncated to 50 chars)
 * - createTransaction uses original_price when discount_price is 0
 * - getPaymentStatus when enrollment has no linked transaction
 * - syncTransactionStatus when no enrollment linked to transaction
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
  title: 'Web Development Bootcamp',
  status: 'ACTIVE',
  pricing: [{ id: 10, name: 'Standard', original_price: 3000000, discount_price: 0 }],
};

const baseUser = {
  id: 100,
  first_name: 'Budi',
  last_name: 'Santoso',
  email: 'budi@example.com',
  phone: '081234567890',
};

const baseSnapResult = {
  token: 'snap-token-xyz',
  redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-xyz',
};

const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

function makeTx({ enrollmentId = 50 } = {}) {
  return {
    transaction: { create: vi.fn().mockResolvedValue({ id: 20 }), update: vi.fn().mockResolvedValue({}) },
    transactionItem: { create: vi.fn().mockResolvedValue({}) },
    midtransTransaction: { create: vi.fn().mockResolvedValue({}) },
    academyEnrollment: {
      create: vi.fn().mockResolvedValue({ id: enrollmentId }),
      update: vi.fn().mockResolvedValue({ id: enrollmentId }),
    },
  };
}

// ============================================================
describe('AcademyPaymentService — additional edge cases', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AcademyPaymentService();
    mockPrisma.academy.findFirst.mockResolvedValue(baseAcademy);
    mockPrisma.user.findUnique.mockResolvedValue(baseUser);
    mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue(null);
    mockAcademyPaymentRepository.getNextSequenceNumber.mockResolvedValue(1);
    mockMidtransService.createSnapTransaction.mockResolvedValue(baseSnapResult);
    mockMidtransService.cancelTransaction.mockResolvedValue({});
    mockPrisma.$transaction.mockImplementation(async (fn) => fn(makeTx()));
  });

  // ----------------------------------------------------------
  describe('createTransaction — edge cases', () => {
    it('treats null expired_at as expired (resets enrollment)', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue({
        id: 99,
        status: 'pending',
        transaction: {
          id: 5,
          transaction_code: 'ACAD01OLD12345',
          amount: 3000000,
          expired_at: null, // null → treated as expired
          midtrans_data: { snap_token: 'old-token', redirect_url: 'https://old.url' },
        },
      });

      const result = await service.createTransaction(100, 1, 10);

      // Should cancel old transaction and create a new one
      expect(mockMidtransService.cancelTransaction).toHaveBeenCalledWith('ACAD01OLD12345');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('snap-token-xyz');
    });

    it('truncates item name to 50 characters for long academy titles', async () => {
      const longTitle = 'A'.repeat(60);
      const pricingName = 'Standard Package';
      mockPrisma.academy.findFirst.mockResolvedValue({
        id: 1,
        title: longTitle,
        status: 'ACTIVE',
        pricing: [{ id: 10, name: pricingName, original_price: 3000000, discount_price: 0 }],
      });

      const tx = makeTx();
      mockPrisma.$transaction.mockImplementation(async (fn) => fn(tx));

      await service.createTransaction(100, 1, 10);

      // Check transactionItem was created with a name <= 50 chars
      const createCall = tx.transactionItem.create.mock.calls[0][0];
      expect(createCall.data.product_name.length).toBeLessThanOrEqual(50);
    });

    it('uses original_price when discount_price is 0', async () => {
      mockPrisma.academy.findFirst.mockResolvedValue({
        ...baseAcademy,
        pricing: [{ id: 10, name: 'Standard', original_price: 5000000, discount_price: 0 }],
      });

      const result = await service.createTransaction(100, 1, 10);

      expect(result.amount).toBe(5000000);
    });

    it('uses discount_price when it is greater than 0', async () => {
      mockPrisma.academy.findFirst.mockResolvedValue({
        ...baseAcademy,
        pricing: [{ id: 10, name: 'Promo', original_price: 5000000, discount_price: 2500000 }],
      });

      const result = await service.createTransaction(100, 1, 10);

      expect(result.amount).toBe(2500000);
    });

    it('builds customer name from first_name and last_name', async () => {
      const tx = makeTx();
      mockPrisma.$transaction.mockImplementation(async (fn) => fn(tx));

      await service.createTransaction(100, 1, 10);

      const createCall = tx.transaction.create.mock.calls[0][0];
      expect(createCall.data.customer_name).toBe('Budi Santoso');
      expect(createCall.data.customer_email).toBe('budi@example.com');
    });

    it('falls back to "Customer" when user has no first/last name', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 100,
        first_name: '',
        last_name: '',
        email: 'anonymous@example.com',
        phone: null,
      });

      const tx = makeTx();
      mockPrisma.$transaction.mockImplementation(async (fn) => fn(tx));

      await service.createTransaction(100, 1, 10);

      const createCall = tx.transaction.create.mock.calls[0][0];
      expect(createCall.data.customer_name).toBe('Customer');
    });

    it('includes enrollment_id in return value', async () => {
      const tx = makeTx({ enrollmentId: 77 });
      mockPrisma.$transaction.mockImplementation(async (fn) => fn(tx));

      const result = await service.createTransaction(100, 1, 10);

      expect(result.enrollment_id).toBe(77);
    });

    it('sets product_type to academy_enrollment', async () => {
      const tx = makeTx();
      mockPrisma.$transaction.mockImplementation(async (fn) => fn(tx));

      await service.createTransaction(100, 1, 10);

      const createCall = tx.transaction.create.mock.calls[0][0];
      expect(createCall.data.product_type).toBe('academy_enrollment');
    });

    it('throws when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createTransaction(100, 1, 10)).rejects.toThrow('User not found');
    });
  });

  // ----------------------------------------------------------
  describe('syncTransactionStatus — edge cases', () => {
    const mockTransaction = { id: 20, user_id: 100 };

    beforeEach(() => {
      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
    });

    it('keeps enrollment status unchanged when midtrans status is pending', async () => {
      mockMidtransService.getTransactionStatus.mockResolvedValue({
        transaction_status: 'pending',
        transaction_id: 'mid-txn-pending',
        payment_type: 'bank_transfer',
      });

      let capturedTx;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          transaction: { update: vi.fn().mockResolvedValue({}) },
          midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
          academyEnrollment: {
            findFirst: vi.fn().mockResolvedValue({ id: 50, status: 'pending' }),
            update: vi.fn().mockResolvedValue({}),
          },
        };
        capturedTx = tx;
        return fn(tx);
      });

      await service.syncTransactionStatus('ACAD01ABCD1234', 100);

      // Enrollment update should be called with same status ('pending')
      expect(capturedTx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'pending' }),
        }),
      );
    });

    it('sets enrollment status to cancelled when midtrans status is cancel', async () => {
      mockMidtransService.getTransactionStatus.mockResolvedValue({
        transaction_status: 'cancel',
        transaction_id: 'mid-txn-cancel',
        payment_type: 'bank_transfer',
      });

      let capturedTx;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          transaction: { update: vi.fn().mockResolvedValue({}) },
          midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
          academyEnrollment: {
            findFirst: vi.fn().mockResolvedValue({ id: 50, status: 'pending' }),
            update: vi.fn().mockResolvedValue({}),
          },
        };
        capturedTx = tx;
        return fn(tx);
      });

      await service.syncTransactionStatus('ACAD01ABCD1234', 100);

      expect(capturedTx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'cancelled' }),
        }),
      );
    });

    it('sets enrollment status to cancelled when midtrans status is deny', async () => {
      mockMidtransService.getTransactionStatus.mockResolvedValue({
        transaction_status: 'deny',
        transaction_id: 'mid-txn-deny',
        payment_type: 'credit_card',
      });

      let capturedTx;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          transaction: { update: vi.fn().mockResolvedValue({}) },
          midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
          academyEnrollment: {
            findFirst: vi.fn().mockResolvedValue({ id: 50, status: 'pending' }),
            update: vi.fn().mockResolvedValue({}),
          },
        };
        capturedTx = tx;
        return fn(tx);
      });

      await service.syncTransactionStatus('ACAD01ABCD1234', 100);

      expect(capturedTx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'cancelled' }),
        }),
      );
    });

    it('does not call academyEnrollment.update when no enrollment is linked', async () => {
      mockMidtransService.getTransactionStatus.mockResolvedValue({
        transaction_status: 'settlement',
        transaction_id: 'mid-txn-001',
        payment_type: 'gopay',
      });

      let capturedTx;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          transaction: { update: vi.fn().mockResolvedValue({}) },
          midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
          academyEnrollment: {
            findFirst: vi.fn().mockResolvedValue(null), // no enrollment linked
            update: vi.fn().mockResolvedValue({}),
          },
        };
        capturedTx = tx;
        return fn(tx);
      });

      await service.syncTransactionStatus('ACAD01ABCD1234', 100);

      // Should not update enrollment when there's none linked
      expect(capturedTx.academyEnrollment.update).not.toHaveBeenCalled();
    });

    it('sets enrolled_at when payment is settled', async () => {
      mockMidtransService.getTransactionStatus.mockResolvedValue({
        transaction_status: 'settlement',
        transaction_id: 'mid-txn-001',
        payment_type: 'bank_transfer',
        bank: 'bca',
      });

      let capturedTx;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          transaction: { update: vi.fn().mockResolvedValue({}) },
          midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
          academyEnrollment: {
            findFirst: vi.fn().mockResolvedValue({ id: 50, status: 'pending' }),
            update: vi.fn().mockResolvedValue({}),
          },
        };
        capturedTx = tx;
        return fn(tx);
      });

      await service.syncTransactionStatus('ACAD01ABCD1234', 100);

      expect(capturedTx.academyEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'active',
            enrolled_at: expect.any(Date),
          }),
        }),
      );
    });

    it('returns status and payment_method', async () => {
      mockMidtransService.getTransactionStatus.mockResolvedValue({
        transaction_status: 'settlement',
        transaction_id: 'mid-txn-001',
        payment_type: 'gopay',
      });

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          transaction: { update: vi.fn().mockResolvedValue({}) },
          midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
          academyEnrollment: {
            findFirst: vi.fn().mockResolvedValue({ id: 50, status: 'pending' }),
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return fn(tx);
      });

      const result = await service.syncTransactionStatus('ACAD01ABCD1234', 100);

      expect(result).toHaveProperty('status', 'paid');
      expect(result).toHaveProperty('payment_method', 'GoPay');
    });
  });

  // ----------------------------------------------------------
  describe('checkEnrollment — edge cases', () => {
    it('treats null expired_at as expired (snap_token should be null)', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue({
        id: 50,
        status: 'pending',
        transaction: {
          id: 5,
          status: 'pending',
          transaction_code: 'ACAD01ABCD1234',
          expired_at: null, // null → expired
          midtrans_data: { snap_token: 'should-not-be-returned' },
        },
      });

      const result = await service.checkEnrollment(100, 1);

      expect(result.hasPendingPayment).toBe(true);
      expect(result.snap_token).toBeNull();
      expect(result.transaction_code).toBeNull();
    });

    it('returns payment_status from transaction when pending', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue({
        id: 50,
        status: 'pending',
        transaction: {
          id: 5,
          status: 'pending',
          transaction_code: 'ACAD01ABCD1234',
          expired_at: futureDate,
          midtrans_data: { snap_token: 'valid-snap-token' },
        },
      });

      const result = await service.checkEnrollment(100, 1);

      expect(result.payment_status).toBe('pending');
    });

    it('returns null payment_status when no transaction linked', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue({
        id: 50,
        status: 'pending',
        transaction: null,
      });

      const result = await service.checkEnrollment(100, 1);

      expect(result.payment_status).toBeNull();
    });

    it('returns enrollment_id in the result', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue({
        id: 77,
        status: 'active',
        transaction: null,
      });

      const result = await service.checkEnrollment(100, 1);

      expect(result.enrollment_id).toBe(77);
    });

    it('returns enrolled=false and no hasPendingPayment when no enrollment exists', async () => {
      mockAcademyEnrollmentRepository.findActiveByUserAcademy.mockResolvedValue(null);

      const result = await service.checkEnrollment(100, 1);

      expect(result).toEqual({ enrolled: false });
    });
  });

  // ----------------------------------------------------------
  describe('getPaymentStatus — edge cases', () => {
    it('returns hasPayment=true but status from enrollment when transaction has no status', async () => {
      mockAcademyPaymentRepository.findEnrollmentWithTransaction.mockResolvedValue({
        id: 50,
        status: 'active',
        created_at: new Date(),
        transaction: null, // no transaction
      });

      const result = await service.getPaymentStatus(50, 100);

      // hasPayment is based on !!enrollment.transaction
      expect(result.hasPayment).toBe(false);
      // status falls back to enrollment.status
      expect(result.status).toBe('active');
    });

    it('includes currency from transaction when available', async () => {
      mockAcademyPaymentRepository.findEnrollmentWithTransaction.mockResolvedValue({
        id: 50,
        status: 'active',
        created_at: new Date(),
        transaction: {
          status: 'paid',
          transaction_code: 'ACAD01ABCD1234',
          amount: 3000000,
          currency: 'IDR',
          payment_method: 'GoPay',
          paid_at: new Date(),
        },
      });

      const result = await service.getPaymentStatus(50, 100);

      expect(result.currency).toBe('IDR');
      expect(result.payment_method).toBe('GoPay');
    });

    it('defaults currency to IDR when transaction has no currency', async () => {
      mockAcademyPaymentRepository.findEnrollmentWithTransaction.mockResolvedValue({
        id: 50,
        status: 'pending',
        created_at: new Date(),
        transaction: {
          status: 'pending',
          transaction_code: 'ACAD01ABCD1234',
          amount: 3000000,
          currency: null,
          payment_method: null,
          paid_at: null,
        },
      });

      const result = await service.getPaymentStatus(50, 100);

      expect(result.currency).toBe('IDR');
    });
  });
});
