import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/repositories/userRepository.js', () => ({
  userRepository: {
    emailExists: vi.fn().mockResolvedValue(false),
    usernameExists: vi.fn().mockResolvedValue(false),
    createWithSettings: vi.fn().mockResolvedValue({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      username: 'johndoe',
      role: 'USER',
      password: 'hashed',
    }),
  },
}));

vi.mock('../../../src/repositories/userSettingsRepository.js', () => ({
  userSettingsRepository: {},
}));

vi.mock('../../../src/services/fileUploadService.js', () => ({
  fileUploadService: {},
}));

vi.mock('../../../src/lib/jwt.js', () => ({
  generateToken: vi.fn().mockReturnValue('mock-token'),
}));

vi.mock('../../../src/services/emailService.js', () => ({
  emailService: {
    sendWelcome: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../src/lib/loggerContext.js', () => ({
  getLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('UserService — welcome email hook', () => {
  let service;
  let emailService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { UserService } = await import('../../../src/services/userService.js');
    const emailModule = await import('../../../src/services/emailService.js');
    service = new UserService();
    emailService = emailModule.emailService;
  });

  it('should fire welcome email after user creation (fire-and-forget)', async () => {
    const userData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    await service.createUser(userData);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emailService.sendWelcome).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'john@example.com' }),
    );
  });

  it('should not throw if welcome email fails', async () => {
    emailService.sendWelcome.mockRejectedValueOnce(new Error('Brevo down'));

    const userData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    await expect(service.createUser(userData)).resolves.toBeDefined();
  });
});
