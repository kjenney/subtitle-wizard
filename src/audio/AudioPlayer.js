/**
 * Subtitle Wizard - Audio Player
 */

import { logger } from '../utils/logger.js';

/**
 * Audio player wrapper using Web Audio API
 */
export class AudioPlayer {
  constructor() {
    this.audioContext = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.buffer = null;
    this.audioElement = null;
  }

  /**
   * Initialize audio context
   */
  async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 1.0;
    }

    return this.audioContext;
  }

  /**
   * Load audio from file
   * @param {File} audioFile - Audio file to load
   * @returns {Promise<void>}
   */
  async loadAudio(audioFile) {
    await this.init();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(audioFile);
    });
  }

  /**
   * Load audio from URL
   * @param {string} url - Audio URL
   * @returns {Promise<void>}
   */
  async loadAudioFromURL(url) {
    await this.init();

    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.preload = 'auto';

      audio.addEventListener('loadedmetadata', () => {
        // Create buffer from audio element
        this.createBufferFromAudioElement(audio);
        resolve();
      });

      audio.addEventListener('error', () => reject(audio.error));
      audio.src = url;
    });
  }

  /**
   * Create buffer from HTML audio element
   */
  createBufferFromAudioElement(audioElement) {
    // For now, just store the audio element
    this.audioElement = audioElement;
  }

  /**
   * Play audio
   * @param {number} startTime - Start time in seconds
   */
  async play(startTime = 0) {
    if (!this.buffer) return;

    await this.audioContext.resume();

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.connect(this.gainNode);

    this.sourceNode.start(0, startTime);
    this.isPlaying = true;
    this.currentTime = startTime;

    // Update current time
    this.sourceNode.onended = () => {
      this.isPlaying = false;
      this.currentTime = 0;
    };

    // Update loop to track time
    this.updateTimeInterval = setInterval(() => {
      this.currentTime += 0.1;
    }, 100);
  }

  /**
   * Pause audio
   */
  pause() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
    }

    if (this.audioElement) {
      this.audioElement.pause();
    }

    this.isPlaying = false;

    if (this.updateTimeInterval) {
      clearInterval(this.updateTimeInterval);
    }
  }

  /**
   * Seek to position
   * @param {number} time - Time in seconds
   */
  seek(time) {
    this.currentTime = time;

    if (this.sourceNode && this.isPlaying) {
      this.sourceNode.stop();
      this.play(time);
    } else if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  /**
   * Set volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }

    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get audio duration
   */
  getDuration() {
    if (this.buffer) {
      return this.buffer.duration;
    }

    if (this.audioElement) {
      return this.audioElement.duration;
    }

    return 0;
  }

  /**
   * Get current playback time
   */
  getCurrentTime() {
    return this.currentTime;
  }

  /**
   * Check if audio is playing
   */
  isPlaying() {
    return this.isPlaying;
  }

  /**
   * Get audio context
   */
  getAudioContext() {
    return this.audioContext;
  }

  /**
   * Get buffer source
   */
  getBuffer() {
    return this.buffer;
  }

  /**
   * Stop and clean up
   */
  dispose() {
    this.pause();

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.buffer = null;
    this.audioElement = null;
    this.gainNode = null;
  }
}

// Export singleton
export const audioPlayer = new AudioPlayer();
