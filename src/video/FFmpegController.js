/**
 * Subtitle Wizard - FFmpeg.wasm Controller
 */

import { FFMPEG_WASM_URL, FFMPEG_CORE_URL } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * FFmpeg.wasm controller for video processing
 */
export class FFmpegController {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
    this.loadProgress = 0;
  }

  /**
   * Load FFmpeg.wasm
   */
  async load() {
    try {
      logger.info('Loading FFmpeg.wasm...');

      // Import ffmpeg.js from CDN
      const ffmpegModule = await import(FFMPEG_WASM_URL);

      this.ffmpeg = ffmpegModule.default;

      // Create a proxy object for the ffmpeg instance
      this.ffmpegInstance = new this.ffmpeg({
        memoryInitMethod: 'fetch'
      });

      this.isLoaded = true;
      this.loadProgress = 100;

      logger.info('FFmpeg.wasm loaded successfully');

    } catch (error) {
      logger.error('Failed to load FFmpeg.wasm:', error);
      throw error;
    }
  }

  /**
   * Extract audio from video file
   * @param {File} videoFile - Video file to process
   * @param {string} audioFormat - Output audio format
   * @param {function} progressCallback - Progress callback
   * @returns {Promise<File>} Extracted audio file
   */
  async extractAudio(videoFile, audioFormat = 'mp3', progressCallback = null) {
    if (!this.isLoaded) {
      await this.load();
    }

    logger.info(`Extracting audio from ${videoFile.name} as ${audioFormat}`);

    // Create a blob URL for the input file
    const videoUrl = URL.createObjectURL(videoFile);

    // Create output file
    const outputName = `${videoFile.name.split('.')[0]}.${audioFormat}`;

    try {
      // Use FFmpeg Core directly via the CDN
      const ffmpeg = await import(FFMPEG_CORE_URL);

      // Create a fresh instance for this operation
      const instance = await ffmpeg({
        arguments: [
          '-i', videoUrl,
          '-vn', // No video
          '-acodec', this.getCodec(audioFormat),
          '-ar', '44100', // Audio sample rate
          '-ac', '2', // Stereo
          '-ab', '192k', // Audio bitrate
          outputName
        ],
        cores: 4,
        memLimit: 0, // No limit
        timeout: 0, // No timeout
        useWorkerPool: true
      });

      // Get output file
      const outputFile = instance.FS('readFile', outputName);

      // Create File object
      const audioBlob = new Blob([outputFile], { type: `audio/${audioFormat}` });
      const audioFile = new File([audioBlob], outputName, {
        type: `audio/${audioFormat}`,
        lastModified: Date.now()
      });

      // Cleanup
      instance.FS('unlink', outputName);

      logger.info(`Audio extraction complete: ${audioFile.name}`);

      return audioFile;

    } catch (error) {
      logger.error('Audio extraction failed:', error);
      throw error;
    }
  }

  /**
   * Get codec for audio format
   */
  getCodec(format) {
    const codecs = {
      mp3: 'libmp3lame',
      wav: 'pcm_s16le',
      aac: 'aac'
    };
    return codecs[format] || 'libmp3lame';
  }

  /**
   * Get load progress
   */
  getLoadProgress() {
    return this.loadProgress;
  }

  /**
   * Check if FFmpeg is loaded
   */
  isFFmpegLoaded() {
    return this.isLoaded;
  }

  /**
   * Unload FFmpeg to free memory
   */
  async unload() {
    if (this.ffmpegInstance) {
      // Try to terminate worker pool
      if (this.ffmpegInstance.terminate) {
        await this.ffmpegInstance.terminate();
      }
    }
    this.ffmpegInstance = null;
    this.isLoaded = false;
    this.loadProgress = 0;
    logger.info('FFmpeg.wasm unloaded');
  }
}

// Export singleton
export const ffmpegController = new FFmpegController();
