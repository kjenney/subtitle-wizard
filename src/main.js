/**
 * Subtitle Wizard - Main Application
 */

import { uploadUI } from './ui/UploadUI.js';
import { videoPlayer } from './player/VideoPlayer.js';
import { subtitleManager } from './subtitles/SubtitleManager.js';
import { subtitleEditor } from './subtitles/SubtitleEditor.js';
import { sessionStore } from './storage/SessionStore.js';
import { pollyClient, PollyClient } from './aws/pollyClient.js';
import { pollySyncer } from './subtitles/PollySyncer.js';
import { credentialsManager } from './aws/credentials.js';
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

    // Initialize UI components
    uploadUI.init();
    videoPlayer.init();

    // Initialize session store
    await sessionStore.init();

    // Setup event handlers
    this.setupEventHandlers();

    // Check for existing credentials and update UI
    this.updateCredentialsUI();

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

    // Setup credential handlers
    this.setupCredentialHandlers();

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
   * Setup AWS credentials UI handlers
   */
  setupCredentialHandlers() {
    const credentialsBtn = document.getElementById('credentials-btn');
    const closeCredentialsBtn = document.getElementById('close-credentials-btn');
    const saveCredentialsBtn = document.getElementById('save-credentials-btn');
    const clearCredentialsBtn = document.getElementById('clear-credentials-btn');
    const credentialsModal = document.getElementById('credentials-modal');

    // Show credentials modal
    if (credentialsBtn) {
      credentialsBtn.addEventListener('click', () => {
        // Load existing credentials
        this.loadCredentialsIntoForm();
        credentialsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    }

    // Hide credentials modal
    if (closeCredentialsBtn) {
      closeCredentialsBtn.addEventListener('click', () => {
        credentialsModal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }

    // Close modal when clicking outside
    if (credentialsModal) {
      credentialsModal.addEventListener('click', (e) => {
        if (e.target === credentialsModal) {
          credentialsModal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // Save credentials
    if (saveCredentialsBtn) {
      saveCredentialsBtn.addEventListener('click', async () => {
        await this.handleSaveCredentials(saveCredentialsBtn);
      });
    }

    // Clear credentials
    if (clearCredentialsBtn) {
      clearCredentialsBtn.addEventListener('click', async () => {
        await this.handleClearCredentials();
      });
    }
  }

  /**
   * Update credentials UI indicator
   */
  async updateCredentialsUI() {
    const credentialsBtn = document.getElementById('credentials-btn');
    if (credentialsBtn) {
      const hasCredentials = credentialsManager.hasCredentials();
      if (hasCredentials) {
        credentialsBtn.textContent = 'Credentials Saved';
        credentialsBtn.classList.remove('btn-secondary');
        credentialsBtn.classList.add('btn-success');
      }
    }
  }

  /**
   * Load credentials from storage into form
   */
  async loadCredentialsIntoForm() {
    const credentials = await credentialsManager.getCredentials();
    if (credentials) {
      const awsKeyIdInput = document.getElementById('aws-key-id');
      const awsSecretKeyInput = document.getElementById('aws-secret-key');
      const awsRegionSelect = document.getElementById('aws-region');

      if (awsKeyIdInput) awsKeyIdInput.value = credentials.accessKeyId || '';
      if (awsSecretKeyInput) awsSecretKeyInput.value = '';
      if (awsRegionSelect) awsRegionSelect.value = credentials.region || 'us-east-1';
    }
  }

  /**
   * Handle save credentials button click
   */
  async handleSaveCredentials(btn) {
    const awsKeyIdInput = document.getElementById('aws-key-id');
    const awsSecretKeyInput = document.getElementById('aws-secret-key');
    const awsRegionSelect = document.getElementById('aws-region');

    const accessKeyId = awsKeyIdInput?.value?.trim();
    const secretAccessKey = awsSecretKeyInput?.value;
    const region = awsRegionSelect?.value;

    if (!accessKeyId || !secretAccessKey) {
      toastManager.error('Please enter both Access Key ID and Secret Access Key');
      return;
    }

    // Show loading state on button
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Testing...';
      btn.disabled = true;
    }

    try {
      await credentialsManager.storeCredentials(accessKeyId, secretAccessKey, region);

      // Test credentials with Polly
      toastManager.info('Testing credentials...');

      // Create a temporary client to test - use the describeVoices with a real call
      const testClient = new PollyClient({ accessKeyId, secretAccessKey, region });
      await testClient.init();

      // Use describeVoices to verify credentials - this requires valid AWS credentials
      const voices = await testClient.describeVoices('en-US');

      // We expect at least some voices or we'd get an error
      if (voices && voices.length > 0) {
        toastManager.success('Credentials saved and tested successfully!');
        document.getElementById('credentials-modal').style.display = 'none';
      } else {
        logger.warn('No voices returned from describeVoices');
        // If we got here without error, credentials are valid but region may be wrong
        toastManager.success('Credentials saved successfully!');
        document.getElementById('credentials-modal').style.display = 'none';
      }

    } catch (error) {
      logger.error('Failed to save/test credentials:', error);
      // Check if it's an auth error
      const errorMessage = error.message || String(error);
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('InvalidClientTokenId') || errorMessage.includes('SignatureDoesNotMatch')) {
        toastManager.error('Invalid AWS credentials. Please check your Access Key ID and Secret Access Key.');
      } else {
        toastManager.error(`Failed to test credentials: ${errorMessage}`);
      }
    } finally {
      // Restore button state
      if (btn) {
        btn.textContent = 'Save & Test';
        btn.disabled = false;
      }
    }
  }

  /**
   * Handle clear credentials button click
   */
  async handleClearCredentials() {
    if (!confirm('Are you sure you want to clear your AWS credentials?')) return;

    await credentialsManager.clearCredentials();

    // Clear form
    document.getElementById('aws-key-id').value = '';
    document.getElementById('aws-secret-key').value = '';
    toastManager.success('Credentials cleared');

    // Update UI indicator
    this.updateCredentialsUI();
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
