/**
 * Subtitle Wizard - Subtitle Overlay
 */

import { subtitleManager } from '../subtitles/SubtitleManager.js';
import { logger } from '../utils/logger.js';

/**
 * Subtitle overlay for video player
 */
export class SubtitleOverlay {
  constructor(videoElementId, options = {}) {
    this.videoId = videoElementId;
    this.videoElement = document.getElementById(videoElementId);
    this.container = null;
    this.settings = {
      color: options.color || '#FFFFFF',
      fontSize: options.fontSize || 16,
      backgroundColor: options.backgroundColor || 'rgba(0, 0, 0, 0.7)',
      showBackground: options.showBackground !== false,
      outline: options.outline || true,
      position: options.position || 'bottom'
    };
    this.subtitleElement = null;
  }

  /**
   * Initialize the overlay
   */
  init() {
    if (!this.videoElement) {
      logger.error(`Video element with id "${this.videoId}" not found`);
      return false;
    }

    // Create overlay container
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: absolute;
      bottom: ${this.settings.position === 'bottom' ? '60px' : '20%' };
      left: 0;
      right: 0;
      text-align: center;
      pointer-events: none;
      padding: 0 20px;
      box-sizing: border-box;
    `;

    // Create subtitle text element
    this.subtitleElement = document.createElement('div');
    this.subtitleElement.id = 'subtitle-text';
    this.subtitleElement.style.cssText = `
      display: inline-block;
      color: ${this.settings.color};
      font-size: ${this.settings.fontSize}px;
      font-family: sans-serif;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      background: ${this.settings.showBackground ? this.settings.backgroundColor : 'transparent'};
      padding: 10px 20px;
      border-radius: 4px;
      line-height: 1.4;
      max-width: 90%;
      word-wrap: break-word;
    `;

    if (this.settings.outline) {
      this.subtitleElement.style.textShadow = `
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000
      `;
    }

    this.container.appendChild(this.subtitleElement);

    // Insert after video element
    this.videoElement.parentNode.insertBefore(this.container, this.videoElement.nextSibling);

    // Listen for time updates
    this.videoElement.addEventListener('timeupdate', () => this.update());

    logger.info('Subtitle overlay initialized');
    return true;
  }

  /**
   * Update subtitle based on video time
   */
  update() {
    if (!this.subtitleElement) return;

    const time = this.videoElement.currentTime;
    const segment = subtitleManager.getCurrentSegment(time);

    if (segment && segment.text) {
      this.subtitleElement.textContent = segment.text;
      this.subtitleElement.hidden = false;
    } else {
      this.subtitleElement.textContent = '';
      this.subtitleElement.hidden = true;
    }
  }

  /**
   * Show a subtitle
   */
  show(text) {
    if (!this.subtitleElement) return;

    this.subtitleElement.textContent = text;
    this.subtitleElement.hidden = false;
  }

  /**
   * Hide subtitle
   */
  hide() {
    if (!this.subtitleElement) return;

    this.subtitleElement.textContent = '';
    this.subtitleElement.hidden = true;
  }

  /**
   * Update settings
   */
  setOptions(options) {
    this.settings = { ...this.settings, ...options };

    if (this.subtitleElement) {
      this.subtitleElement.style.color = this.settings.color;
      this.subtitleElement.style.fontSize = `${this.settings.fontSize}px`;
      this.subtitleElement.style.background = this.settings.showBackground
        ? this.settings.backgroundColor
        : 'transparent';
    }

    if (this.container) {
      this.container.style.bottom = this.settings.position === 'bottom' ? '60px' : '20%';
    }
  }

  /**
   * Get current settings
   */
  getOptions() {
    return { ...this.settings };
  }

  /**
   * Show/hide overlay
   */
  setVisible(visible) {
    if (this.container) {
      this.container.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Toggle visibility
   */
  toggle() {
    this.setVisible(this.container?.style.display !== 'none');
  }

  /**
   * Increase font size
   */
  increaseFontSize() {
    const newSize = Math.min(48, this.settings.fontSize + 2);
    this.setOptions({ fontSize: newSize });
  }

  /**
   * Decrease font size
   */
  decreaseFontSize() {
    const newSize = Math.max(10, this.settings.fontSize - 2);
    this.setOptions({ fontSize: newSize });
  }

  /**
   * Destroy the overlay
   */
  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    if (this.subtitleElement) {
      this.subtitleElement = null;
    }
  }
}

// Export factory function
export function createSubtitleOverlay(videoId, options = {}) {
  return new SubtitleOverlay(videoId, options);
}
