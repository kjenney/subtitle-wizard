/**
 * Subtitle Wizard - Subtitle Manager
 */

import { SUBTITLE } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Manages subtitle segments
 */
export class SubtitleManager {
  constructor() {
    this.segments = [];
    this.settings = {
      ...SUBTITLE
    };
  }

  /**
   * Add a new subtitle segment
   */
  addSegment(segment) {
    const newSegment = {
      id: segment.id || this.generateId(),
      start: parseFloat(segment.start) || 0,
      end: parseFloat(segment.end) || 0,
      text: segment.text || '',
      confidence: parseFloat(segment.confidence) || 0.5,
      voice: segment.voice || null,
      timestamp: Date.now()
    };

    // Validate timing
    if (newSegment.start < 0) newSegment.start = 0;
    if (newSegment.end <= newSegment.start) newSegment.end = newSegment.start + 1;

    this.segments.push(newSegment);
    this.segments.sort((a, b) => a.start - b.start);

    logger.debug(`Added segment: ${newSegment.id}`);
    return newSegment;
  }

  /**
   * Update an existing segment
   */
  updateSegment(id, updates) {
    const index = this.segments.findIndex(s => s.id === id);
    if (index === -1) return null;

    const segment = { ...this.segments[index], ...updates, timestamp: Date.now() };

    // Validate timing
    if (segment.start < 0) segment.start = 0;
    if (segment.end <= segment.start) segment.end = segment.start + 0.5;

    this.segments[index] = segment;
    this.segments.sort((a, b) => a.start - b.start);

    logger.debug(`Updated segment: ${id}`);
    return segment;
  }

  /**
   * Delete a segment
   */
  deleteSegment(id) {
    const index = this.segments.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.segments.splice(index, 1);
    logger.debug(`Deleted segment: ${id}`);
    return true;
  }

  /**
   * Get a segment by ID
   */
  getSegment(id) {
    return this.segments.find(s => s.id === id);
  }

  /**
   * Get all segments
   */
  getAllSegments() {
    return this.segments;
  }

  /**
   * Get segments within a time range
   */
  getSegmentsInRange(startTime, endTime) {
    return this.segments.filter(s =>
      s.start >= startTime && s.end <= endTime
    );
  }

  /**
   * Get current segment at a given time
   */
  getCurrentSegment(time) {
    return this.segments.find(s => time >= s.start && time <= s.end);
  }

  /**
   * Generate segments from text and timing
   */
  generateSegmentsFromText(text, voice, options = {}) {
    const sentences = this.splitIntoSentences(text);
    const segmentDuration = options.segmentDuration || 3; // seconds per sentence on average

    const segments = [];
    let currentTime = 0;

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/).length;
      const duration = Math.max(1, words / 2.5); // Average 2.5 words/second

      segments.push({
        id: this.generateId(),
        start: currentTime,
        end: currentTime + duration,
        text: sentence.trim(),
        confidence: 0.7,
        voice: voice,
        timestamp: Date.now()
      });

      currentTime += duration;
    }

    this.segments = segments;
    return segments;
  }

  /**
   * Split text into sentences
   */
  splitIntoSentences(text) {
    // Simple sentence splitting
    return text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [text];
  }

  /**
   * Calculate total duration
   */
  getTotalDuration() {
    if (this.segments.length === 0) return 0;
    return this.segments[this.segments.length - 1].end;
  }

  /**
   * Calculate average confidence
   */
  getAverageConfidence() {
    if (this.segments.length === 0) return 0;
    const total = this.segments.reduce((sum, s) => sum + (s.confidence || 0), 0);
    return total / this.segments.length;
  }

  /**
   * Export segments to SRT format
   */
  toSRT() {
    let srt = '';

    this.segments.forEach((segment, index) => {
      srt += `${index + 1}\n`;
      srt += `${this.formatTime(segment.start)} --> ${this.formatTime(segment.end)}\n`;
      srt += `${segment.text}\n\n`;
    });

    return srt.trim();
  }

  /**
   * Import segments from SRT content
   */
  fromSRT(srtContent) {
    const segments = [];
    const blocks = srtContent.trim().split(/\n\n+/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;

      // Parse timestamp line
      const timestampLine = lines[1];
      const [startStr, endStr] = timestampLine.split(' --> ');

      // Text is all lines after timestamp
      const text = lines.slice(2).join(' ');

      segments.push({
        id: this.generateId(),
        start: this.parseTime(startStr.trim()),
        end: this.parseTime(endStr.trim()),
        text: text.replace(/\r/g, ''),
        confidence: 0.5,
        timestamp: Date.now()
      });
    }

    this.segments = segments.sort((a, b) => a.start - b.start);
    return this.segments;
  }

  /**
   * Format time for SRT
   */
  formatTime(seconds) {
    const date = new Date(0);
    date.setUTCMilliseconds(seconds * 1000);

    const hh = date.getUTCHours().toString().padStart(2, '0');
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    const ms = Math.floor(date.getUTCMilliseconds()).toString().padStart(3, '0');

    return `${hh}:${mm}:${ss},${ms}`;
  }

  /**
   * Parse time from SRT
   */
  parseTime(timeStr) {
    const [time, ms] = timeStr.split(',');
    const [h, m, s] = time.split(':').map(Number);
    return h * 3600 + m * 60 + s + (ms ? parseInt(ms) / 1000 : 0);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return 'seg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Clear all segments
   */
  clear() {
    this.segments = [];
    logger.info('All segments cleared');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      count: this.segments.length,
      totalDuration: this.getTotalDuration(),
      averageConfidence: this.getAverageConfidence(),
      startTime: this.segments.length ? this.segments[0].start : 0,
      endTime: this.segments.length ? this.segments[this.segments.length - 1].end : 0
    };
  }
}

// Export singleton
export const subtitleManager = new SubtitleManager();
