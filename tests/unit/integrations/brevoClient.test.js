import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: vi.fn().mockImplementation(function () {
    this.transactionalEmails = {
      sendTransacEmail: vi.fn().mockResolvedValue({
        messageId: '<test-message-id@relay.domain.com>',
      }),
    };
  }),
}));

vi.mock('../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), error: vi.fn() }),
}));

process.env.BREVO_API_KEY = 'test-api-key';
process.env.EMAIL_FROM_ADDRESS = 'noreply@test.com';
process.env.EMAIL_FROM_NAME = 'Rise Social';

const { sendEmail } = await import('../../../src/integrations/brevoClient.js');
const { BrevoClient } = await import('@getbrevo/brevo');

// Capture the instance and spy created when brevoClient.js was loaded
const brevoInstance = BrevoClient.mock.instances[0];
const sendTransacEmailSpy = brevoInstance.transactionalEmails.sendTransacEmail;

describe('brevoClient', () => {
  beforeEach(() => {
    sendTransacEmailSpy.mockClear();
    sendTransacEmailSpy.mockResolvedValue({ messageId: '<test-message-id@relay.domain.com>' });
  });

  it('should call sendTransacEmail with correct payload', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      toName: 'John Doe',
      subject: 'Test Subject',
      htmlContent: '<p>Hello</p>',
    });

    expect(sendTransacEmailSpy).toHaveBeenCalledWith({
      sender: { name: 'Rise Social', email: 'noreply@test.com' },
      to: [{ email: 'user@example.com', name: 'John Doe' }],
      subject: 'Test Subject',
      htmlContent: '<p>Hello</p>',
    });
    expect(result.messageId).toBe('<test-message-id@relay.domain.com>');
  });

  it('should initialize BrevoClient with API key from env', () => {
    expect(BrevoClient).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
  });

  it('should propagate SDK errors', async () => {
    sendTransacEmailSpy.mockRejectedValueOnce(
      Object.assign(new Error('Invalid API key'), { statusCode: 401 }),
    );

    await expect(
      sendEmail({ to: 'user@example.com', toName: 'John', subject: 'Test', htmlContent: '<p>hi</p>' }),
    ).rejects.toThrow('Invalid API key');
  });
});
