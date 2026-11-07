/**
 * Subtitle Wizard - Video Player wrapper
 */

import { logger } from '../utils/logger.js';

/**
 * Video player wrapper using Video.js or native HTML5 video
 */
export class VideoPlayer {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.videoElement = null;
    this.player = null;
    this.isPlaying = false;
    this.duration = 0;
    this.currentTime = 0;
    this.originalVideoUrl = null;
  }

  /**
   * Initialize the video player
   */
  init() {
    if (!this.container) {
      logger.error(`Container with id "${this.containerId}" not found`);
      return false;
    }

    // Create video element
    this.videoElement = document.createElement('video');
    this.videoElement.controls = true;
    this.videoElement.style.width = '100%';
    this.videoElement.style.maxWidth = '800px';
    this.videoElement.style.backgroundColor = '#000';

    this.container.appendChild(this.videoElement);

    // Set up event listeners
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.duration = this.videoElement.duration;
      logger.info(`Video loaded: ${this.duration}s`);
    });

    this.videoElement.addEventListener('timeupdate', () => {
      this.currentTime = this.videoElement.currentTime;
    });

    this.videoElement.addEventListener('play', () => {
      this.isPlaying = true;
    });

    this.videoElement.addEventListener('pause', () => {
      this.isPlaying = false;
    });

    this.videoElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.currentTime = 0;
    });

    return true;
  }

  /**
   * Load video from file
   */
  loadVideo(file) {
    const url = URL.createObjectURL(file);
    this.originalVideoUrl = url;

    return new Promise((resolve, reject) => {
      this.videoElement.src = url;
      this.videoElement.load();

      this.videoElement.addEventListener('loadedmetadata', () => {
        this.duration = this.videoElement.duration;
        resolve(true);
      });

      this.videoElement.addEventListener('error', (e) => {
        reject(e.error);
      });
    });
  }

  /**
   * Play video
   */
  play() {
    if (this.videoElement) {
      this.videoElement.play();
      this.isPlaying = true;
    }
  }

  /**
   * Pause video
   */
  pause() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Seek to position
   */
  seek(time) {
    if (this.videoElement) {
      this.videoElement.currentTime = Math.max(0, Math.min(time, this.duration));
      this.currentTime = this.videoElement.currentTime;
    }
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    if (this.videoElement) {
      this.videoElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get video duration
   */
  getDuration() {
    return this.duration;
  }

  /**
   * Get current time
   */
  getCurrentTime() {
    return this.currentTime;
  }

  /**
   * Check if playing
   */
  isPlaying() {
    return this.isPlaying;
  }

  /**
   * Get video element
   */
  getElement() {
    return this.videoElement;
  }

  /**
   * Get video dimensions
   */
  getDimensions() {
    return {
      width: this.videoElement?.videoWidth || 0,
      height: this.videoElement?.videoHeight || 0
    };
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    if (this.container) {
      const loading = document.createElement('div');
      loading.id = 'video-loading';
      loading.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 24px;
        background: rgba(0,0,0,0.8);
        padding: 20px;
        border-radius: 8px;
      `;
      loading.textContent = 'Loading video...';
      this.container.appendChild(loading);
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loading = document.getElementById('video-loading');
    if (loading) {
      loading.remove();
    }
  }

  /**
   * Destroy the player
   */
  destroy() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement.remove();
      this.videoElement = null;
    }

    if (this.originalVideoUrl) {
      URL.revokeObjectURL(this.originalVideoUrl);
      this.originalVideoUrl = null;
    }

    this.isPlaying = false;
    this.duration = 0;
    this.currentTime = 0;
  }
}

// Export singleton
export const videoPlayer = new VideoPlayer('video-container');
