/**
 * Safety Tests for Test Database Helper
 * Verifies that safeguards prevent accidental production database access
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Test Database Safety Checks', () => {
  let originalDatabaseUrl;
  let originalNodeEnv;

  beforeEach(() => {
    // Save original values
    originalDatabaseUrl = process.env.DATABASE_URL;
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    // Restore original values
    process.env.DATABASE_URL = originalDatabaseUrl;
    process.env.NODE_ENV = originalNodeEnv;
    
    // Clear module cache to reset testPrisma
    delete require.cache[require.resolve('./testDb.js')];
  });

  it('should accept database URL with _test suffix', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/myapp_test';
    process.env.NODE_ENV = 'test';
    
    const { isTestDatabase } = require('./testDb.js');
    expect(isTestDatabase()).toBe(true);
  });

  it('should accept database URL with test in name', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test_database';
    process.env.NODE_ENV = 'test';
    
    const { isTestDatabase } = require('./testDb.js');
    expect(isTestDatabase()).toBe(true);
  });

  it('should accept when NODE_ENV is test', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/somedb';
    process.env.NODE_ENV = 'test';
    
    const { isTestDatabase } = require('./testDb.js');
    expect(isTestDatabase()).toBe(true);
  });

  it('should reject database URL without test indicator', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/myapp';
    process.env.NODE_ENV = 'development';
    
    const { getTestPrisma } = require('./testDb.js');
    
    expect(() => getTestPrisma()).toThrow('SAFETY CHECK FAILED');
    expect(() => getTestPrisma()).toThrow('Not using test database');
  });

  it('should reject database URL with production keywords', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/myapp_production';
    process.env.NODE_ENV = 'test';
    
    const { getTestPrisma } = require('./testDb.js');
    
    expect(() => getTestPrisma()).toThrow('SAFETY CHECK FAILED');
    expect(() => getTestPrisma()).toThrow('production keywords');
  });

  it('should reject database URL with prod keyword', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/myapp_prod';
    process.env.NODE_ENV = 'test';
    
    const { getTestPrisma } = require('./testDb.js');
    
    expect(() => getTestPrisma()).toThrow('SAFETY CHECK FAILED');
  });

  it('should reject database URL with live keyword', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/myapp_live';
    process.env.NODE_ENV = 'test';
    
    const { getTestPrisma } = require('./testDb.js');
    
    expect(() => getTestPrisma()).toThrow('SAFETY CHECK FAILED');
  });

  it('should reject database URL with main keyword', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/main_database';
    process.env.NODE_ENV = 'test';
    
    const { getTestPrisma } = require('./testDb.js');
    
    expect(() => getTestPrisma()).toThrow('SAFETY CHECK FAILED');
  });
});
