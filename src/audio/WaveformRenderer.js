/**
 * Subtitle Wizard - Waveform Renderer
 */

import { logger } from '../utils/logger.js';

/**
 * Waveform renderer for audio visualization
 */
export class WaveformRenderer {
  constructor(canvasId, options = {}) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.audioBuffer = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.height = options.height || 100;
    this.waveformColor = options.waveformColor || '#4CAF50';
    this.backgroundColor = options.backgroundColor || '#1a1a1a';
    this.playheadColor = options.playheadColor || '#FF5722';
    this.renderId = null;
  }

  /**
   * Initialize the canvas
   */
  init() {
    this.canvas = document.getElementById(this.canvasId);

    if (!this.canvas) {
      logger.error(`Canvas with id "${this.canvasId}" not found`);
      return false;
    }

    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this.canvas.height = this.height;

    return true;
  }

  /**
   * Set audio buffer
   */
  setAudioBuffer(audioBuffer) {
    this.audioBuffer = audioBuffer;
  }

  /**
   * Render waveform
   * @param {number} duration - Audio duration in seconds
   */
  render(duration) {
    if (!this.ctx || !this.audioBuffer) return;

    const channelData = this.audioBuffer.getChannelData(0);
    const sampleCount = channelData.length;
    const viewWidth = this.canvas.width;
    const sampleStep = Math.floor(sampleCount / viewWidth);

    // Clear canvas
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, viewWidth, this.height);

    const midY = this.height / 2;

    // Draw waveform
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.waveformColor;
    this.ctx.lineWidth = 1;

    for (let x = 0; x < viewWidth; x++) {
      let max = 0;

      for (let i = 0; i < sampleStep; i++) {
        const sampleIndex = x * sampleStep + i;
        if (sampleIndex < sampleCount) {
          const val = Math.abs(channelData[sampleIndex]);
          max = Math.max(max, val);
        }
      }

      const y = midY - (max * midY);
      const y2 = midY + (max * midY);

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      // Draw bottom half
      if (x === 0) {
        this.ctx.moveTo(x, y2);
      } else {
        this.ctx.lineTo(x, y2);
      }
    }

    this.ctx.stroke();

    // Draw time markers
    this.drawTimeMarkers(duration);
  }

  /**
   * Draw time markers
   */
  drawTimeMarkers(duration) {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#888';
    this.ctx.font = '10px sans-serif';

    // Draw 5 markers evenly spaced
    const markerCount = 5;
    const viewWidth = this.canvas.width;

    for (let i = 0; i <= markerCount; i++) {
      const x = (viewWidth / markerCount) * i;
      const time = (duration / markerCount) * i;

      this.ctx.fillRect(x, 0, 1, this.height);
      this.ctx.fillText(this.formatTime(time), x + 2, 15);
    }
  }

  /**
   * Draw playhead
   */
  drawPlayhead(time) {
    if (!this.ctx || !this.canvas.width) return;

    const duration = this.audioBuffer ? this.audioBuffer.duration : 1;
    const x = (time / duration) * this.canvas.width;
    const midY = this.height / 2;

    // Clear previous playhead by redrawing
    // (In a real app, you'd just redraw the waveform)
    this.ctx.strokeStyle = this.playheadColor;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.height);
    this.ctx.stroke();

    // Draw triangle marker at top
    this.ctx.fillStyle = this.playheadColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 5, 0);
    this.ctx.lineTo(x + 5, 0);
    this.ctx.lineTo(x, 10);
    this.ctx.fill();

    this.currentTime = time;
  }

  /**
   * Format time as MM:SS
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Update playhead position
   */
  updatePlayhead(time) {
    if (!this.ctx || !this.canvas) return;

    // Get duration from canvas data or audio buffer
    const duration = this.audioBuffer ? this.audioBuffer.duration : 1;
    const x = (time / duration) * this.canvas.width;
    const midY = this.height / 2;

    // Clear previous playhead (simple approach: redraw entire waveform)
    // For better performance, you'd keep the waveform as image data and only redraw playhead

    // Redraw playhead
    this.ctx.strokeStyle = this.playheadColor;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.height);
    this.ctx.stroke();

    // Draw triangle
    this.ctx.fillStyle = this.playheadColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 5, 0);
    this.ctx.lineTo(x + 5, 0);
    this.ctx.lineTo(x, 10);
    this.ctx.fill();
  }

  /**
   * Clear waveform
   */
  clear() {
    if (!this.ctx) return;

    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.height);
  }

  /**
   * Resize canvas
   */
  resize(width, height) {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Destroy the renderer
   */
  destroy() {
    if (this.renderId) {
      cancelAnimationFrame(this.renderId);
    }

    this.canvas = null;
    this.ctx = null;
    this.audioBuffer = null;
  }
}

// Export factory function
export function createWaveformRenderer(canvasId, options = {}) {
  return new WaveformRenderer(canvasId, options);
}
