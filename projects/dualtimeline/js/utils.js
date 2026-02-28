export const formatTimestamp = (totalSeconds, format = 'HH:MM:SS') => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
        return '00:00:00';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);

    const pad = (num, length = 2) => String(num).padStart(length, '0');

    switch (format) {
        case 'HH:MM:SS':
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        case 'MM:SS':
            return `${pad(minutes)}:${pad(seconds)}`;
        case 'MM:SS.mmm':
            return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
        case 'AUTO':
            return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
        default:
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
};

export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

/**
 * Throttle Function
 * Ensures a function is called at most once in a specified time period.
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Logger with structured metadata and styles
 */
export const logger = {
    prefix: ' [DualTimeline] ',

    info(message, data = null) {
        console.log(
            `%c${this.prefix}INFO%c ${message}`,
            'background: #3b82f6; color: white; border-radius: 2px; padding: 2px 4px;',
            'color: inherit;',
            data || ''
        );
    },

    warn(message, data = null) {
        console.warn(
            `%c${this.prefix}WARN%c ${message}`,
            'background: #f59e0b; color: black; border-radius: 2px; padding: 2px 4px;',
            'color: inherit;',
            data || ''
        );
    },

    error(message, data = null) {
        console.error(
            `%c${this.prefix}ERR%c ${message}`,
            'background: #ef4444; color: white; border-radius: 2px; padding: 2px 4px;',
            'color: inherit;',
            data || ''
        );
    },

    debug(message, data = null) {
        if (window.DUAL_TIMELINE_DEBUG) {
            console.debug(
                `%c${this.prefix}DEBUG%c ${message}`,
                'background: #6b7280; color: white; border-radius: 2px; padding: 2px 4px;',
                'color: inherit;',
                data || ''
            );
        }
    }
};

/**
 * State Validator
 * Ensures that synchronized state objects are malformed or missing required keys.
 */
export const validateState = (state) => {
    const requiredKeys = ['currentTime', 'duration', 'isPlaying'];
    const missingKeys = requiredKeys.filter(key => !(key in state));

    if (missingKeys.length > 0) {
        logger.error('Invalid state received. Missing keys:', missingKeys);
        return false;
    }

    if (isNaN(state.currentTime) || isNaN(state.duration)) {
        logger.error('Invalid state values: currentTime/duration are NaN');
        return false;
    }

    return true;
};

/**
 * UI Transition Helpers
 */
export const fadeOut = (element, duration = 400) => {
    if (!element) return;
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    setTimeout(() => {
        element.classList.add('hidden');
    }, duration);
};

export const fadeIn = (element, duration = 400) => {
    if (!element) return;
    element.classList.remove('hidden');
    element.style.opacity = '0';
    // Trigger reflow
    element.offsetHeight;
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '1';
};

/**
 * Distance Calculation (for Scrubbing Acceleration)
 */
export const calculateScrubAcceleration = (deltaX, scale = 1.0) => {
    const magnitude = Math.abs(deltaX);
    if (magnitude < 5) return 0.1 * scale;
    if (magnitude < 20) return 0.5 * scale;
    if (magnitude < 50) return 2.0 * scale;
    return 5.0 * scale;
};
