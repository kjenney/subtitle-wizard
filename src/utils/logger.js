/**
 * Subtitle Wizard - Logger utility
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
};

class Logger {
  constructor(level = 'INFO') {
    this.level = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
    this.prefix = '[SubtitleWizard]';
  }

  /**
   * Log debug message
   */
  debug(...args) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      console.debug(`${this.prefix} DEBUG:`, ...args);
    }
  }

  /**
   * Log info message
   */
  info(...args) {
    if (this.level <= LOG_LEVELS.INFO) {
      console.info(`${this.prefix} INFO:`, ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(...args) {
    if (this.level <= LOG_LEVELS.WARN) {
      console.warn(`${this.prefix} WARN:`, ...args);
    }
  }

  /**
   * Log error message
   */
  error(...args) {
    if (this.level <= LOG_LEVELS.ERROR) {
      console.error(`${this.prefix} ERROR:`, ...args);
    }
  }

  /**
   * Set log level
   */
  setLevel(level) {
    this.level = LOG_LEVELS[level.toUpperCase()] ?? this.level;
  }

  /**
   * Get current log level name
   */
  getCurrentLevel() {
    return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === this.level);
  }
}

// Export singleton instance
export const logger = new Logger('INFO');
