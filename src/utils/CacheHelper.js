export class CacheHelper {
  static async get(fastify, key) {
    return new Promise((resolve) => {
      fastify.cache.get(key, (err, value) => {
        resolve(err ? null : value);
      });
    });
  }

  static async set(fastify, key, value, ttl = 3600000) {
    return new Promise((resolve) => {
      fastify.cache.set(key, value, ttl, (err) => {
        resolve(!err);
      });
    });
  }

  static async delete(fastify, key) {
    return new Promise((resolve) => {
      fastify.cache.delete(key, (err) => {
        resolve(!err);
      });
    });
  }
}
