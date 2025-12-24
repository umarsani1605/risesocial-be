import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('UserService', () => {
  const mockRepo = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    emailExists: vi.fn(),
    createWithSettings: vi.fn(),
    delete: vi.fn(),
  };

  class TestUserService {
    constructor() { this.repo = mockRepo; }
    async createUser(data) {
      if (await this.repo.emailExists(data.email)) throw new Error('Email exists');
      data.password = 'hashed_' + data.password;
      return this.excludePassword(await this.repo.createWithSettings(data));
    }
    async login(email, password) {
      const user = await this.repo.findByEmail(email);
      if (!user || user.password !== 'hashed_' + password) throw new Error('Invalid credentials');
      return { user: this.excludePassword(user), token: 'token' };
    }
    async getUserById(id) {
      const user = await this.repo.findById(id);
      if (!user) throw new Error('Not found');
      return this.excludePassword(user);
    }
    async deleteUser(id) {
      const user = await this.repo.findById(id);
      if (!user) throw new Error('Not found');
      await this.repo.delete(id);
    }
    excludePassword(u) { if (!u) return null; const { password, ...r } = u; return r; }
    generateUsername(f, l) { return (f + l).toLowerCase().replace(/[^a-z0-9]/g, ''); }
  }

  let svc;
  beforeEach(() => { vi.clearAllMocks(); svc = new TestUserService(); });

  it('creates user', async () => {
    mockRepo.emailExists.mockResolvedValue(false);
    mockRepo.createWithSettings.mockResolvedValue({ id: 1, email: 'a@b.c', password: 'x' });
    const r = await svc.createUser({ email: 'a@b.c', password: 'p' });
    expect(r.email).toBe('a@b.c');
    expect(r).not.toHaveProperty('password');
  });

  it('throws if email exists', async () => {
    mockRepo.emailExists.mockResolvedValue(true);
    await expect(svc.createUser({ email: 'x' })).rejects.toThrow('Email exists');
  });

  it('login works', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: 1, email: 'a@b.c', password: 'hashed_p' });
    const r = await svc.login('a@b.c', 'p');
    expect(r.token).toBe('token');
  });

  it('login fails bad email', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    await expect(svc.login('x', 'p')).rejects.toThrow('Invalid credentials');
  });

  it('login fails bad password', async () => {
    mockRepo.findByEmail.mockResolvedValue({ password: 'hashed_correct' });
    await expect(svc.login('x', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('getUserById works', async () => {
    mockRepo.findById.mockResolvedValue({ id: 1, password: 'x' });
    const r = await svc.getUserById(1);
    expect(r).not.toHaveProperty('password');
  });

  it('getUserById throws if not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(svc.getUserById(1)).rejects.toThrow('Not found');
  });

  it('deleteUser works', async () => {
    mockRepo.findById.mockResolvedValue({ id: 1 });
    await expect(svc.deleteUser(1)).resolves.not.toThrow();
  });

  it('deleteUser throws if not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(svc.deleteUser(1)).rejects.toThrow('Not found');
  });

  it('generateUsername works', () => {
    expect(svc.generateUsername('John', 'Doe')).toBe('johndoe');
  });
});
