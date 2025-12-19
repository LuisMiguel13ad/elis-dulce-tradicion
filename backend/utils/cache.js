/**
 * Simple in-memory cache with TTL
 * For production, replace with Redis
 */
class Cache {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }

  /**
   * Get value from cache
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in cache with TTL
   */
  set(key, value, ttlSeconds = 3600) {
    // Delete existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });

    // Set timer to auto-delete
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Delete from cache
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.store.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.store.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Export singleton instance
export const cache = new Cache();

// Cache key generators
export const cacheKeys = {
  pricing: {
    current: () => 'pricing:current',
    calculate: (params) => `pricing:calculate:${JSON.stringify(params)}`,
  },
  capacity: {
    availableDates: (days) => `capacity:dates:${days || 90}`,
    date: (date) => `capacity:date:${date}`,
    businessHours: () => 'capacity:hours',
    holidays: () => 'capacity:holidays',
  },
  products: {
    all: () => 'products:all',
    category: (category) => `products:category:${category}`,
  },
};
