/**
 * Subtitle Wizard - Subtitle Editor
 */

import { subtitleManager } from './SubtitleManager.js';
import { logger } from '../utils/logger.js';

/**
 * Manages subtitle editing state
 */
export class SubtitleEditor {
  constructor() {
    this.currentSegmentId = null;
    this.isEditing = false;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;
  }

  /**
   * Set current segment for editing
   */
  setCurrentSegment(segmentId) {
    this.currentSegmentId = segmentId;
    logger.debug(`Current segment set to: ${segmentId}`);
  }

  /**
   * Get current segment
   */
  getCurrentSegment() {
    if (!this.currentSegmentId) return null;
    return subtitleManager.getSegment(this.currentSegmentId);
  }

  /**
   * Begin editing a segment
   */
  beginEdit(segmentId) {
    this.isEditing = true;
    this.setCurrentSegment(segmentId);
    this.saveState();
  }

  /**
   * Save current state to history
   */
  saveState() {
    // Remove future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add current state
    const state = {
      segments: JSON.parse(JSON.stringify(subtitleManager.getAllSegments())),
      timestamp: Date.now()
    };

    this.history.push(state);
    this.historyIndex++;

    // Trim history if needed
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }

    logger.debug('State saved to history');
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
      logger.debug('Undo performed');
      return true;
    }
    return false;
  }

  /**
   * Redo next action
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
      logger.debug('Redo performed');
      return true;
    }
    return false;
  }

  /**
   * Restore state from history
   */
  restoreState(state) {
    subtitleManager.clear();

    for (const segment of state.segments) {
      subtitleManager.addSegment(segment);
    }
  }

  /**
   * Update current segment text
   */
  updateSegmentText(text) {
    if (!this.currentSegmentId) return false;

    subtitleManager.updateSegment(this.currentSegmentId, { text });
    return true;
  }

  /**
   * Update current segment timing
   */
  updateSegmentTiming(start, end) {
    if (!this.currentSegmentId) return false;

    subtitleManager.updateSegment(this.currentSegmentId, { start, end });
    return true;
  }

  /**
   * Move segment
   */
  moveSegment(segmentId, offset) {
    const segment = subtitleManager.getSegment(segmentId);
    if (!segment) return false;

    const newStart = Math.max(0, segment.start + offset);
    const duration = segment.end - segment.start;
    const newEnd = newStart + duration;

    subtitleManager.updateSegment(segmentId, { start: newStart, end: newEnd });
    return true;
  }

  /**
   * Adjust segment end time
   */
  adjustEnd(segmentId, offset) {
    const segment = subtitleManager.getSegment(segmentId);
    if (!segment) return false;

    const newEnd = Math.max(segment.start + 0.1, segment.end + offset);
    subtitleManager.updateSegment(segmentId, { end: newEnd });
    return true;
  }

  /**
   * Adjust segment start time
   */
  adjustStart(segmentId, offset) {
    const segment = subtitleManager.getSegment(segmentId);
    if (!segment) return false;

    const newStart = Math.max(0, segment.start + offset);
    if (newStart >= segment.end) return false;

    subtitleManager.updateSegment(segmentId, { start: newStart });
    return true;
  }

  /**
   * Split current segment at a position
   */
  splitSegment(segmentId, position) {
    const segment = subtitleManager.getSegment(segmentId);
    if (!segment) return null;

    if (position <= segment.start || position >= segment.end) return null;

    // Create new segment with second half
    const newSegment = {
      start: position,
      end: segment.end,
      text: segment.text,
      confidence: segment.confidence,
      voice: segment.voice
    };

    // Update original segment
    subtitleManager.updateSegment(segmentId, { end: position, text: segment.text });

    // Add new segment
    const newId = subtitleManager.addSegment(newSegment).id;

    return newId;
  }

  /**
   * Merge with next segment
   */
  mergeWithNext(segmentId) {
    const currentIndex = this.getSegmentIndex(segmentId);
    if (currentIndex === -1 || currentIndex === subtitleManager.getAllSegments().length - 1) {
      return false;
    }

    const current = subtitleManager.getSegment(segmentId);
    const next = subtitleManager.getAllSegments()[currentIndex + 1];

    // Update current segment
    subtitleManager.updateSegment(segmentId, {
      end: next.end,
      text: `${current.text} ${next.text}`,
      confidence: Math.min(current.confidence, next.confidence)
    });

    // Delete next segment
    subtitleManager.deleteSegment(next.id);

    return true;
  }

  /**
   * Get segment index
   */
  getSegmentIndex(segmentId) {
    const segments = subtitleManager.getAllSegments();
    return segments.findIndex(s => s.id === segmentId);
  }

  /**
   * Get previous segment
   */
  getPreviousSegment(segmentId) {
    const index = this.getSegmentIndex(segmentId);
    if (index > 0) {
      return subtitleManager.getAllSegments()[index - 1];
    }
    return null;
  }

  /**
   * Get next segment
   */
  getNextSegment(segmentId) {
    const index = this.getSegmentIndex(segmentId);
    const segments = subtitleManager.getAllSegments();
    if (index !== -1 && index < segments.length - 1) {
      return segments[index + 1];
    }
    return null;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
    this.historyIndex = -1;
    logger.info('Undo/redo history cleared');
  }

  /**
   * Can undo?
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  /**
   * Can redo?
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Get current edit state
   */
  getState() {
    return {
      currentSegmentId: this.currentSegmentId,
      isEditing: this.isEditing,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      HistoryLength: this.history.length
    };
  }

  /**
   * Reset editor state
   */
  reset() {
    this.currentSegmentId = null;
    this.isEditing = false;
    this.clearHistory();
    logger.info('Subtitle editor reset');
  }
}

// Export singleton
export const subtitleEditor = new SubtitleEditor();
