/**
 * Subtitle Wizard - Modal Dialog
 */

/**
 * Modal dialog manager
 */
export class ModalManager {
  constructor() {
    this.container = null;
    this.modalElement = null;
    this.isOpen = false;
    this.currentOptions = null;
  }

  /**
   * Initialize modal container
   */
  init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'modal-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container && this.currentOptions && this.currentOptions.clickOutsideToClose) {
        this.close();
      }
    });

    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    document.body.appendChild(this.container);
  }

  /**
   * Open a modal
   */
  open(title, content, options = {}) {
    this.init();
    this.currentOptions = options;

    // Create modal content
    const isOpening = !this.isOpen;
    this.isOpen = true;

    this.modalElement = document.createElement('div');
    this.modalElement.style.cssText = `
      background: var(--bg);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: modal-fade-in 0.2s ease;
    `;

    this.modalElement.innerHTML = `
      <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; font-size: 18px;">${title}</h3>
        ${options.onClose ? `<button class="modal-close" style="position:absolute; top:20px; right:20px; background:none; border:none; font-size:20px; cursor:pointer; color:inherit;">&times;</button>` : ''}
      </div>
      <div class="modal-body" style="padding: 20px; overflow-y: auto;">
        ${typeof content === 'string' ? `<p>${content}</p>` : content.innerHTML || content}
      </div>
      <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; justify-content: flex-end;">
        ${options.primaryLabel ? `<button class="btn btn-primary" id="modal-primary">${options.primaryLabel}</button>` : ''}
        ${options.secondaryLabel ? `<button class="btn btn-secondary" id="modal-secondary">${options.secondaryLabel}</button>` : ''}
        ${!options.primaryLabel && !options.secondaryLabel ? `<button class="btn btn-secondary" id="modal-close">Close</button>` : ''}
      </div>
    `;

    this.container.appendChild(this.modalElement);

    // Show with animation
    setTimeout(() => {
      this.container.style.opacity = '1';
    }, 10);

    // Set up event handlers
    this.setupHandlers(options);

    // Return the modal element for further manipulation
    return this.modalElement;
  }

  /**
   * Setup event handlers
   */
  setupHandlers(options) {
    const primaryBtn = this.modalElement.querySelector('#modal-primary');
    const secondaryBtn = this.modalElement.querySelector('#modal-secondary');
    const closeBtn = this.modalElement.querySelector('#modal-close');
    const headerCloseBtn = this.modalElement.querySelector('.modal-close');

    if (primaryBtn && options.onPrimary) {
      primaryBtn.addEventListener('click', () => {
        this.close();
        options.onPrimary();
      });
    }

    if (secondaryBtn && options.onSecondary) {
      secondaryBtn.addEventListener('click', () => {
        this.close();
        options.onSecondary();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (headerCloseBtn) {
      headerCloseBtn.addEventListener('click', () => this.close());
    }
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.isOpen || !this.modalElement) return;

    this.modalElement.style.animation = 'modal-fade-out 0.2s ease';

    setTimeout(() => {
      if (this.modalElement.parentNode) {
        this.modalElement.parentNode.removeChild(this.modalElement);
      }
      this.modalElement = null;
      this.isOpen = false;
      this.currentOptions = null;
    }, 200);
  }

  /**
   * Confirm dialog
   */
  confirm(title, message, options = {}) {
    return new Promise((resolve) => {
      const modalOptions = {
        ...options,
        primaryLabel: options.confirmLabel || 'Confirm',
        secondaryLabel: options.cancelLabel || 'Cancel',
        onPrimary: () => resolve(true),
        onSecondary: () => resolve(false)
      };

      this.open(title, message, modalOptions);
    });
  }

  /**
   * Alert dialog
   */
  alert(title, message, options = {}) {
    return new Promise((resolve) => {
      const modalOptions = {
        ...options,
        primaryLabel: options.okLabel || 'OK',
        onPrimary: () => resolve()
      };

      this.open(title, message, modalOptions);
    });
  }

  /**
   * Check if modal is open
   */
  isOpen() {
    return this.isOpen;
  }
}

// Export singleton
export const modalManager = new ModalManager();
