/**
 * Integration Tests: AdminPermission and UserAdminPermission schema constraints
 *
 * Tests the new permission management models added in migration
 * 20260422224121_add_admin_permission_management.
 *
 * Validates:
 *  - Creating AdminPermission registry entries
 *  - Assigning UserAdminPermission to admin users
 *  - Unique constraint on (user_id, permission_key)
 *  - Cascade delete when user is deleted
 *  - Cascade delete when permission key is deleted
 *  - AdminAccessLevel enum (VIEWER, EDITOR)
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection } from '../../../helpers/testDb.js';
import { createTestUser } from '../../../helpers/userFixtures.js';

let prisma;
let adminUser;

async function createAdminUser(overrides = {}) {
  return createTestUser({ role: 'ADMIN', ...overrides });
}

async function createPermission(overrides = {}) {
  const key = overrides.key || `admin.test.${Date.now()}.${Math.random().toString(36).substring(2, 6)}`;
  return prisma.adminPermission.create({
    data: {
      key,
      name: 'Test Permission',
      description: 'Permission for tests',
      available_levels: ['VIEWER', 'EDITOR'],
      ...overrides,
    },
  });
}

async function assignPermission(userId, permissionKey, accessLevel = 'VIEWER') {
  return prisma.userAdminPermission.create({
    data: {
      user_id: userId,
      permission_key: permissionKey,
      access_level: accessLevel,
    },
  });
}

// Clean up admin permission tables that aren't in resetDatabase()
async function cleanupPermissionTables() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "user_admin_permissions" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "admin_permissions" CASCADE`);
}

describe('AdminPermission and UserAdminPermission schema constraints', { concurrent: false }, () => {
  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase();
    await cleanupPermissionTables();
    adminUser = await createAdminUser();
  });

  afterAll(async () => {
    await closeConnection();
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('AdminPermission registry', () => {
    it('creates a permission record with required fields', async () => {
      const permission = await createPermission({
        key: 'admin.academy',
        name: 'Academy Management',
        description: 'Manage academy content',
        available_levels: ['VIEWER', 'EDITOR'],
      });

      expect(permission).toBeDefined();
      expect(permission.key).toBe('admin.academy');
      expect(permission.name).toBe('Academy Management');
      expect(permission.description).toBe('Manage academy content');
      expect(permission.available_levels).toEqual(['VIEWER', 'EDITOR']);
      expect(permission.created_at).toBeInstanceOf(Date);
    });

    it('creates a permission with only VIEWER level available', async () => {
      const permission = await createPermission({
        key: 'admin.readonly',
        name: 'Read-only Access',
        available_levels: ['VIEWER'],
      });

      expect(permission.available_levels).toEqual(['VIEWER']);
    });

    it('uses permission key as primary key (string PK)', async () => {
      const permission = await createPermission({ key: 'admin.jobs' });

      const found = await prisma.adminPermission.findUnique({
        where: { key: 'admin.jobs' },
      });

      expect(found).not.toBeNull();
      expect(found.key).toBe('admin.jobs');
    });

    it('rejects duplicate permission key', async () => {
      await createPermission({ key: 'admin.duplicate' });

      await expect(createPermission({ key: 'admin.duplicate' })).rejects.toThrow();
    });

    it('allows description to be null', async () => {
      const permission = await createPermission({
        key: 'admin.nodesc',
        name: 'No Description',
        description: undefined,
        available_levels: ['VIEWER'],
      });

      const found = await prisma.adminPermission.findUnique({ where: { key: 'admin.nodesc' } });
      expect(found.description).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('UserAdminPermission assignment', () => {
    it('assigns VIEWER permission to an admin user', async () => {
      const permission = await createPermission({ key: 'admin.academy' });

      const assignment = await assignPermission(adminUser.id, permission.key, 'VIEWER');

      expect(assignment).toBeDefined();
      expect(assignment.user_id).toBe(adminUser.id);
      expect(assignment.permission_key).toBe('admin.academy');
      expect(assignment.access_level).toBe('VIEWER');
      expect(assignment.created_at).toBeInstanceOf(Date);
    });

    it('assigns EDITOR permission to an admin user', async () => {
      const permission = await createPermission({ key: 'admin.academy' });

      const assignment = await assignPermission(adminUser.id, permission.key, 'EDITOR');

      expect(assignment.access_level).toBe('EDITOR');
    });

    it('allows multiple permissions assigned to one user', async () => {
      const perm1 = await createPermission({ key: 'admin.academy' });
      const perm2 = await createPermission({ key: 'admin.jobs' });

      await assignPermission(adminUser.id, perm1.key, 'VIEWER');
      await assignPermission(adminUser.id, perm2.key, 'EDITOR');

      const assignments = await prisma.userAdminPermission.findMany({
        where: { user_id: adminUser.id },
      });

      expect(assignments).toHaveLength(2);
    });

    it('allows the same permission assigned to multiple users', async () => {
      const adminUser2 = await createAdminUser();
      const permission = await createPermission({ key: 'admin.academy' });

      await assignPermission(adminUser.id, permission.key, 'VIEWER');
      await assignPermission(adminUser2.id, permission.key, 'EDITOR');

      const assignments = await prisma.userAdminPermission.findMany({
        where: { permission_key: permission.key },
      });

      expect(assignments).toHaveLength(2);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('unique constraint: (user_id, permission_key)', () => {
    it('rejects duplicate assignment of same permission to same user', async () => {
      const permission = await createPermission({ key: 'admin.academy' });

      await assignPermission(adminUser.id, permission.key, 'VIEWER');

      await expect(
        assignPermission(adminUser.id, permission.key, 'EDITOR'),
      ).rejects.toThrow();
    });

    it('allows same permission key assigned to different users without conflict', async () => {
      const adminUser2 = await createAdminUser();
      const permission = await createPermission({ key: 'admin.academy' });

      await expect(
        Promise.all([
          assignPermission(adminUser.id, permission.key, 'VIEWER'),
          assignPermission(adminUser2.id, permission.key, 'VIEWER'),
        ]),
      ).resolves.toHaveLength(2);
    });

    it('allows same user assigned to different permissions without conflict', async () => {
      const perm1 = await createPermission({ key: 'admin.academy' });
      const perm2 = await createPermission({ key: 'admin.cohorts' });

      await expect(
        Promise.all([
          assignPermission(adminUser.id, perm1.key),
          assignPermission(adminUser.id, perm2.key),
        ]),
      ).resolves.toHaveLength(2);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('cascade delete: when user is deleted', () => {
    it('deletes all permission assignments when user is deleted', async () => {
      const permission = await createPermission({ key: 'admin.academy' });
      const assignment = await assignPermission(adminUser.id, permission.key, 'VIEWER');

      await prisma.user.delete({ where: { id: adminUser.id } });

      const found = await prisma.userAdminPermission.findUnique({
        where: { id: assignment.id },
      });
      expect(found).toBeNull();
    });

    it('preserves assignments for other users when one user is deleted', async () => {
      const adminUser2 = await createAdminUser();
      const permission = await createPermission({ key: 'admin.academy' });

      await assignPermission(adminUser.id, permission.key, 'VIEWER');
      const surviving = await assignPermission(adminUser2.id, permission.key, 'EDITOR');

      await prisma.user.delete({ where: { id: adminUser.id } });

      const found = await prisma.userAdminPermission.findUnique({
        where: { id: surviving.id },
      });
      expect(found).not.toBeNull();
      expect(found.user_id).toBe(adminUser2.id);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('cascade delete: when permission key is deleted', () => {
    it('deletes all user assignments when the permission key is deleted', async () => {
      const permission = await createPermission({ key: 'admin.academy' });
      const assignment = await assignPermission(adminUser.id, permission.key, 'VIEWER');

      await prisma.adminPermission.delete({ where: { key: permission.key } });

      const found = await prisma.userAdminPermission.findUnique({
        where: { id: assignment.id },
      });
      expect(found).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('querying permissions', () => {
    it('finds user permission by compound unique key', async () => {
      const permission = await createPermission({ key: 'admin.academy' });
      await assignPermission(adminUser.id, permission.key, 'EDITOR');

      const found = await prisma.userAdminPermission.findUnique({
        where: {
          user_id_permission_key: {
            user_id: adminUser.id,
            permission_key: 'admin.academy',
          },
        },
      });

      expect(found).not.toBeNull();
      expect(found.access_level).toBe('EDITOR');
    });

    it('returns null when user has no assignment for the permission', async () => {
      await createPermission({ key: 'admin.academy' });

      const found = await prisma.userAdminPermission.findUnique({
        where: {
          user_id_permission_key: {
            user_id: adminUser.id,
            permission_key: 'admin.academy',
          },
        },
      });

      expect(found).toBeNull();
    });

    it('includes user relation when querying with include', async () => {
      const permission = await createPermission({ key: 'admin.academy' });
      await assignPermission(adminUser.id, permission.key, 'VIEWER');

      const found = await prisma.userAdminPermission.findUnique({
        where: {
          user_id_permission_key: {
            user_id: adminUser.id,
            permission_key: 'admin.academy',
          },
        },
        include: { user: true, permission: true },
      });

      expect(found.user).toBeDefined();
      expect(found.user.id).toBe(adminUser.id);
      expect(found.permission).toBeDefined();
      expect(found.permission.key).toBe('admin.academy');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('SUPERADMIN role does not require permission records', () => {
    it('SUPERADMIN user can exist without any permission assignments', async () => {
      const superAdmin = await createTestUser({ role: 'SUPERADMIN' });

      const assignments = await prisma.userAdminPermission.findMany({
        where: { user_id: superAdmin.id },
      });

      expect(assignments).toHaveLength(0);
    });
  });
});