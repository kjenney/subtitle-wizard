/**
 * Subtitle Wizard - Session Store
 */

import { STORAGE_KEYS, AUTO_SAVE_INTERVAL, DEFAULT_SETTINGS } from '../config.js';
import { encryptData, decryptData } from '../utils/encryption.js';
import { logger } from '../utils/logger.js';

/**
 * Session store for persistence
 */
export class SessionStore {
  constructor() {
    this.session = null;
    this.encryptionKey = null;
    this.saveInterval = null;
  }

  /**
   * Initialize session store
   */
  async init() {
    this.encryptionKey = this.getEncryptionKey();

    // Try to load existing session
    await this.load();

    // Start auto-save
    this.startAutoSave();

    logger.info('Session store initialized');
  }

  /**
   * Load session from localStorage
   */
  async load() {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.SESSION);

      if (!encrypted) {
        this.createEmptySession();
        return false;
      }

      // Try to decrypt with stored key
      try {
        const decrypted = await decryptData(encrypted, this.encryptionKey);
        this.session = decrypted;
      } catch (e) {
        // Fallback to plain decode if encryption key doesn't match
        this.session = JSON.parse(atob(encrypted));
      }

      logger.info('Session loaded successfully');
      return true;

    } catch (error) {
      logger.error('Failed to load session:', error);
      this.createEmptySession();
      return false;
    }
  }

  /**
   * Save session to localStorage
   */
  async save() {
    if (!this.session) {
      this.createEmptySession();
    }

    try {
      const encrypted = await encryptData(this.session, this.encryptionKey);
      localStorage.setItem(STORAGE_KEYS.SESSION, encrypted);

      logger.debug('Session saved');
      return true;

    } catch (error) {
      logger.error('Failed to save session:', error);
      // Try plain save for any encryption-related error or localStorage quota errors
      const shouldTryPlainSave = error.message && (
        error.message.includes('too large') ||
        error.message.includes('source array') ||
        error.message.includes('RangeError') ||
        error.message.includes('QuotaExceeded') ||
        error.message.includes('localStorage') ||
        // For any crypto-related error, try plain save as fallback
        error.name === 'EncryptError' ||
        error.name === 'EncryptionError' ||
        error.name === 'CryptoError'
      );
      if (shouldTryPlainSave) {
        logger.warn('Session save with encryption failed, attempting plain save');
        try {
          const plainData = btoa(JSON.stringify(this.session));
          localStorage.setItem(STORAGE_KEYS.SESSION, plainData);
          logger.info('Session saved in plain format (unencrypted)');
          return true;
        } catch (plainError) {
          logger.error('Failed to save session even without encryption:', plainError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Create empty session
   */
  createEmptySession() {
    this.session = {
      id: this.generateSessionId(),
      video: null,
      audioTrack: null,
      segments: [],
      settings: { ...DEFAULT_SETTINGS },
      cache: {
        polly: {},
        audio: {}
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Get current session
   */
  getSession() {
    return this.session;
  }

  /**
   * Update session data
   */
  updateSession(updates) {
    if (!this.session) return;

    this.session = {
      ...this.session,
      ...updates,
      updatedAt: Date.now()
    };

    this.save();
  }

  /**
   * Update video info
   */
  updateVideo(videoInfo) {
    if (!this.session) return;

    this.session.video = {
      ...videoInfo,
      updatedAt: Date.now()
    };

    this.save();
  }

  /**
   * Update audio track info
   */
  updateAudioTrack(trackInfo) {
    if (!this.session) return;

    this.session.audioTrack = {
      ...trackInfo,
      updatedAt: Date.now()
    };

    this.save();
  }

  /**
   * Update subtitle segments
   */
  updateSegments(segments) {
    if (!this.session) return;

    this.session.segments = segments;
    this.session.updatedAt = Date.now();

    this.save();
  }

  /**
   * Update settings
   */
  updateSettings(settings) {
    if (!this.session) return;

    this.session.settings = {
      ...this.session.settings,
      ...settings,
      updatedAt: Date.now()
    };

    this.save();
  }

  /**
   * Add a segment
   */
  addSegment(segment) {
    if (!this.session) return;

    this.session.segments.push(segment);
    this.session.updatedAt = Date.now();

    this.save();
  }

  /**
   * Update a segment
   */
  updateSegment(segmentId, updates) {
    if (!this.session) return;

    const index = this.session.segments.findIndex(s => s.id === segmentId);
    if (index === -1) return;

    this.session.segments[index] = {
      ...this.session.segments[index],
      ...updates,
      updatedAt: Date.now()
    };

    this.save();
  }

  /**
   * Delete a segment
   */
  deleteSegment(segmentId) {
    if (!this.session) return;

    this.session.segments = this.session.segments.filter(s => s.id !== segmentId);
    this.session.updatedAt = Date.now();

    this.save();
  }

  /**
   * Get encryption key
   */
  getEncryptionKey() {
    let key = localStorage.getItem('subtitle_wizard_encryption_key');

    if (!key) {
      key = this.generateEncryptionKey();
      localStorage.setItem('subtitle_wizard_encryption_key', key);
    }

    return key;
  }

  /**
   * Generate encryption key
   */
  generateEncryptionKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    return Array.from(array)
      .map(byte => chars[byte % chars.length])
      .join('');
  }

  /**
   * Clear session
   */
  async clear() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.createEmptySession();

    logger.info('Session cleared');
  }

  /**
   * Start auto-save
   */
  startAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }

    this.saveInterval = setInterval(() => {
      this.save();
    }, AUTO_SAVE_INTERVAL);

    logger.info(`Auto-save started (${AUTO_SAVE_INTERVAL / 1000}s interval)`);
  }

  /**
   * Stop auto-save
   */
  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  /**
   * Destroy the session store
   */
  destroy() {
    this.stopAutoSave();
    this.session = null;
  }
}

// Export singleton
export const sessionStore = new SessionStore();
