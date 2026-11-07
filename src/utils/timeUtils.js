/**
 * Subtitle Wizard - Time formatting utilities
 */

/**
 * Format seconds to SRT timestamp format (HH:MM:SS,mss)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted timestamp string
 */
export function formatTimeSeconds(seconds) {
  if (seconds < 0) seconds = 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
}

/**
 * Format seconds to timestamp format (HH:MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted timestamp string without milliseconds
 */
export function formatTimeSecondsNoMs(seconds) {
  if (seconds < 0) seconds = 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) % 60);
  const secs = Math.floor(seconds % 60);

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)}`;
}

/**
 * Parse SRT timestamp to seconds
 * @param {string} timestamp - SRT timestamp (HH:MM:SS,mss or HH:MM:SS.mss)
 * @returns {number} Time in seconds
 */
export function parseTimeToSeconds(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return 0;

  // Handle both comma and dot as milliseconds separator
  const parts = timestamp.replace(',', '.').split(':');

  if (parts.length < 2) return 0;

  const hours = parseFloat(parts[0]) || 0;
  const minutes = parseFloat(parts[1]) || 0;
  const seconds = parts[2] !== undefined ? parseFloat(parts[2]) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Pad a number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} size - Total size
 * @returns {string} Padded string
 */
function pad(num, size) {
  let s = '000' + String(num);
  return s.substring(s.length - size);
}

/**
 * Format duration in human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Human-readable duration
 */
export function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  } else {
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }
}

/**
 * Get human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Human-readable file size
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Calculate time difference in seconds between two timestamps
 * @param {string} startTime - Start timestamp
 * @param {string} endTime - End timestamp
 * @returns {number} Difference in seconds
 */
export function getTimeDifference(startTime, endTime) {
  return parseTimeToSeconds(endTime) - parseTimeToSeconds(startTime);
}
