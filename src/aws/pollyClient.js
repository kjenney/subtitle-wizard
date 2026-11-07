/**
 * Subtitle Wizard - AWS Polly Client
 */

import { AWS_POLLY } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * AWS Polly API client
 */
export class PollyClient {
  constructor(credentials) {
    this.credentials = credentials;
    this.awsConfig = {
      region: credentials?.region || AWS_POLLY.region,
      credentials: credentials
    };

    // For browser use, we'll use the AWS SDK v3
    this.api = null;
  }

  /**
   * Initialize AWS SDK
   */
  async init() {
    try {
      // Dynamically import AWS SDK
      const { PollyClient, SynthesizeSpeechCommand } = await import(
        'https://unpkg.com/@aws-sdk/client-polly@3.637.0/es/PollyClient.js'
      );

      this.client = new PollyClient(this.awsConfig);
      this.synthesizeCommand = SynthesizeSpeechCommand;

      logger.info('Polly client initialized');
      return true;

    } catch (error) {
      logger.error('Failed to initialize Polly client:', error);
      throw error;
    }
  }

  /**
   * Synthesize speech using Polly
   * @param {string} text - Text to synthesize
   * @param {Object} options - Synthesis options
   * @returns {Promise<Object>} Audio data and timestamps
   */
  async synthesize(text, options = {}) {
    if (!this.client) {
      await this.init();
    }

    const params = {
      Text: text,
      OutputFormat: AWS_POLLY.outputFormat,
      VoiceId: options.voice || AWS_POLLY.supportedLanguages['en-US'].defaultVoice,
      SampleRate: AWS_POLLY.sampleRate.toString(),
      LanguageCode: options.language || 'en-US'
    };

    try {
      const command = new this.synthesizeCommand(params);
      const response = await this.client.send(command);

      // Process response
      const result = {
        audioStream: response.AudioStream,
        requestCharacters: response.RequestCharacters || 0,
        contentType: response.ContentType,
        voiceId: params.VoiceId
      };

      logger.debug(`Synthesized ${text.substring(0, 50)}... (${result.requestCharacters} chars)`);

      return result;

    } catch (error) {
      logger.error('Polly synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Get available voices for a language
   * @param {string} languageCode - Language code (e.g., 'en-US')
   * @returns {Promise<Array>} List of available voices
   */
  async describeVoices(languageCode = 'en-US') {
    if (!this.client) {
      await this.init();
    }

    try {
      const { DescribeVoicesCommand } = await import(
        'https://unpkg.com/@aws-sdk/client-polly@3.637.0/es/DescribeVoicesCommand.js'
      );

      const command = new DescribeVoicesCommand({ LanguageCode: languageCode });
      const response = await this.client.send(command);

      return response.Voices || [];

    } catch (error) {
      logger.warn('Failed to describe voices:', error);
      // Return default voices from config
      return AWS_POLLY.supportedLanguages[languageCode]?.voices || [];
    }
  }

  /**
   * Check if credentials are valid
   * @returns {Promise<boolean>}
   */
  async testCredentials() {
    if (!this.client) {
      await this.init();
    }

    try {
      // Try a simple call with minimal text
      await this.synthesize('Hello', { voice: 'Joanna' });
      return true;
    } catch (error) {
      logger.warn('Credentials test failed:', error);
      return false;
    }
  }

  /**
   * Pause the client
   */
  pause() {
    // No-op for Polly - connection persists
  }

  /**
   * Resume the client
   */
  resume() {
    // No-op for Polly - connection persists
  }
}

// Export singleton
export const pollyClient = new PollyClient();
