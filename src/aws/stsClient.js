/**
 * Subtitle Wizard - STS Client for temporary credentials
 */

import { CredentialsManager } from './credentials.js';

/**
 * STS (Security Token Service) client
 * Used for obtaining temporary credentials with limited scope
 */
export class STSClient {
  constructor() {
    this.credentialsManager = new CredentialsManager();
    this.tempCredentials = null;
  }

  /**
   * Get temporary credentials
   * @param {Object} params - STS parameters
   * @returns {Promise<Object>} Temporary credentials
   */
  async getTemporaryCredentials(params) {
    // For client-side only applications, we'll use long-lived credentials
    // In production, you'd implement proper STS temp creds flow

    const credentials = await this.credentialsManager.getCredentials();

    if (!credentials) {
      throw new Error('No AWS credentials found');
    }

    return credentials;
  }

  /**
   * Refresh temporary credentials
   */
  async refreshCredentials() {
    return this.getTemporaryCredentials();
  }

  /**
   * Check if temporary credentials are valid
   */
  isValid() {
    return this.tempCredentials !== null && this.tempCredentials !== undefined;
  }
}
