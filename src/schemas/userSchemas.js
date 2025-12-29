import { createSuccessResponseSchema, createErrorResponseSchema, timestampFieldsSchema, idParamSchema } from './baseSchemas.js';

const userEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'User ID' },
    first_name: { type: 'string', description: 'First name' },
    last_name: { type: 'string', description: 'Last name' },
    email: { type: 'string', format: 'email', description: 'Email address' },
    phone: { type: ['string', 'null'], description: 'Phone number' },
    avatar: { type: ['string', 'null'], description: 'Avatar URL' },
    role: { type: 'string', enum: ['USER', 'ADMIN'], description: 'User role' },
    ...timestampFieldsSchema,
  },
};

const authResponseSchema = {
  type: 'object',
  properties: {
    user: userEntitySchema,
    token: { type: 'string', description: 'JWT access token' },
    expiresIn: { type: 'string', description: 'Token expiration time' },
  },
};

export const userResponseSchema = userEntitySchema;

export const createUserSchema = {
  summary: 'Create user',
  description: 'Create a new user (Admin only)',
  tags: ['Admin Users'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['email', 'first_name', 'last_name'],
    properties: {
      first_name: { type: 'string', minLength: 1, maxLength: 100, description: 'First name' },
      last_name: { type: 'string', minLength: 1, maxLength: 100, description: 'Last name' },
      email: { type: 'string', format: 'email', description: 'Email address' },
      phone: { type: 'string', maxLength: 20, description: 'Phone number' },
      password: { type: 'string', minLength: 6, description: 'Password (min 6 characters)' },
      avatar: { type: 'string', description: 'Avatar URL' },
      role: { type: 'string', enum: ['USER', 'ADMIN'], description: 'User role' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(userEntitySchema, 'User created successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    409: createErrorResponseSchema(409, 'Conflict - Email already exists'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateUserSchema = {
  summary: 'Update user',
  description: 'Update an existing user (Admin only)',
  tags: ['Admin Users'],
  security: [{ bearerAuth: [] }],
  params: idParamSchema,
  body: {
    type: 'object',
    properties: {
      first_name: { type: 'string', minLength: 1, maxLength: 100, description: 'First name' },
      last_name: { type: 'string', minLength: 1, maxLength: 100, description: 'Last name' },
      email: { type: 'string', format: 'email', description: 'Email address' },
      phone: { type: 'string', maxLength: 20, description: 'Phone number' },
      avatar: { type: 'string', description: 'Avatar URL' },
      role: { type: 'string', enum: ['USER', 'ADMIN'], description: 'User role' },
      password: { type: 'string', minLength: 6, description: 'New password (min 6 characters)' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(userEntitySchema, 'User updated successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    404: createErrorResponseSchema(404, 'Not Found - User not found'),
    409: createErrorResponseSchema(409, 'Conflict - Email already exists'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const loginSchema = {
  summary: 'User login',
  description: 'Authenticate user with email and password',
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', description: 'Email address' },
      password: { type: 'string', minLength: 1, description: 'Password' },
      rememberMe: { type: 'boolean', default: false, description: 'Remember me option' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(authResponseSchema, 'Login successful'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid credentials'),
    401: createErrorResponseSchema(401, 'Unauthorized - Invalid email or password'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const registerSchema = {
  summary: 'User registration',
  description: 'Register a new user account',
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['email', 'first_name', 'last_name', 'password'],
    properties: {
      first_name: { type: 'string', minLength: 1, maxLength: 100, description: 'First name' },
      last_name: { type: 'string', minLength: 1, maxLength: 100, description: 'Last name' },
      email: { type: 'string', format: 'email', description: 'Email address' },
      phone: { type: 'string', maxLength: 20, description: 'Phone number' },
      password: { type: 'string', minLength: 6, description: 'Password (min 6 characters)' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(authResponseSchema, 'Registration successful'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid input data'),
    409: createErrorResponseSchema(409, 'Conflict - Email already exists'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getCurrentUserSchema = {
  summary: 'Get current user profile',
  description: 'Retrieve the profile information of the currently authenticated user',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(userEntitySchema, 'User profile retrieved successfully'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const logoutSchema = {
  summary: 'User logout',
  description: 'Logout the currently authenticated user',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema({ type: 'object', properties: { message: { type: 'string' } } }, 'Logout successful'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// User Self-Management Schemas
export const getUserProfileSchema = {
  summary: 'Get current user profile',
  description: 'Get the profile of the currently authenticated user',
  tags: ['User Self-Management'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(userEntitySchema, 'Profile retrieved'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserSettingsSchema = {
  summary: 'Get user settings',
  description: 'Get settings for the currently authenticated user',
  tags: ['User Self-Management'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Settings retrieved'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateUserSettingsSchema = {
  summary: 'Update user settings',
  description: 'Update settings for the currently authenticated user',
  tags: ['User Self-Management'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      theme: { type: 'string', enum: ['light', 'dark', 'system'] },
      language: { type: 'string' },
      timezone: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Settings updated'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getNotificationPreferencesSchema = {
  summary: 'Get notification preferences',
  description: 'Get notification preferences for the currently authenticated user',
  tags: ['User Self-Management'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Preferences retrieved'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateNotificationPreferencesSchema = {
  summary: 'Update notification preferences',
  description: 'Update notification preferences for the currently authenticated user',
  tags: ['User Self-Management'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      email_notifications: { type: 'boolean' },
      push_notifications: { type: 'boolean' },
      marketing_emails: { type: 'boolean' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Preferences updated'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateUserAccountSchema = {
  summary: 'Update user account',
  description: 'Update account information for the currently authenticated user',
  tags: ['User Self-Management'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      first_name: { type: 'string', minLength: 1, maxLength: 100 },
      last_name: { type: 'string', minLength: 1, maxLength: 100 },
      phone: { type: 'string', maxLength: 20 },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(userEntitySchema, 'Account updated'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateUserPasswordSchema = {
  summary: 'Update user password',
  description: 'Update password for the currently authenticated user',
  tags: ['User Self-Management'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['current_password', 'new_password'],
    properties: {
      current_password: { type: 'string', minLength: 1 },
      new_password: { type: 'string', minLength: 6 },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema({ type: 'object' }, 'Password updated'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid password'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
