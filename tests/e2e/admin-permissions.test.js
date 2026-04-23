import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createTestApp, generateAdminToken, generateSuperadminToken } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../helpers/testDb.js';
import { createTestUser } from '../helpers/userFixtures.js';
import bcrypt from 'bcryptjs';

describe('Admin Permission Enforcement E2E', { concurrent: false }, () => {
  let app;
  let prisma;
  let superadminUser;
  let adminNoPerms;
  let adminViewerAcademy;
  let adminEditorAcademy;
  let superadminToken;
  let adminNoPermsToken;
  let adminViewerToken;
  let adminEditorToken;

  async function seedPermissionRegistry() {
    await prisma.adminPermission.upsert({
      where: { key: 'admin.academy' },
      update: {},
      create: { key: 'admin.academy', name: 'Academy', available_levels: ['VIEWER', 'EDITOR'] },
    });
  }

  async function assignPermission(userId, key, level) {
    await prisma.userAdminPermission.upsert({
      where: { user_id_permission_key: { user_id: userId, permission_key: key } },
      update: { access_level: level },
      create: { user_id: userId, permission_key: key, access_level: level },
    });
  }

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase();

    const hashedPw = await bcrypt.hash('password123', 12);

    superadminUser = await createTestUser({ role: 'SUPERADMIN', email: `superadmin.${Date.now()}@test.com`, password: hashedPw });
    adminNoPerms = await createTestUser({ role: 'ADMIN', email: `admin.noperms.${Date.now()}@test.com`, password: hashedPw });
    adminViewerAcademy = await createTestUser({ role: 'ADMIN', email: `admin.viewer.${Date.now()}@test.com`, password: hashedPw });
    adminEditorAcademy = await createTestUser({ role: 'ADMIN', email: `admin.editor.${Date.now()}@test.com`, password: hashedPw });

    await seedPermissionRegistry();
    await assignPermission(adminViewerAcademy.id, 'admin.academy', 'VIEWER');
    await assignPermission(adminEditorAcademy.id, 'admin.academy', 'EDITOR');

    superadminToken = await generateSuperadminToken(superadminUser.id, superadminUser.email);
    adminNoPermsToken = await generateAdminToken(adminNoPerms.id, adminNoPerms.email);
    adminViewerToken = await generateAdminToken(adminViewerAcademy.id, adminViewerAcademy.email);
    adminEditorToken = await generateAdminToken(adminEditorAcademy.id, adminEditorAcademy.email);
  });

  afterAll(async () => {
    await app.close();
    await closeConnection();
  });

  // 1. SUPERADMIN can access all routes without permission assignments
  it('SUPERADMIN can GET /admin/academies without any permission assignment', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/admin/academies',
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  // 2. ADMIN with no permissions → 403
  it('ADMIN with no permissions gets 403 on /admin/academies', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/admin/academies',
      headers: { Authorization: `Bearer ${adminNoPermsToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  // 3. ADMIN with VIEWER → GET passes, POST fails
  it('ADMIN with VIEWER on admin.academy can GET but not POST', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: '/admin/academies',
      headers: { Authorization: `Bearer ${adminViewerToken}` },
    });
    expect(getRes.statusCode).toBe(200);

    const postRes = await app.inject({
      method: 'POST',
      url: '/admin/academies',
      headers: { Authorization: `Bearer ${adminViewerToken}`, 'content-type': 'application/json' },
      payload: { title: 'Test', slug: 'test' },
    });
    expect(postRes.statusCode).toBe(403);
    expect(JSON.parse(postRes.payload).message).toMatch(/read-only/i);
  });

  // 4. ADMIN with EDITOR → GET and POST both pass (POST may fail with 400 but not 403)
  it('ADMIN with EDITOR on admin.academy passes permission check on POST', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: '/admin/academies',
      headers: { Authorization: `Bearer ${adminEditorToken}` },
    });
    expect(getRes.statusCode).toBe(200);

    const postRes = await app.inject({
      method: 'POST',
      url: '/admin/academies',
      headers: { Authorization: `Bearer ${adminEditorToken}`, 'content-type': 'application/json' },
      payload: { title: 'Test Academy', slug: 'test-academy' },
    });
    // 403 would mean permission denied; anything else means the request passed the permission check
    expect(postRes.statusCode).not.toBe(403);
  });

  // 5. SUPERADMIN assigns permission → takes effect immediately
  it('SUPERADMIN can assign permission via PUT /admin/users/:id/permissions', async () => {
    await prisma.adminPermission.upsert({
      where: { key: 'admin.users' },
      update: {},
      create: { key: 'admin.users', name: 'Users', available_levels: ['VIEWER', 'EDITOR'] },
    });

    const putRes = await app.inject({
      method: 'PUT',
      url: `/admin/users/${adminNoPerms.id}/permissions`,
      headers: { Authorization: `Bearer ${superadminToken}`, 'content-type': 'application/json' },
      payload: { permissions: [{ key: 'admin.users', access_level: 'VIEWER' }] },
    });
    expect(putRes.statusCode).toBe(200);

    // Immediate effect: adminNoPerms can now access admin.users endpoint
    const getRes = await app.inject({
      method: 'GET',
      url: '/admin/users',
      headers: { Authorization: `Bearer ${adminNoPermsToken}` },
    });
    expect(getRes.statusCode).toBe(200);
  });

  // 6. SUPERADMIN revokes permission → 403 on next request (no re-login needed)
  it('Revoking permission takes effect immediately without re-login', async () => {
    // adminViewerAcademy already has VIEWER on admin.academy - verify it works
    const beforeRes = await app.inject({
      method: 'GET',
      url: '/admin/academies',
      headers: { Authorization: `Bearer ${adminViewerToken}` },
    });
    expect(beforeRes.statusCode).toBe(200);

    // Revoke the permission
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/admin/users/${adminViewerAcademy.id}/permissions/admin.academy`,
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    expect(deleteRes.statusCode).toBe(200);

    // Same token, same request → now 403
    const afterRes = await app.inject({
      method: 'GET',
      url: '/admin/academies',
      headers: { Authorization: `Bearer ${adminViewerToken}` },
    });
    expect(afterRes.statusCode).toBe(403);
  });

  // 7. Non-SUPERADMIN cannot call permission management API
  it('ADMIN cannot call PUT /admin/users/:id/permissions (SUPERADMIN only)', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/admin/users/${adminNoPerms.id}/permissions`,
      headers: { Authorization: `Bearer ${adminEditorToken}`, 'content-type': 'application/json' },
      payload: { permissions: [] },
    });
    expect(res.statusCode).toBe(403);
  });

  // Unauthenticated requests → 401
  it('Unauthenticated request returns 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/academies' });
    expect(res.statusCode).toBe(401);
  });
});
