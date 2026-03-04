import { NOTIFY } from '../core/constants.js';

/**
 * NotificationManager
 * 
 * Manages the display of floating toast notifications.
 */
export class NotificationManager {

    constructor() {
        this.container = document.getElementById('toast-container');
    }

    /**
     * Shows a toast notification.
     * @param {string} message - Text to display.
     * @param {string} type - 'success', 'error', 'warning', 'info' (default: info).
     * @param {number} duration - Time in ms before auto-dismiss (default: 3000).
     */
    show(message, type = NOTIFY.INFO, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = \`toast \${type}\`;
        
        const content = document.createElement('div');
        
        const title = document.createElement('h4');
        title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        
        const text = document.createElement('p');
        text.textContent = message;

        content.appendChild(title);
        content.appendChild(text);
        toast.appendChild(content);

        // Add to DOM
        this.container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, duration);
    }
}
