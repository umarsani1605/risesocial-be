import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

const MOCK_SERVER_KEY = 'test-server-key';

vi.mock('../../../src/integrations/midtransClient.js', () => ({
  snap: {},
  getServerKey: vi.fn().mockReturnValue(MOCK_SERVER_KEY),
}));

vi.mock('../../../src/repositories/rylsPaymentRepository.js', () => ({
  RylsPaymentRepository: vi.fn().mockImplementation(() => ({
    findByOrderId: vi.fn().mockResolvedValue({
      id: 1,
      registration_id: 10,
      transaction_status: 'pending',
    }),
    updateByOrderId: vi.fn().mockResolvedValue({
      id: 1,
      order_id: 'RYLS-001',
      gross_amount_idr: 500000,
      currency: 'IDR',
      registration: {
        id: 10,
        full_name: 'John Doe',
        email: 'john@example.com',
      },
    }),
  })),
}));

vi.mock('../../../src/repositories/rylsRegistrationRepository.js', () => ({
  RylsRegistrationRepository: vi.fn().mockImplementation(() => ({
    updateStatus: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../../../src/constants/payments.js', () => ({
  generateOrderId: vi.fn().mockReturnValue('RYLS-001'),
  getPaymentAmountIdr: vi.fn().mockResolvedValue(500000),
  getItemTemplate: vi.fn().mockReturnValue({ id: 'item-1', name: 'Test', category: 'Test' }),
  mapTransactionStatus: vi.fn().mockReturnValue('PAID'),
  mapFraudStatus: vi.fn().mockReturnValue('ACCEPTED'),
  WEBHOOK_CONFIG: { SIGNATURE_ALGORITHM: 'sha512', TIMEOUT_MS: 30000, RETRY_ATTEMPTS: 3 },
}));

vi.mock('../../../src/services/emailService.js', () => ({
  emailService: {
    sendPaymentConfirmation: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../src/lib/loggerContext.js', () => ({
  getLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  }),
}));

function buildValidSignature(orderId, statusCode, grossAmount) {
  return crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${MOCK_SERVER_KEY}`)
    .digest('hex');
}

describe('RylsPaymentService — payment confirmation email hook', () => {
  let service;
  let emailService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { RylsPaymentService } = await import('../../../src/services/rylsPaymentService.js');
    const emailModule = await import('../../../src/services/emailService.js');
    service = new RylsPaymentService();
    emailService = emailModule.emailService;
  });

  it('should fire payment confirmation email when status is settlement', async () => {
    const orderId = 'RYLS-001';
    const statusCode = '200';
    const grossAmount = '500000.00';

    const notificationData = {
      order_id: orderId,
      transaction_status: 'settlement',
      transaction_id: 'txn-123',
      payment_type: 'bank_transfer',
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: buildValidSignature(orderId, statusCode, grossAmount),
    };

    await service.handleWebhookNotification(notificationData);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emailService.sendPaymentConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'john@example.com',
        name: 'John Doe',
        transactionCode: 'RYLS-001',
        amount: 500000,
      }),
    );
  });

  it('should NOT fire email when status is pending', async () => {
    const orderId = 'RYLS-001';
    const statusCode = '201';
    const grossAmount = '500000.00';

    const notificationData = {
      order_id: orderId,
      transaction_status: 'pending',
      transaction_id: 'txn-123',
      payment_type: 'bank_transfer',
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: buildValidSignature(orderId, statusCode, grossAmount),
    };

    await service.handleWebhookNotification(notificationData);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emailService.sendPaymentConfirmation).not.toHaveBeenCalled();
  });

  it('should not throw if email sending fails', async () => {
    emailService.sendPaymentConfirmation.mockRejectedValueOnce(new Error('Brevo down'));

    const orderId = 'RYLS-001';
    const statusCode = '200';
    const grossAmount = '500000.00';

    const notificationData = {
      order_id: orderId,
      transaction_status: 'settlement',
      transaction_id: 'txn-123',
      payment_type: 'bank_transfer',
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: buildValidSignature(orderId, statusCode, grossAmount),
    };

    await expect(service.handleWebhookNotification(notificationData)).resolves.toBeDefined();
  });
});
