import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../src/services/shared/emailService.js', () => ({
  emailService: {
    sendCertificateReady: vi.fn().mockResolvedValue({ messageId: 'certificate-id' }),
  },
}));

vi.mock('../../../../src/services/admin/systemSettingsService.js', () => ({
  systemSettingsService: {},
}));

describe('AdminSystemSettingsController — email template test route', () => {
  let controller;
  let emailService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const controllerModule = await import('../../../../src/controllers/admin/systemSettingsController.js');
    const emailModule = await import('../../../../src/services/shared/emailService.js');
    controller = controllerModule.adminSystemSettingsController;
    emailService = emailModule.emailService;
  });

  it('should send certificate email to the fixed test recipient and return its status', async () => {
    const reply = { send: vi.fn() };

    await controller.sendTestEmailTemplates({}, reply);

    expect(emailService.sendCertificateReady).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'umarsani361@gmail.com' }),
    );

    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          recipient: 'umarsani361@gmail.com',
          results: [
            expect.objectContaining({ template: 'certificateReady', status: 'sent' }),
          ],
        }),
      }),
    );
  });
});
