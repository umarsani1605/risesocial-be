import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAdminTransactionRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
};

const mockAcademyEnrollmentRepository = {
  ensureForPaidTransaction: vi.fn(),
};

const mockPrisma = {
  transaction: { findUnique: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock('../../../../src/repositories/admin/transactionRepository.js', () => ({
  adminTransactionRepository: mockAdminTransactionRepository,
}));

vi.mock('../../../../src/repositories/cohorts/academyEnrollmentRepository.js', () => ({
  academyEnrollmentRepository: mockAcademyEnrollmentRepository,
}));

vi.mock('../../../../src/services/shared/MidtransService.js', () => ({
  midtransService: {},
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const { AdminTransactionService } = await import('../../../../src/services/admin/transactionService.js');

describe('AdminTransactionService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminTransactionService();
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 20,
      provider: 'midtrans',
      product_type: 'academy_enrollment',
    });
    mockAdminTransactionRepository.findById.mockResolvedValue({
      id: 20,
      transaction_code: 'AE0100000001',
      amount: 3000000,
      currency: 'IDR',
      status: 'paid',
      provider: 'midtrans',
      payment_method: null,
      created_at: new Date(),
      paid_at: new Date(),
      expired_at: null,
      user: null,
      items: [],
      academy_enrollment: null,
      ryls_payment: null,
    });
    mockAcademyEnrollmentRepository.ensureForPaidTransaction.mockResolvedValue({ id: 50 });
  });

  it('creates academy enrollment when status is manually changed to paid', async () => {
    let capturedTx;
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      capturedTx = {
        transaction: { update: vi.fn().mockResolvedValue({}) },
        midtransTransaction: {
          findUnique: vi.fn().mockResolvedValue({ id: 99 }),
          update: vi.fn().mockResolvedValue({}),
        },
        rylsPayment: { findUnique: vi.fn().mockResolvedValue(null) },
      };
      return fn(capturedTx);
    });

    await service.updateStatusManually(20, 'paid');

    expect(capturedTx.transaction.update).toHaveBeenCalled();
    expect(mockAcademyEnrollmentRepository.ensureForPaidTransaction).toHaveBeenCalledWith(capturedTx, 20);
  });

  it('does not create academy enrollment when status is changed to failed', async () => {
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      const tx = {
        transaction: { update: vi.fn().mockResolvedValue({}) },
        midtransTransaction: {
          findUnique: vi.fn().mockResolvedValue({ id: 99 }),
          update: vi.fn().mockResolvedValue({}),
        },
        rylsPayment: { findUnique: vi.fn().mockResolvedValue(null) },
      };
      return fn(tx);
    });

    await service.updateStatusManually(20, 'failed');

    expect(mockAcademyEnrollmentRepository.ensureForPaidTransaction).not.toHaveBeenCalled();
  });
});
