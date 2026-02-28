// Invisible Navigation Challenge

const gameState = {
    foundZones: [],
    totalZones: 7,
    attempts: 0,
    startTime: null,
    elapsedTime: 0,
    timerInterval: null,
    hintsUsed: 0,
    soundEnabled: true,
    zones: [
        { id: 'nav-home', revealed: false, position: 'top-left', hint: 'Look for a subtle glow in the top left corner' },
        { id: 'nav-settings', revealed: false, position: 'top-right', hint: 'Check the top right for a faint shadow' },
        { id: 'nav-back', revealed: false, position: 'bottom-left', hint: 'Bottom left area has a slight vibration' },
        { id: 'nav-next', revealed: false, position: 'bottom-right', hint: 'Bottom right corner emits soft sound' },
        { id: 'nav-action', revealed: false, position: 'center', hint: 'Center area responds to cursor proximity' },
        { id: 'nav-menu', revealed: false, position: 'left-edge', hint: 'Left edge shows temperature change' },
        { id: 'nav-info', revealed: false, position: 'right-edge', hint: 'Right edge has magnetic pull effect' }
    ],
    visualCueTexts: [
        "Watch for shadow changes",
        "Listen for audio feedback",
        "Feel the cursor resistance",
        "Look for color shifts",
        "Notice movement patterns",
        "Observe light variations",
        "Sense temperature changes"
    ]
};

// DOM Elements
let foundCountEl, attemptsCountEl, timeCountEl, hintsCountEl;
let currentMessageEl, discoveryProgressEl, visualCueEl, cueTextEl;
let hintBtn, soundBtn, resetBtn, playAgainBtn;
let completionScreen, finalTimeEl, finalAccuracyEl, finalScoreEl, completionMessageEl;

// Initialize game
function initGame() {
    // Get DOM elements
    foundCountEl = document.getElementById('found-count');
    attemptsCountEl = document.getElementById('attempts-count');
    timeCountEl = document.getElementById('time-count');
    hintsCountEl = document.getElementById('hints-count');
    
    currentMessageEl = document.getElementById('current-message');
    discoveryProgressEl = document.getElementById('discovery-progress');
    visualCueEl = document.getElementById('visual-cue');
    cueTextEl = visualCueEl.querySelector('.cue-text');
    
    hintBtn = document.getElementById('btn-hint');
    soundBtn = document.getElementById('btn-sound');
    resetBtn = document.getElementById('btn-reset');
    playAgainBtn = document.getElementById('btn-play-again');
    
    completionScreen = document.getElementById('completion-screen');
    finalTimeEl = document.getElementById('final-time');
    finalAccuracyEl = document.getElementById('final-accuracy');
    finalScoreEl = document.getElementById('final-score');
    completionMessageEl = document.getElementById('completion-message');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize zones
    initZones();
    
    // Start game
    startGame();
    
    // Initialize audio
    initAudio();
    
    // Update display
    updateStats();
    rotateVisualCue();
}

// Set up event listeners
function setupEventListeners() {
    // Navigation zones
    gameState.zones.forEach(zone => {
        const zoneEl = document.getElementById(zone.id);
        if (zoneEl) {
            zoneEl.addEventListener('mouseenter', () => handleZoneHover(zone.id));
            zoneEl.addEventListener('mouseleave', () => handleZoneLeave(zone.id));
            zoneEl.addEventListener('click', () => handleZoneClick(zone.id));
        }
    });
    
    // Control buttons
    hintBtn.addEventListener('click', requestHint);
    soundBtn.addEventListener('click', toggleSound);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    // Mouse movement for edge detection
    document.addEventListener('mousemove', handleMouseMove);
    
    // Random zone hints
    setInterval(() => {
        if (gameState.foundZones.length < gameState.totalZones) {
            giveRandomHint();
        }
    }, 15000);
}

// Initialize zones
function initZones() {
    gameState.zones.forEach(zone => {
        const zoneEl = document.getElementById(zone.id);
        if (zoneEl) {
            // Set initial opacity based on zone type
            let baseOpacity = 0;
            
            switch(zone.position) {
                case 'center':
                    baseOpacity = 0.05;
                    break;
                case 'top-left':
                case 'top-right':
                case 'bottom-left':
                case 'bottom-right':
                    baseOpacity = 0.03;
                    break;
                case 'left-edge':
                case 'right-edge':
                    baseOpacity = 0.02;
                    break;
            }
            
            zoneEl.style.opacity = baseOpacity;
            
            // Add subtle animations
            if (Math.random() > 0.5) {
                zoneEl.style.animation = `float ${10 + Math.random() * 10}s infinite ease-in-out`;
            }
        }
    });
}

// Start game timer
function startGame() {
    gameState.startTime = Date.now();
    
    gameState.timerInterval = setInterval(() => {
        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        updateStats();
    }, 1000);
}

// Initialize audio
function initAudio() {
    // Create simple audio tones using Web Audio API
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    
    // Note: Actual audio implementation would require proper audio files
    // For this demo, we'll use placeholder audio elements
}

// Handle zone hover
function handleZoneHover(zoneId) {
    const zone = gameState.zones.find(z => z.id === zoneId);
    const zoneEl = document.getElementById(zoneId);
    
    if (!zone.revealed) {
        // Increase opacity on hover
        zoneEl.style.opacity = '0.2';
        zoneEl.classList.add('active');
        
        // Play hover sound if enabled
        if (gameState.soundEnabled) {
            playSound('hover');
        }
        
        // Update visual cue
        showVisualCue('hint', `Something here feels different...`);
        
        // Random chance to give a stronger hint
        if (Math.random() > 0.7) {
            zoneEl.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.1)';
            setTimeout(() => {
                zoneEl.style.boxShadow = '';
            }, 1000);
        }
    }
}

// Handle zone leave
function handleZoneLeave(zoneId) {
    const zone = gameState.zones.find(z => z.id === zoneId);
    const zoneEl = document.getElementById(zoneId);
    
    if (!zone.revealed) {
        // Restore original opacity
        let baseOpacity = 0;
        
        switch(zone.position) {
            case 'center': baseOpacity = 0.05; break;
            case 'top-left':
            case 'top-right':
            case 'bottom-left':
            case 'bottom-right':
                baseOpacity = 0.03; break;
            default: baseOpacity = 0.02;
        }
        
        zoneEl.style.opacity = baseOpacity;
        zoneEl.classList.remove('active');
    }
}

// Handle zone click
function handleZoneClick(zoneId) {
    gameState.attempts++;
    
    const zone = gameState.zones.find(z => z.id === zoneId);
    const zoneEl = document.getElementById(zoneId);
    
    if (!zone.revealed) {
        // Zone discovered!
        zone.revealed = true;
        gameState.foundZones.push(zoneId);
        
        // Reveal the button
        zoneEl.classList.add('revealed');
        zoneEl.style.opacity = '0.8';
        
        // Play success sound
        if (gameState.soundEnabled) {
            playSound('success');
        }
        
        // Show success message
        showVisualCue('success', `Discovered: ${zone.id.replace('nav-', '').toUpperCase()}!`);
        updateMessage(`Found the ${zone.id.replace('nav-', '')} navigation! ${gameState.totalZones - gameState.foundZones.length} remaining.`);
        
        // Check for completion
        if (gameState.foundZones.length === gameState.totalZones) {
            completeGame();
        }
    } else {
        // Already discovered zone
        if (gameState.soundEnabled) {
            playSound('error');
        }
        
        showVisualCue('error', 'Already discovered this area');
        updateMessage(`You've already found the ${zone.id.replace('nav-', '')} navigation.`);
    }
    
    updateStats();
}

// Handle mouse movement for edge detection
function handleMouseMove(event) {
    const x = event.clientX;
    const y = event.clientY;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Detect edges and give subtle feedback
    if (x < 50) { // Left edge
        const leftEdgeZone = document.getElementById('nav-menu');
        if (leftEdgeZone && !leftEdgeZone.classList.contains('revealed')) {
            leftEdgeZone.style.opacity = '0.1';
            
            // Occasionally add a visual effect
            if (Math.random() > 0.9) {
                leftEdgeZone.style.boxShadow = 'inset 10px 0 20px rgba(255, 255, 255, 0.05)';
                setTimeout(() => {
                    leftEdgeZone.style.boxShadow = '';
                }, 500);
            }
        }
    }
    
    if (x > width - 50) { // Right edge
        const rightEdgeZone = document.getElementById('nav-info');
        if (rightEdgeZone && !rightEdgeZone.classList.contains('revealed')) {
            rightEdgeZone.style.opacity = '0.1';
            
            if (Math.random() > 0.9) {
                rightEdgeZone.style.boxShadow = 'inset -10px 0 20px rgba(255, 255, 255, 0.05)';
                setTimeout(() => {
                    rightEdgeZone.style.boxShadow = '';
                }, 500);
            }
        }
    }
}

// Request a hint
function requestHint() {
    if (gameState.hintsUsed >= 5) {
        updateMessage("You've used all available hints!");
        return;
    }
    
    gameState.hintsUsed++;
    
    // Find an undiscovered zone
    const undiscoveredZones = gameState.zones.filter(z => !z.revealed);
    
    if (undiscoveredZones.length > 0) {
        const randomZone = undiscoveredZones[Math.floor(Math.random() * undiscoveredZones.length)];
        
        // Highlight the zone
        const zoneEl = document.getElementById(randomZone.id);
        zoneEl.style.animation = 'pulse 1s infinite';
        
        // Show hint text
        updateMessage(`Hint: ${randomZone.hint}`);
        showVisualCue('hint', `Hint: ${randomZone.position.replace('-', ' ')} area`);
        
        // Stop highlighting after 3 seconds
        setTimeout(() => {
            zoneEl.style.animation = '';
        }, 3000);
        
        // Play hint sound
        if (gameState.soundEnabled) {
            playSound('click-medium');
        }
    }
    
    updateStats();
}

// Toggle sound
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundBtn.innerHTML = `<i class="fas fa-volume-${gameState.soundEnabled ? 'up' : 'mute'}"></i>
                         <span>Sound: ${gameState.soundEnabled ? 'ON' : 'OFF'}</span>`;
    
    // Play toggle sound
    playSound('click-low');
    
    updateMessage(`Sound ${gameState.soundEnabled ? 'enabled' : 'disabled'}`);
}

// Play sound
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    try {
        const audioEl = document.getElementById(`sound-${type}`);
        if (audioEl) {
            audioEl.currentTime = 0;
            audioEl.play().catch(e => console.log("Audio play failed:", e));
        }
    } catch (e) {
        console.log("Sound error:", e);
    }
}

// Give random hint
function giveRandomHint() {
    if (gameState.foundZones.length === gameState.totalZones) return;
    
    const hintTypes = [
        () => {
            // Visual cue hint
            const randomCue = gameState.visualCueTexts[Math.floor(Math.random() * gameState.visualCueTexts.length)];
            cueTextEl.textContent = randomCue;
            visualCueEl.classList.add('hint');
            setTimeout(() => visualCueEl.classList.remove('hint'), 2000);
        },
        () => {
            // Message hint
            const hints = [
                "Check the screen corners carefully",
                "Move your cursor slowly along the edges",
                "Some areas respond to prolonged hovering",
                "Listen for subtle audio changes",
                "Watch for shadow variations"
            ];
            updateMessage(hints[Math.floor(Math.random() * hints.length)]);
        },
        () => {
            // Zone pulse hint
            const undiscoveredZones = gameState.zones.filter(z => !z.revealed);
            if (undiscoveredZones.length > 0) {
                const zone = undiscoveredZones[Math.floor(Math.random() * undiscoveredZones.length)];
                const zoneEl = document.getElementById(zone.id);
                zoneEl.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.2)';
                setTimeout(() => {
                    zoneEl.style.boxShadow = '';
                }, 1000);
            }
        }
    ];
    
    hintTypes[Math.floor(Math.random() * hintTypes.length)]();
}

// Show visual cue
function showVisualCue(type, text) {
    visualCueEl.className = 'visual-cue';
    visualCueEl.classList.add(type);
    cueTextEl.textContent = text;
    
    // Auto-clear after 3 seconds
    setTimeout(() => {
        if (visualCueEl.classList.contains(type)) {
            visualCueEl.classList.remove(type);
            rotateVisualCue();
        }
    }, 3000);
}

// Rotate visual cue text
function rotateVisualCue() {
    let cueIndex = 0;
    
    setInterval(() => {
        if (!visualCueEl.classList.contains('hint') && 
            !visualCueEl.classList.contains('success') && 
            !visualCueEl.classList.contains('error')) {
            
            cueTextEl.textContent = gameState.visualCueTexts[cueIndex];
            cueIndex = (cueIndex + 1) % gameState.visualCueTexts.length;
        }
    }, 4000);
}

// Update message
function updateMessage(text) {
    currentMessageEl.textContent = text;
}

// Update stats display
function updateStats() {
    foundCountEl.textContent = gameState.foundZones.length;
    attemptsCountEl.textContent = gameState.attempts;
    timeCountEl.textContent = gameState.elapsedTime;
    hintsCountEl.textContent = gameState.hintsUsed;
    
    // Update progress bar
    const progress = (gameState.foundZones.length / gameState.totalZones) * 100;
    discoveryProgressEl.style.setProperty('--progress', `${progress}%`);
    discoveryProgressEl.querySelector('::after').style.width = `${progress}%`;
}

// Complete the game
function completeGame() {
    clearInterval(gameState.timerInterval);
    
    // Calculate stats
    const accuracy = gameState.attempts > 0 ? 
        Math.round((gameState.foundZones.length / gameState.attempts) * 100) : 100;
    
    const timePenalty = Math.max(0, gameState.elapsedTime - 60);
    const hintPenalty = gameState.hintsUsed * 20;
    const accuracyBonus = accuracy > 50 ? (accuracy - 50) * 2 : 0;
    
    const score = Math.max(0, 
        1000 - 
        timePenalty * 2 - 
        hintPenalty + 
        accuracyBonus
    );
    
    // Update completion screen
    finalTimeEl.textContent = `${gameState.elapsedTime}s`;
    finalAccuracyEl.textContent = `${accuracy}%`;
    finalScoreEl.textContent = Math.round(score);
    
    // Set completion message
    let message = "";
    if (score > 800) {
        message = "Master Navigator! You found all zones with exceptional intuition.";
    } else if (score > 600) {
        message = "Skilled Explorer! Your perception skills are impressive.";
    } else if (score > 400) {
        message = "Good Discovery! You found all hidden navigation points.";
    } else {
        message = "Challenge Complete! All zones discovered.";
    }
    
    completionMessageEl.textContent = message;
    
    // Show completion screen
    completionScreen.style.display = 'flex';
    
    // Play completion sound
    if (gameState.soundEnabled) {
        playSound('success');
    }
}

// Reset game
function resetGame() {
    // Reset game state
    gameState.foundZones = [];
    gameState.attempts = 0;
    gameState.elapsedTime = 0;
    gameState.hintsUsed = 0;
    
    gameState.zones.forEach(zone => {
        zone.revealed = false;
        
        // Reset zone elements
        const zoneEl = document.getElementById(zone.id);
        if (zoneEl) {
            zoneEl.classList.remove('revealed', 'active');
            
            let baseOpacity = 0;
            switch(zone.position) {
                case 'center': baseOpacity = 0.05; break;
                case 'top-left':
                case 'top-right':
                case 'bottom-left':
                case 'bottom-right':
                    baseOpacity = 0.03; break;
                default: baseOpacity = 0.02;
            }
            
            zoneEl.style.opacity = baseOpacity;
            zoneEl.style.animation = '';
            zoneEl.style.boxShadow = '';
        }
    });
    
    // Hide completion screen
    completionScreen.style.display = 'none';
    
    // Clear timer
    clearInterval(gameState.timerInterval);
    
    // Restart game
    startGame();
    
    // Reset messages
    updateMessage("Explore the edges and corners. Look for subtle shadows, listen for sounds, and watch for movement.");
    showVisualCue('hint', 'Challenge reset. Find all 7 hidden navigation points.');
    
    // Update stats
    updateStats();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Set the progress bar width using JavaScript (since CSS custom property didn't work)
function updateProgressBar() {
    const progress = (gameState.foundZones.length / gameState.totalZones) * 100;
    discoveryProgressEl.style.width = `${progress}%`;
}

// Override updateStats to include progress bar update
const originalUpdateStats = updateStats;
updateStats = function() {
    originalUpdateStats();
    updateProgressBar();
};