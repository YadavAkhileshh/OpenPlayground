/**
 * KaleidoScroll - Scroll Controller Module
 * Manages scroll events, position tracking, and scroll-driven animations
 * with optimized performance and smooth interpolation
 */

const ScrollController = (() => {
    'use strict';

    // State management
    let scrollPosition = 0;
    let maxScroll = 0;
    let scrollProgress = 0;
    let scrollVelocity = 0;
    let lastScrollPosition = 0;
    let scrollDirection = 0;
    let isScrolling = false;
    let scrollTimeout = null;

    // Configuration
    const config = {
        velocityDamping: 0.85,
        smoothingFactor: 0.15,
        scrollThreshold: 0.1,
        debounceDelay: 150,
        maxVelocity: 100
    };

    // Callbacks
    const callbacks = {
        onScroll: [],
        onScrollStart: [],
        onScrollEnd: [],
        onVelocityChange: [],
        onDirectionChange: []
    };

    // Smoothed values
    let smoothScrollPosition = 0;
    let smoothScrollProgress = 0;
    let smoothVelocity = 0;

    // RAF management
    let rafId = null;
    let isUpdating = false;

    /**
     * Initialize scroll controller
     */
    function init() {
        updateMaxScroll();
        attachEventListeners();
        startUpdateLoop();
        return this;
    }

    /**
     * Attach scroll event listeners
     */
    function attachEventListeners() {
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('orientationchange', handleResize, { passive: true });
    }

    /**
     * Handle scroll event
     */
    function handleScroll() {
        updateScrollPosition();
        updateScrollVelocity();
        updateScrollDirection();

        if (!isScrolling) {
            isScrolling = true;
            triggerCallbacks('onScrollStart', {
                position: scrollPosition,
                progress: scrollProgress
            });
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            scrollVelocity = 0;
            triggerCallbacks('onScrollEnd', {
                position: scrollPosition,
                progress: scrollProgress
            });
        }, config.debounceDelay);

        triggerCallbacks('onScroll', {
            position: scrollPosition,
            progress: scrollProgress,
            velocity: scrollVelocity,
            direction: scrollDirection
        });
    }

    /**
     * Handle resize event
     */
    function handleResize() {
        updateMaxScroll();
        updateScrollPosition();
    }

    /**
     * Update scroll position
     */
    function updateScrollPosition() {
        scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        scrollProgress = maxScroll > 0 ? GeometryCalculator.clamp(scrollPosition / maxScroll, 0, 1) : 0;
    }

    /**
     * Update maximum scroll value
     */
    function updateMaxScroll() {
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        maxScroll = documentHeight - window.innerHeight;
    }

    /**
     * Update scroll velocity
     */
    function updateScrollVelocity() {
        const delta = scrollPosition - lastScrollPosition;
        scrollVelocity = GeometryCalculator.clamp(
            delta,
            -config.maxVelocity,
            config.maxVelocity
        );
        lastScrollPosition = scrollPosition;

        if (Math.abs(scrollVelocity) > config.scrollThreshold) {
            triggerCallbacks('onVelocityChange', {
                velocity: scrollVelocity,
                position: scrollPosition
            });
        }
    }

    /**
     * Update scroll direction
     */
    function updateScrollDirection() {
        const newDirection = scrollVelocity > 0 ? 1 : scrollVelocity < 0 ? -1 : 0;
        
        if (newDirection !== scrollDirection && newDirection !== 0) {
            scrollDirection = newDirection;
            triggerCallbacks('onDirectionChange', {
                direction: scrollDirection,
                position: scrollPosition
            });
        }
    }

    /**
     * Start update loop for smooth interpolation
     */
    function startUpdateLoop() {
        if (isUpdating) return;
        isUpdating = true;
        update();
    }

    /**
     * Stop update loop
     */
    function stopUpdateLoop() {
        isUpdating = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    /**
     * Update loop using RAF
     */
    function update() {
        if (!isUpdating) return;

        // Smooth scroll position
        smoothScrollPosition += (scrollPosition - smoothScrollPosition) * config.smoothingFactor;
        smoothScrollProgress += (scrollProgress - smoothScrollProgress) * config.smoothingFactor;
        
        // Smooth velocity with damping
        smoothVelocity += (scrollVelocity - smoothVelocity) * config.smoothingFactor;
        smoothVelocity *= config.velocityDamping;

        // Continue loop
        rafId = requestAnimationFrame(update);
    }

    /**
     * Get current scroll data
     */
    function getScrollData() {
        return {
            position: scrollPosition,
            smoothPosition: smoothScrollPosition,
            progress: scrollProgress,
            smoothProgress: smoothScrollProgress,
            velocity: scrollVelocity,
            smoothVelocity: smoothVelocity,
            direction: scrollDirection,
            maxScroll: maxScroll,
            isScrolling: isScrolling
        };
    }

    /**
     * Get scroll position
     */
    function getScrollPosition() {
        return scrollPosition;
    }

    /**
     * Get smooth scroll position
     */
    function getSmoothScrollPosition() {
        return smoothScrollPosition;
    }

    /**
     * Get scroll progress (0-1)
     */
    function getScrollProgress() {
        return scrollProgress;
    }

    /**
     * Get smooth scroll progress (0-1)
     */
    function getSmoothScrollProgress() {
        return smoothScrollProgress;
    }

    /**
     * Get scroll velocity
     */
    function getScrollVelocity() {
        return scrollVelocity;
    }

    /**
     * Get smooth scroll velocity
     */
    function getSmoothScrollVelocity() {
        return smoothVelocity;
    }

    /**
     * Get scroll direction
     */
    function getScrollDirection() {
        return scrollDirection;
    }

    /**
     * Get max scroll
     */
    function getMaxScroll() {
        return maxScroll;
    }

    /**
     * Check if scrolling
     */
    function getIsScrolling() {
        return isScrolling;
    }

    /**
     * Scroll to position
     */
    function scrollTo(position, smooth = true) {
        if (smooth) {
            window.scrollTo({
                top: position,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, position);
        }
    }

    /**
     * Scroll to progress (0-1)
     */
    function scrollToProgress(progress, smooth = true) {
        const position = GeometryCalculator.clamp(progress, 0, 1) * maxScroll;
        scrollTo(position, smooth);
    }

    /**
     * Scroll to element
     */
    function scrollToElement(element, offset = 0, smooth = true) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        if (!element) return;

        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop + offset;

        scrollTo(targetPosition, smooth);
    }

    /**
     * Add callback
     */
    function on(event, callback) {
        if (callbacks[event]) {
            callbacks[event].push(callback);
        }
        return this;
    }

    /**
     * Remove callback
     */
    function off(event, callback) {
        if (callbacks[event]) {
            const index = callbacks[event].indexOf(callback);
            if (index > -1) {
                callbacks[event].splice(index, 1);
            }
        }
        return this;
    }

    /**
     * Trigger callbacks
     */
    function triggerCallbacks(event, data) {
        if (callbacks[event]) {
            callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }

    /**
     * Update configuration
     */
    function setConfig(newConfig) {
        Object.assign(config, newConfig);
        return this;
    }

    /**
     * Get configuration
     */
    function getConfig() {
        return { ...config };
    }

    /**
     * Enable smooth scrolling
     */
    function enableSmoothScroll() {
        document.documentElement.style.scrollBehavior = 'smooth';
        return this;
    }

    /**
     * Disable smooth scrolling
     */
    function disableSmoothScroll() {
        document.documentElement.style.scrollBehavior = 'auto';
        return this;
    }

    /**
     * Lock scroll
     */
    function lockScroll() {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return this;
    }

    /**
     * Unlock scroll
     */
    function unlockScroll() {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        return this;
    }

    /**
     * Get viewport info
     */
    function getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollY: window.pageYOffset || document.documentElement.scrollTop,
            scrollX: window.pageXOffset || document.documentElement.scrollLeft
        };
    }

    /**
     * Check if element is in viewport
     */
    function isElementInViewport(element, offset = 0) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;

        return (
            rect.top + offset < windowHeight &&
            rect.bottom - offset > 0 &&
            rect.left + offset < windowWidth &&
            rect.right - offset > 0
        );
    }

    /**
     * Get element visibility ratio
     */
    function getElementVisibilityRatio(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        if (!element) return 0;

        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        if (rect.bottom < 0 || rect.top > windowHeight) {
            return 0;
        }

        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        return GeometryCalculator.clamp(visibleHeight / rect.height, 0, 1);
    }

    /**
     * Destroy scroll controller
     */
    function destroy() {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        
        stopUpdateLoop();
        
        Object.keys(callbacks).forEach(key => {
            callbacks[key] = [];
        });

        clearTimeout(scrollTimeout);
    }

    /**
     * Reset scroll controller
     */
    function reset() {
        scrollPosition = 0;
        maxScroll = 0;
        scrollProgress = 0;
        scrollVelocity = 0;
        lastScrollPosition = 0;
        scrollDirection = 0;
        isScrolling = false;
        smoothScrollPosition = 0;
        smoothScrollProgress = 0;
        smoothVelocity = 0;
        
        updateMaxScroll();
        updateScrollPosition();
        
        return this;
    }

    // Public API
    return {
        init,
        destroy,
        reset,
        getScrollData,
        getScrollPosition,
        getSmoothScrollPosition,
        getScrollProgress,
        getSmoothScrollProgress,
        getScrollVelocity,
        getSmoothScrollVelocity,
        getScrollDirection,
        getMaxScroll,
        getIsScrolling,
        scrollTo,
        scrollToProgress,
        scrollToElement,
        on,
        off,
        setConfig,
        getConfig,
        enableSmoothScroll,
        disableSmoothScroll,
        lockScroll,
        unlockScroll,
        getViewportInfo,
        isElementInViewport,
        getElementVisibilityRatio
    };
})();
