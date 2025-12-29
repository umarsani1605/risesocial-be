export class CacheHelper {
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
