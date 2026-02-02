/**
 * KaleidoScroll - Main Application
 * Orchestrates all modules and handles user interaction
 * Production-ready initialization and event management
 */

(function() {
    'use strict';

    // Application state
    const app = {
        initialized: false,
        currentSymmetry: 8,
        currentSpeed: 1,
        symmetryModes: [4, 8, 16],
        speedModes: [0.5, 1, 2],
        symmetryIndex: 1,
        speedIndex: 1
    };

    // DOM elements
    const elements = {
        loadingScreen: null,
        kaleidoscopeCanvas: null,
        mainContent: null,
        controlPanel: null,
        infoDisplay: null,
        symmetryBtn: null,
        colorBtn: null,
        speedBtn: null,
        symmetryValue: null,
        rotationValue: null,
        scrollValue: null,
        scrollSections: []
    };

    /**
     * Initialize application
     */
    function init() {
        if (app.initialized) return;

        console.log('KaleidoScroll: Initializing...');

        // Get DOM elements
        cacheElements();

        // Initialize modules
        initializeModules();

        // Setup event listeners
        setupEventListeners();

        // Setup scroll animations
        setupScrollAnimations();

        // Hide loading screen
        hideLoadingScreen();

        app.initialized = true;
        console.log('KaleidoScroll: Initialization complete');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.loadingScreen = document.getElementById('loading-screen');
        elements.kaleidoscopeCanvas = document.getElementById('kaleidoscope-canvas');
        elements.mainContent = document.getElementById('main-content');
        elements.controlPanel = document.getElementById('control-panel');
        elements.infoDisplay = document.getElementById('info-display');
        elements.symmetryBtn = document.getElementById('symmetry-btn');
        elements.colorBtn = document.getElementById('color-btn');
        elements.speedBtn = document.getElementById('speed-btn');
        elements.symmetryValue = document.getElementById('symmetry-value');
        elements.rotationValue = document.getElementById('rotation-value');
        elements.scrollValue = document.getElementById('scroll-value');
        elements.scrollSections = document.querySelectorAll('[data-scroll-section]');
    }

    /**
     * Initialize all modules
     */
    function initializeModules() {
        // Initialize animation engine
        AnimationEngine.init();
        console.log('KaleidoScroll: Animation engine initialized');

        // Initialize scroll controller
        ScrollController.init();
        console.log('KaleidoScroll: Scroll controller initialized');

        // Initialize kaleidoscope
        if (elements.kaleidoscopeCanvas) {
            Kaleidoscope.init(elements.kaleidoscopeCanvas);
            console.log('KaleidoScroll: Kaleidoscope initialized');
        }

        // Setup animation loop
        AnimationEngine.onUpdate(updateApp);
        AnimationEngine.onRender(renderApp);
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Control buttons
        if (elements.symmetryBtn) {
            elements.symmetryBtn.addEventListener('click', handleSymmetryChange);
        }

        if (elements.colorBtn) {
            elements.colorBtn.addEventListener('click', handleColorChange);
        }

        if (elements.speedBtn) {
            elements.speedBtn.addEventListener('click', handleSpeedChange);
        }

        // Scroll events
        ScrollController.on('onScroll', handleScroll);
        ScrollController.on('onScrollStart', handleScrollStart);
        ScrollController.on('onScrollEnd', handleScrollEnd);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyPress);

        // Visibility change
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Click on symmetry cards
        const symmetryCards = document.querySelectorAll('.symmetry-card');
        symmetryCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const symmetry = parseInt(card.dataset.symmetry);
                if (symmetry) {
                    Kaleidoscope.setSymmetry(symmetry);
                    app.currentSymmetry = symmetry;
                    updateInfoDisplay();
                }
            });
        });
    }

    /**
     * Setup scroll animations
     */
    function setupScrollAnimations() {
        // Intersection Observer for scroll sections
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        elements.scrollSections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Hide loading screen
     */
    function hideLoadingScreen() {
        setTimeout(() => {
            if (elements.loadingScreen) {
                elements.loadingScreen.classList.add('hidden');
                document.body.classList.remove('loading');
            }
        }, 1000);
    }

    /**
     * Update application state
     */
    function updateApp(dt) {
        const scrollData = ScrollController.getScrollData();
        
        // Update kaleidoscope
        Kaleidoscope.update(
            scrollData.smoothProgress * app.currentSpeed,
            scrollData.smoothVelocity
        );

        // Update info display
        updateInfoDisplay();
    }

    /**
     * Render application
     */
    function renderApp(dt) {
        // Render kaleidoscope
        Kaleidoscope.render();
    }

    /**
     * Handle scroll
     */
    function handleScroll(data) {
        // Additional scroll-based effects can be added here
    }

    /**
     * Handle scroll start
     */
    function handleScrollStart(data) {
        // Add effects when scrolling starts
    }

    /**
     * Handle scroll end
     */
    function handleScrollEnd(data) {
        // Add effects when scrolling ends
    }

    /**
     * Handle symmetry change
     */
    function handleSymmetryChange() {
        app.symmetryIndex = (app.symmetryIndex + 1) % app.symmetryModes.length;
        app.currentSymmetry = app.symmetryModes[app.symmetryIndex];
        Kaleidoscope.setSymmetry(app.currentSymmetry);
        updateInfoDisplay();

        // Visual feedback
        animateButton(elements.symmetryBtn);
    }

    /**
     * Handle color change
     */
    function handleColorChange() {
        Kaleidoscope.cycleColorPalette();
        
        // Visual feedback
        animateButton(elements.colorBtn);
    }

    /**
     * Handle speed change
     */
    function handleSpeedChange() {
        app.speedIndex = (app.speedIndex + 1) % app.speedModes.length;
        app.currentSpeed = app.speedModes[app.speedIndex];
        
        // Visual feedback
        animateButton(elements.speedBtn);
    }

    /**
     * Handle key press
     */
    function handleKeyPress(event) {
        switch (event.key) {
            case 's':
            case 'S':
                handleSymmetryChange();
                break;
            case 'c':
            case 'C':
                handleColorChange();
                break;
            case 'v':
            case 'V':
                handleSpeedChange();
                break;
            case 'r':
            case 'R':
                resetKaleidoscope();
                break;
            case ' ':
                event.preventDefault();
                scrollToNext();
                break;
        }
    }

    /**
     * Handle visibility change
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is hidden
            AnimationEngine.stop();
        } else {
            // Resume animations when tab is visible
            AnimationEngine.start();
        }
    }

    /**
     * Update info display
     */
    function updateInfoDisplay() {
        if (elements.symmetryValue) {
            elements.symmetryValue.textContent = app.currentSymmetry;
        }

        if (elements.rotationValue) {
            const rotation = Kaleidoscope.getRotation();
            const degrees = Math.round((rotation * GeometryCalculator.RAD_TO_DEG) % 360);
            elements.rotationValue.textContent = `${degrees}°`;
        }

        if (elements.scrollValue) {
            const progress = ScrollController.getScrollProgress();
            elements.scrollValue.textContent = `${Math.round(progress * 100)}%`;
        }
    }

    /**
     * Animate button click
     */
    function animateButton(button) {
        if (!button) return;

        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    /**
     * Reset kaleidoscope
     */
    function resetKaleidoscope() {
        Kaleidoscope.reset();
        ScrollController.scrollTo(0, true);
    }

    /**
     * Scroll to next section
     */
    function scrollToNext() {
        const sections = Array.from(elements.scrollSections);
        const scrollPosition = ScrollController.getScrollPosition();
        
        const nextSection = sections.find(section => {
            const rect = section.getBoundingClientRect();
            const top = rect.top + scrollPosition;
            return top > scrollPosition + 100;
        });

        if (nextSection) {
            ScrollController.scrollToElement(nextSection, -50, true);
        }
    }

    /**
     * Handle errors
     */
    function handleError(error) {
        console.error('KaleidoScroll Error:', error);
        
        // Show error message to user if needed
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            z-index: 10000;
            font-family: monospace;
        `;
        errorMessage.textContent = `Error: ${error.message}`;
        document.body.appendChild(errorMessage);

        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }

    /**
     * Performance monitoring
     */
    function monitorPerformance() {
        setInterval(() => {
            const stats = AnimationEngine.getStats();
            
            if (stats.fps < 30) {
                console.warn('KaleidoScroll: Low FPS detected, adjusting quality');
                Kaleidoscope.setRenderQuality(0.75);
            } else if (stats.fps > 55) {
                Kaleidoscope.setRenderQuality(1);
            }
        }, 5000);
    }

    /**
     * Cleanup on unload
     */
    function cleanup() {
        ScrollController.destroy();
        Kaleidoscope.destroy();
        AnimationEngine.stop();
        console.log('KaleidoScroll: Cleanup complete');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // Start performance monitoring
    monitorPerformance();

    // Global error handler
    window.addEventListener('error', (event) => {
        handleError(event.error);
    });

    // Expose app for debugging
    if (typeof window !== 'undefined') {
        window.KaleidoScrollApp = {
            version: '1.0.0',
            getState: () => ({ ...app }),
            getStats: () => AnimationEngine.getStats(),
            getScrollData: () => ScrollController.getScrollData(),
            reset: resetKaleidoscope,
            setSymmetry: (s) => {
                app.currentSymmetry = s;
                Kaleidoscope.setSymmetry(s);
            },
            setSpeed: (s) => {
                app.currentSpeed = s;
            }
        };

        console.log('KaleidoScroll v1.0.0 - Debug API available at window.KaleidoScrollApp');
    }
})();
