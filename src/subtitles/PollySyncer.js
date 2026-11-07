/**
 * Subtitle Wizard - Polly Syncer
 */

import { pollyClient } from '../aws/pollyClient.js';
import { subtitleManager } from './SubtitleManager.js';
import { audioSegmenter } from '../audio/Segmenter.js';
import { logger } from '../utils/logger.js';

/**
 * Handles Polly TTS synthesis and subtitle synchronization
 */
export class PollySyncer {
  constructor() {
    this.currentVoice = 'Joanna';
    this.currentLanguage = 'en-US';
    this.synthesisRate = 1.0;
    this.isProcessing = false;
    this.segmentsToProcess = [];
  }

  /**
   * Set processing options
   */
  setOptions(options) {
    if (options.voice) this.currentVoice = options.voice;
    if (options.language) this.currentLanguage = options.language;
    if (options.rate) this.synthesisRate = options.rate;
  }

  /**
   * Process all unprocessed segments
   * @param {function} progressCallback - Progress callback: (current, total) => void
   * @returns {Promise<Array>} Array of processed segments
   */
  async processAllSegments(progressCallback = null) {
    const segments = subtitleManager.getAllSegments();
    const unprocessed = segments.filter(s => !s.text || s.text.trim() === '');

    if (unprocessed.length === 0) {
      logger.info('All segments already processed');
      return segments;
    }

    this.segmentsToProcess = unprocessed;
    this.isProcessing = true;

    const total = unprocessed.length;
    const results = [];

    for (let i = 0; i < unprocessed.length; i++) {
      const segment = unprocessed[i];

      try {
        // Synthesize speech for this segment
        const result = await this.synthesizeSegment(segment);

        // Update segment with text and confidence
        subtitleManager.updateSegment(segment.id, {
          text: result.text,
          confidence: result.confidence,
          voice: this.currentVoice
        });

        results.push({
          ...segment,
          text: result.text,
          confidence: result.confidence
        });

        if (progressCallback) {
          progressCallback(i + 1, total);
        }

      } catch (error) {
        logger.error(`Failed to process segment ${segment.id}:`, error);

        // Keep original segment with error flag
        subtitleManager.updateSegment(segment.id, {
          confidence: 0,
         voice: this.currentVoice
        });
      }
    }

    this.isProcessing = false;
    this.segmentsToProcess = [];

    return subtitleManager.getAllSegments();
  }

  /**
   * Synthesize a single segment
   */
  async synthesizeSegment(segment) {
    const text = segment.text || '...';

    try {
      const result = await pollyClient.synthesize(text, {
        voice: this.currentVoice,
        language: this.currentLanguage
      });

      // For now, return placeholder text
      // In a real implementation, you'd use Polly's word timestamps

      return {
        text: text, // Use original text if synthesis successful
        confidence: 0.9,
        audio: result
      };

    } catch (error) {
      logger.error('Polly synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Generate initial segments from audio
   * @param {AudioBuffer} audioBuffer - Audio buffer to analyze
   * @returns {Promise<Array>} Generated segments
   */
  async generateSegmentsFromAudio(audioBuffer) {
    // Segment audio by silence
    let segments = audioSegmenter.process(audioBuffer);

    // Add Polly voice info
    segments = segments.map(s => ({
      ...s,
      voice: this.currentVoice
    }));

    // Add to subtitle manager
    subtitleManager.clear();
    for (const segment of segments) {
      subtitleManager.addSegment(segment);
    }

    logger.info(`Generated ${segments.length} segments from audio`);

    return segments;
  }

  /**
   * Update segment timing based on Polly word timestamps
   */
  syncSegmentTiming(segmentId, wordTimestamps) {
    const segment = subtitleManager.getSegment(segmentId);
    if (!segment) return false;

    // Use word timestamps to refine timing
    if (wordTimestamps && wordTimestamps.length > 0) {
      const words = segment.text.trim().split(/\s+/);

      if (words.length === wordTimestamps.length) {
        // Update timing based on actual word durations
        const duration = segment.end - segment.start;
        const totalTime = wordTimestamps[wordTimestamps.length - 1].time;

        let currentTime = segment.start;

        const newSegment = { ...segment };

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const endTime = wordTimestamps[i].time / 1000; // Convert to seconds

          // Scale to match segment duration
          const scaledEnd = currentTime + (endTime * duration / totalTime);

          if (i === words.length - 1) {
            newSegment.end = segment.end; // Ensure ends at original time
          }

          currentTime = scaledEnd;
        }

        return subtitleManager.updateSegment(segmentId, newSegment);
      }
    }

    return false;
  }

  /**
   * Cancel current processing
   */
  cancel() {
    this.isProcessing = false;
    this.segmentsToProcess = [];
    logger.info('Polly processing cancelled');
  }

  /**
   * Check if processing is in progress
   */
  isProcessing() {
    return this.isProcessing;
  }

  /**
   * Get current processing progress
   */
  getProgress() {
    if (!this.isProcessing || this.segmentsToProcess.length === 0) {
      return { current: 0, total: 0, percent: 0 };
    }

    // This would track actual progress in a real implementation
    return { current: 0, total: this.segmentsToProcess.length, percent: 0 };
  }
}

// Export singleton
export const pollySyncer = new PollySyncer();
