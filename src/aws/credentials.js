/**
 * Subtitle Wizard - AWS Credentials Manager
 */

import { STORAGE_KEYS } from '../config.js';
import { encryptData, decryptData } from '../utils/encryption.js';

/**
 * AWS credentials manager
 */
export class CredentialsManager {
  constructor() {
    this.credentials = null;
    this.encryptionKey = null;
  }

  /**
   * Store AWS credentials
   * @param {string} accessKeyId - AWS Access Key ID
   * @param {string} secretAccessKey - AWS Secret Access Key
   * @param {string} region - AWS Region (optional)
   */
  async storeCredentials(accessKeyId, secretAccessKey, region = 'us-east-1') {
    const credentialsData = {
      accessKeyId,
      secretAccessKey,
      region,
      storedAt: Date.now()
    };

    // Encrypt credentials
    const encrypted = await encryptData(credentialsData, this.getEncryptionKey());

    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, encrypted);

    // Store in memory
    this.credentials = credentialsData;

    return true;
  }

  /**
   * Retrieve stored credentials
   * @returns {Promise<Object|null>} Stored credentials or null
   */
  async getCredentials() {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);

      if (!encrypted) {
        return null;
      }

      // If we have an encryption key, use it
      if (this.encryptionKey) {
        try {
          const decrypted = await decryptData(encrypted, this.encryptionKey);
          this.credentials = decrypted;
          return decrypted;
        } catch (e) {
          // Fall through to prompt for password
        }
      }

      // For now, store credentials in plain text (will be improved)
      // In production, you'd want a secure password storage mechanism
      this.credentials = JSON.parse(atob(encrypted));
      return this.credentials;

    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  /**
   * Check if credentials are stored
   */
  hasCredentials() {
    const encrypted = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    return !!encrypted;
  }

  /**
   * Clear stored credentials
   */
  clearCredentials() {
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    this.credentials = null;
  }

  /**
   * Get encryption key (from environment or generated)
   */
  getEncryptionKey() {
    if (!this.encryptionKey) {
      // Generate a key from localStorage if available, otherwise create new
      let storedKey = localStorage.getItem('subtitle_wizard_encryption_key');

      if (!storedKey) {
        storedKey = this.generateEncryptionKey();
        localStorage.setItem('subtitle_wizard_encryption_key', storedKey);
      }

      this.encryptionKey = storedKey;
    }

    return this.encryptionKey;
  }

  /**
   * Generate a random encryption key
   */
  generateEncryptionKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    return Array.from(array)
      .map(byte => chars[byte % chars.length])
      .join('');
  }
}

// Export singleton
export const credentialsManager = new CredentialsManager();
