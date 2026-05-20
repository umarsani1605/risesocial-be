import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/integrations/brevoClient.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
}));


describe('EmailService', () => {
  let emailService;
  let sendEmail;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const serviceModule = await import('../../../../src/services/shared/emailService.js');
    const clientModule = await import('../../../../src/integrations/brevoClient.js');
    emailService = serviceModule.emailService;
    sendEmail = clientModule.sendEmail;
  });

  describe('sendCertificateReady', () => {
    it('should call sendEmail with certificate-only content and Rise branding', async () => {
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
          to: 'user@example.com',
          toName: 'Siti',
          subject: 'Sertifikat Kelulusan UI/UX Design',
          htmlContent: expect.stringContaining('UI/UX Design'),
        }),
      );
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          htmlContent: expect.not.stringContaining('Kode Sertifikat'),
        }),
      );
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          htmlContent: expect.stringContaining('https://risesocial.org/images/logo_white.png'),
        }),
      );
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          htmlContent: expect.stringContaining('background:#FF8E4F'),
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should throw when sendEmail fails', async () => {
      sendEmail.mockRejectedValueOnce(new Error('Brevo API error 500'));

      await expect(
        emailService.sendCertificateReady({
          to: 'user@example.com',
          name: 'John',
          cohortName: 'Batch 1',
          academyTitle: 'UI/UX Design',
          certCode: 'CERT-1',
          verifyUrl: 'https://risesocial.org/certificates/verify/CERT-1',
        }),
      ).rejects.toThrow('Brevo API error 500');
    });
  });
});
