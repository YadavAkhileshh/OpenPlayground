/**
 * KaleidoScroll - Animation Engine Module
 * Manages RAF loop, tween animations, and visual effects coordination
 * High-performance animation system with GPU acceleration
 */

const AnimationEngine = (() => {
    'use strict';

    // Animation state
    let rafId = null;
    let isRunning = false;
    let currentTime = 0;
    let deltaTime = 0;
    let lastTime = 0;
    let fps = 60;
    let frameCount = 0;

    // Animation queue
    const animations = new Map();
    const tweens = new Map();
    const timers = new Map();
    
    // Callbacks
    const updateCallbacks = [];
    const renderCallbacks = [];

    // Configuration
    const config = {
        targetFPS: 60,
        adaptivePerformance: true,
        gpuAcceleration: true,
        maxDeltaTime: 100
    };

    // Performance monitoring
    let lastFPSUpdate = 0;
    let frameCountForFPS = 0;
    let performanceMode = 'high';

    /**
     * Initialize animation engine
     */
    function init() {
        enableGPUAcceleration();
        start();
        return this;
    }

    /**
     * Enable GPU acceleration
     */
    function enableGPUAcceleration() {
        if (!config.gpuAcceleration) return;

        const style = document.createElement('style');
        style.textContent = `
            .gpu-accelerated {
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
                will-change: transform, opacity;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Start animation loop
     */
    function start() {
        if (isRunning) return;
        isRunning = true;
        lastTime = performance.now();
        loop();
    }

    /**
     * Stop animation loop
     */
    function stop() {
        isRunning = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    /**
     * Main animation loop
     */
    function loop(timestamp = performance.now()) {
        if (!isRunning) return;

        // Calculate time delta
        currentTime = timestamp;
        deltaTime = Math.min(currentTime - lastTime, config.maxDeltaTime);
        lastTime = currentTime;

        // Update FPS
        updateFPS();

        // Update phase
        update(deltaTime);

        // Render phase
        render(deltaTime);

        // Continue loop
        frameCount++;
        rafId = requestAnimationFrame(loop);
    }

    /**
     * Update FPS counter
     */
    function updateFPS() {
        frameCountForFPS++;
        const elapsed = currentTime - lastFPSUpdate;

        if (elapsed >= 1000) {
            fps = Math.round((frameCountForFPS * 1000) / elapsed);
            frameCountForFPS = 0;
            lastFPSUpdate = currentTime;

            // Adaptive performance
            if (config.adaptivePerformance) {
                adjustPerformance();
            }
        }
    }

    /**
     * Adjust performance based on FPS
     */
    function adjustPerformance() {
        if (fps < 30 && performanceMode !== 'low') {
            performanceMode = 'low';
            console.log('AnimationEngine: Switching to low performance mode');
        } else if (fps > 50 && performanceMode !== 'high') {
            performanceMode = 'high';
            console.log('AnimationEngine: Switching to high performance mode');
        }
    }

    /**
     * Update animations
     */
    function update(dt) {
        // Update all registered animations
        animations.forEach((animation, id) => {
            if (animation.paused) return;

            animation.elapsed += dt;
            const progress = Math.min(animation.elapsed / animation.duration, 1);
            const easedProgress = animation.easing(progress);

            animation.onUpdate(easedProgress, dt);

            if (progress >= 1) {
                if (animation.onComplete) {
                    animation.onComplete();
                }
                if (animation.loop) {
                    animation.elapsed = 0;
                } else {
                    animations.delete(id);
                }
            }
        });

        // Update tweens
        tweens.forEach((tween, id) => {
            if (tween.paused) return;

            tween.elapsed += dt;
            const progress = Math.min(tween.elapsed / tween.duration, 1);
            const easedProgress = tween.easing(progress);

            Object.keys(tween.properties).forEach(prop => {
                const start = tween.start[prop];
                const end = tween.properties[prop];
                const current = GeometryCalculator.lerp(start, end, easedProgress);
                
                if (tween.target) {
                    tween.target[prop] = current;
                }
            });

            if (tween.onUpdate) {
                tween.onUpdate(easedProgress);
            }

            if (progress >= 1) {
                if (tween.onComplete) {
                    tween.onComplete();
                }
                tweens.delete(id);
            }
        });

        // Update timers
        timers.forEach((timer, id) => {
            timer.elapsed += dt;
            if (timer.elapsed >= timer.delay) {
                timer.callback();
                timers.delete(id);
            }
        });

        // Execute update callbacks
        updateCallbacks.forEach(callback => {
            try {
                callback(dt, currentTime);
            } catch (error) {
                console.error('Update callback error:', error);
            }
        });
    }

    /**
     * Render frame
     */
    function render(dt) {
        renderCallbacks.forEach(callback => {
            try {
                callback(dt, currentTime);
            } catch (error) {
                console.error('Render callback error:', error);
            }
        });
    }

    /**
     * Create animation
     */
    function createAnimation(options) {
        const id = generateId();
        const animation = {
            id,
            duration: options.duration || 1000,
            elapsed: 0,
            easing: options.easing || GeometryCalculator.Easing.linear,
            onUpdate: options.onUpdate || (() => {}),
            onComplete: options.onComplete || null,
            loop: options.loop || false,
            paused: false
        };

        animations.set(id, animation);
        return id;
    }

    /**
     * Create tween
     */
    function createTween(target, properties, options = {}) {
        const id = generateId();
        const start = {};

        Object.keys(properties).forEach(prop => {
            start[prop] = target ? target[prop] : 0;
        });

        const tween = {
            id,
            target,
            properties,
            start,
            duration: options.duration || 1000,
            elapsed: 0,
            easing: options.easing || GeometryCalculator.Easing.easeInOutQuad,
            onUpdate: options.onUpdate || null,
            onComplete: options.onComplete || null,
            paused: false
        };

        tweens.set(id, tween);
        return id;
    }

    /**
     * Pause animation
     */
    function pauseAnimation(id) {
        const animation = animations.get(id);
        if (animation) {
            animation.paused = true;
        }
        const tween = tweens.get(id);
        if (tween) {
            tween.paused = true;
        }
    }

    /**
     * Resume animation
     */
    function resumeAnimation(id) {
        const animation = animations.get(id);
        if (animation) {
            animation.paused = false;
        }
        const tween = tweens.get(id);
        if (tween) {
            tween.paused = false;
        }
    }

    /**
     * Stop animation
     */
    function stopAnimation(id) {
        animations.delete(id);
        tweens.delete(id);
    }

    /**
     * Clear all animations
     */
    function clearAllAnimations() {
        animations.clear();
        tweens.clear();
        timers.clear();
    }

    /**
     * Set timeout
     */
    function setTimeout(callback, delay) {
        const id = generateId();
        timers.set(id, {
            callback,
            delay,
            elapsed: 0
        });
        return id;
    }

    /**
     * Clear timeout
     */
    function clearTimeout(id) {
        timers.delete(id);
    }

    /**
     * Add update callback
     */
    function onUpdate(callback) {
        if (typeof callback === 'function') {
            updateCallbacks.push(callback);
        }
        return this;
    }

    /**
     * Remove update callback
     */
    function offUpdate(callback) {
        const index = updateCallbacks.indexOf(callback);
        if (index > -1) {
            updateCallbacks.splice(index, 1);
        }
        return this;
    }

    /**
     * Add render callback
     */
    function onRender(callback) {
        if (typeof callback === 'function') {
            renderCallbacks.push(callback);
        }
        return this;
    }

    /**
     * Remove render callback
     */
    function offRender(callback) {
        const index = renderCallbacks.indexOf(callback);
        if (index > -1) {
            renderCallbacks.splice(index, 1);
        }
        return this;
    }

    /**
     * Generate unique ID
     */
    function generateId() {
        return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get current FPS
     */
    function getFPS() {
        return fps;
    }

    /**
     * Get performance mode
     */
    function getPerformanceMode() {
        return performanceMode;
    }

    /**
     * Set performance mode
     */
    function setPerformanceMode(mode) {
        if (['low', 'medium', 'high'].includes(mode)) {
            performanceMode = mode;
        }
        return this;
    }

    /**
     * Get animation stats
     */
    function getStats() {
        return {
            fps,
            frameCount,
            deltaTime,
            currentTime,
            animationCount: animations.size,
            tweenCount: tweens.size,
            timerCount: timers.size,
            performanceMode,
            isRunning
        };
    }

    /**
     * Particle system
     */
    class ParticleSystem {
        constructor(options = {}) {
            this.particles = [];
            this.maxParticles = options.maxParticles || 100;
            this.emissionRate = options.emissionRate || 10;
            this.particleLife = options.particleLife || 2000;
            this.gravity = options.gravity || { x: 0, y: 0.5 };
            this.friction = options.friction || 0.98;
            this.lastEmission = 0;
        }

        update(dt) {
            // Emit particles
            const particlesToEmit = Math.floor((dt * this.emissionRate) / 1000);
            for (let i = 0; i < particlesToEmit && this.particles.length < this.maxParticles; i++) {
                this.emit();
            }

            // Update particles
            this.particles = this.particles.filter(particle => {
                particle.life -= dt;
                if (particle.life <= 0) return false;

                particle.velocity.x += this.gravity.x;
                particle.velocity.y += this.gravity.y;
                particle.velocity.x *= this.friction;
                particle.velocity.y *= this.friction;

                particle.position.x += particle.velocity.x;
                particle.position.y += particle.velocity.y;

                particle.alpha = particle.life / this.particleLife;

                return true;
            });
        }

        emit() {
            this.particles.push({
                position: { x: 0, y: 0 },
                velocity: {
                    x: GeometryCalculator.random(-2, 2),
                    y: GeometryCalculator.random(-2, 2)
                },
                life: this.particleLife,
                alpha: 1,
                size: GeometryCalculator.random(2, 8),
                color: `hsl(${GeometryCalculator.random(0, 360)}, 70%, 60%)`
            });
        }

        render(ctx) {
            this.particles.forEach(particle => {
                ctx.save();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.position.x, particle.position.y, particle.size, 0, GeometryCalculator.TWO_PI);
                ctx.fill();
                ctx.restore();
            });
        }

        clear() {
            this.particles = [];
        }
    }

    /**
     * Spring physics
     */
    class Spring {
        constructor(value = 0, options = {}) {
            this.value = value;
            this.target = value;
            this.velocity = 0;
            this.stiffness = options.stiffness || 0.1;
            this.damping = options.damping || 0.8;
            this.mass = options.mass || 1;
        }

        update(dt) {
            const force = (this.target - this.value) * this.stiffness;
            this.velocity += (force / this.mass) * dt;
            this.velocity *= this.damping;
            this.value += this.velocity * dt;
        }

        setTarget(target) {
            this.target = target;
        }

        setValue(value) {
            this.value = value;
            this.velocity = 0;
        }

        isAtRest() {
            return Math.abs(this.velocity) < 0.01 && Math.abs(this.target - this.value) < 0.01;
        }
    }

    // Public API
    return {
        init,
        start,
        stop,
        createAnimation,
        createTween,
        pauseAnimation,
        resumeAnimation,
        stopAnimation,
        clearAllAnimations,
        setTimeout,
        clearTimeout,
        onUpdate,
        offUpdate,
        onRender,
        offRender,
        getFPS,
        getPerformanceMode,
        setPerformanceMode,
        getStats,
        ParticleSystem,
        Spring
    };
})();
