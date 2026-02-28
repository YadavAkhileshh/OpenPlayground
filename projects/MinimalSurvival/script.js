// Game state
const gameState = {
    stability: 100,
    resources: 100,
    integrity: 100,
    timeSurvived: 0,
    threats: [],
    difficulty: 1, // 1: low, 2: medium, 3: high
    gameActive: true,
    gameTimer: null,
    threatTimer: null,
    decayTimer: null
};

// Threat types
const threatTypes = [
    { name: "UI Corruption", icon: "fas fa-bug", damage: { stability: 5, resources: 2, integrity: 3 } },
    { name: "Memory Leak", icon: "fas fa-memory", damage: { stability: 2, resources: 8, integrity: 1 } },
    { name: "Render Glitch", icon: "fas fa-film", damage: { stability: 8, resources: 3, integrity: 2 } },
    { name: "Input Lag", icon: "fas fa-clock", damage: { stability: 3, resources: 5, integrity: 4 } },
    { name: "Visual Tearing", icon: "fas fa-tear", damage: { stability: 6, resources: 2, integrity: 5 } }
];

// Initialize the game
function initGame() {
    // Set up event listeners
    document.getElementById('btn-repair').addEventListener('click', () => handleControlClick('repair'));
    document.getElementById('btn-stabilize').addEventListener('click', () => handleControlClick('stabilize'));
    document.getElementById('btn-optimize').addEventListener('click', () => handleControlClick('optimize'));
    document.getElementById('btn-reboot').addEventListener('click', () => handleControlClick('reboot'));
    document.getElementById('btn-reset').addEventListener('click', resetGame);
    document.getElementById('btn-restart').addEventListener('click', resetGame);
    
    // Difficulty buttons
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = parseInt(btn.dataset.level);
            addLogEntry(`UI stress level set to ${btn.textContent}`);
        });
    });
    
    // Start game timers
    startGameTimers();
    
    // Initial log entry
    addLogEntry("Interface initialized. Survival challenge engaged.");
}

// Start game timers
function startGameTimers() {
    // Main game timer
    gameState.gameTimer = setInterval(() => {
        if (gameState.gameActive) {
            gameState.timeSurvived++;
            updateTimeDisplay();
        }
    }, 1000);
    
    // Threat generation timer
    gameState.threatTimer = setInterval(() => {
        if (gameState.gameActive) {
            generateThreat();
        }
    }, 5000 / gameState.difficulty); // More frequent threats at higher difficulty
    
    // Stat decay timer
    gameState.decayTimer = setInterval(() => {
        if (gameState.gameActive) {
            decayStats();
        }
    }, 3000);
}

// Handle control button clicks
function handleControlClick(action) {
    if (!gameState.gameActive) return;
    
    let costPaid = false;
    let message = "";
    
    switch(action) {
        case 'repair':
            if (gameState.resources >= 15) {
                gameState.resources -= 15;
                gameState.integrity = Math.min(100, gameState.integrity + 20);
                costPaid = true;
                message = "UI repaired. Integrity increased.";
                // Remove one random threat
                if (gameState.threats.length > 0) {
                    const randomIndex = Math.floor(Math.random() * gameState.threats.length);
                    removeThreat(randomIndex);
                }
            } else {
                message = "Insufficient resources for repair!";
            }
            break;
            
        case 'stabilize':
            if (gameState.integrity >= 10) {
                gameState.integrity -= 10;
                gameState.stability = Math.min(100, gameState.stability + 15);
                costPaid = true;
                message = "System stabilized. Stability increased.";
            } else {
                message = "Insufficient integrity for stabilization!";
            }
            break;
            
        case 'optimize':
            if (gameState.stability >= 20) {
                gameState.stability -= 20;
                gameState.resources = Math.min(100, gameState.resources + 25);
                costPaid = true;
                message = "System optimized. Resources increased.";
                // Speed up threat removal temporarily
                clearInterval(gameState.threatTimer);
                gameState.threatTimer = setInterval(() => {
                    if (gameState.gameActive) {
                        generateThreat();
                    }
                }, 8000 / gameState.difficulty);
                setTimeout(() => {
                    clearInterval(gameState.threatTimer);
                    gameState.threatTimer = setInterval(() => {
                        if (gameState.gameActive) {
                            generateThreat();
                        }
                    }, 5000 / gameState.difficulty);
                }, 10000);
            } else {
                message = "Insufficient stability for optimization!";
            }
            break;
            
        case 'reboot':
            if (gameState.stability >= 30 && gameState.resources >= 30 && gameState.integrity >= 30) {
                gameState.stability -= 30;
                gameState.resources -= 30;
                gameState.integrity -= 30;
                costPaid = true;
                message = "Emergency reboot initiated. All threats cleared.";
                // Clear all threats
                gameState.threats = [];
                updateThreatsDisplay();
            } else {
                message = "Insufficient stats for emergency reboot!";
            }
            break;
    }
    
    if (costPaid) {
        // Add random consequence
        const consequence = Math.random();
        if (consequence < 0.3) {
            // 30% chance of unintended consequence
            const randomStat = ['stability', 'resources', 'integrity'][Math.floor(Math.random() * 3)];
            const damage = 5 + Math.floor(Math.random() * 10);
            gameState[randomStat] = Math.max(0, gameState[randomStat] - damage);
            message += ` Unintended consequence: ${randomStat} decreased by ${damage}%.`;
        }
    }
    
    addLogEntry(message);
    updateStatsDisplay();
    checkGameOver();
}

// Generate a new threat
function generateThreat() {
    if (!gameState.gameActive || gameState.threats.length >= 5) return;
    
    const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const threat = {
        id: Date.now(),
        name: threatType.name,
        icon: threatType.icon,
        damage: threatType.damage
    };
    
    gameState.threats.push(threat);
    updateThreatsDisplay();
    
    addLogEntry(`New threat detected: ${threat.name}`);
    
    // Apply threat damage
    applyThreatDamage(threat);
}

// Apply damage from all active threats
function applyThreatDamage(threat) {
    gameState.stability = Math.max(0, gameState.stability - threat.damage.stability);
    gameState.resources = Math.max(0, gameState.resources - threat.damage.resources);
    gameState.integrity = Math.max(0, gameState.integrity - threat.damage.integrity);
    
    updateStatsDisplay();
    checkGameOver();
}

// Remove a threat by index
function removeThreat(index) {
    if (index >= 0 && index < gameState.threats.length) {
        const removedThreat = gameState.threats.splice(index, 1)[0];
        addLogEntry(`Threat neutralized: ${removedThreat.name}`);
        updateThreatsDisplay();
    }
}

// Decay stats over time
function decayStats() {
    if (!gameState.gameActive) return;
    
    // Base decay rate influenced by number of threats
    const threatMultiplier = 1 + (gameState.threats.length * 0.2);
    
    gameState.stability = Math.max(0, gameState.stability - (0.5 * threatMultiplier));
    gameState.resources = Math.max(0, gameState.resources - (0.3 * threatMultiplier));
    gameState.integrity = Math.max(0, gameState.integrity - (0.4 * threatMultiplier));
    
    updateStatsDisplay();
    checkGameOver();
}

// Update the stats display
function updateStatsDisplay() {
    // Update values
    document.getElementById('stability').querySelector('.stat-value').textContent = `${Math.round(gameState.stability)}%`;
    document.getElementById('resources').querySelector('.stat-value').textContent = `${Math.round(gameState.resources)}%`;
    document.getElementById('integrity').querySelector('.stat-value').textContent = `${Math.round(gameState.integrity)}%`;
    
    // Update bars
    document.getElementById('stability-bar').style.width = `${gameState.stability}%`;
    document.getElementById('resources-bar').style.width = `${gameState.resources}%`;
    document.getElementById('integrity-bar').style.width = `${gameState.integrity}%`;
    
    // Update bar colors based on values
    updateStatBarColor('stability', gameState.stability);
    updateStatBarColor('resources', gameState.resources);
    updateStatBarColor('integrity', gameState.integrity);
    
    // Apply visual effects for low stats
    const body = document.body;
    if (gameState.stability < 30) {
        body.classList.add('low-stability');
        document.getElementById('ui-glitch').style.opacity = (30 - gameState.stability) / 30;
    } else {
        body.classList.remove('low-stability');
        document.getElementById('ui-glitch').style.opacity = 0;
    }
    
    // Add critical class to low stats
    const stats = ['stability', 'resources', 'integrity'];
    stats.forEach(stat => {
        const element = document.getElementById(stat);
        if (gameState[stat] < 20) {
            element.classList.add('critical');
        } else {
            element.classList.remove('critical');
        }
    });
}

// Update stat bar color based on value
function updateStatBarColor(stat, value) {
    const bar = document.getElementById(`${stat}-bar`);
    if (value > 60) {
        bar.style.backgroundColor = '#4c8';
    } else if (value > 30) {
        bar.style.backgroundColor = '#cc4';
    } else {
        bar.style.backgroundColor = '#c44';
    }
}

// Update threats display
function updateThreatsDisplay() {
    const threatsList = document.getElementById('threats-list');
    const threatCount = document.getElementById('threat-count');
    
    threatsList.innerHTML = '';
    threatCount.textContent = gameState.threats.length;
    
    gameState.threats.forEach((threat, index) => {
        const threatElement = document.createElement('div');
        threatElement.className = 'threat';
        threatElement.innerHTML = `
            <i class="${threat.icon}"></i>
            <span>${threat.name}</span>
        `;
        
        // Make threats clickable to remove (with cost)
        threatElement.addEventListener('click', () => {
            if (!gameState.gameActive) return;
            
            // Cost to manually remove a threat
            if (gameState.resources >= 8) {
                gameState.resources -= 8;
                removeThreat(index);
                updateStatsDisplay();
                addLogEntry(`Manually removed ${threat.name}. Cost: 8% resources.`);
            } else {
                addLogEntry(`Insufficient resources to remove ${threat.name}!`);
            }
        });
        
        threatsList.appendChild(threatElement);
    });
}

// Update time display
function updateTimeDisplay() {
    const minutes = Math.floor(gameState.timeSurvived / 60);
    const seconds = gameState.timeSurvived % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('time-survived').textContent = timeString;
}

// Add entry to event log
function addLogEntry(message) {
    const eventLog = document.getElementById('event-log');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ${message}`;
    
    eventLog.appendChild(logEntry);
    eventLog.scrollTop = eventLog.scrollHeight;
    
    // Limit log entries
    if (eventLog.children.length > 10) {
        eventLog.removeChild(eventLog.firstChild);
    }
}

// Check if game is over
function checkGameOver() {
    if (gameState.stability <= 0 || gameState.resources <= 0 || gameState.integrity <= 0) {
        endGame();
    }
}

// End the game
function endGame() {
    gameState.gameActive = false;
    
    // Clear timers
    clearInterval(gameState.gameTimer);
    clearInterval(gameState.threatTimer);
    clearInterval(gameState.decayTimer);
    
    // Determine cause of collapse
    let collapseReason = "";
    if (gameState.stability <= 0) {
        collapseReason = "UI stability completely degraded.";
    } else if (gameState.resources <= 0) {
        collapseReason = "System resources exhausted.";
    } else if (gameState.integrity <= 0) {
        collapseReason = "UI integrity irreparably compromised.";
    }
    
    // Update game over screen
    document.getElementById('final-time').textContent = document.getElementById('time-survived').textContent;
    document.getElementById('collapse-reason').textContent = collapseReason;
    
    // Show game over screen
    document.getElementById('game-over').style.display = 'flex';
    
    addLogEntry(`INTERFACE COLLAPSE: ${collapseReason}`);
}

// Reset the game
function resetGame() {
    // Hide game over screen
    document.getElementById('game-over').style.display = 'none';
    
    // Reset game state
    gameState.stability = 100;
    gameState.resources = 100;
    gameState.integrity = 100;
    gameState.timeSurvived = 0;
    gameState.threats = [];
    gameState.gameActive = true;
    
    // Reset difficulty to low
    document.querySelectorAll('.difficulty-btn').forEach((btn, index) => {
        if (index === 0) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    gameState.difficulty = 1;
    
    // Clear timers
    if (gameState.gameTimer) clearInterval(gameState.gameTimer);
    if (gameState.threatTimer) clearInterval(gameState.threatTimer);
    if (gameState.decayTimer) clearInterval(gameState.decayTimer);
    
    // Update displays
    updateStatsDisplay();
    updateThreatsDisplay();
    updateTimeDisplay();
    
    // Clear event log except initial message
    const eventLog = document.getElementById('event-log');
    eventLog.innerHTML = '<div class="log-entry">System initialized. Interface survival challenge engaged.</div>';
    
    // Restart timers
    startGameTimers();
    
    addLogEntry("Interface reset. Survival challenge restarted.");
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', initGame);