import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/integrations/brevoClient.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
}));

vi.mock('../../../src/lib/loggerContext.js', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('EmailService', () => {
  let emailService;
  let sendEmail;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const serviceModule = await import('../../../src/services/emailService.js');
    const clientModule = await import('../../../src/integrations/brevoClient.js');
    emailService = serviceModule.emailService;
    sendEmail = clientModule.sendEmail;
  });

  describe('sendWelcome', () => {
    it('should call sendEmail with correct recipient and subject', async () => {
      await emailService.sendWelcome({ to: 'user@example.com', name: 'John Doe' });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          toName: 'John Doe',
          subject: expect.stringContaining('Selamat'),
          htmlContent: expect.stringContaining('John Doe'),
        }),
      );
    });
  });

  describe('sendPaymentConfirmation', () => {
    it('should call sendEmail with transaction code in HTML', async () => {
      await emailService.sendPaymentConfirmation({
        to: 'user@example.com',
        name: 'Jane',
        transactionCode: 'ACK01ABCD1234',
        amount: 500000,
        currency: 'IDR',
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          htmlContent: expect.stringContaining('ACK01ABCD1234'),
        }),
      );
    });
  });

  describe('sendCohortEnrollment', () => {
    it('should call sendEmail with cohort name in HTML', async () => {
      await emailService.sendCohortEnrollment({
        to: 'user@example.com',
        name: 'Budi',
        cohortName: 'Batch 3',
        academyTitle: 'Data Science Fundamentals',
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          htmlContent: expect.stringContaining('Batch 3'),
        }),
      );
    });
  });

  describe('sendCertificateReady', () => {
    it('should call sendEmail with cert code in HTML', async () => {
      await emailService.sendCertificateReady({
        to: 'user@example.com',
        name: 'Siti',
        cohortName: 'Batch 1',
        academyTitle: 'UI/UX Design',
        certCode: 'CERT-2026-0001',
        verifyUrl: 'https://rise.social/certificates/verify/CERT-2026-0001',
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          htmlContent: expect.stringContaining('CERT-2026-0001'),
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should throw when sendEmail fails', async () => {
      sendEmail.mockRejectedValueOnce(new Error('Brevo API error 500'));

      await expect(
        emailService.sendWelcome({ to: 'user@example.com', name: 'John' }),
      ).rejects.toThrow('Brevo API error 500');
    });
  });
});
