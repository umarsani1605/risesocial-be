import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';

const PERMISSION_REGISTRY = [
  { key: 'admin.dashboard',    name: 'Dashboard',        description: 'Akses halaman dashboard admin',   available_levels: ['VIEWER'] },
  { key: 'admin.users',        name: 'User Management',  description: 'Kelola user terdaftar',            available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.academy',      name: 'Academy',          description: 'Kelola program academy',           available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.cohort',       name: 'Cohort',           description: 'Kelola cohort & enrollment',       available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.transactions', name: 'Transactions',     description: 'Lihat & kelola transaksi',         available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.ryls',         name: 'RYLS',             description: 'Kelola registrasi RYLS',           available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.jobs',         name: 'Jobs',             description: 'Kelola job listing',               available_levels: ['VIEWER', 'EDITOR'] },
  { key: 'admin.statistics',   name: 'Statistics',       description: 'Lihat statistik platform',         available_levels: ['VIEWER'] },
  { key: 'admin.settings',     name: 'System Settings',  description: 'Kelola konfigurasi sistem',        available_levels: ['VIEWER', 'EDITOR'] },
];

const USER_ASSIGNMENTS = [
  {
    email: 'admin.academy@risesocial.org',
    perms: [
      { key: 'admin.dashboard', level: 'VIEWER' },
      { key: 'admin.academy',   level: 'EDITOR' },
      { key: 'admin.cohort',    level: 'EDITOR' },
    ],
  },
  {
    email: 'admin.finance@risesocial.org',
    perms: [
      { key: 'admin.dashboard',    level: 'VIEWER' },
      { key: 'admin.transactions', level: 'EDITOR' },
      { key: 'admin.ryls',         level: 'EDITOR' },
    ],
  },
  {
    email: 'admin.jobs@risesocial.org',
    perms: [
      { key: 'admin.dashboard', level: 'VIEWER' },
      { key: 'admin.jobs',      level: 'VIEWER' },
    ],
  },
  {
    email: 'admin.viewer@risesocial.org',
    perms: [
      { key: 'admin.dashboard',    level: 'VIEWER' },
      { key: 'admin.academy',      level: 'VIEWER' },
      { key: 'admin.cohort',       level: 'VIEWER' },
      { key: 'admin.transactions', level: 'VIEWER' },
      { key: 'admin.ryls',         level: 'VIEWER' },
      { key: 'admin.jobs',         level: 'VIEWER' },
      { key: 'admin.statistics',   level: 'VIEWER' },
      { key: 'admin.settings',     level: 'VIEWER' },
    ],
  },
];

export async function seedPermissions(prisma) {
  try {
    logSeedStart('Permissions');

    for (const permission of PERMISSION_REGISTRY) {
      await prisma.adminPermission.upsert({
        where: { key: permission.key },
        update: permission,
        create: permission,
      });
    }

    let assignmentCount = 0;
    for (const { email, perms } of USER_ASSIGNMENTS) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) continue;

      for (const p of perms) {
        await prisma.userAdminPermission.upsert({
          where: { user_id_permission_key: { user_id: user.id, permission_key: p.key } },
          update: { access_level: p.level },
          create: { user_id: user.id, permission_key: p.key, access_level: p.level },
        });
        assignmentCount++;
      }
    }

    const stats = {
      permissionRegistryCount: PERMISSION_REGISTRY.length,
      userPermissionAssignmentCount: assignmentCount,
    };

    logSeedSuccess('Permissions', stats);
    return stats;
  } catch (error) {
    logSeedError('Permissions', error);
    throw error;
  }
}
