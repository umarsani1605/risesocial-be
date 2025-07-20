/**
 * Skema untuk response data user.
 * Digunakan untuk memastikan tidak ada data sensitif (seperti password) yang dikirim ke client.
 */
export const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: ['string', 'null'] },
    avatar: { type: ['string', 'null'] },
    role: { type: 'string', enum: ['USER', 'ADMIN'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * Skema untuk membuat user baru.
 * Memvalidasi body request dan mendefinisikan format response sukses.
 */
export const createUserSchema = {
  body: {
    type: 'object',
    required: ['first_name', 'last_name', 'email', 'password'],
    properties: {
      first_name: { type: 'string', minLength: 1 },
      last_name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      password: { type: 'string', minLength: 6 },
      avatar: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: userResponseSchema,
      },
    },
  },
};

/**
 * Skema untuk memperbarui data user.
 */
export const updateUserSchema = {
  body: {
    type: 'object',
    properties: {
      first_name: { type: 'string', minLength: 1 },
      last_name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      avatar: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: userResponseSchema,
      },
    },
  },
};

/**
 * Skema untuk login.
 */
export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      rememberMe: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            user: userResponseSchema,
            token: { type: 'string' },
            expiresIn: { type: 'string' },
          },
        },
      },
    },
  },
};

/**
 * Skema untuk register.
 */
export const registerSchema = {
  body: {
    type: 'object',
    required: ['first_name', 'last_name', 'email', 'password'],
    properties: {
      first_name: { type: 'string', minLength: 1 },
      last_name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      password: { type: 'string', minLength: 6 },
      avatar: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            user: userResponseSchema,
            token: { type: 'string' },
            expiresIn: { type: 'string' },
          },
        },
      },
    },
  },
};

/**
 * Skema untuk get current user.
 */
export const getCurrentUserSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: userResponseSchema,
      },
    },
  },
};
