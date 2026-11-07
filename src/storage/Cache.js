/**
 * Subtitle Wizard - Cache for Polly responses
 */

import { STORAGE_KEYS, CACHE_PREFIX } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Cache manager for Polly responses and audio
 */
export class Cache {
  constructor() {
    this maxSize = 100; // Maximum number of cached items
    this.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Get cache key for text
   */
  getCacheKey(text) {
    // Simple hash function for text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return CACHE_PREFIX + Math.abs(hash).toString(36);
  }

  /**
   * Check if item is cached
   */
  has(key) {
    try {
      const item = localStorage.getItem(this.buildKey(key));
      if (!item) return false;

      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > this.maxAge) {
        this.delete(key);
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get cached item
   */
  get(key) {
    try {
      const item = localStorage.getItem(this.buildKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > this.maxAge) {
        this.delete(key);
        return null;
      }

      return parsed.value;
    } catch (e) {
      return null;
    }
  }

  /**
   * Set cached item
   */
  set(key, value) {
    try {
      // Get all cache keys to manage size
      const keys = this.getAllKeys();
      if (keys.length >= this.maxSize) {
        // Remove oldest items
        for (let i = 0; i < keys.length - this.maxSize + 1; i++) {
          this.deleteByRawKey(keys[i]);
        }
      }

      const item = {
        value: value,
        timestamp: Date.now()
      };

      localStorage.setItem(this.buildKey(key), JSON.stringify(item));

      logger.debug(`Cached item: ${key}`);
      return true;
    } catch (e) {
      logger.error('Failed to cache item:', e);
      return false;
    }
  }

  /**
   * Delete cached item
   */
  delete(key) {
    localStorage.removeItem(this.buildKey(key));
  }

  /**
   * Delete by raw key (internal)
   */
  deleteByRawKey(rawKey) {
    localStorage.removeItem(rawKey);
  }

  /**
   * Build full key with prefix
   */
  buildKey(key) {
    return STORAGE_KEYS.CACHE_PREFIX + key;
  }

  /**
   * Get all cache keys
   */
  getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Clear all cache
   */
  clear() {
    const keys = this.getAllKeys();
    for (const key of keys) {
      localStorage.removeItem(key);
    }

    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const keys = this.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    }

    return {
      count: keys.length,
      totalSize: totalSize,
      maxSize: this.maxSize
    };
  }

  /**
   * Set cache limit
   */
  setLimit(limit) {
    this.maxSize = limit;
  }

  /**
   * Set cache age limit (in milliseconds)
   */
  setMaxAge(age) {
    this.maxAge = age;
  }
}

// Export singleton
export const cache = new Cache();
