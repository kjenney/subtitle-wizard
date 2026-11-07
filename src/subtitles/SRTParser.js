/**
 * Subtitle Wizard - SRT Parser
 */

import { subtitleManager } from './SubtitleManager.js';
import { logger } from '../utils/logger.js';

/**
 * SRT (SubRip Subtitle) file parser and generator
 */
export class SRTParser {
  /**
   * Parse SRT content into segments
   * @param {string} srtContent - SRT file content
   * @returns {Array<Object>} Array of subtitle segments
   */
  parse(srtContent) {
    const segments = [];

    // Remove any BOM and normalize line endings
    const normalized = srtContent.replace(/^﻿/, '').replace(/\r\n/g, '\n');

    // Split into blocks by empty lines
    const blocks = normalized.trim().split('\n\n');

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;

      // Line 1: Index (optional)
      // Line 2: Timestamps
      // Line 3+: Text (may contain newlines)

      const timestampLine = lines[1];
      if (!timestampLine.includes('-->')) continue;

      const [startStr, endStr] = timestampLine.split('-->');
      if (!startStr || !endStr) continue;

      // Text is everything after timestamp line
      const textLines = lines.slice(2);
      const text = textLines.join('\n').replace(/\r/g, '');

      segments.push({
        id: this.generateId(),
        start: this.parseTime(startStr.trim()),
        end: this.parseTime(endStr.trim()),
        text: text.trim(),
        confidence: 0.5,
        timestamp: Date.now()
      });
    }

    // Sort by start time
    segments.sort((a, b) => a.start - b.start);

    return segments;
  }

  /**
   * Format segments to SRT content
   * @param {Array<Object>} segments - Subtitle segments
   * @returns {string} SRT content
   */
  format(segments) {
    let srt = '';

    segments.sort((a, b) => a.start - b.start).forEach((segment, index) => {
      srt += `${index + 1}\n`;
      srt += `${this.formatTime(segment.start)} --> ${this.formatTime(segment.end)}\n`;
      srt += `${segment.text}\n\n`;
    });

    return srt.trim();
  }

  /**
   * Parse time from SRT format
   * @param {string} timeStr - Time string (HH:MM:SS,mmm or HH:MM:SS.mmm)
   * @returns {number} Time in seconds
   */
  parseTime(timeStr) {
    const [time, ms] = timeStr.split(/,|\.`);
    const parts = time.split(':').map(Number);

    if (parts.length !== 3) return 0;

    const [hours, minutes, seconds] = parts;
    const milliseconds = ms ? Number(ms) : 0;

    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
  }

  /**
   * Format time to SRT format
   * @param {number} seconds - Time in seconds
   * @returns {string} Time string in SRT format
   */
  formatTime(seconds) {
    // Ensure non-negative
    if (seconds < 0) seconds = 0;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const pad = (num, size) => String(num).padStart(size, '0');

    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
  }

  /**
   * Export segments to downloadable SRT file
   * @param {Array<Object>} segments - Subtitle segments
   * @param {string} filename - Output filename
   */
  export(segments, filename) {
    const srtContent = this.format(segments);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import SRT from file
   * @param {File} file - SRT file
   * @returns {Promise<Array<Object>>} Parsed segments
   */
  async import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const segments = this.parse(content);

          // Clear existing and add new
          subtitleManager.clear();
          for (const segment of segments) {
            subtitleManager.addSegment(segment);
          }

          resolve(segments);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return 'seg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Validate SRT content
   * @param {string} content - SRT content to validate
   * @returns {boolean}
   */
  isValid(content) {
    if (!content || typeof content !== 'string') return false;

    const normalized = content.replace(/^﻿/, '').replace(/\r\n/g, '\n');
    const blocks = normalized.trim().split('\n\n');

    if (blocks.length === 0) return false;

    // Check first block has timestamps
    const firstBlock = blocks[0].split('\n');
    if (firstBlock.length < 2) return false;

    return firstBlock[1].includes('-->');
  }
}

// Export singleton
export const srtParser = new SRTParser();
