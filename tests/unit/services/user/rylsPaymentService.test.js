/**
 * Unit Tests: RylsPaymentService
 * Tests 3-layer payment creation logic with mocked dependencies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---
const mockMidtransService = {
  createSnapTransaction: vi.fn(),
};

const mockRylsPaymentRepository = {
  getNextSequenceNumber: vi.fn(),
  findByRegistrationId: vi.fn(),
};

const mockPrisma = {
  $transaction: vi.fn(),
};

vi.mock('../../../../src/services/shared/MidtransService.js', () => ({
  midtransService: mockMidtransService,
}));

vi.mock('../../../../src/repositories/user/rylsPaymentRepository.js', () => ({
  rylsPaymentRepository: mockRylsPaymentRepository,
}));

vi.mock('../../../../src/repositories/user/rylsRegistrationRepository.js', () => ({
  rylsRegistrationRepository: {},
}));

vi.mock('../../../../src/repositories/shared/transactionRepository.js', () => ({
  transactionRepository: {},
}));

vi.mock('../../../../src/repositories/shared/midtransTransactionRepository.js', () => ({
  midtransTransactionRepository: {},
}));

vi.mock('../../../../src/repositories/shared/transactionItemRepository.js', () => ({
  transactionItemRepository: {},
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

vi.mock('../../../../src/constants/payments.js', () => ({
  getPaymentAmountIdr: vi.fn().mockResolvedValue(11250000),
  getItemTemplate: vi.fn().mockReturnValue({ id: 'RYLS-SF', name: 'RYLS Self Funded', category: 'scholarship' }),
}));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() }),
}));

const { RylsPaymentService } = await import('../../../../src/services/user/rylsPaymentService.js');

// ============================================================
describe('RylsPaymentService', () => {
  let service;

  const baseRegistrationData = {
    registrationId: 1,
    fullName: 'Budi Santoso',
    email: 'budi@example.com',
    whatsapp: '081234567890',
    residence: 'Jakarta',
    scholarshipType: 'SELF_FUNDED',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RylsPaymentService();
    mockRylsPaymentRepository.getNextSequenceNumber.mockResolvedValue(1);
  });

  // ----------------------------------------------------------
  describe('createTransaction (MIDTRANS)', () => {
    beforeEach(() => {
      mockMidtransService.createSnapTransaction.mockResolvedValue({
        token: 'snap-token-abc',
        redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-abc',
      });

      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          transaction: {
            create: vi.fn().mockResolvedValue({ id: 10, amount: 11250000, status: 'pending' }),
          },
          transactionItem: { create: vi.fn().mockResolvedValue({}) },
          midtransTransaction: { create: vi.fn().mockResolvedValue({}) },
          rylsPayment: { create: vi.fn().mockResolvedValue({ id: 20 }) },
        };
        return fn(tx);
      });
    });

    it('should return payment_id, transaction_code, token, and redirect_url', async () => {
      const result = await service.createTransaction({ type: 'MIDTRANS', data: baseRegistrationData });

      expect(result).toHaveProperty('payment_id');
      expect(result).toHaveProperty('transaction_code');
      expect(result.token).toBe('snap-token-abc');
      expect(result.redirect_url).toContain('midtrans');
      expect(result.currency).toBe('IDR');
      expect(result.amount).toBe(11250000);
    });

    it('transaction code should match RYLS format', async () => {
      const result = await service.createTransaction({ type: 'MIDTRANS', data: baseRegistrationData });

      // Format: RYLS + 2-digit seq + 8-char hex → total 14 chars
      expect(result.transaction_code).toMatch(/^RYLS\d{2}[A-F0-9]{8}$/i);
    });

    it('should call getNextSequenceNumber to generate code', async () => {
      await service.createTransaction({ type: 'MIDTRANS', data: baseRegistrationData });

      expect(mockRylsPaymentRepository.getNextSequenceNumber).toHaveBeenCalledOnce();
    });

    it('should call midtransService.createSnapTransaction', async () => {
      await service.createTransaction({ type: 'MIDTRANS', data: baseRegistrationData });

      expect(mockMidtransService.createSnapTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          grossAmount: 11250000,
          customerDetails: expect.objectContaining({ email: 'budi@example.com' }),
        })
      );
    });

    it('should throw when Midtrans API fails', async () => {
      mockMidtransService.createSnapTransaction.mockRejectedValue(new Error('Midtrans unavailable'));

      await expect(service.createTransaction({ type: 'MIDTRANS', data: baseRegistrationData }))
        .rejects.toThrow('Failed to create payment');
    });
  });

  // ----------------------------------------------------------
  describe('createTransaction (PAYPAL)', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          transaction: {
            create: vi.fn().mockResolvedValue({ id: 11, amount: 11250000, status: 'paid', paid_at: new Date() }),
          },
          transactionItem: { create: vi.fn().mockResolvedValue({}) },
          rylsPayment: { create: vi.fn().mockResolvedValue({ id: 21 }) },
        };
        return fn(tx);
      });
    });

    it('should return token=null and redirect_url=null', async () => {
      const result = await service.createTransaction({ type: 'PAYPAL', data: baseRegistrationData });

      expect(result.token).toBeNull();
      expect(result.redirect_url).toBeNull();
    });

    it('should return transaction_code, amount, currency', async () => {
      const result = await service.createTransaction({ type: 'PAYPAL', data: baseRegistrationData });

      expect(result).toHaveProperty('transaction_code');
      expect(result.amount).toBe(11250000);
      expect(result.currency).toBe('IDR');
    });

    it('should NOT call midtransService', async () => {
      await service.createTransaction({ type: 'PAYPAL', data: baseRegistrationData });

      expect(mockMidtransService.createSnapTransaction).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  describe('createTransaction (invalid type)', () => {
    it('should throw on unknown payment type', async () => {
      await expect(service.createTransaction({ type: 'STRIPE', data: baseRegistrationData }))
        .rejects.toThrow('Failed to create payment');
    });
  });

  // ----------------------------------------------------------
  describe('getPaymentStatus', () => {
    it('should return hasPayment=false when no payments exist', async () => {
      mockRylsPaymentRepository.findByRegistrationId.mockResolvedValue([]);

      const result = await service.getPaymentStatus(1);

      expect(result.hasPayment).toBe(false);
      expect(result.status).toBeNull();
    });

    it('should return latest payment status when payments exist', async () => {
      mockRylsPaymentRepository.findByRegistrationId.mockResolvedValue([
        {
          id: 5,
          transaction: {
            status: 'pending',
            transaction_code: 'RYLS01ABCD1234',
            amount: 11250000,
            currency: 'IDR',
            payment_method: 'midtrans',
            paid_at: null,
            created_at: new Date('2026-01-01'),
          },
        },
      ]);

      const result = await service.getPaymentStatus(1);

      expect(result.hasPayment).toBe(true);
      expect(result.status).toBe('pending');
      expect(result.transactionCode).toBe('RYLS01ABCD1234');
      expect(result.amount).toBe(11250000);
    });

    it('should return paid status for completed payment', async () => {
      const paidAt = new Date('2026-01-05');
      mockRylsPaymentRepository.findByRegistrationId.mockResolvedValue([
        {
          id: 6,
          transaction: {
            status: 'paid',
            transaction_code: 'RYLS02EFGH5678',
            amount: 11250000,
            currency: 'IDR',
            payment_method: 'paypal_manual',
            paid_at: paidAt,
            created_at: new Date('2026-01-04'),
          },
        },
      ]);

      const result = await service.getPaymentStatus(2);

      expect(result.status).toBe('paid');
      expect(result.paidAt).toEqual(paidAt);
    });

    it('should propagate error from repository', async () => {
      mockRylsPaymentRepository.findByRegistrationId.mockRejectedValue(new Error('Query failed'));

      await expect(service.getPaymentStatus(1)).rejects.toThrow('Query failed');
    });
  });
});
