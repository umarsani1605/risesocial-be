/**
 * UserRepository Unit Tests
 * Tests data access logic with mocked Prisma client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMockUser, getMockUserWithSettings, getMockPaginatedUsers } from '../../helpers/userFixtures.js';

// Mock Prisma
const mockPrisma = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  userSetting: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

vi.mock('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

// Mock logger

// Import after mocking
const { UserRepository } = await import('../../../src/repositories/userRepository.js');

describe('UserRepository', () => {
  let repository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new UserRepository();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = getMockUser({ email: 'test@test.com' });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@test.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });

    it('should pass options to findUnique', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(getMockUserWithSettings());

      await repository.findByEmail('test@test.com', {
        include: { user_settings: true },
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
        include: { user_settings: true },
      });
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = getMockUser({ username: 'testuser' });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByUsername('testuser');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const mockUser = getMockUser({ id: 1 });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById(1);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('createWithSettings', () => {
    it('should create user with default notification settings', async () => {
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed123',
        role: 'USER',
      };

      const mockCreatedUser = getMockUser(userData);
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.userSetting.create.mockResolvedValue({});

      const result = await repository.createWithSettings(userData);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
        include: { user_settings: true },
      });
      expect(mockPrisma.userSetting.create).toHaveBeenCalledWith({
        data: {
          user_id: mockCreatedUser.id,
          key: 'notification_preferences',
          value: {
            promo_notification: true,
            job_notification: true,
            program_notification: true,
          },
        },
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle transaction errors', async () => {
      const userData = {
        email: 'test@test.com',
        username: 'testuser',
      };

      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));

      await expect(repository.createWithSettings(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findManyWithPagination', () => {
    it('should return paginated users with default options', async () => {
      const mockUsers = [getMockUser(), getMockUser({ id: 2 })];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockPrisma.user.count.mockResolvedValue(2);

      const result = await repository.findManyWithPagination({});

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { created_at: 'desc' },
        include: { user_settings: true },
      });
      expect(mockPrisma.user.count).toHaveBeenCalledWith({ where: {} });
      expect(result.data).toEqual(mockUsers);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter by role', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await repository.findManyWithPagination({ role: 'ADMIN' });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: 'ADMIN' },
        }),
      );
    });

    it('should search by multiple fields', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await repository.findManyWithPagination({ search: 'john' });

      const callArgs = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('OR');
      expect(callArgs.where.OR).toEqual([
        { first_name: { contains: 'john', mode: 'insensitive' } },
        { last_name: { contains: 'john', mode: 'insensitive' } },
        { email: { contains: 'john', mode: 'insensitive' } },
        { username: { contains: 'john', mode: 'insensitive' } },
      ]);
    });

    it('should handle pagination correctly', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(25);

      const result = await repository.findManyWithPagination({
        page: 2,
        limit: 10,
      });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should combine role and search filters', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await repository.findManyWithPagination({
        role: 'USER',
        search: 'john',
      });

      const callArgs = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArgs.where.role).toBe('USER');
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateData = { first_name: 'Updated' };
      const mockUpdated = getMockUser(updateData);
      mockPrisma.user.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(1, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockPrisma.user.delete.mockResolvedValue(getMockUser());

      await repository.delete(1);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await repository.emailExists('test@test.com');

      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      mockPrisma.user.count.mockResolvedValue(0);

      const result = await repository.emailExists('nonexistent@test.com');

      expect(result).toBe(false);
    });
  });

  describe('usernameExists', () => {
    it('should return true when username exists', async () => {
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await repository.usernameExists('testuser');

      expect(result).toBe(true);
    });

    it('should return false when username does not exist', async () => {
      mockPrisma.user.count.mockResolvedValue(0);

      const result = await repository.usernameExists('nonexistent');

      expect(result).toBe(false);
    });
  });
});
