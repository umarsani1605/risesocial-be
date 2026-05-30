/**
 * Users API E2E Tests
 * Tests HTTP endpoints with real database
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createTestApp } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../helpers/testDb.js';
import { seedUsersWithSettings, getCreatedUsers, TEST_PASSWORD } from '../helpers/userFixtures.js';

describe('Users API E2E Tests', () => {
  let app;
  let prisma;
  let testUser;
  let authToken;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase();
    const users = await seedUsersWithSettings();
    testUser = users[0];

    // Login to get token
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: testUser.email,
        password: TEST_PASSWORD,
      },
    });

    expect(loginResponse.statusCode).toBe(200);
    const loginBody = JSON.parse(loginResponse.payload);
    expect(loginBody.success).toBe(true);
    expect(loginBody.data).toBeDefined();
    expect(loginBody.data.token).toBeDefined();
    authToken = loginBody.data.token;
  });

  afterAll(async () => {
    await app.close();
    await closeConnection();
  });

  describe('GET /users/profile', () => {
    it('should return current user profile', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(testUser.id);
      expect(body.data.email).toBe(testUser.email);
      expect(body.data.first_name).toBe(testUser.first_name);
      expect(body.data.password).toBeUndefined();
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/profile',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/profile',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /users/settings', () => {
    it('should return user settings', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/settings',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      // Settings is an array
      if (Array.isArray(body.data)) {
        expect(body.data.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/settings',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /users/settings', () => {
    it('should update user settings', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/settings',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          settings: [
            {
              key: 'theme',
              value: 'dark',
            },
          ],
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
    });

    it('should update multiple settings at once', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/settings',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          settings: [
            { key: 'theme', value: 'dark' },
            { key: 'language', value: 'id' },
          ],
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/settings',
        payload: {
          settings: [{ key: 'theme', value: 'dark' }],
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /users/notification-preferences', () => {
    it('should return notification preferences', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/notification-preferences',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      console.log('Response body:', JSON.stringify(body, null, 2));

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data).toHaveProperty('job_notification');
      expect(body.data).toHaveProperty('program_notification');
    });

    it('should return default preferences if not set', async () => {
      // Create user without settings
      const newUser = await prisma.user.create({
        data: {
          first_name: 'New',
          last_name: 'User',
          email: 'new.user@test.com',
          username: 'newuser',
          password: testUser.password,
          role: 'USER',
        },
      });

      // Login as new user
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: newUser.email,
          password: TEST_PASSWORD,
        },
      });

      const newToken = JSON.parse(loginResponse.payload).data.token;

      const response = await app.inject({
        method: 'GET',
        url: '/users/notification-preferences',
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.data.job_notification).toBe(true);
      expect(body.data.program_notification).toBe(true);
    });
  });

  describe('PUT /users/notification-preferences', () => {
    it('should update notification preferences', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/notification-preferences',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          preferences: {
            job_notification: true,
            program_notification: false,
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.data.job_notification).toBe(true);
      expect(body.data.program_notification).toBe(false);
    });

    it('should set missing preferences to false', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/notification-preferences',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          preferences: {
            program_notification: true,
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.data.program_notification).toBe(true);
      expect(body.data.job_notification).toBe(false);
    });
  });

  describe('PUT /users/account', () => {
    it('should update user account info', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/account',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          first_name: 'John Updated',
          last_name: 'Doe Updated',
          phone: '+62812345999',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);
      expect(body.data.first_name).toBe('John Updated');
      expect(body.data.last_name).toBe('Doe Updated');
      expect(body.data.phone).toBe('+62812345999');
    });

    it('should not allow duplicate email', async () => {
      const users = getCreatedUsers();
      const otherUserEmail = users[1].email;

      const response = await app.inject({
        method: 'PUT',
        url: '/users/account',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          email: otherUserEmail,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });

    it('should allow updating own email', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/account',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          email: testUser.email,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should update only provided fields', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/account',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          phone: '+62899999999',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.data.phone).toBe('+62899999999');
      expect(body.data.first_name).toBe(testUser.first_name);
      expect(body.data.email).toBe(testUser.email);
    });
  });

  describe('PUT /users/security', () => {
    it('should update user password', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/security',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          password: 'newpassword123',
          repeatPassword: 'newpassword123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.success).toBe(true);

      // Verify can login with new password
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: testUser.email,
          password: 'newpassword123',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
    });

    it('should not allow short password', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/security',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          password: '123',
          repeatPassword: '123',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/users/security',
        payload: {
          password: 'newpassword123',
          repeatPassword: 'newpassword123',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Response format validation', () => {
    it('should match API docs response format for profile', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const body = JSON.parse(response.payload);

      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');

      const user = body.data;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('first_name');
      expect(user).toHaveProperty('last_name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).not.toHaveProperty('password');
    });
  });
});
