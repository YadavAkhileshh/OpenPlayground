/**
 * KaleidoScroll - Complete Application
 * All modules combined for optimal performance
 */

const GeometryCalculator = (() => {
    'use strict';
    const PI = Math.PI, TWO_PI = PI * 2, DEG_TO_RAD = PI / 180, RAD_TO_DEG = 180 / PI;
    
    class Point { constructor(x = 0, y = 0) { this.x = x; this.y = y; } }
    
    const lerp = (start, end, t) => start + (end - start) * t;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const map = (value, inMin, inMax, outMin, outMax) => ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    const random = (min = 0, max = 1) => Math.random() * (max - min) + min;
    
    const Easing = {
        linear: t => t,
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };
    
    return { Point, lerp, clamp, map, random, Easing, PI, TWO_PI, DEG_TO_RAD, RAD_TO_DEG };
})();

const ScrollController = (() => {
    'use strict';
    let scrollPosition = 0, maxScroll = 0, scrollProgress = 0, scrollVelocity = 0;
    let lastScrollPosition = 0, smoothScrollPosition = 0, smoothScrollProgress = 0;
    const config = { smoothingFactor: 0.15, maxVelocity: 100 };
    const callbacks = { onScroll: [] };
    let rafId = null;
    
    function init() {
        updateMaxScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
        startUpdateLoop();
        return this;
    }
    
    function handleScroll() {
        updateScrollPosition();
        const delta = scrollPosition - lastScrollPosition;
        scrollVelocity = GeometryCalculator.clamp(delta, -config.maxVelocity, config.maxVelocity);
        lastScrollPosition = scrollPosition;
        triggerCallbacks('onScroll', { position: scrollPosition, progress: scrollProgress, velocity: scrollVelocity });
    }
    
    function handleResize() { updateMaxScroll(); updateScrollPosition(); }
    
    function updateScrollPosition() {
        scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        scrollProgress = maxScroll > 0 ? GeometryCalculator.clamp(scrollPosition / maxScroll, 0, 1) : 0;
    }
    
    function updateMaxScroll() {
        const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        maxScroll = documentHeight - window.innerHeight;
    }
    
    function startUpdateLoop() {
        function update() {
            smoothScrollPosition += (scrollPosition - smoothScrollPosition) * config.smoothingFactor;
            smoothScrollProgress += (scrollProgress - smoothScrollProgress) * config.smoothingFactor;
            rafId = requestAnimationFrame(update);
        }
        update();
    }
    
    function triggerCallbacks(event, data) {
        callbacks[event]?.forEach(callback => { try { callback(data); } catch(e) { console.error(e); } });
    }
    
    function on(event, callback) { if (callbacks[event]) callbacks[event].push(callback); return this; }
    
    function getScrollData() {
        return { position: scrollPosition, smoothPosition: smoothScrollPosition, progress: scrollProgress, 
                 smoothProgress: smoothScrollProgress, velocity: scrollVelocity, maxScroll };
    }
    
    function scrollToElement(element, offset = 0) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop + offset, behavior: 'smooth' });
    }
    
    return { init, on, getScrollData, scrollToElement };
})();

const AnimationEngine = (() => {
    'use strict';
    let rafId = null, isRunning = false, currentTime = 0, deltaTime = 0, lastTime = 0;
    const updateCallbacks = [], renderCallbacks = [];
    
    function init() { start(); return this; }
    
    function start() {
        if (isRunning) return;
        isRunning = true;
        lastTime = performance.now();
        loop();
    }
    
    function stop() {
        isRunning = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }
    
    function loop(timestamp = performance.now()) {
        if (!isRunning) return;
        currentTime = timestamp;
        deltaTime = Math.min(currentTime - lastTime, 100);
        lastTime = currentTime;
        
        updateCallbacks.forEach(cb => { try { cb(deltaTime, currentTime); } catch(e) { console.error(e); } });
        renderCallbacks.forEach(cb => { try { cb(deltaTime, currentTime); } catch(e) { console.error(e); } });
        
        rafId = requestAnimationFrame(loop);
    }
    
    function onUpdate(callback) { if (typeof callback === 'function') updateCallbacks.push(callback); return this; }
    function onRender(callback) { if (typeof callback === 'function') renderCallbacks.push(callback); return this; }
    
    class Spring {
        constructor(value = 0, options = {}) {
            this.value = value; this.target = value; this.velocity = 0;
            this.stiffness = options.stiffness || 0.1;
            this.damping = options.damping || 0.8;
        }
        update(dt) {
            const force = (this.target - this.value) * this.stiffness;
            this.velocity += force * dt;
            this.velocity *= this.damping;
            this.value += this.velocity * dt;
        }
        setTarget(target) { this.target = target; }
        setValue(value) { this.value = value; this.velocity = 0; }
    }
    
    return { init, start, stop, onUpdate, onRender, Spring };
})();

const Kaleidoscope = (() => {
    'use strict';
    let canvas = null, ctx = null, width = 0, height = 0, centerX = 0, centerY = 0;
    let currentSymmetry = 8, rotation = 0, scale = 1, colorPhase = 0;
    const rotationSpring = new AnimationEngine.Spring(0, { stiffness: 0.05, damping: 0.7 });
    const scaleSpring = new AnimationEngine.Spring(1, { stiffness: 0.08, damping: 0.75 });
    
    const colorPalettes = [
        ['#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b', '#ff006e'],
        ['#ff0080', '#ff8c00', '#40e0d0', '#9d4edd', '#06ffd5'],
        ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0']
    ];
    let currentPaletteIndex = 0, currentPalette = colorPalettes[0];
    let patterns = [], particles = [];
    
    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        if (!ctx) return false;
        setupCanvas();
        initializePatterns();
        initializeParticles();
        return true;
    }
    
    function setupCanvas() {
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }
    
    function updateCanvasSize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        centerX = width / 2;
        centerY = height / 2;
    }
    
    function initializePatterns() {
        patterns = [];
        const radius = Math.max(width, height) * 0.8;
        for (let i = 0; i < 30; i++) {
            patterns.push({
                x: GeometryCalculator.random(-radius, radius),
                y: GeometryCalculator.random(-radius, radius),
                size: GeometryCalculator.random(10, 100),
                rotation: GeometryCalculator.random(0, GeometryCalculator.TWO_PI),
                speed: GeometryCalculator.random(0.0005, 0.002),
                type: Math.floor(GeometryCalculator.random(0, 8)),
                color: currentPalette[Math.floor(GeometryCalculator.random(0, currentPalette.length))],
                color2: currentPalette[Math.floor(GeometryCalculator.random(0, currentPalette.length))],
                alpha: GeometryCalculator.random(0.3, 0.8),
                pulsePhase: GeometryCalculator.random(0, GeometryCalculator.TWO_PI),
                orbitRadius: GeometryCalculator.random(50, 200),
                orbitSpeed: GeometryCalculator.random(0.001, 0.005)
            });
        }
    }
    
    function initializeParticles() {
        particles = [];
        const radius = Math.max(width, height) * 0.6;
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: GeometryCalculator.random(-radius, radius),
                y: GeometryCalculator.random(-radius, radius),
                vx: GeometryCalculator.random(-0.5, 0.5),
                vy: GeometryCalculator.random(-0.5, 0.5),
                size: GeometryCalculator.random(2, 8),
                color: currentPalette[Math.floor(GeometryCalculator.random(0, currentPalette.length))],
                alpha: GeometryCalculator.random(0.2, 0.6)
            });
        }
    }
    
    function update(scrollProgress, scrollVelocity) {
        const targetRotation = scrollProgress * GeometryCalculator.TWO_PI * 4 + scrollVelocity * 0.01;
        rotationSpring.setTarget(targetRotation);
        rotationSpring.update(16);
        rotation = rotationSpring.value;
        
        const velocityScale = 1 + Math.abs(scrollVelocity) * 0.002;
        scaleSpring.setTarget(GeometryCalculator.clamp(velocityScale, 0.8, 1.5));
        scaleSpring.update(16);
        scale = scaleSpring.value;
        
        colorPhase += 0.005;
        
        patterns.forEach(p => {
            p.rotation += p.speed;
            p.pulsePhase += 0.02;
            const orbitAngle = p.rotation * p.orbitSpeed;
            p.x += Math.sin(orbitAngle) * 0.5 + Math.cos(p.rotation) * 0.3;
            p.y += Math.cos(orbitAngle) * 0.5 + Math.sin(p.rotation) * 0.3;
        });
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            const centerDist = Math.sqrt(p.x * p.x + p.y * p.y);
            const maxDist = Math.max(width, height) * 0.6;
            if (centerDist > maxDist) {
                const angle = Math.atan2(p.y, p.x);
                p.vx = -Math.cos(angle) * 0.8;
                p.vy = -Math.sin(angle) * 0.8;
            }
            p.vx -= p.x * 0.0002;
            p.vy -= p.y * 0.0002;
            p.vx *= 0.99;
            p.vy *= 0.99;
        });
    }
    
    function render() {
        ctx.clearRect(0, 0, width, height);
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `hsla(${(colorPhase * 180 / Math.PI) % 360}, 70%, 10%, 0.05)`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * 0.1);
        ctx.scale(scale, scale);
        
        for (let i = 0; i < currentSymmetry; i++) {
            ctx.save();
            ctx.rotate((GeometryCalculator.TWO_PI / currentSymmetry) * i);
            drawContent();
            ctx.restore();
            
            ctx.save();
            ctx.scale(1, -1);
            ctx.rotate((GeometryCalculator.TWO_PI / currentSymmetry) * i);
            drawContent();
            ctx.restore();
        }
        
        ctx.restore();
        
        patterns.forEach(p => {
            ctx.save();
            ctx.translate(centerX + p.x, centerY + p.y);
            ctx.rotate(p.rotation);
            
            const pulseSize = p.size * (1 + Math.sin(p.pulsePhase) * 0.2);
            ctx.globalAlpha = p.alpha;
            
            switch(p.type) {
                case 0:
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(0, 0, pulseSize, 0, GeometryCalculator.TWO_PI);
                    ctx.stroke();
                    break;
                case 1:
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(-pulseSize/2, -pulseSize/2, pulseSize, pulseSize);
                    break;
                case 2:
                    drawStar(ctx, 5, pulseSize, pulseSize * 0.5, p.color);
                    break;
                case 3:
                    drawPolygon(ctx, 6, pulseSize, p.color);
                    break;
                case 4:
                    drawSpiral(ctx, pulseSize, p.color, p.color2);
                    break;
                case 5:
                    drawMandala(ctx, pulseSize, p.color, p.color2);
                    break;
                case 6:
                    drawFlower(ctx, 8, pulseSize, p.color);
                    break;
                case 7:
                    drawCrystal(ctx, pulseSize, p.color, p.color2);
                    break;
            }
            ctx.restore();
        });
        
        ctx.save();
        ctx.translate(centerX, centerY);
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, GeometryCalculator.TWO_PI);
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();
    }
    
    function drawStar(context, points, outerRadius, innerRadius, color) {
        context.fillStyle = color;
        context.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
    }
    
    function drawPolygon(context, sides, radius, color) {
        context.strokeStyle = color;
        context.lineWidth = 3;
        context.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * GeometryCalculator.TWO_PI) / sides - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.closePath();
        context.stroke();
    }
    
    function drawSpiral(context, size, color1, color2) {
        const turns = 3;
        const steps = 60;
        const gradient = context.createLinearGradient(-size, -size, size, size);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        context.strokeStyle = gradient;
        context.lineWidth = 2;
        context.beginPath();
        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * turns * GeometryCalculator.TWO_PI;
            const radius = (i / steps) * size;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.stroke();
    }
    
    function drawMandala(context, size, color1, color2) {
        const layers = 3;
        for (let layer = 0; layer < layers; layer++) {
            const layerSize = size * (1 - layer * 0.25);
            const petals = 8 + layer * 4;
            context.strokeStyle = layer % 2 === 0 ? color1 : color2;
            context.lineWidth = 2;
            for (let i = 0; i < petals; i++) {
                const angle = (i * GeometryCalculator.TWO_PI) / petals;
                context.save();
                context.rotate(angle);
                context.beginPath();
                context.ellipse(layerSize * 0.5, 0, layerSize * 0.3, layerSize * 0.15, 0, 0, GeometryCalculator.TWO_PI);
                context.stroke();
                context.restore();
            }
        }
    }
    
    function drawFlower(context, petals, size, color) {
        context.fillStyle = color;
        for (let i = 0; i < petals; i++) {
            const angle = (i * GeometryCalculator.TWO_PI) / petals;
            context.save();
            context.rotate(angle);
            context.beginPath();
            context.ellipse(size * 0.4, 0, size * 0.3, size * 0.15, 0, 0, GeometryCalculator.TWO_PI);
            context.fill();
            context.restore();
        }
        context.fillStyle = color;
        context.beginPath();
        context.arc(0, 0, size * 0.2, 0, GeometryCalculator.TWO_PI);
        context.fill();
    }
    
    function drawCrystal(context, size, color1, color2) {
        const sides = 6;
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        context.fillStyle = gradient;
        context.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * GeometryCalculator.TWO_PI) / sides;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
        
        context.strokeStyle = color1;
        context.lineWidth = 2;
        for (let i = 0; i < sides; i++) {
            const angle = (i * GeometryCalculator.TWO_PI) / sides;
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
            context.stroke();
        }
    }
    
    function drawContent() {
        patterns.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            
            const pulseSize = p.size * (1 + Math.sin(p.pulsePhase) * 0.2);
            ctx.globalAlpha = p.alpha;
            
            switch(p.type) {
                case 0:
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(0, 0, pulseSize, 0, GeometryCalculator.TWO_PI);
                    ctx.stroke();
                    break;
                case 1:
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(-pulseSize/2, -pulseSize/2, pulseSize, pulseSize);
                    break;
                case 2:
                    drawStar(ctx, 5, pulseSize, pulseSize * 0.5, p.color);
                    break;
                case 3:
                    drawPolygon(ctx, 6, pulseSize, p.color);
                    break;
                case 4:
                    drawSpiral(ctx, pulseSize, p.color, p.color2);
                    break;
                case 5:
                    drawMandala(ctx, pulseSize, p.color, p.color2);
                    break;
                case 6:
                    drawFlower(ctx, 8, pulseSize, p.color);
                    break;
                case 7:
                    drawCrystal(ctx, pulseSize, p.color, p.color2);
                    break;
            }
            ctx.restore();
        });
        
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, GeometryCalculator.TWO_PI);
            ctx.fill();
            ctx.restore();
        });
    }
    
    function setSymmetry(segments) { currentSymmetry = GeometryCalculator.clamp(segments, 2, 32); return this; }
    function getSymmetry() { return currentSymmetry; }
    function getRotation() { return rotation; }
    function cycleColorPalette() {
        currentPaletteIndex = (currentPaletteIndex + 1) % colorPalettes.length;
        currentPalette = colorPalettes[currentPaletteIndex];
        initializePatterns();
        initializeParticles();
        return this;
    }
    
    return { init, update, render, setSymmetry, getSymmetry, getRotation, cycleColorPalette };
})();

(function() {
    'use strict';
    const app = { currentSymmetry: 8, currentSpeed: 1, symmetryModes: [4, 8, 16], symmetryIndex: 1 };
    const elements = {};
    
    function init() {
        cacheElements();
        AnimationEngine.init();
        ScrollController.init();
        Kaleidoscope.init(elements.kaleidoscopeCanvas);
        
        AnimationEngine.onUpdate(updateApp);
        AnimationEngine.onRender(() => Kaleidoscope.render());
        
        setupEventListeners();
        setupScrollAnimations();
        hideLoadingScreen();
    }
    
    function cacheElements() {
        elements.loadingScreen = document.getElementById('loading-screen');
        elements.kaleidoscopeCanvas = document.getElementById('kaleidoscope-canvas');
        elements.symmetryBtn = document.getElementById('symmetry-btn');
        elements.colorBtn = document.getElementById('color-btn');
        elements.speedBtn = document.getElementById('speed-btn');
        elements.symmetryValue = document.getElementById('symmetry-value');
        elements.rotationValue = document.getElementById('rotation-value');
        elements.scrollValue = document.getElementById('scroll-value');
        elements.scrollSections = document.querySelectorAll('[data-scroll-section]');
    }
    
    function setupEventListeners() {
        if (elements.symmetryBtn) elements.symmetryBtn.addEventListener('click', () => {
            app.symmetryIndex = (app.symmetryIndex + 1) % app.symmetryModes.length;
            app.currentSymmetry = app.symmetryModes[app.symmetryIndex];
            Kaleidoscope.setSymmetry(app.currentSymmetry);
        });
        
        if (elements.colorBtn) elements.colorBtn.addEventListener('click', () => Kaleidoscope.cycleColorPalette());
        
        if (elements.speedBtn) elements.speedBtn.addEventListener('click', () => {
            app.currentSpeed = app.currentSpeed === 1 ? 2 : app.currentSpeed === 2 ? 0.5 : 1;
        });
        
        document.querySelectorAll('.symmetry-card').forEach(card => {
            card.addEventListener('click', () => {
                const symmetry = parseInt(card.dataset.symmetry);
                if (symmetry) { Kaleidoscope.setSymmetry(symmetry); app.currentSymmetry = symmetry; }
            });
        });
    }
    
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        
        elements.scrollSections.forEach(section => observer.observe(section));
    }
    
    function hideLoadingScreen() {
        setTimeout(() => {
            if (elements.loadingScreen) {
                elements.loadingScreen.classList.add('hidden');
                document.body.classList.remove('loading');
            }
        }, 1000);
    }
    
    function updateApp() {
        const scrollData = ScrollController.getScrollData();
        Kaleidoscope.update(scrollData.smoothProgress * app.currentSpeed, scrollData.velocity);
        
        if (elements.symmetryValue) elements.symmetryValue.textContent = app.currentSymmetry;
        if (elements.rotationValue) {
            const degrees = Math.round((Kaleidoscope.getRotation() * GeometryCalculator.RAD_TO_DEG) % 360);
            elements.rotationValue.textContent = `${degrees}°`;
        }
        if (elements.scrollValue) {
            elements.scrollValue.textContent = `${Math.round(scrollData.progress * 100)}%`;
        }
    }
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
