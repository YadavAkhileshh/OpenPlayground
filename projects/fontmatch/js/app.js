/**
 * FontMatch - Main Application
 * Application initialization and coordination
 */

(function () {
    'use strict';

    /**
     * Initialize application
     */
    async function init() {
        try {
            console.log('FontMatch initializing...');

            // Show loading state
            showLoadingState();

            // Preload fonts (they're already imported via CSS, this just ensures they're ready)
            await FontManager.preloadAllFonts();

            // Initialize UI
            UIController.init();

            // Hide loading state
            hideLoadingState();

            console.log('FontMatch initialized successfully');

            // Show welcome message
            setTimeout(() => {
                UIController.showToast('Welcome to FontMatch! Experiment with font pairings.', 'success');
            }, 500);

        } catch (error) {
            console.error('Error initializing FontMatch:', error);
            showErrorState(error.message);
        }
    }

    /**
     * Show loading state
     */
    function showLoadingState() {
        const loadingElements = document.querySelectorAll('.font-select');
        loadingElements.forEach(el => {
            el.disabled = true;
        });
    }

    /**
     * Hide loading state
     */
    function hideLoadingState() {
        const loadingElements = document.querySelectorAll('.font-select');
        loadingElements.forEach(el => {
            el.disabled = false;
        });
    }

    /**
     * Show error state
     */
    function showErrorState(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-bg-elevated);
            border: 1px solid var(--color-error);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            max-width: 400px;
            text-align: center;
            z-index: 9999;
        `;
        errorDiv.innerHTML = `
            <h2 style="color: var(--color-error); margin-bottom: var(--space-md);">Error</h2>
            <p style="color: var(--color-text-secondary);">${message}</p>
            <button onclick="location.reload()" style="
                margin-top: var(--space-lg);
                padding: var(--space-sm) var(--space-lg);
                background: var(--color-primary);
                border: none;
                border-radius: var(--radius-md);
                color: white;
                cursor: pointer;
            ">Reload</button>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * Handle keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + E: Export CSS
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                document.getElementById('export-css').click();
            }

            // Ctrl/Cmd + R: Reset to defaults
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                resetToDefaults();
            }
        });
    }

    /**
     * Reset to default settings
     */
    function resetToDefaults() {
        UIController.setState({
            headingFont: 'Playfair Display',
            bodyFont: 'Open Sans',
            headingSize: 48,
            headingSpacing: 0,
            headingLineHeight: 1.2,
            bodySize: 16,
            bodySpacing: 0,
            bodyLineHeight: 1.6
        });

        UIController.showToast('Reset to default settings', 'success');
    }

    /**
     * Setup performance monitoring
     */
    function setupPerformanceMonitoring() {
        // Log performance metrics
        window.addEventListener('load', () => {
            if (window.performance && window.performance.timing) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`Page load time: ${pageLoadTime}ms`);
            }
        });
    }

    /**
     * Setup error handling
     */
    function setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    /**
     * Check browser compatibility
     */
    function checkBrowserCompatibility() {
        const features = {
            'CSS Grid': 'grid' in document.documentElement.style,
            'CSS Custom Properties': CSS.supports('--test', '0'),
            'Clipboard API': !!navigator.clipboard,
            'Font Loading API': 'fonts' in document
        };

        const unsupported = Object.entries(features)
            .filter(([name, supported]) => !supported)
            .map(([name]) => name);

        if (unsupported.length > 0) {
            console.warn('Unsupported features:', unsupported.join(', '));
        }

        return unsupported.length === 0;
    }

    /**
     * Start application when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (checkBrowserCompatibility()) {
                init();
                setupKeyboardShortcuts();
                setupPerformanceMonitoring();
                setupErrorHandling();
            } else {
                showErrorState('Your browser may not support all features. Please use a modern browser.');
            }
        });
    } else {
        if (checkBrowserCompatibility()) {
            init();
            setupKeyboardShortcuts();
            setupPerformanceMonitoring();
            setupErrorHandling();
        } else {
            showErrorState('Your browser may not support all features. Please use a modern browser.');
        }
    }

})();
