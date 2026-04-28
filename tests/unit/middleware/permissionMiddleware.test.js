import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFindUnique = vi.fn();

vi.mock('../../../src/config/database.js', () => ({
  default: {
    userAdminPermission: {
      findUnique: mockFindUnique,
    },
  },
}));

const { requirePermission } = await import('../../../src/middleware/permissionMiddleware.js');

function makeRequest(role, userId = 1) {
  return { user: { id: userId, role } };
}

function makeReply() {
  const reply = { _status: null, _body: null };
  reply.status = (code) => { reply._status = code; return reply; };
  reply.send = (body) => { reply._body = body; return reply; };
  return reply;
}

describe('requirePermission middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SUPERADMIN bypasses — no DB query, no reply', async () => {
    const fn = requirePermission('admin.academy');
    const req = makeRequest('SUPERADMIN');
    const reply = makeReply();

    await fn(req, reply);

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(reply._status).toBeNull();
  });

  it('ADMIN with VIEWER permission passes GET-style check (VIEWER required)', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'VIEWER' });
    const fn = requirePermission('admin.academy');
    const req = makeRequest('ADMIN', 5);
    const reply = makeReply();

    await fn(req, reply);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { user_id_permission_key: { user_id: 5, permission_key: 'admin.academy' } },
    });
    expect(reply._status).toBeNull();
  });

  it('ADMIN with VIEWER permission blocked when EDITOR required', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'VIEWER' });
    const fn = requirePermission('admin.academy', 'EDITOR');
    const req = makeRequest('ADMIN', 5);
    const reply = makeReply();

    await fn(req, reply);

    expect(reply._status).toBe(403);
    expect(reply._body.message).toMatch(/read-only/i);
  });

  it('ADMIN with no permission record gets 403', async () => {
    mockFindUnique.mockResolvedValue(null);
    const fn = requirePermission('admin.academy');
    const req = makeRequest('ADMIN', 5);
    const reply = makeReply();

    await fn(req, reply);

    expect(reply._status).toBe(403);
    expect(reply._body.message).toMatch(/no permission/i);
  });

  it('ADMIN with EDITOR permission passes EDITOR-required check', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'EDITOR' });
    const fn = requirePermission('admin.academy', 'EDITOR');
    const req = makeRequest('ADMIN', 5);
    const reply = makeReply();

    await fn(req, reply);

    expect(reply._status).toBeNull();
  });

  it('ADMIN with EDITOR permission also passes VIEWER-required check (EDITOR >= VIEWER)', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'EDITOR' });
    const fn = requirePermission('admin.cohort', 'VIEWER');
    const req = makeRequest('ADMIN', 5);
    const reply = makeReply();

    await fn(req, reply);

    expect(reply._status).toBeNull();
  });

  it('uses the correct permission_key when querying DB', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'EDITOR' });
    const fn = requirePermission('admin.cohort.placements', 'VIEWER');
    const req = makeRequest('ADMIN', 42);
    const reply = makeReply();

    await fn(req, reply);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        user_id_permission_key: { user_id: 42, permission_key: 'admin.cohort.placements' },
      },
    });
  });

  it('SUPERADMIN bypasses even when DB would return no permission', async () => {
    mockFindUnique.mockResolvedValue(null);
    const fn = requirePermission('admin.any.key', 'EDITOR');
    const req = makeRequest('SUPERADMIN', 1);
    const reply = makeReply();

    await fn(req, reply);

    // No DB lookup and no error response
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(reply._status).toBeNull();
  });
});
