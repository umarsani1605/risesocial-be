import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/repositories/shared/userRepository.js', () => ({
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

vi.mock('../../../../src/repositories/shared/userSettingsRepository.js', () => ({
  userSettingsRepository: {},
}));

vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: {},
}));

vi.mock('../../../../src/services/shared/emailService.js', () => ({
  emailService: {
    sendWelcome: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../../src/utils/jwt.js', () => ({
  generateToken: vi.fn().mockReturnValue('mock-token'),
}));


vi.mock('../../../../src/config/database.js', () => ({ default: {} }));

describe('UserService — welcome email hook', () => {
  let service;
  let emailService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { UserService } = await import('../../../../src/services/shared/userService.js');
    const emailModule = await import('../../../../src/services/shared/emailService.js');
    service = new UserService();
    emailService = emailModule.emailService;
  });

  it('should fire welcome email after user creation (fire-and-forget)', async () => {
    await service.createUser({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emailService.sendWelcome).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'john@example.com' }),
    );
  });

  it('should not throw if welcome email fails', async () => {
    emailService.sendWelcome.mockRejectedValueOnce(new Error('Brevo down'));

    await expect(
      service.createUser({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    ).resolves.toBeDefined();
  });
});
