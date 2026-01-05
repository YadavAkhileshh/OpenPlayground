// Game state
const gameState = {
    currentScreen: 'IDLE',
    stats: {
        score: 0,
        misses: 0,
        clicks: 0,
        level: 1
    },
    buttons: [],
    animationId: null,
    mousePosition: { x: -1000, y: -1000 }
};

// DOM Elements
const elements = {
    idleScreen: document.getElementById('idle-screen'),
    playingScreen: document.getElementById('playing-screen'),
    resultsScreen: document.getElementById('results-screen'),
    startButton: document.getElementById('start-game'),
    endButton: document.getElementById('end-game'),
    restartButton: document.getElementById('restart-game'),
    backToMenu: document.getElementById('back-to-menu'),
    buttonArena: document.getElementById('button-arena'),
    buttonsContainer: document.getElementById('buttons-container'),
    mouseGlow: document.getElementById('mouse-glow'),
    tauntPopup: document.getElementById('taunt-popup'),
    tauntText: document.getElementById('taunt-text'),
    levelIndicator: document.getElementById('level-indicator')
};

// Game constants
const BUTTON_COUNT = 5;
const BASE_DANGER_RADIUS = 150;
const FRICTION = 0.98;
const CENTER_GRAVITY = 0.03;

// Initialize game
function init() {
    // Set up event listeners
    elements.startButton.addEventListener('click', startGame);
    elements.endButton.addEventListener('click', endGame);
    elements.restartButton.addEventListener('click', restartGame);
    elements.backToMenu.addEventListener('click', goToMainMenu);
    
    // Set up button arena events
    elements.buttonArena.addEventListener('mousemove', handleMouseMove);
    elements.buttonArena.addEventListener('click', handleArenaClick);
    
    // Initialize buttons
    initializeButtons();
    
    // Start animation loop
    animate();
}

function initializeButtons() {
    const labels = ['Catch!', 'Missed!', 'Too Slow', 'Hehe', 'Closer!'];
    gameState.buttons = [];
    
    for (let i = 0; i < BUTTON_COUNT; i++) {
        const button = {
            id: `btn-${i}`,
            x: Math.random() * (window.innerWidth - 200) + 100,
            y: Math.random() * (window.innerHeight - 200) + 100,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            element: null,
            label: labels[i % labels.length]
        };
        
        // Create button element
        const btnEl = document.createElement('button');
        btnEl.className = 'game-button';
        btnEl.textContent = button.label;
        btnEl.style.transform = `translate3d(${button.x}px, ${button.y}px, 0)`;
        btnEl.addEventListener('click', (e) => handleButtonClick(button, e));
        
        elements.buttonsContainer.appendChild(btnEl);
        button.element = btnEl;
        gameState.buttons.push(button);
    }
}

function handleMouseMove(e) {
    gameState.mousePosition = { x: e.clientX, y: e.clientY };
    
    // Update mouse glow position
    elements.mouseGlow.style.left = `${e.clientX - 400}px`;
    elements.mouseGlow.style.top = `${e.clientY - 400}px`;
}

function handleArenaClick(e) {
    if (e.target === elements.buttonArena) {
        updateStats({
            score: Math.max(0, gameState.stats.score - (10 + gameState.stats.level * 2)),
            misses: gameState.stats.misses + 1
        });
        showTaunt(false);
    }
}

function handleButtonClick(button, e) {
    e.stopPropagation();
    
    updateStats({
        score: gameState.stats.score + (25 * gameState.stats.level),
        clicks: gameState.stats.clicks + 1,
        level: Math.min(10, Math.floor(gameState.stats.clicks / 4) + 1)
    });
    
    // Add repulsion effect
    button.vx = (Math.random() - 0.5) * 120;
    button.vy = (Math.random() - 0.5) * 120;
    
    showTaunt(true);
}

function updateStats(updates) {
    // Update game state
    Object.assign(gameState.stats, updates);
    
    // Update UI
    document.getElementById('score-value').textContent = gameState.stats.score.toString().padStart(4, '0');
    document.getElementById('clicks-value').textContent = gameState.stats.clicks;
    document.getElementById('misses-value').textContent = gameState.stats.misses;
    
    const levelEl = document.getElementById('level-value');
    levelEl.textContent = gameState.stats.level;
    levelEl.className = gameState.stats.level === 10 ? 'stat-value-large pulse' : 'stat-value-large';
    
    // Update level indicator
    elements.levelIndicator.textContent = gameState.stats.level === 10 ? 'MAX' : `L${gameState.stats.level}`;
    elements.levelIndicator.className = gameState.stats.level === 10 ? 'level-indicator pulse' : 'level-indicator';
}

function showTaunt(isGood) {
    const taunts = {
        good: [
            "Fast as fire!",
            "Ignited!",
            "Crimson speed!",
            "Too fast to catch!",
            "Velocity achieved!",
            "Red-hot reflexes!",
            "Direct drive engaged!",
            "Maximum burn!",
            "Scorching catch!",
            "Protocol success!"
        ],
        bad: [
            "Too slow!",
            "Velocity too low!",
            "React faster!",
            "Missed the ignition!",
            "Need more speed!",
            "Reflex failure!",
            "System lag detected!",
            "Protocol breach!",
            "Cold hands?",
            "Boost your tempo!"
        ]
    };
    
    const tauntList = isGood ? taunts.good : taunts.bad;
    const taunt = taunts[isGood ? 'good' : 'bad'][Math.floor(Math.random() * taunts[isGood ? 'good' : 'bad'].length)];
    
    elements.tauntText.textContent = taunt;
    elements.tauntPopup.classList.add('visible');
    
    setTimeout(() => {
        elements.tauntPopup.classList.remove('visible');
    }, 1800);
}

function animate() {
    if (gameState.currentScreen === 'PLAYING') {
        const level = gameState.stats.level;
        
        // Scaling factors based on level
        const speedMult = 0.3 + (level * 0.35);
        const dangerRadius = BASE_DANGER_RADIUS + (level * 25);
        const fleePower = 0.2 + (level * 0.12);
        const dodgeFactor = level >= 5 ? (level - 4) * 0.15 : 0;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        gameState.buttons.forEach(btn => {
            if (!btn.element) return;
            
            // Calculate distances
            const dx = btn.x + 50 - gameState.mousePosition.x;
            const dy = btn.y + 25 - gameState.mousePosition.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Flee logic
            if (dist < dangerRadius) {
                const normalizedDist = (dangerRadius - dist) / dangerRadius;
                const force = Math.pow(normalizedDist, 2) * fleePower * speedMult;
                const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * dodgeFactor;
                
                btn.vx += Math.cos(angle) * force * 12;
                btn.vy += Math.sin(angle) * force * 12;
            }
            
            // Ambient movement & center pull
            btn.vx += (centerX - btn.x) * CENTER_GRAVITY * 0.01;
            btn.vy += (centerY - btn.y) * CENTER_GRAVITY * 0.01;
            
            // Jitter scales with level
            btn.vx += (Math.random() - 0.5) * level * 0.3;
            btn.vy += (Math.random() - 0.5) * level * 0.3;
            
            // Apply friction
            btn.vx *= FRICTION;
            btn.vy *= FRICTION;
            
            // Update positions
            btn.x += btn.vx;
            btn.y += btn.vy;
            
            // Elastic boundaries
            const margin = 60;
            const right = window.innerWidth - 180;
            const bottom = window.innerHeight - 100;
            const top = 160;
            const bounceMult = 1.1 + (level * 0.05);
            
            if (btn.x < margin) { btn.vx = Math.abs(btn.vx) * bounceMult + 2; btn.x = margin; }
            if (btn.x > right) { btn.vx = -Math.abs(btn.vx) * bounceMult - 2; btn.x = right; }
            if (btn.y < top) { btn.vy = Math.abs(btn.vy) * bounceMult + 2; btn.y = top; }
            if (btn.y > bottom) { btn.vy = -Math.abs(btn.vy) * bounceMult - 2; btn.y = bottom; }
            
            // Speed cap
            const maxV = 10 + (level * 6);
            const currV = Math.sqrt(btn.vx * btn.vx + btn.vy * btn.vy);
            if (currV > maxV) {
                btn.vx = (btn.vx / currV) * maxV;
                btn.vy = (btn.vy / currV) * maxV;
            }
            
            // Update DOM
            btn.element.style.transform = `translate3d(${btn.x}px, ${btn.y}px, 0)`;
        });
    }
    
    gameState.animationId = requestAnimationFrame(animate);
}

function startGame() {
    gameState.currentScreen = 'PLAYING';
    gameState.stats = { score: 0, misses: 0, clicks: 0, level: 1 };
    
    elements.idleScreen.style.display = 'none';
    elements.playingScreen.style.display = 'flex';
    elements.resultsScreen.style.display = 'none';
    
    updateStats(gameState.stats);
    
    // Reset button positions
    gameState.buttons.forEach(btn => {
        btn.x = Math.random() * (window.innerWidth - 200) + 100;
        btn.y = Math.random() * (window.innerHeight - 200) + 100;
        btn.vx = (Math.random() - 0.5) * 5;
        btn.vy = (Math.random() - 0.5) * 5;
    });
}

function endGame() {
    gameState.currentScreen = 'RESULTS';
    
    // Update results screen
    document.getElementById('final-score').textContent = gameState.stats.score;
    document.getElementById('final-level').textContent = gameState.stats.level;
    document.getElementById('final-clicks').textContent = gameState.stats.clicks;
    document.getElementById('final-misses').textContent = gameState.stats.misses;
    
    const accuracy = gameState.stats.clicks + gameState.stats.misses > 0
        ? Math.round((gameState.stats.clicks / (gameState.stats.clicks + gameState.stats.misses)) * 100)
        : 0;
    document.getElementById('final-accuracy').textContent = `${accuracy}%`;
    
    elements.playingScreen.style.display = 'none';
    elements.resultsScreen.style.display = 'flex';
}

function restartGame() {
    startGame();
}

function goToMainMenu() {
    gameState.currentScreen = 'IDLE';
    
    elements.resultsScreen.style.display = 'none';
    elements.idleScreen.style.display = 'flex';
}

// Handle window resize
window.addEventListener('resize', () => {
    // Keep buttons in bounds
    gameState.buttons.forEach(btn => {
        if (btn.x > window.innerWidth - 180) btn.x = window.innerWidth - 180;
        if (btn.y > window.innerHeight - 100) btn.y = window.innerHeight - 100;
    });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);