/**
 * Subtitle Wizard - Audio Extractor
 */

import { ffmpegController } from './FFmpegController.js';
import { DEFAULT_AUDIO_FORMAT } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Audio extractor for video files
 */
export class AudioExtractor {
  constructor() {
    this.extractedAudio = null;
    this.availableTracks = [];
  }

  /**
   * Extract audio from video file
   * @param {File} videoFile - Video file to process
   * @param {string} audioFormat - Output audio format
   * @param {function} progressCallback - Progress callback
   * @returns {Promise<File>} Extracted audio file
   */
  async extractAudio(videoFile, audioFormat = DEFAULT_AUDIO_FORMAT.extension, progressCallback = null) {
    logger.info(`Starting audio extraction for ${videoFile.name}`);

    try {
      // Extract audio using FFmpeg
      const audioFile = await ffmpegController.extractAudio(
        videoFile,
        audioFormat,
        progressCallback
      );

      this.extractedAudio = audioFile;
      this.availableTracks = this.analyzeAudio(audioFile);

      logger.info(`Audio extraction completed: ${audioFile.name}`);

      return audioFile;

    } catch (error) {
      logger.error('Audio extraction failed:', error);
      throw error;
    }
  }

  /**
   * Analyze audio file to get track information
   */
  analyzeAudio(audioFile) {
    // For now, return basic track info
    // Full analysis would require parsing audio metadata
    return [
      {
        id: 0,
        language: 'und',
        name: 'Default Audio Track',
        sampleRate: 44100,
        channels: 2,
        duration: null // Will be set when audio is loaded
      }
    ];
  }

  /**
   * Get the extracted audio file
   */
  getExtractedAudio() {
    return this.extractedAudio;
  }

  /**
   * Get available audio tracks
   */
  getAvailableTracks() {
    return this.availableTracks;
  }

  /**
   * Set the active audio track
   */
  setActiveTrack(trackId) {
    const track = this.availableTracks.find(t => t.id === trackId);
    if (track) {
      logger.info(`Active track set to: ${track.name}`);
      return true;
    }
    return false;
  }

  /**
   * Reset the extractor
   */
  reset() {
    this.extractedAudio = null;
    this.availableTracks = [];
    logger.info('Audio extractor reset');
  }
}

// Export singleton
export const audioExtractor = new AudioExtractor();
