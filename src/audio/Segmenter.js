/**
 * Subtitle Wizard - Audio Segmenter
 */

import { logger } from '../utils/logger.js';

/**
 * Audio segmenter using silence detection
 */
export class AudioSegmenter {
  constructor(options = {}) {
    this.silenceThreshold = options.silenceThreshold || -50; // dB
    this.minSilenceDuration = options.minSilenceDuration || 0.3; // seconds
    this.minSegmentDuration = options.minSegmentDuration || 1.0; // seconds
  }

  /**
   * Segment audio based on silence detection
   * @param {AudioBuffer} audioBuffer - Audio buffer to segment
   * @returns {Array<Object>} Array of segments with start/end times
   */
  segmentAudio(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const totalSamples = channelData.length;
    const totalDuration = audioBuffer.duration;

    // Convert silence threshold to linear amplitude
    const threshold = Math.pow(10, this.silenceThreshold / 20);
    const minSilenceSamples = this.minSilenceDuration * sampleRate;
    const minSegmentSamples = this.minSegmentDuration * sampleRate;

    const segments = [];
    let segmentStart = 0;
    let isInSegment = false;
    let segmentMaxAmplitude = 0;

    // Analyze samples
    for (let i = 0; i < totalSamples; i++) {
      const amplitude = Math.abs(channelData[i]);
      segmentMaxAmplitude = Math.max(segmentMaxAmplitude, amplitude);

      const isSilence = amplitude < threshold;
      const samplesInSegment = i - segmentStart;

      if (!isInSegment) {
        if (!isSilence) {
          // Start new segment
          isInSegment = true;
          segmentStart = i;
          segmentMaxAmplitude = amplitude;
        }
      } else {
        if (isSilence && samplesInSegment >= minSegmentSamples) {
          // End segment (we've had enough non-silence)
          const segmentEnd = i - minSilenceSamples;
          if (segmentEnd > segmentStart) {
            segments.push({
              start: segmentStart / sampleRate,
              end: segmentEnd / sampleRate,
              maxAmplitude: segmentMaxAmplitude,
              duration: (segmentEnd - segmentStart) / sampleRate
            });
          }
          isInSegment = false;
          segmentStart = i;
          segmentMaxAmplitude = 0;
        }
      }
    }

    // Close final segment if open
    if (isInSegment && totalSamples - segmentStart >= minSegmentSamples) {
      segments.push({
        start: segmentStart / sampleRate,
        end: totalDuration,
        maxAmplitude: segmentMaxAmplitude,
        duration: (totalSamples - segmentStart) / sampleRate
      });
    }

    // Merge adjacent segments that are too close together
    return this.mergeSegments(segments);
  }

  /**
   * Merge segments that are too close together
   */
  mergeSegments(segments) {
    const maxMergeGap = 0.5; // seconds

    return segments.reduce((merged, current) => {
      if (merged.length === 0) {
        return [current];
      }

      const last = merged[merged.length - 1];
      const gap = current.start - last.end;

      if (gap < maxMergeGap && (last.duration + current.duration + gap) < 10) {
        // Merge segments
        last.end = current.end;
        last.duration = current.end - last.start;
        last.maxAmplitude = Math.max(last.maxAmplitude, current.maxAmplitude);
      } else {
        merged.push(current);
      }

      return merged;
    }, []);
  }

  /**
   * Refine segments by splitting at natural pauses
   */
  refineSegments(segments, audioBuffer) {
    const refined = [];
    const sampleRate = audioBuffer.sampleRate;

    for (const segment of segments) {
      const startSample = Math.floor(segment.start * sampleRate);
      const endSample = Math.floor(segment.end * sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      // Find the quietest point in the middle third of the segment
      const midStart = startSample + Math.floor((endSample - startSample) / 3);
      const midEnd = endSample - Math.floor((endSample - startSample) / 3);

      let minAmplitude = Infinity;
      let splitPoint = null;

      for (let i = midStart; i < midEnd; i += Math.max(1, Math.floor(sampleRate * 0.05))) {
        const amplitude = Math.abs(channelData[i]);
        if (amplitude < minAmplitude) {
          minAmplitude = amplitude;
          splitPoint = i;
        }
      }

      if (splitPoint && (splitPoint - startSample) / sampleRate > 0.5 && (endSample - splitPoint) / sampleRate > 0.5) {
        // Split into two segments
        refined.push({
          start: segment.start,
          end: splitPoint / sampleRate,
          maxAmplitude: segment.maxAmplitude,
          confidence: 0.8
        });
        refined.push({
          start: splitPoint / sampleRate,
          end: segment.end,
          maxAmplitude: segment.maxAmplitude,
          confidence: 0.8
        });
      } else {
        refined.push(segment);
      }
    }

    return refined;
  }

  /**
   * Get confidence score for a segment based on amplitude
   */
  calculateConfidence(segment) {
    // Higher amplitude = better confidence
    const normalized = Math.min(1, segment.maxAmplitude * 10);
    return 0.5 + (normalized * 0.5);
  }

  /**
   * Segment audio and return subtitle-ready segments
   */
  process(audioBuffer) {
    let segments = this.segmentAudio(audioBuffer);
    segments = this.refineSegments(segments, audioBuffer);

    return segments.map(segment => ({
      id: this.generateId(),
      start: segment.start,
      end: segment.end,
      text: '', // Will be filled by Polly processing
      confidence: this.calculateConfidence(segment),
      source: 'silence_detection'
    }));
  }

  /**
   * Generate a unique ID
   */
  generateId() {
    return 'seg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
  }
}

// Export singleton
export const audioSegmenter = new AudioSegmenter();
