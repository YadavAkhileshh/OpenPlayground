/**
 * NotificationManager
 * -------------------
 * Centralized system for handling UI notifications (toasts).
 * Supports different types: success, error, info, warning.
 */

class NotificationManager {
    constructor() {
        if (window.notificationInstance) {
            return window.notificationInstance;
        }

        this.container = this.createContainer();
        this.toasts = [];
        window.notificationInstance = this;
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Show a toast message
     * @param {string} message - The message to display
     * @param {string} type - 'success', 'error', 'info', 'warning'
     * @param {number} duration - Duration in ms
     */
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        const icons = {
            success: 'ri-checkbox-circle-fill',
            error: 'ri-error-warning-fill',
            info: 'ri-information-fill',
            warning: 'ri-alert-fill'
        };

        const iconClass = icons[type] || icons.info;

        toast.innerHTML = `
            <div class="toast-content">
                <i class="${iconClass}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="ri-close-line"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        const timeoutId = setTimeout(() => {
            this.remove(toast);
        }, duration);

        toast.dataset.timeoutId = timeoutId;
    }

    remove(toast) {
        toast.classList.remove('show');
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }

    // Shortcut methods
    success(msg, dur) { this.show(msg, 'success', dur); }
    error(msg, dur) { this.show(msg, 'error', dur); }
    info(msg, dur) { this.show(msg, 'info', dur); }
    warning(msg, dur) { this.show(msg, 'warning', dur); }
}

// Export for module use or attach to window for legacy scripts
const notificationManager = new NotificationManager();
window.showToast = (msg, type, dur) => notificationManager.show(msg, type, dur);
window.notificationManager = notificationManager;

export default notificationManager;
