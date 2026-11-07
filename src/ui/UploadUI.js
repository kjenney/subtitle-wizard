/**
 * Subtitle Wizard - Upload UI
 */

import { validateVideoFile, getVideoFileInfo, readFileAsArrayBuffer } from '../utils/fileUtils.js';
import { ffmpegController } from '../video/FFmpegController.js';
import { logger } from '../utils/logger.js';

/**
 * Upload UI handler
 */
export class UploadUI {
  constructor(options = {}) {
    this.containerId = options.containerId || 'upload-container';
    this.dropZone = null;
    this.fileInput = null;
    this.progressBar = null;
    this.currentFile = null;
    this.callbacks = {
      onFileSelected: null,
      onUploadProgress: null,
      onUploadComplete: null
    };
  }

  /**
   * Initialize the upload UI
   */
  init() {
    this.container = document.getElementById(this.containerId);

    if (!this.container) {
      logger.error(`Container with id "${this.containerId}" not found`);
      return false;
    }

    // Create upload UI
    this.container.innerHTML = `
      <div class="upload-drop-zone" id="drop-zone">
        <div class="upload-content">
          <div class="upload-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3 class="upload-title">Drag & Drop Video File</h3>
          <p class="upload-hint">or click to browse</p>
          <input type="file" id="file-input" accept="video/*" class="file-input" style="display: none">
          <button id="browse-btn" class="btn btn-primary">Choose File</button>
        </div>
        <div class="file-info" id="file-info" style="display: none">
          <div class="file-name" id="file-name"></div>
          <div class="file-size" id="file-size"></div>
          <progress id="progress-bar" value="0" max="100" style="display: none"></progress>
          <div class="file-actions">
            <button id="remove-btn" class="btn btn-secondary">Remove</button>
            <button id="process-btn" class="btn btn-success" disabled>Process Video</button>
          </div>
        </div>
      </div>
    `;

    // Get references
    this.dropZone = this.container.querySelector('#drop-zone');
    this.fileInput = this.container.querySelector('#file-input');
    this.browseBtn = this.container.querySelector('#browse-btn');
    this.removeBtn = this.container.querySelector('#remove-btn');
    this.processBtn = this.container.querySelector('#process-btn');
    this.fileInfo = this.container.querySelector('#file-info');
    this.fileName = this.container.querySelector('#file-name');
    this.fileSize = this.container.querySelector('#file-size');
    this.progressBar = this.container.querySelector('#progress-bar');

    // Set up event listeners
    this.setupEventListeners();

    logger.info('Upload UI initialized');
    return true;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Drag and drop
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('drag-over');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drag-over');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    });

    // Click to browse
    this.browseBtn.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFile(e.target.files[0]);
      }
    });

    // Remove button
    this.removeBtn.addEventListener('click', () => {
      this.reset();
    });

    // Process button
    this.processBtn.addEventListener('click', () => {
      if (this.callbacks.onUploadComplete) {
        this.callbacks.onUploadComplete(this.currentFile);
      }
    });
  }

  /**
   * Handle file selection
   */
  handleFile(file) {
    const validation = validateVideoFile(file);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    this.currentFile = file;

    // Update UI
    this.fileName.textContent = file.name;
    this.fileSize.textContent = this.formatFileSize(file.size);
    this.fileInfo.style.display = 'block';
    this.dropZone.querySelector('.upload-content').style.display = 'none';
    this.processBtn.disabled = false;

    logger.info(`File selected: ${file.name}`);
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Register callback for file selection
   */
  onFileSelected(callback) {
    this.callbacks.onFileSelected = callback;
  }

  /**
   * Register callback for upload progress
   */
  onUploadProgress(callback) {
    this.callbacks.onUploadProgress = callback;
  }

  /**
   * Register callback for upload completion
   */
  onUploadComplete(callback) {
    this.callbacks.onUploadComplete = callback;
  }

  /**
   * Show progress
   */
  showProgress(value) {
    if (this.progressBar) {
      this.progressBar.style.display = 'block';
      this.progressBar.value = value;
    }
  }

  /**
   * Reset upload UI
   */
  reset() {
    this.currentFile = null;
    this.fileInput.value = '';
    this.fileInfo.style.display = 'none';
    this.dropZone.querySelector('.upload-content').style.display = 'block';
    this.processBtn.disabled = true;
    if (this.progressBar) {
      this.progressBar.value = 0;
      this.progressBar.style.display = 'none';
    }
    logger.info('Upload UI reset');
  }

  /**
   * Get selected file
   */
  getFile() {
    return this.currentFile;
  }

  /**
   * Check if a file is selected
   */
  hasFile() {
    return !!this.currentFile;
  }
}

// Export singleton
export const uploadUI = new UploadUI();
