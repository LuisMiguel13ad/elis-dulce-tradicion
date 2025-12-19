/**
 * Cache middleware for Express routes
 * Adds caching headers and implements cache logic
 */
import { cache, cacheKeys } from '../utils/cache.js';

/**
 * Cache middleware factory
 * @param {number} ttlSeconds - Time to live in seconds
 * @param {Function} keyGenerator - Function to generate cache key from request
 */
export const cacheMiddleware = (ttlSeconds = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `${req.path}:${JSON.stringify(req.query)}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to cache response
    res.json = function (data) {
      // Cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, ttlSeconds);
        res.setHeader('X-Cache', 'MISS');
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear cache for specific pattern
 */
export const clearCache = (pattern) => {
  const stats = cache.getStats();
  stats.keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
};
