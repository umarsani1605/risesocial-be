/**
 * Cache Helper Class untuk Fastify
 * Menyediakan methods sederhana untuk operasi cache
 */
export class CacheHelper {
  /**
   * Get data dari cache
   * @param {Object} fastify - Fastify instance
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached data atau null
   */
  static async get(fastify, key) {
    return new Promise((resolve) => {
      fastify.cache.get(key, (err, value) => {
        if (err) {
          console.warn(`[CacheHelper] Get error for key ${key}:`, err.message);
          resolve(null);
        } else {
          resolve(value);
        }
      });
    });
  }

  /**
   * Set data ke cache
   * @param {Object} fastify - Fastify instance
   * @param {string} key - Cache key
   * @param {any} value - Data yang akan di-cache
   * @param {number} ttl - Time to live dalam milidetik (default: 1 jam)
   * @returns {Promise<boolean>} Success status
   */
  static async set(fastify, key, value, ttl = 3600000) {
    return new Promise((resolve) => {
      fastify.cache.set(key, value, ttl, (err) => {
        if (err) {
          console.warn(`[CacheHelper] Set error for key ${key}:`, err.message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Delete data dari cache
   * @param {Object} fastify - Fastify instance
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  static async delete(fastify, key) {
    return new Promise((resolve) => {
      fastify.cache.delete(key, (err) => {
        if (err) {
          console.warn(`[CacheHelper] Delete error for key ${key}:`, err.message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
