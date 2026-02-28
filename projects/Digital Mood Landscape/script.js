const canvas = document.getElementById('landscape-canvas');
const ctx = canvas.getContext('2d');
const clickCountEl = document.getElementById('click-count');
const typeSpeedEl = document.getElementById('type-speed');
const idleTimeEl = document.getElementById('idle-time');
const interactionArea = document.getElementById('interaction-area');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Variables for interactions
let clickCount = 0;
let lastKeyTime = 0;
let keyCount = 0;
let wpm = 0;
let idleTime = 0;
let lastActivity = Date.now();
let ripples = [];

// Landscape elements
let skyColor = '#87CEEB';
let mountainColor = '#8B4513';
let treeColor = '#228B22';
let groundColor = '#32CD32';

// Animation variables
let time = 0;
let waveOffset = 0;

// Event listeners
canvas.addEventListener('click', (e) => {
    clickCount++;
    clickCountEl.textContent = `Clicks: ${clickCount}`;
    lastActivity = Date.now();
    idleTime = 0;
    // Add ripple
    ripples.push({
        x: e.offsetX,
        y: e.offsetY,
        radius: 0,
        maxRadius: 100,
        alpha: 1
    });
});

interactionArea.addEventListener('keydown', () => {
    const now = Date.now();
    if (now - lastKeyTime > 1000) { // Reset if more than 1s
        keyCount = 0;
    }
    keyCount++;
    lastKeyTime = now;
    // Calculate WPM (approx)
    const minutes = (now - lastKeyTime + 60000) / 60000; // at least 1 min
    wpm = Math.round(keyCount / 5 / minutes); // 5 chars per word
    typeSpeedEl.textContent = `Typing Speed: ${wpm} WPM`;
    lastActivity = now;
    idleTime = 0;
});

// Idle detection
document.addEventListener('mousemove', () => lastActivity = Date.now());
document.addEventListener('keydown', () => lastActivity = Date.now());

function updateIdle() {
    const now = Date.now();
    if (now - lastActivity > 1000) { // Idle after 1s
        idleTime = Math.floor((now - lastActivity) / 1000);
        idleTimeEl.textContent = `Idle Time: ${idleTime}s`;
    } else {
        idleTime = 0;
    }
}

// Drawing functions
function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    gradient.addColorStop(0, skyColor);
    gradient.addColorStop(1, lightenColor(skyColor, 0.5));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
}

function drawMountains() {
    ctx.fillStyle = mountainColor;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let i = 0; i <= canvas.width; i += 50) {
        const height = canvas.height / 2 + Math.sin(i * 0.01 + waveOffset) * 50 + Math.random() * 20;
        ctx.lineTo(i, height);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
}

function drawTrees() {
    ctx.fillStyle = treeColor;
    for (let i = 0; i < canvas.width; i += 100) {
        const x = i + Math.sin(time * 0.01 + i) * 10;
        const y = canvas.height * 0.6 + Math.random() * 50;
        ctx.beginPath();
        ctx.arc(x, y, 20 + Math.sin(time * 0.02) * 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround() {
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);
}

function drawRipples() {
    ripples.forEach((ripple, index) => {
        ripple.radius += 2;
        ripple.alpha -= 0.02;
        if (ripple.alpha <= 0) {
            ripples.splice(index, 1);
            return;
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Update colors based on interactions
function updateColors() {
    // Based on clicks: more clicks make brighter
    const clickFactor = Math.min(clickCount / 10, 1);
    skyColor = `hsl(200, 70%, ${50 + clickFactor * 30}%)`;
    mountainColor = `hsl(25, 70%, ${30 + clickFactor * 20}%)`;

    // Based on typing speed: faster typing makes greener
    const typeFactor = Math.min(wpm / 50, 1);
    treeColor = `hsl(120, 70%, ${30 + typeFactor * 30}%)`;
    groundColor = `hsl(90, 70%, ${40 + typeFactor * 20}%)`;

    // Based on idle: idle makes darker
    const idleFactor = Math.min(idleTime / 60, 1); // Max 60s
    const darken = idleFactor * 0.5;
    skyColor = lightenColor(skyColor, -darken);
    mountainColor = lightenColor(mountainColor, -darken);
    treeColor = lightenColor(treeColor, -darken);
    groundColor = lightenColor(groundColor, -darken);
}

function animate() {
    time++;
    waveOffset += 0.01 + clickCount * 0.001; // More clicks, more wave
    updateIdle();
    updateColors();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky();
    drawMountains();
    drawTrees();
    drawGround();
    drawRipples();

    requestAnimationFrame(animate);
}

animate();

// Dark mode toggle
const toggleDark = document.getElementById('toggle-dark');
const body = document.body;
toggleDark.addEventListener('click', () => {
    body.classList.toggle('dark');
    const icon = document.getElementById('toggle-dark-icon');
    icon.textContent = body.classList.contains('dark') ? 'light_mode' : 'dark_mode';
});