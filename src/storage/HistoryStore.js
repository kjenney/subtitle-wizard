/**
 * Subtitle Wizard - History Store
 */

import { STORAGE_KEYS } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Store for recent session history
 */
export class HistoryStore {
  constructor() {
    this.maxItems = 5;
  }

  /**
   * Get history
   */
  getHistory() {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!history) return [];

      const parsed = JSON.parse(history);
      return parsed;
    } catch (e) {
      logger.error('Failed to load history:', e);
      return [];
    }
  }

  /**
   * Add item to history
   */
  addItem(item) {
    const history = this.getHistory();

    // Check if item already exists (by session ID or video name)
    const exists = history.find(h =>
      h.sessionId === item.sessionId ||
      (h.videoName === item.videoName && h.timestamp === item.timestamp)
    );

    if (exists) {
      // Update existing item
      const index = history.indexOf(exists);
      history[index] = { ...item, timestamp: Date.now() };
    } else {
      // Add new item at beginning
      history.unshift({ ...item, timestamp: Date.now() });
    }

    // Trim to max items
    history.splice(this.maxItems);

    this.save(history);
  }

  /**
   * Remove item from history
   */
  removeItem(index) {
    const history = this.getHistory();
    if (index >= 0 && index < history.length) {
      history.splice(index, 1);
      this.save(history);
      return true;
    }
    return false;
  }

  /**
   * Clear history
   */
  clear() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    logger.info('History cleared');
  }

  /**
   * Save history
   */
  save(history) {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      logger.error('Failed to save history:', e);
    }
  }

  /**
   * Get last processed session
   */
  getLastItem() {
    const history = this.getHistory();
    return history.length > 0 ? history[0] : null;
  }

  /**
   * Check if session is in history
   */
  isInHistory(sessionId) {
    const history = this.getHistory();
    return history.some(h => h.sessionId === sessionId);
  }
}

// Export singleton
export const historyStore = new HistoryStore();
