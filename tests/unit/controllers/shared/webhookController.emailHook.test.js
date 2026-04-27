import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/services/shared/MidtransService.js', () => ({
  midtransService: { verifyWebhookSignature: vi.fn().mockReturnValue(true) },
}));

vi.mock('../../../../src/repositories/shared/transactionRepository.js', () => ({
  transactionRepository: {},
}));

vi.mock('../../../../src/constants/paymentHelpers.js', () => ({
  mapMidtransStatus: vi.fn().mockReturnValue('paid'),
  mapPaymentMethod: vi.fn().mockReturnValue('bank_transfer'),
}));

vi.mock('../../../../src/services/shared/emailService.js', () => ({
  emailService: {
    sendPaymentConfirmation: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: {
    $transaction: vi.fn().mockImplementation(async (fn) => {
      const tx = {
        transaction: {
          update: vi.fn().mockResolvedValue({ id: 1 }),
        },
        midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
        rylsPayment: { findUnique: vi.fn().mockResolvedValue(null) },
        cohortEnrollment: { findFirst: vi.fn().mockResolvedValue(null) },
      };
      return fn(tx);
    }),
    transaction: {
      findUnique: vi.fn().mockResolvedValue({
        customer_email: 'user@example.com',
        customer_name: 'John Doe',
        amount: 500000,
        currency: 'IDR',
      }),
    },
  },
}));

describe('WebhookController — payment email hook', () => {
  let controller;
  let emailService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { WebhookController } = await import('../../../../src/controllers/shared/webhookController.js');
    const emailModule = await import('../../../../src/services/shared/emailService.js');
    controller = new WebhookController();
    emailService = emailModule.emailService;
  });

  it('should fire payment confirmation email when status is paid', async () => {
    const request = {
      body: {
        order_id: 'ACK01ABCD1234',
        transaction_status: 'settlement',
        transaction_id: 'txn-123',
        payment_type: 'bank_transfer',
        fraud_status: 'accept',
      },
    };
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };

    await controller.handleMidtransWebhook(request, reply);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emailService.sendPaymentConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        name: 'John Doe',
        transactionCode: 'ACK01ABCD1234',
        amount: 500000,
      }),
    );
  });

  it('should NOT fire email when status is not paid', async () => {
    const { mapMidtransStatus } = await import('../../../../src/constants/paymentHelpers.js');
    mapMidtransStatus.mockReturnValueOnce('pending');

    const request = {
      body: {
        order_id: 'ACK01ABCD1234',
        transaction_status: 'pending',
        transaction_id: 'txn-123',
        payment_type: 'bank_transfer',
      },
    };
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };

    await controller.handleMidtransWebhook(request, reply);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emailService.sendPaymentConfirmation).not.toHaveBeenCalled();
  });

  it('should not throw if email sending fails', async () => {
    emailService.sendPaymentConfirmation.mockRejectedValueOnce(new Error('Brevo down'));

    const request = {
      body: {
        order_id: 'ACK01ABCD1234',
        transaction_status: 'settlement',
        transaction_id: 'txn-123',
        payment_type: 'bank_transfer',
      },
    };
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };

    await controller.handleMidtransWebhook(request, reply);
    expect(reply.send).toHaveBeenCalled();
  });
});
