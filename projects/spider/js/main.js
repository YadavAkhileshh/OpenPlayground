/* ============================================
   THE SPIDER - MAIN APPLICATION
   Canvas setup, event handling, and render loop
   ============================================ */

// Global state
let canvas;
let ctx;
let spider;
let lastTime = 0;
let fps = 60;
let frameCount = 0;
let fpsUpdateTimer = 0;

// UI elements
let fpsCounter;
let legsActiveCounter;
let distanceCounter;
let speedSlider;
let speedValue;
let stepHeightSlider;
let stepHeightValue;
let legLengthSlider;
let legLengthValue;
let resetButton;
let toggleControlsButton;
let controlPanel;
let clickIndicator;
let loadingScreen;

/**
 * Initialize application
 */
function init() {
    // Get canvas and context
    canvas = document.getElementById('spiderCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get UI elements
    fpsCounter = document.getElementById('fpsCounter');
    legsActiveCounter = document.getElementById('legsActive');
    distanceCounter = document.getElementById('distanceValue');
    speedSlider = document.getElementById('speedSlider');
    speedValue = document.getElementById('speedValue');
    stepHeightSlider = document.getElementById('stepHeightSlider');
    stepHeightValue = document.getElementById('stepHeightValue');
    legLengthSlider = document.getElementById('legLengthSlider');
    legLengthValue = document.getElementById('legLengthValue');
    resetButton = document.getElementById('resetButton');
    toggleControlsButton = document.getElementById('toggleControls');
    controlPanel = document.querySelector('.control-panel');
    clickIndicator = document.getElementById('clickIndicator');
    loadingScreen = document.getElementById('loadingScreen');

    // Create spider at center
    spider = new Spider(canvas.width / 2, canvas.height / 2);

    // Set up event listeners
    setupEventListeners();

    // Hide loading screen
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1000);

    // Start animation loop
    requestAnimationFrame(animate);
}

/**
 * Resize canvas to fill window
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Update spider position if needed (keep centered on first load)
    if (!spider) return;

    // Keep spider within bounds
    spider.x = Math.max(50, Math.min(canvas.width - 50, spider.x));
    spider.y = Math.max(50, Math.min(canvas.height - 50, spider.y));
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Canvas click - set spider target
    canvas.addEventListener('click', handleCanvasClick);

    // Speed slider
    speedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        spider.updateSpeed(speed);
        speedValue.textContent = speed.toFixed(1) + 'x';
    });

    // Step height slider
    stepHeightSlider.addEventListener('input', (e) => {
        const height = parseInt(e.target.value);
        for (const leg of spider.legs) {
            leg.stepHeight = height;
        }
        stepHeightValue.textContent = height + 'px';
    });

    // Leg length slider
    legLengthSlider.addEventListener('input', (e) => {
        const length = parseInt(e.target.value);
        spider.updateLegParameters(length, spider.legs[0].stepHeight);
        legLengthValue.textContent = length + 'px';
    });

    // Reset button
    resetButton.addEventListener('click', () => {
        spider.x = canvas.width / 2;
        spider.y = canvas.height / 2;
        spider.rotation = 0;
        spider.targetX = spider.x;
        spider.targetY = spider.y;
        spider.isMoving = false;

        // Reset all legs
        for (const leg of spider.legs) {
            leg.updateShoulderPosition();
            leg.calculateIdealFootPosition();
            leg.currentPos = { ...leg.targetPos };
            leg.isLifted = false;
        }
    });

    // Toggle controls button
    toggleControlsButton.addEventListener('click', () => {
        controlPanel.classList.toggle('hidden');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
}

/**
 * Handle canvas click
 */
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Set spider target
    spider.setTarget(x, y);

    // Show click indicator
    showClickIndicator(e.clientX, e.clientY);
}

/**
 * Show click indicator animation
 */
function showClickIndicator(x, y) {
    clickIndicator.style.left = x + 'px';
    clickIndicator.style.top = y + 'px';
    clickIndicator.classList.remove('active');

    // Trigger reflow
    void clickIndicator.offsetWidth;

    clickIndicator.classList.add('active');

    // Remove class after animation
    setTimeout(() => {
        clickIndicator.classList.remove('active');
    }, 600);
}

/**
 * Handle keyboard input
 */
function handleKeyPress(e) {
    switch (e.key.toLowerCase()) {
        case 'r':
            resetButton.click();
            break;
        case 'c':
            toggleControlsButton.click();
            break;
        case ' ':
            e.preventDefault();
            // Random target
            const randomX = MathUtils.random(100, canvas.width - 100);
            const randomY = MathUtils.random(100, canvas.height - 100);
            spider.setTarget(randomX, randomY);
            showClickIndicator(randomX, randomY);
            break;
    }
}

/**
 * Main animation loop
 */
function animate(currentTime) {
    // Calculate delta time
    const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
    lastTime = currentTime;

    // Update
    update(deltaTime);

    // Render
    render();

    // Update FPS counter
    updateFPS(deltaTime);

    // Continue loop
    requestAnimationFrame(animate);
}

/**
 * Update game state
 */
function update(deltaTime) {
    // Clamp delta time to prevent huge jumps
    deltaTime = Math.min(deltaTime, 0.1);

    // Update spider
    spider.update(deltaTime);

    // Update UI stats
    updateStats();
}

/**
 * Render everything
 */
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    drawBackground();

    // Draw ground grid
    drawGroundGrid();

    // Render spider
    spider.render(ctx);
}

/**
 * Draw background
 */
function drawBackground() {
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
    );
    gradient.addColorStop(0, '#1a1f2e');
    gradient.addColorStop(1, '#0a0e17');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw ground grid for depth perception
 */
function drawGroundGrid() {
    const gridSize = 50;
    const lineColor = 'rgba(0, 212, 255, 0.05)';

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

/**
 * Update stats display
 */
function updateStats() {
    // Active legs count
    const activeLegCount = spider.getActiveLegCount();
    legsActiveCounter.textContent = activeLegCount;

    // Distance to target
    const distance = Math.round(spider.getDistanceToTarget());
    distanceCounter.textContent = distance + 'px';
}

/**
 * Update FPS counter
 */
function updateFPS(deltaTime) {
    frameCount++;
    fpsUpdateTimer += deltaTime;

    // Update FPS display every 0.5 seconds
    if (fpsUpdateTimer >= 0.5) {
        fps = Math.round(frameCount / fpsUpdateTimer);
        fpsCounter.textContent = fps;

        frameCount = 0;
        fpsUpdateTimer = 0;
    }
}

/**
 * Utility: Draw debug text
 */
function drawDebugText(text, x, y) {
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00d4ff';
    ctx.fillText(text, x, y);
}

/**
 * Utility: Draw debug point
 */
function drawDebugPoint(x, y, color = '#ff0000', radius = 5) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Utility: Draw debug line
 */
function drawDebugLine(x1, y1, x2, y2, color = '#ff0000', width = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

/**
 * Utility: Draw debug circle
 */
function drawDebugCircle(x, y, radius, color = '#ff0000', width = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
}

/**
 * Advanced: Auto-wander mode
 */
function enableAutoWander() {
    setInterval(() => {
        if (!spider.isMoving) {
            const randomX = MathUtils.random(100, canvas.width - 100);
            const randomY = MathUtils.random(100, canvas.height - 100);
            spider.setTarget(randomX, randomY);
        }
    }, 3000);
}

/**
 * Advanced: Follow mouse mode
 */
let followMouseEnabled = false;

function toggleFollowMouse() {
    followMouseEnabled = !followMouseEnabled;

    if (followMouseEnabled) {
        canvas.addEventListener('mousemove', handleMouseMove);
    } else {
        canvas.removeEventListener('mousemove', handleMouseMove);
    }
}

function handleMouseMove(e) {
    if (!followMouseEnabled) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only update target if mouse is far enough from spider
    const dx = x - spider.x;
    const dy = y - spider.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 100) {
        spider.setTarget(x, y);
    }
}

/**
 * Performance monitoring
 */
class PerformanceMonitor {
    constructor() {
        this.frameTimes = [];
        this.maxSamples = 60;
    }

    recordFrame(deltaTime) {
        this.frameTimes.push(deltaTime);
        if (this.frameTimes.length > this.maxSamples) {
            this.frameTimes.shift();
        }
    }

    getAverageFrameTime() {
        if (this.frameTimes.length === 0) return 0;
        const sum = this.frameTimes.reduce((a, b) => a + b, 0);
        return sum / this.frameTimes.length;
    }

    getAverageFPS() {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime > 0 ? 1 / avgFrameTime : 0;
    }
}

const perfMonitor = new PerformanceMonitor();

/**
 * Screenshot functionality
 */
function takeScreenshot() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'spider-screenshot.png';
    link.href = dataURL;
    link.click();
}

/**
 * Export spider state as JSON
 */
function exportSpiderState() {
    const state = {
        position: { x: spider.x, y: spider.y },
        rotation: spider.rotation,
        isMoving: spider.isMoving,
        target: { x: spider.targetX, y: spider.targetY },
        legs: spider.legs.map(leg => ({
            index: leg.index,
            currentPos: leg.currentPos,
            targetPos: leg.targetPos,
            isLifted: leg.isLifted
        }))
    };

    console.log('Spider State:', JSON.stringify(state, null, 2));
    return state;
}

/**
 * Add keyboard shortcut hints
 */
function showKeyboardShortcuts() {
    console.log(`
    Keyboard Shortcuts:
    - R: Reset spider position
    - C: Toggle control panel
    - Space: Random target
    - Click: Set target position
    `);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Show keyboard shortcuts in console
showKeyboardShortcuts();

// Optional: Enable auto-wander after 10 seconds of inactivity
// Uncomment to enable:
// setTimeout(() => {
//     console.log('Auto-wander mode enabled');
//     enableAutoWander();
// }, 10000);
