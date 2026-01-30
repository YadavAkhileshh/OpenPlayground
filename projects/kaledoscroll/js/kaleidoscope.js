/**
 * KaleidoScroll - Kaleidoscope Module
 * Core kaleidoscope rendering engine with real-time mirror effects
 * GPU-optimized canvas rendering with multiple symmetry modes
 */

const Kaleidoscope = (() => {
    'use strict';

    // Canvas and context
    let canvas = null;
    let ctx = null;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;

    // Rendering state
    let currentSymmetry = 8;
    let rotation = 0;
    let scale = 1;
    let colorPhase = 0;
    let isInitialized = false;

    // Animation state
    let targetRotation = 0;
    let targetScale = 1;
    const rotationSpring = new AnimationEngine.Spring(0, {
        stiffness: 0.05,
        damping: 0.7
    });
    const scaleSpring = new AnimationEngine.Spring(1, {
        stiffness: 0.08,
        damping: 0.75
    });

    // Color palettes
    const colorPalettes = [
        ['#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b', '#ff006e'],
        ['#ff0080', '#ff8c00', '#40e0d0', '#9d4edd', '#06ffd5'],
        ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'],
        ['#d00000', '#ffba08', '#3f88c5', '#032b43', '#136f63'],
        ['#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4']
    ];
    let currentPaletteIndex = 0;
    let currentPalette = colorPalettes[0];

    // Performance optimization
    let offscreenCanvas = null;
    let offscreenCtx = null;
    let useOffscreen = true;
    let renderQuality = 1;

    // Particle effects
    let particles = [];
    const maxParticles = 100;

    // Pattern generation
    let patterns = [];
    const maxPatterns = 20;

    /**
     * Initialize kaleidoscope
     */
    function init(canvasElement) {
        if (!canvasElement) {
            console.error('Kaleidoscope: Canvas element required');
            return false;
        }

        canvas = canvasElement;
        ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,
            willReadFrequently: false
        });

        if (!ctx) {
            console.error('Kaleidoscope: Failed to get 2D context');
            return false;
        }

        setupCanvas();
        setupOffscreenCanvas();
        initializePatterns();
        initializeParticles();

        isInitialized = true;
        return true;
    }

    /**
     * Setup main canvas
     */
    function setupCanvas() {
        updateCanvasSize();
        window.addEventListener('resize', handleResize);
    }

    /**
     * Setup offscreen canvas for double buffering
     */
    function setupOffscreenCanvas() {
        if (!useOffscreen) return;

        try {
            offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
            offscreenCtx = offscreenCanvas.getContext('2d', { alpha: true });
        } catch (error) {
            console.warn('Offscreen canvas not supported:', error);
            useOffscreen = false;
        }
    }

    /**
     * Update canvas size
     */
    function updateCanvasSize() {
        width = window.innerWidth;
        height = window.innerHeight;
        
        canvas.width = width * renderQuality;
        canvas.height = height * renderQuality;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        if (renderQuality !== 1) {
            ctx.scale(renderQuality, renderQuality);
        }

        centerX = width / 2;
        centerY = height / 2;

        if (offscreenCanvas) {
            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
        }
    }

    /**
     * Handle resize
     */
    function handleResize() {
        updateCanvasSize();
        initializePatterns();
    }

    /**
     * Initialize patterns
     */
    function initializePatterns() {
        patterns = [];
        const radius = Math.max(width, height) * 0.8;

        for (let i = 0; i < maxPatterns; i++) {
            patterns.push({
                x: GeometryCalculator.random(-radius, radius),
                y: GeometryCalculator.random(-radius, radius),
                size: GeometryCalculator.random(10, 100),
                rotation: GeometryCalculator.random(0, GeometryCalculator.TWO_PI),
                speed: GeometryCalculator.random(0.0005, 0.002),
                type: Math.floor(GeometryCalculator.random(0, 4)),
                color: currentPalette[Math.floor(GeometryCalculator.random(0, currentPalette.length))],
                alpha: GeometryCalculator.random(0.3, 0.8)
            });
        }
    }

    /**
     * Initialize particles
     */
    function initializeParticles() {
        particles = [];
        const radius = Math.max(width, height) * 0.6;

        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: GeometryCalculator.random(-radius, radius),
                y: GeometryCalculator.random(-radius, radius),
                vx: GeometryCalculator.random(-0.5, 0.5),
                vy: GeometryCalculator.random(-0.5, 0.5),
                size: GeometryCalculator.random(2, 8),
                color: currentPalette[Math.floor(GeometryCalculator.random(0, currentPalette.length))],
                alpha: GeometryCalculator.random(0.2, 0.6),
                life: 1
            });
        }
    }

    /**
     * Update kaleidoscope state
     */
    function update(scrollProgress, scrollVelocity) {
        if (!isInitialized) return;

        // Update rotation based on scroll
        targetRotation = scrollProgress * GeometryCalculator.TWO_PI * 4;
        targetRotation += scrollVelocity * 0.01;
        rotationSpring.setTarget(targetRotation);
        rotationSpring.update(16);
        rotation = rotationSpring.value;

        // Update scale based on velocity
        const velocityScale = 1 + Math.abs(scrollVelocity) * 0.002;
        targetScale = GeometryCalculator.clamp(velocityScale, 0.8, 1.5);
        scaleSpring.setTarget(targetScale);
        scaleSpring.update(16);
        scale = scaleSpring.value;

        // Update color phase
        colorPhase = (colorPhase + 0.002) % GeometryCalculator.TWO_PI;

        // Update patterns
        updatePatterns(scrollProgress);

        // Update particles
        updateParticles();
    }

    /**
     * Update patterns
     */
    function updatePatterns(scrollProgress) {
        patterns.forEach(pattern => {
            pattern.rotation += pattern.speed;
            pattern.x += Math.sin(pattern.rotation) * 0.5;
            pattern.y += Math.cos(pattern.rotation) * 0.5;
        });
    }

    /**
     * Update particles
     */
    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off boundaries
            const maxDist = Math.max(width, height) * 0.6;
            const dist = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
            
            if (dist > maxDist) {
                const angle = Math.atan2(particle.y, particle.x);
                particle.vx = -Math.cos(angle) * 0.5;
                particle.vy = -Math.sin(angle) * 0.5;
            }

            // Add slight attraction to center
            particle.vx -= particle.x * 0.0001;
            particle.vy -= particle.y * 0.0001;

            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    /**
     * Render kaleidoscope
     */
    function render() {
        if (!isInitialized) return;

        const renderCtx = useOffscreen ? offscreenCtx : ctx;

        // Clear canvas
        renderCtx.clearRect(0, 0, width, height);

        // Save context
        renderCtx.save();

        // Move to center
        renderCtx.translate(centerX, centerY);

        // Apply global rotation and scale
        renderCtx.rotate(rotation * 0.1);
        renderCtx.scale(scale, scale);

        // Draw kaleidoscope segments
        drawKaleidoscopeSegments(renderCtx);

        // Restore context
        renderCtx.restore();

        // Copy offscreen to main canvas if using double buffering
        if (useOffscreen) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(offscreenCanvas, 0, 0);
        }
    }

    /**
     * Draw kaleidoscope segments
     */
    function drawKaleidoscopeSegments(renderCtx) {
        const sliceAngle = GeometryCalculator.TWO_PI / currentSymmetry;

        for (let i = 0; i < currentSymmetry; i++) {
            renderCtx.save();

            // Rotate to segment position
            renderCtx.rotate(i * sliceAngle);

            // Clip to segment
            renderCtx.beginPath();
            renderCtx.moveTo(0, 0);
            renderCtx.arc(0, 0, Math.max(width, height), 0, sliceAngle);
            renderCtx.closePath();
            renderCtx.clip();

            // Mirror every other segment
            if (i % 2 === 1) {
                renderCtx.scale(-1, 1);
            }

            // Draw content
            drawSegmentContent(renderCtx);

            renderCtx.restore();
        }
    }

    /**
     * Draw segment content
     */
    function drawSegmentContent(renderCtx) {
        // Draw patterns
        patterns.forEach(pattern => {
            renderCtx.save();
            renderCtx.translate(pattern.x, pattern.y);
            renderCtx.rotate(pattern.rotation);
            renderCtx.globalAlpha = pattern.alpha;

            switch (pattern.type) {
                case 0:
                    drawCirclePattern(renderCtx, pattern);
                    break;
                case 1:
                    drawSquarePattern(renderCtx, pattern);
                    break;
                case 2:
                    drawStarPattern(renderCtx, pattern);
                    break;
                case 3:
                    drawPolygonPattern(renderCtx, pattern);
                    break;
            }

            renderCtx.restore();
        });

        // Draw particles
        particles.forEach(particle => {
            renderCtx.save();
            renderCtx.globalAlpha = particle.alpha;
            renderCtx.fillStyle = particle.color;
            renderCtx.beginPath();
            renderCtx.arc(particle.x, particle.y, particle.size, 0, GeometryCalculator.TWO_PI);
            renderCtx.fill();
            renderCtx.restore();
        });
    }

    /**
     * Draw circle pattern
     */
    function drawCirclePattern(renderCtx, pattern) {
        renderCtx.strokeStyle = pattern.color;
        renderCtx.lineWidth = 3;
        renderCtx.beginPath();
        renderCtx.arc(0, 0, pattern.size, 0, GeometryCalculator.TWO_PI);
        renderCtx.stroke();
    }

    /**
     * Draw square pattern
     */
    function drawSquarePattern(renderCtx, pattern) {
        renderCtx.strokeStyle = pattern.color;
        renderCtx.lineWidth = 3;
        renderCtx.strokeRect(-pattern.size / 2, -pattern.size / 2, pattern.size, pattern.size);
    }

    /**
     * Draw star pattern
     */
    function drawStarPattern(renderCtx, pattern) {
        const points = 5;
        const outerRadius = pattern.size;
        const innerRadius = pattern.size * 0.5;

        renderCtx.fillStyle = pattern.color;
        renderCtx.beginPath();

        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                renderCtx.moveTo(x, y);
            } else {
                renderCtx.lineTo(x, y);
            }
        }

        renderCtx.closePath();
        renderCtx.fill();
    }

    /**
     * Draw polygon pattern
     */
    function drawPolygonPattern(renderCtx, pattern) {
        const sides = 6;
        const radius = pattern.size;

        renderCtx.strokeStyle = pattern.color;
        renderCtx.lineWidth = 3;
        renderCtx.beginPath();

        for (let i = 0; i < sides; i++) {
            const angle = (i * GeometryCalculator.TWO_PI) / sides;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                renderCtx.moveTo(x, y);
            } else {
                renderCtx.lineTo(x, y);
            }
        }

        renderCtx.closePath();
        renderCtx.stroke();
    }

    /**
     * Set symmetry mode
     */
    function setSymmetry(segments) {
        currentSymmetry = GeometryCalculator.clamp(segments, 2, 32);
        return this;
    }

    /**
     * Get current symmetry
     */
    function getSymmetry() {
        return currentSymmetry;
    }

    /**
     * Cycle to next color palette
     */
    function cycleColorPalette() {
        currentPaletteIndex = (currentPaletteIndex + 1) % colorPalettes.length;
        currentPalette = colorPalettes[currentPaletteIndex];
        initializePatterns();
        initializeParticles();
        return this;
    }

    /**
     * Set render quality (0.5 to 2)
     */
    function setRenderQuality(quality) {
        renderQuality = GeometryCalculator.clamp(quality, 0.5, 2);
        updateCanvasSize();
        return this;
    }

    /**
     * Get rotation
     */
    function getRotation() {
        return rotation;
    }

    /**
     * Reset kaleidoscope
     */
    function reset() {
        rotation = 0;
        scale = 1;
        colorPhase = 0;
        targetRotation = 0;
        targetScale = 1;
        rotationSpring.setValue(0);
        scaleSpring.setValue(1);
        initializePatterns();
        initializeParticles();
        return this;
    }

    /**
     * Destroy kaleidoscope
     */
    function destroy() {
        window.removeEventListener('resize', handleResize);
        if (ctx) {
            ctx.clearRect(0, 0, width, height);
        }
        canvas = null;
        ctx = null;
        offscreenCanvas = null;
        offscreenCtx = null;
        isInitialized = false;
    }

    // Public API
    return {
        init,
        update,
        render,
        setSymmetry,
        getSymmetry,
        cycleColorPalette,
        setRenderQuality,
        getRotation,
        reset,
        destroy
    };
})();
