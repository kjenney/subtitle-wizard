/**
 * Subtitle Wizard - Toast Notifications
 */

/**
 * Toast notification manager
 */
export class ToastManager {
  constructor(containerId = 'toast-container') {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.toasts = [];
    this.maxToasts = 5;
  }

  /**
   * Initialize toast container
   */
  init() {
    if (!this.container) {
      // Create container if it doesn't exist
      this.container = document.createElement('div');
      this.container.id = this.containerId;
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a toast notification
   */
  show(message, options = {}) {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const toast = {
      id: id,
      message: message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      dismissible: options.dismissible !== false,
      createdAt: Date.now(),
      element: null
    };

    this.toasts.push(toast);
    this.renderToast(toast);

    // Auto-dismiss
    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }

    // Cleanup old toasts
    this.cleanup();

    return id;
  }

  /**
   * Render a toast
   */
  renderToast(toast) {
    const types = {
      info: { bg: '#3b82f6', icon: 'i' },
      success: { bg: '#10b981', icon: '✓' },
      error: { bg: '#ef4444', icon: '!' },
      warning: { bg: '#f59e0b', icon: '⚠' }
    };

    const typeConfig = types[toast.type] || types.info;

    toast.element = document.createElement('div');
    toast.element.className = 'toast';
    toast.element.style.cssText = `
      background: ${typeConfig.bg};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: toast-slide-in 0.3s ease;
      max-width: 400px;
      pointer-events: auto;
    `;

    toast.element.innerHTML = `
      <span style="font-weight: bold; min-width: 20px;">${typeConfig.icon}</span>
      <span style="flex: 1;">${toast.message}</span>
      ${toast.dismissible ? '<button class="toast-close" style="background:none; border:none; color:inherit; cursor:pointer; font-size:18px;">&times;</button>' : ''}
    `;

    this.container.appendChild(toast.element);

    // Add close handler
    if (toast.dismissible) {
      toast.element.querySelector('.toast-close').addEventListener('click', () => {
        this.dismiss(toast.id);
      });
    }

    // Add to DOM
    this.container.insertBefore(toast.element, this.container.firstChild);
  }

  /**
   * Dismiss a toast
   */
  dismiss(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;

    const toast = this.toasts[index];

    if (toast.element) {
      toast.element.style.animation = 'toast-slide-out 0.3s ease';
      setTimeout(() => {
        if (toast.element && toast.element.parentNode) {
          toast.element.parentNode.removeChild(toast.element);
        }
      }, 300);
    }

    this.toasts.splice(index, 1);
  }

  /**
   * Show success toast
   */
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  }

  /**
   * Show error toast
   */
  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error' });
  }

  /**
   * Show warning toast
   */
  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning' });
  }

  /**
   * Show info toast
   */
  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  }

  /**
   * Cleanup old toasts
   */
  cleanup() {
    // Remove old toasts if we have too many
    while (this.toasts.length > this.maxToasts) {
      const toast = this.toasts.shift();
      if (toast.element && toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
    }
  }

  /**
   * Clear all toasts
   */
  clear() {
    for (const toast of this.toasts) {
      this.dismiss(toast.id);
    }
  }
}

// Export singleton
export const toastManager = new ToastManager();
