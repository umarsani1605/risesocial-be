import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: vi.fn().mockImplementation(() => ({
    transactionalEmails: {
      sendTransacEmail: vi.fn().mockResolvedValue({
        messageId: '<test-message-id@relay.domain.com>',
      }),
    },
  })),
}));

vi.mock('../../../src/lib/loggerContext.js', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('brevoClient', () => {
  beforeEach(() => {
    process.env.BREVO_API_KEY = 'test-api-key';
    process.env.EMAIL_FROM_ADDRESS = 'noreply@test.com';
    process.env.EMAIL_FROM_NAME = 'Rise Social';
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should call sendTransacEmail with correct payload', async () => {
    const { sendEmail } = await import('../../../src/integrations/brevoClient.js');
    const { BrevoClient } = await import('@getbrevo/brevo');
    const mockInstance = BrevoClient.mock.results[0].value;

    const result = await sendEmail({
      to: 'user@example.com',
      toName: 'John Doe',
      subject: 'Test Subject',
      htmlContent: '<p>Hello</p>',
    });

    expect(mockInstance.transactionalEmails.sendTransacEmail).toHaveBeenCalledWith({
      sender: { name: 'Rise Social', email: 'noreply@test.com' },
      to: [{ email: 'user@example.com', name: 'John Doe' }],
      subject: 'Test Subject',
      htmlContent: '<p>Hello</p>',
    });

    expect(result.messageId).toBe('<test-message-id@relay.domain.com>');
  });

  it('should initialize BrevoClient with API key from env', async () => {
    await import('../../../src/integrations/brevoClient.js');
    const { BrevoClient } = await import('@getbrevo/brevo');

    expect(BrevoClient).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
  });

  it('should propagate SDK errors', async () => {
    const { sendEmail } = await import('../../../src/integrations/brevoClient.js');
    const { BrevoClient } = await import('@getbrevo/brevo');
    const mockInstance = BrevoClient.mock.results[0].value;
    mockInstance.transactionalEmails.sendTransacEmail.mockRejectedValueOnce(
      Object.assign(new Error('Invalid API key'), { statusCode: 401 }),
    );

    await expect(
      sendEmail({ to: 'user@example.com', toName: 'John', subject: 'Test', htmlContent: '<p>hi</p>' }),
    ).rejects.toThrow('Invalid API key');
  });
});
