import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestApp, generateAuthToken } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection } from '../helpers/testDb.js';

/**
 * E2E Tests for Authentication Endpoints
 * Tests complete HTTP request/response flows
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5, 6.6
 */

describe('Authentication E2E Tests', () => {
  let app;
  let prisma;

  beforeEach(async () => {
    app = await createTestApp();
    prisma = getTestPrisma();
    await resetDatabase();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await closeConnection();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      // Arrange
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: userData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('user');
      expect(body.data).toHaveProperty('token');
      expect(body.data).toHaveProperty('expiresIn');
      
      expect(body.data.user.email).toBe('john.doe@example.com');
      expect(body.data.user.first_name).toBe('John');
      expect(body.data.user.last_name).toBe('Doe');
      expect(body.data.user).not.toHaveProperty('password');
      
      expect(typeof body.data.token).toBe('string');
      expect(body.data.token.length).toBeGreaterThan(0);
      expect(body.data.expiresIn).toBe('1 day');
    });

    it('should return 400 for duplicate email', async () => {
      // Arrange - create first user
      const userData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: userData,
      });

      // Act - try to register with same email
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: userData,
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Email is already registered');
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const invalidData = {
        first_name: 'John',
        // missing last_name, email, password
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: invalidData,
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      // Arrange
      const invalidData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: invalidData,
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          password: 'password123',
        },
      });
    });

    it('should login with valid credentials and return token', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: loginData,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('user');
      expect(body.data).toHaveProperty('token');
      expect(body.data).toHaveProperty('expiresIn');
      
      expect(body.data.user.email).toBe('test@example.com');
      expect(body.data.user).not.toHaveProperty('password');
      
      expect(typeof body.data.token).toBe('string');
      expect(body.data.token.length).toBeGreaterThan(0);
    });

    it('should return 401 for invalid email', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: loginData,
      });

      // Assert
      expect(response.statusCode).toBe(401);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Invalid email or password');
    });

    it('should return 401 for invalid password', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: loginData,
      });

      // Assert
      expect(response.statusCode).toBe(401);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Invalid email or password');
    });

    it('should support remember me option', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: loginData,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('expiresIn');
      expect(body.data.expiresIn).toBe('30 days');
    });
  });

  describe('GET /api/auth/session', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Register and login to get token
      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          first_name: 'Auth',
          last_name: 'User',
          email: 'auth@example.com',
          password: 'password123',
        },
      });

      const registerBody = JSON.parse(registerResponse.body);
      authToken = registerBody.data.token;
      userId = registerBody.data.user.id;
    });

    it('should return current user with valid token', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/session',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('data');
      expect(body.data.id).toBe(userId);
      expect(body.data.email).toBe('auth@example.com');
      expect(body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/session',
      });

      // Assert
      expect(response.statusCode).toBe(401);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/session',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      // Assert
      expect(response.statusCode).toBe(401);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });
});
