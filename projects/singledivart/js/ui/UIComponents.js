/**
 * UIComponents - Dynamic UI Generation Utility
 * 
 * This module handles the creation and management of reusable 
 * UI elements within the SingleDivArt application.
 */

const UIComponents = (() => {

    /**
     * Creates a toolip element for a specific target
     * @param {HTMLElement} target - The element to attach the tooltip to
     * @param {string} text - The tooltip text
     */
    const createTooltip = (target, text) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'ui-tooltip';
        tooltip.textContent = text;

        target.addEventListener('mouseenter', () => {
            const rect = target.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 30}px`;
            document.body.appendChild(tooltip);
        });

        target.addEventListener('mouseleave', () => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
    };

    /**
     * Generates a status indicator for rendering updates
     */
    const createStatusIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator';
        indicator.innerHTML = `
            <div class="spinner"></div>
            <span>Processing Patterns...</span>
        `;
        return indicator;
    };

    /**
     * Creates a custom slider component with label and value display
     */
    const createSlider = (options) => {
        const { id, label, min, max, value, unit = "" } = options;

        const container = document.createElement('div');
        container.className = 'slider-item';

        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.textContent = label;

        const input = document.createElement('input');
        input.type = 'range';
        input.id = id;
        input.min = min;
        input.max = max;
        input.value = value;

        const display = document.createElement('span');
        display.className = 'value-display';
        display.textContent = `${value}${unit}`;

        input.addEventListener('input', () => {
            display.textContent = `${input.value}${unit}`;
        });

        container.appendChild(labelEl);
        container.appendChild(input);
        container.appendChild(display);

        return { container, input };
    };

    /**
     * Animation utility for UI transitions
     */
    const fadeOut = (element, duration = 300) => {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    };

    const fadeIn = (element, duration = 300) => {
        element.style.display = 'block';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = '1';
        }, 10);
    };

    /**
     * Notification system for UI feedback
     */
    const notify = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        const container = document.getElementById('toast-container') || createToastContainer();
        container.appendChild(toast);

        setTimeout(() => {
            fadeOut(toast);
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const createToastContainer = () => {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    };

    return {
        createTooltip,
        createStatusIndicator,
        createSlider,
        fadeIn,
        fadeOut,
        notify
    };

})();

window.UIComponents = UIComponents;
