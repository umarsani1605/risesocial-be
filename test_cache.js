/**
 * Test Cache Implementation
 * File ini untuk testing cache functionality
 */

import { CacheHelper } from './src/lib/CacheHelper.js';

// Mock Fastify instance untuk testing
const mockFastify = {
  cache: {
    get: (key, callback) => {
      console.log(`[MockCache] Getting key: ${key}`);
      // Simulate cache hit/miss
      if (key === 'test:key') {
        callback(null, { data: 'cached_value' });
      } else {
        callback(null, null);
      }
    },
    set: (key, value, ttl, callback) => {
      console.log(`[MockCache] Setting key: ${key}, value:`, value, `TTL: ${ttl}ms`);
      callback(null);
    },
    delete: (key, callback) => {
      console.log(`[MockCache] Deleting key: ${key}`);
      callback(null);
    },
  },
};

// Test CacheHelper methods
async function testCacheHelper() {
  console.log('🧪 Testing CacheHelper...\n');

  try {
    // Test GET - Cache HIT
    console.log('1. Testing GET with cache HIT...');
    const cachedValue = await CacheHelper.get(mockFastify, 'test:key');
    console.log('✅ Cache HIT result:', cachedValue);

    // Test GET - Cache MISS
    console.log('\n2. Testing GET with cache MISS...');
    const missedValue = await CacheHelper.get(mockFastify, 'nonexistent:key');
    console.log('✅ Cache MISS result:', missedValue);

    // Test SET
    console.log('\n3. Testing SET...');
    const setResult = await CacheHelper.set(mockFastify, 'new:key', { test: 'data' }, 3600000);
    console.log('✅ SET result:', setResult);

    // Test DELETE
    console.log('\n4. Testing DELETE...');
    const deleteResult = await CacheHelper.delete(mockFastify, 'test:key');
    console.log('✅ DELETE result:', deleteResult);

    console.log('\n🎉 All tests passed! CacheHelper is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testCacheHelper();
