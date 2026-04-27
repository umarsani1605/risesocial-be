const permissionItem = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    access_level: { type: 'string', enum: ['VIEWER', 'EDITOR'] },
  },
};

const registryItem = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    available_levels: { type: 'array', items: { type: 'string' } },
  },
};

const stdResponse = (dataSchema) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: dataSchema,
    timestamp: { type: 'string' },
  },
});

export const listRegistrySchema = {
  tags: ['Admin Permissions'],
  description: 'List all available permission keys from registry (SUPERADMIN only)',
  response: {
    200: stdResponse({ type: 'array', items: registryItem }),
  },
};

export const getUserPermissionsSchema = {
  tags: ['Admin Permissions'],
  description: 'Get permissions assigned to an admin user (SUPERADMIN only)',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer', minimum: 1 } },
  },
  response: {
    200: stdResponse({ type: 'array', items: permissionItem }),
  },
};

export const setUserPermissionsSchema = {
  tags: ['Admin Permissions'],
  description: 'Replace all permissions for an admin user (SUPERADMIN only)',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer', minimum: 1 } },
  },
  body: {
    type: 'object',
    required: ['permissions'],
    properties: {
      permissions: {
        type: 'array',
        items: {
          type: 'object',
          required: ['key', 'access_level'],
          properties: {
            key: { type: 'string' },
            access_level: { type: 'string', enum: ['VIEWER', 'EDITOR'] },
          },
        },
      },
    },
  },
  response: {
    200: stdResponse({ type: 'array', items: permissionItem }),
  },
};

export const deleteUserPermissionSchema = {
  tags: ['Admin Permissions'],
  description: 'Remove a single permission from an admin user (SUPERADMIN only)',
  params: {
    type: 'object',
    required: ['id', 'key'],
    properties: {
      id: { type: 'integer', minimum: 1 },
      key: { type: 'string' },
    },
  },
  response: {
    200: stdResponse({ type: 'null' }),
  },
};
