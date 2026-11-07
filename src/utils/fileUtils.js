/**
 * Subtitle Wizard - File utilities
 */

import { MAX_FILE_SIZE, SUPPORTED_VIDEO_TYPES } from '../config.js';
import { formatFileSize } from './timeUtils.js';

/**
 * Validate if a file is a supported video format
 * @param {File} file - File object to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateVideoFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported types: ${SUPPORTED_VIDEO_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`
    };
  }

  return { valid: true };
}

/**
 * Get video file info from File object
 * @param {File} file - File object
 * @returns {Promise<Object>} File information including duration if possible
 */
export async function getVideoFileInfo(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');

    video.preload = 'none';
    video.src = url;

    video.addEventListener('loadedmetadata', () => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        duration: video.duration,
        url: url
      });
    });

    video.addEventListener('error', () => {
      // If metadata can't be read, return basic info
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        duration: null,
        url: url
      });
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      reject(new Error('Video metadata loading timed out'));
    }, 5000);
  });
}

/**
 * Download a file from blob data
 * @param {Blob} blob - Blob data to download
 * @param {string} filename - Filename for download
 */
export function downloadFile(blob, filename) {
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
 * Read file as ArrayBuffer
 * @param {File} file - File to read
 * @returns {Promise<ArrayBuffer>}
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>}
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Read file as URL (object URL)
 * @param {File} file - File to read
 * @returns {Promise<string>} Object URL
 */
export function readFileAsURL(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    resolve(url);
  });
}

/**
 * Extract filename without extension
 * @param {string} filename - Full filename
 * @returns {string} Filename without extension
 */
export function getFilenameWithoutExtension(filename) {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return filename;
  return filename.substring(0, lastDot);
}

/**
 * Generate a unique filename for exported subtitles
 * @param {string} videoName - Original video filename
 * @param {string} extension - Target extension (default: 'srt')
 * @returns {string} Generated filename
 */
export function generateSubtitleFilename(videoName, extension = 'srt') {
  const nameWithoutExt = getFilenameWithoutExtension(videoName);
  return `${nameWithoutExt}_subtitles.${extension}`;
}

/**
 * Create a file from text content
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type (default: 'text/plain')
 * @returns {File} Created file
 */
export function createFileFromText(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

/**
 * Check if drag-and-drop is supported
 * @returns {boolean}
 */
export function isDragDropSupported() {
  const div = document.createElement('div');
  return ('draggable' in div || 'ondragstart' in div) && 'ondrop' in document;
}
