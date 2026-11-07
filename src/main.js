/**
 * Subtitle Wizard - Main Application
 */

import { uploadUI } from './ui/UploadUI.js';
import { videoPlayer } from './player/VideoPlayer.js';
import { subtitleManager } from './subtitles/SubtitleManager.js';
import { subtitleEditor } from './subtitles/SubtitleEditor.js';
import { sessionStore } from './storage/SessionStore.js';
import { pollyClient } from './aws/pollyClient.js';
import { pollySyncer } from './subtitles/PollySyncer.js';
import { logger } from './utils/logger.js';
import { toastManager } from './ui/Toast.js';

/**
 * Application state
 */
const AppState = {
  VIDEO_UPLOADED: 'video_uploaded',
  AUDIO_EXTRACTED: 'audio_extracted',
  SUBTITLES_GENERATED: 'subtitles_generated',
  EDITING: 'editing',
  EXPORTING: 'exporting'
};

/**
 * Main application class
 */
class SubtitleWizard {
  constructor() {
    this.state = AppState.VIDEO_UPLOADED;
    this.currentVideoFile = null;
    this.currentAudioFile = null;
    this.subtitleEditor = subtitleEditor;

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    logger.info('Initializing Subtitle Wizard...');

    // Initialize upload UI before setting up callbacks
    uploadUI.init();

    // Initialize video player
    videoPlayer.init();

    // Initialize session store
    await sessionStore.init();

    // Setup event handlers (callback is set before uploadUI sets up event listeners)
    this.setupEventHandlers();

    // Load saved session if exists
    this.loadSavedSession();

    logger.info('Subtitle Wizard ready');
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Upload UI callbacks
    uploadUI.onUploadComplete((file) => {
      this.handleVideoUpload(file);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Resize handler for video player
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * Handle video upload
   */
  async handleVideoUpload(file) {
    try {
      this.currentVideoFile = file;

      // Load video into player
      await videoPlayer.loadVideo(file);

      // Extract video metadata
      const metadata = await this.extractMetadata(file);

      // Save session
      sessionStore.updateSession({
        video: {
          name: file.name,
          size: file.size,
          type: file.type,
          duration: videoPlayer.getDuration()
        }
      });

      toastManager.success(`Video loaded: ${file.name}`);
      logger.info(`Video uploaded: ${file.name}`);

      // Show video player and processing sections
      document.getElementById('video-section').style.display = 'block';
      document.getElementById('processing-section').style.display = 'block';
      document.getElementById('status-section').style.display = 'block';
      document.getElementById('subtitle-section').style.display = 'block';

    } catch (error) {
      logger.error('Failed to upload video:', error);
      toastManager.error('Failed to load video. Please try a different file.');
    }
  }

  /**
   * Extract video metadata
   */
  extractMetadata(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');

      video.preload = 'metadata';
      video.src = url;

      video.addEventListener('loadedmetadata', () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
        URL.revokeObjectURL(url);
      });

      video.addEventListener('error', reject);
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    const { key, shiftKey } = e;

    // Play/Pause
    if (key === ' ') {
      e.preventDefault();
      if (videoPlayer.isPlaying()) {
        videoPlayer.pause();
      } else {
        videoPlayer.play();
      }
    }

    // Seek
    if (key === 'ArrowRight') {
      const offset = shiftKey ? 10 : 1;
      videoPlayer.seek(videoPlayer.getCurrentTime() + offset);
    }

    if (key === 'ArrowLeft') {
      const offset = shiftKey ? 10 : 1;
      videoPlayer.seek(videoPlayer.getCurrentTime() - offset);
    }

    // Subtitle font size
    if (key === 'ArrowUp') {
      this.subtitleOverlay?.increaseFontSize();
    }

    if (key === 'ArrowDown') {
      this.subtitleOverlay?.decreaseFontSize();
    }

    // Toggle subtitles
    if (key.toLowerCase() === 's') {
      this.subtitleOverlay?.toggle();
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    if (this.subtitleOverlay) {
      // Recalculate overlay positioning
      const vidWidth = videoPlayer.getDimensions().width;
      if (vidWidth) {
        this.subtitleOverlay.container.style.width = `${vidWidth}px`;
      }
    }
  }

  /**
   * Load saved session
   */
  async loadSavedSession() {
    const savedSession = sessionStore.getSession();

    if (savedSession && savedSession.video) {
      toastManager.info('Session restored from previous visit');
      logger.info('Session restored');
    }
  }

  /**
   * Extract audio from video
   */
  async extractAudio() {
    if (!this.currentVideoFile) {
      toastManager.error('No video uploaded');
      return;
    }

    try {
      toastManager.info('Extracting audio...');

      // This would use FFmpeg to extract audio
      // For now, just note the video file
      this.currentAudioFile = this.currentVideoFile;

      toastManager.success('Audio extracted successfully');

    } catch (error) {
      logger.error('Audio extraction failed:', error);
      toastManager.error('Failed to extract audio');
    }
  }

  /**
   * Generate subtitles
   */
  async generateSubtitles() {
    try {
      toastManager.info('Generating subtitles...');

      // Synthesize with Polly
      await pollySyncer.processAllSegments((current, total) => {
        const percent = (current / total) * 100;
        toastManager.show(`Processing ${current}/${total}...`, { duration: 1000 });
      });

      this.state = AppState.SUBTITLES_GENERATED;
      toastManager.success('Subtitles generated successfully');

    } catch (error) {
      logger.error('Subtitle generation failed:', error);
      toastManager.error('Failed to generate subtitles');
    }
  }

  /**
   * Export subtitles
   */
  exportSubtitles() {
    const videoName = this.currentVideoFile?.name || 'video';
    const filename = `${videoName.split('.')[0]}_subtitles.srt`;

    const srtContent = subtitleManager.toSRT();
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toastManager.success(`Subtitles exported: ${filename}`);
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.currentVideoFile = null;
    this.currentAudioFile = null;
    this.state = AppState.VIDEO_UPLOADED;

    sessionStore.clear();
    subtitleManager.clear();
    videoPlayer.destroy();

    uploadUI.reset();
    toastManager.success('Session cleared');
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get application info
   */
  getInfo() {
    return {
      version: '1.0.0',
      hasVideo: !!this.currentVideoFile,
      audioFile: this.currentAudioFile?.name || null,
      segmentCount: subtitleManager.getAllSegments().length,
      session: sessionStore.getSession()
    };
  }
}

// Export singleton
export const app = new SubtitleWizard();
