/**
 * Subtitle Wizard - Progress Bar UI
 */

/**
 * Progress bar component
 */
export class ProgressBar {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.progressBar = null;
    this.statusElement = null;
    this.cancelButton = null;
    this.options = {
      showCancel: options.showCancel !== false,
      showPercent: options.showPercent !== false,
      showStatus: options.showStatus !== false
    };
  }

  /**
   * Initialize the progress bar
   */
  init() {
    if (!this.container) return false;

    this.container.innerHTML = `
      <div class="progress-container">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progress-fill"></div>
        </div>
        ${this.options.showPercent ? '<div class="progress-percent" id="progress-percent">0%</div>' : ''}
      </div>
      ${this.options.showStatus ? '<div class="progress-status" id="progress-status"></div>' : ''}
      ${this.options.showCancel ? '<button class="btn btn-secondary cancel-btn" id="cancel-btn" style="display: none">Cancel</button>' : ''}
    `;

    this.progressBarFill = this.container.querySelector('#progress-fill');
    this.progressPercent = this.container.querySelector('#progress-percent');
    this.progressStatus = this.container.querySelector('#progress-status');
    this.cancelButton = this.container.querySelector('#cancel-btn');

    return true;
  }

  /**
   * Set progress
   */
  setProgress(percent) {
    const clamped = Math.max(0, Math.min(100, percent));

    if (this.progressBarFill) {
      this.progressBarFill.style.width = `${clamped}%`;
    }

    if (this.progressPercent) {
      this.progressPercent.textContent = `${Math.round(clamped)}%`;
    }
  }

  /**
   * Set status text
   */
  setStatus(text) {
    if (this.progressStatus) {
      this.progressStatus.textContent = text;
    }
  }

  /**
   * Show cancel button
   */
  showCancel() {
    if (this.cancelButton) {
      this.cancelButton.style.display = 'inline-block';
    }
  }

  /**
   * Hide cancel button
   */
  hideCancel() {
    if (this.cancelButton) {
      this.cancelButton.style.display = 'none';
    }
  }

  /**
   * Complete progress
   */
  complete() {
    this.setProgress(100);
    this.setStatus('Complete');
    this.hideCancel();
  }

  /**
   * Reset progress bar
   */
  reset() {
    this.setProgress(0);
    this.setStatus('');
    this.hideCancel();
  }

  /**
   * Set complete callback
   */
  onComplete(callback) {
    this.onCompleteCallback = callback;
  }

  /**
   * Set cancel callback
   */
  onCancel(callback) {
    this.onCancelCallback = callback;

    if (this.cancelButton) {
      this.cancelButton.addEventListener('click', () => {
        if (this.onCancelCallback) {
          this.onCancelCallback();
        }
        this.reset();
      });
    }
  }

  /**
   * Show error state
   */
  setError(message) {
    this.setStatus(`Error: ${message}`);
    this.progressBarFill.style.backgroundColor = '#dc3545';
    this.hideCancel();
  }

  /**
   * Show processing state
   */
  setProcessing(message) {
    this.setStatus(message || 'Processing...');
    this.showCancel();
  }

  /**
   * Destroy the progress bar
   */
  destroy() {
    this.reset();
  }
}

// Export factory function
export function createProgressBar(containerId, options = {}) {
  return new ProgressBar(containerId, options);
}
