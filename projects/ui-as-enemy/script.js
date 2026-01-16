// ==========================================
// GAME STATE
// ==========================================
const state = {
    level: 1,
    attempts: 0,
    maxLevel: 7,
    totalAttempts: 0, // Persistent across levels
    lastClickTime: Date.now(),
    clickHistory: [], // Track clicks on same elements
    hesitationCount: 0,
    rapidClickCount: 0,
    failureStreak: 0,
    difficultyMultiplier: 1
};

// ==========================================
// MOCKING MESSAGES
// ==========================================
const mockMessages = [
    "Not able to catch?",
    "Still can't catch it.",
    "Almost. Not really.",
    "You're getting predictable.",
    "That was expected.",
    "Try harder.",
    "Is this difficult?",
    "Interesting strategy.",
    "Keep trying.",
    "So close, yet so far.",
    "Another attempt wasted.",
    "Getting warmer. Or colder?",
    "Bold move.",
    "That's one way to do it.",
    "Persistence is key. Maybe."
];

let lastMockIndex = -1;

// ==========================================
// DOM ELEMENTS
// ==========================================
const el = {
    startScreen: document.getElementById('startScreen'),
    gameScreen: document.getElementById('gameScreen'),
    victoryScreen: document.getElementById('victoryScreen'),
    playground: document.getElementById('playground'),
    taskDesc: document.getElementById('taskDesc'),
    levelNum: document.getElementById('levelNum'),
    attempts: document.getElementById('attempts'),
    progressBar: document.getElementById('progressBar'),
    nextBtn: document.getElementById('nextBtn'),
    restartBtn: document.getElementById('restartBtn'),
    fakeCursor: document.getElementById('fakeCursor'),
    mockFeedback: null // Created dynamically
};

// ==========================================
// ADAPTIVE BEHAVIOR TRACKING
// ==========================================
function trackClick(elementId) {
    const now = Date.now();
    const timeSinceLastClick = now - state.lastClickTime;
    
    // Track hesitation (more than 3 seconds without clicking)
    if (timeSinceLastClick > 3000) {
        state.hesitationCount++;
        state.difficultyMultiplier = Math.min(3, 1 + state.hesitationCount * 0.2);
    }
    
    // Track rapid clicking (less than 200ms)
    if (timeSinceLastClick < 200) {
        state.rapidClickCount++;
    }
    
    // Track repeated clicks on same element
    const recentClicks = state.clickHistory.slice(-5);
    const sameElementClicks = recentClicks.filter(id => id === elementId).length;
    if (sameElementClicks >= 2) {
        state.difficultyMultiplier = Math.min(3, state.difficultyMultiplier * 1.1);
    }
    
    state.clickHistory.push(elementId);
    if (state.clickHistory.length > 20) {
        state.clickHistory.shift();
    }
    
    state.lastClickTime = now;
}

function getAdaptiveSpeed() {
    // Buttons move faster based on player behavior
    const baseSpeed = 150;
    return baseSpeed * state.difficultyMultiplier;
}

function shouldShowFalseProgress() {
    // Show false progress after multiple failures
    return state.failureStreak >= 3 && Math.random() < 0.4;
}

// ==========================================
// MOCKING FEEDBACK SYSTEM
// ==========================================
function showMockMessage() {
    if (!el.mockFeedback) {
        el.mockFeedback = document.createElement('div');
        el.mockFeedback.className = 'mock-feedback';
        document.body.appendChild(el.mockFeedback);
    }
    
    // Select non-repeating message
    let index;
    do {
        index = Math.floor(Math.random() * mockMessages.length);
    } while (index === lastMockIndex && mockMessages.length > 1);
    lastMockIndex = index;
    
    const message = mockMessages[index];
    el.mockFeedback.textContent = message;
    el.mockFeedback.classList.add('show');
    
    setTimeout(() => {
        el.mockFeedback.classList.remove('show');
    }, 2000);
}

// ==========================================
// FALSE PROGRESS SYSTEM
// ==========================================
function showFalseSuccess() {
    const falseMsg = document.createElement('div');
    falseMsg.className = 'false-success';
    falseMsg.innerHTML = '<div>✓ SUCCESS!</div><div style="font-size: 0.9rem; margin-top: 0.5rem;">Loading next level...</div>';
    el.playground.appendChild(falseMsg);
    
    setTimeout(() => {
        falseMsg.remove();
        increaseDifficulty();
        showMockMessage();
    }, 1500);
}

function increaseDifficulty() {
    state.difficultyMultiplier = Math.min(3, state.difficultyMultiplier * 1.2);
    state.failureStreak++;
}

// ==========================================
// LEVEL DEFINITIONS
// ==========================================
const levels = {
    1: {
        task: "Click the Submit button to proceed.",
        init: (pg) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-flee';
            btn.textContent = 'Submit';
            btn.dataset.elementId = 'submit-btn-1';
            btn.style.left = '50%';
            btn.style.top = '50%';
            btn.style.transform = 'translate(-50%, -50%)';
            
            let moveCount = 0;
            btn.addEventListener('mouseenter', (e) => {
                trackClick(btn.dataset.elementId);
                moveCount++;
                
                const maxX = pg.offsetWidth - btn.offsetWidth;
                const maxY = pg.offsetHeight - btn.offsetHeight;
                btn.style.left = Math.random() * maxX + 'px';
                btn.style.top = Math.random() * maxY + 'px';
                btn.style.transform = 'none';
                
                // Adaptive: speed increases with difficulty
                btn.style.transition = `all ${0.05 * (1 / state.difficultyMultiplier)}s ease-out`;
                
                // False progress trigger
                if (moveCount > 5 && shouldShowFalseProgress()) {
                    showFalseSuccess();
                    moveCount = 0;
                }
            });
            
            btn.addEventListener('click', () => {
                state.failureStreak = 0; // Reset on success
                levelComplete();
            });
            pg.appendChild(btn);
        }
    },
    
    2: {
        task: "Click the CONFIRM button. Beware of imposters.",
        init: (pg) => {
            const buttons = ['Cancel', 'Confirm', 'Decline', 'Confirm', 'Reject'];
            let clickCounts = {};
            
            buttons.forEach((text, i) => {
                const btn = document.createElement('button');
                btn.className = 'btn';
                btn.textContent = text;
                btn.dataset.elementId = `btn-${i}`;
                btn.style.left = (i * 150 + 20) + 'px';
                btn.style.top = '100px';
                
                clickCounts[i] = 0;
                
                if (text === 'Confirm' && i === 1) {
                    // First Confirm is fake
                    btn.addEventListener('click', () => {
                        trackClick(btn.dataset.elementId);
                        incrementAttempts();
                        clickCounts[i]++;
                        
                        btn.textContent = 'WRONG!';
                        setTimeout(() => btn.textContent = 'Confirm', 500);
                        
                        // Adaptive: change label after repeated clicks
                        if (clickCounts[i] >= 2) {
                            btn.textContent = 'Nice Try';
                        }
                        
                        showMockMessage();
                    });
                } else if (text === 'Confirm' && i === 3) {
                    // Second Confirm is real
                    btn.addEventListener('click', () => {
                        state.failureStreak = 0;
                        levelComplete();
                    });
                } else {
                    btn.addEventListener('click', () => {
                        trackClick(btn.dataset.elementId);
                        incrementAttempts();
                        clickCounts[i]++;
                        
                        btn.textContent = 'WRONG!';
                        setTimeout(() => btn.textContent = text, 500);
                        
                        if (shouldShowFalseProgress()) {
                            showFalseSuccess();
                        } else {
                            showMockMessage();
                        }
                    });
                }
                pg.appendChild(btn);
            });
        }
    },
    
    3: {
        task: "Type 'OVERRIDE' into the input field and click Submit.",
        init: (pg) => {
            const input = document.createElement('input');
            input.className = 'input-field';
            input.placeholder = 'Enter command...';
            input.dataset.elementId = 'input-field';
            input.style.position = 'absolute';
            input.style.left = '50%';
            input.style.top = '40%';
            input.style.transform = 'translate(-50%, -50%)';
            
            let inputAttempts = 0;
            
            // Input reverses text as you type
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                e.target.value = val.split('').reverse().join('');
            });
            
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = 'Submit';
            btn.dataset.elementId = 'submit-btn-3';
            btn.style.left = '50%';
            btn.style.top = '60%';
            btn.style.transform = 'translate(-50%, -50%)';
            
            btn.addEventListener('click', () => {
                trackClick(btn.dataset.elementId);
                inputAttempts++;
                
                // Check for reversed OVERRIDE
                if (input.value === 'EDIRRREVO') {
                    state.failureStreak = 0;
                    levelComplete();
                } else {
                    incrementAttempts();
                    input.value = '';
                    
                    // Adaptive: change placeholder based on attempts
                    if (inputAttempts >= 2) {
                        input.placeholder = 'Think backwards...';
                    } else {
                        input.placeholder = 'INCORRECT! Try again...';
                    }
                    
                    if (shouldShowFalseProgress()) {
                        showFalseSuccess();
                    } else {
                        showMockMessage();
                    }
                }
            });
            
            pg.appendChild(input);
            pg.appendChild(btn);
        }
    },
    
    4: {
        task: "Check the checkbox labeled 'I agree' and submit.",
        init: (pg) => {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '50%';
            container.style.top = '40%';
            container.style.transform = 'translate(-50%, -50%)';
            
            const cb1 = createCheckbox('I disagree', false);
            const cb2 = createCheckbox('I agree', true);
            const cb3 = createCheckbox('I refuse', false);
            
            container.appendChild(cb1);
            container.appendChild(cb2);
            container.appendChild(cb3);
            
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = 'Submit';
            btn.dataset.elementId = 'submit-btn-4';
            btn.style.position = 'relative';
            btn.style.marginTop = '2rem';
            
            let submitAttempts = 0;
            btn.addEventListener('click', () => {
                trackClick(btn.dataset.elementId);
                submitAttempts++;
                
                const checked = container.querySelectorAll('input[type="checkbox"]:checked');
                if (checked.length === 1 && checked[0].dataset.correct === 'true') {
                    state.failureStreak = 0;
                    levelComplete();
                } else {
                    incrementAttempts();
                    
                    // Adaptive: after multiple failures, show false success
                    if (submitAttempts >= 3 && Math.random() < 0.5) {
                        showFalseSuccess();
                    } else {
                        showMockMessage();
                    }
                }
            });
            
            container.appendChild(btn);
            pg.appendChild(container);
        }
    },
    
    5: {
        task: "Click any button. Labels may not reflect their function.",
        init: (pg) => {
            const labels = ['SUCCESS', 'FAILURE', 'CONTINUE', 'ABORT', 'PROCEED'];
            const correctIndex = 1; // FAILURE actually succeeds
            let clicksPerButton = {};
            
            labels.forEach((text, i) => {
                const btn = document.createElement('button');
                btn.className = 'btn';
                btn.textContent = text;
                btn.dataset.elementId = `btn-5-${i}`;
                btn.style.left = (i * 140 + 30) + 'px';
                btn.style.top = '120px';
                
                clicksPerButton[i] = 0;
                
                btn.addEventListener('click', () => {
                    trackClick(btn.dataset.elementId);
                    clicksPerButton[i]++;
                    
                    if (i === correctIndex) {
                        state.failureStreak = 0;
                        levelComplete();
                    } else {
                        incrementAttempts();
                        btn.classList.add('glitch');
                        setTimeout(() => btn.classList.remove('glitch'), 300);
                        
                        // Adaptive: swap labels after multiple clicks
                        if (clicksPerButton[i] >= 2 && state.difficultyMultiplier > 1.5) {
                            const randomIndex = Math.floor(Math.random() * labels.length);
                            btn.textContent = labels[randomIndex];
                        }
                        
                        showMockMessage();
                    }
                });
                pg.appendChild(btn);
            });
            
            const hint = document.createElement('p');
            hint.textContent = 'Hint: Sometimes failure is the path forward.';
            hint.style.position = 'absolute';
            hint.style.bottom = '20px';
            hint.style.left = '50%';
            hint.style.transform = 'translateX(-50%)';
            hint.style.fontSize = '0.8rem';
            hint.style.color = '#666';
            pg.appendChild(hint);
        }
    },
    
    6: {
        task: "Click the button 10 times. The counter might lie.",
        init: (pg) => {
            let realCount = 0;
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = 'Click Me (0/10)';
            btn.dataset.elementId = 'click-counter';
            btn.style.left = '50%';
            btn.style.top = '50%';
            btn.style.transform = 'translate(-50%, -50%)';
            
            btn.addEventListener('click', () => {
                trackClick(btn.dataset.elementId);
                realCount++;
                
                // Adaptive: counter becomes more deceptive with difficulty
                let fakeCount;
                if (state.difficultyMultiplier > 1.5) {
                    // More deceptive - sometimes goes backwards
                    fakeCount = Math.max(0, Math.floor(Math.random() * 15) - 2);
                } else {
                    // Display random wrong number
                    fakeCount = Math.floor(Math.random() * 15);
                }
                
                btn.textContent = `Click Me (${fakeCount}/10)`;
                
                // False progress at count 7
                if (realCount === 7 && shouldShowFalseProgress()) {
                    showFalseSuccess();
                }
                
                if (realCount >= 10) {
                    state.failureStreak = 0;
                    levelComplete();
                }
            });
            pg.appendChild(btn);
        }
    },
    
    7: {
        task: "Final challenge: Find and click the invisible submit button.",
        init: (pg) => {
            // Create invisible button
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = 'Submit';
            btn.dataset.elementId = 'invisible-submit';
            btn.style.opacity = '0';
            btn.style.left = '60%';
            btn.style.top = '60%';
            btn.style.transform = 'translate(-50%, -50%)';
            
            btn.addEventListener('mouseenter', () => {
                btn.style.opacity = '0.3';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.opacity = '0';
            });
            
            btn.addEventListener('click', () => {
                state.failureStreak = 0;
                levelComplete();
            });
            
            // Add decoy visible buttons
            let decoyClicks = 0;
            for (let i = 0; i < 5; i++) {
                const decoy = document.createElement('button');
                decoy.className = 'btn';
                decoy.textContent = 'Submit';
                decoy.dataset.elementId = `decoy-${i}`;
                decoy.style.left = (i * 130 + 20) + 'px';
                decoy.style.top = '100px';
                
                decoy.addEventListener('click', () => {
                    trackClick(decoy.dataset.elementId);
                    incrementAttempts();
                    decoyClicks++;
                    
                    // Adaptive: decoys change text after clicks
                    if (decoyClicks >= 2) {
                        decoy.textContent = 'Nope';
                    }
                    
                    if (decoyClicks >= 4 && shouldShowFalseProgress()) {
                        showFalseSuccess();
                    } else {
                        showMockMessage();
                    }
                });
                pg.appendChild(decoy);
            }
            
            pg.appendChild(btn);
            
            const hint = document.createElement('p');
            hint.textContent = 'Hint: Explore the empty spaces.';
            hint.style.position = 'absolute';
            hint.style.bottom = '20px';
            hint.style.fontSize = '0.8rem';
            hint.style.color = '#666';
            pg.appendChild(hint);
        }
    }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function createCheckbox(label, isCorrect) {
    const div = document.createElement('div');
    div.className = 'checkbox-container';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.correct = isCorrect;
    
    // Checkboxes check/uncheck opposite
    cb.addEventListener('click', (e) => {
        e.preventDefault();
        cb.checked = !cb.checked;
    });
    
    const lbl = document.createElement('label');
    lbl.textContent = label;
    
    div.appendChild(cb);
    div.appendChild(lbl);
    return div;
}

function incrementAttempts() {
    state.attempts++;
    state.totalAttempts++;
    state.failureStreak++;
    el.attempts.textContent = state.attempts;
    
    // Show mock message every 2-3 failures
    if (state.totalAttempts % 2 === 0 || state.failureStreak >= 2) {
        showMockMessage();
    }
}

// ==========================================
// GAME FLOW FUNCTIONS
// ==========================================
function startGame() {
    el.startScreen.classList.add('hidden');
    el.gameScreen.classList.remove('hidden');
    loadLevel(1);
}

function loadLevel(level) {
    state.level = level;
    state.attempts = 0;
    el.levelNum.textContent = level;
    el.attempts.textContent = 0;
    el.playground.innerHTML = '';
    el.taskDesc.textContent = levels[level].task;
    
    const progress = ((level - 1) / state.maxLevel) * 100;
    el.progressBar.style.width = progress + '%';
    
    levels[level].init(el.playground);
}

function levelComplete() {
    el.gameScreen.classList.add('hidden');
    el.victoryScreen.classList.remove('hidden');
    document.getElementById('finalAttempts').textContent = state.attempts;
    
    if (state.level >= state.maxLevel) {
        document.getElementById('victoryMsg').textContent = 'YOU DEFEATED THE TREACHEROUS UI!';
        el.nextBtn.classList.add('hidden');
        el.restartBtn.classList.remove('hidden');
    } else {
        document.getElementById('victoryMsg').textContent = 'Level ' + state.level + ' Complete!';
        el.nextBtn.classList.remove('hidden');
        el.restartBtn.classList.add('hidden');
    }
}

function nextLevel() {
    el.victoryScreen.classList.add('hidden');
    el.gameScreen.classList.remove('hidden');
    loadLevel(state.level + 1);
}

function restartGame() {
    el.victoryScreen.classList.add('hidden');
    el.startScreen.classList.remove('hidden');
    state.level = 1;
    state.attempts = 0;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
document.getElementById('startBtn').addEventListener('click', startGame);
el.nextBtn.addEventListener('click', nextLevel);
el.restartBtn.addEventListener('click', restartGame);

// ==========================================
// MOBILE OPTIMIZATIONS
// ==========================================

// Prevent double-tap zoom on buttons
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        button, input, .btn {
            touch-action: manipulation;
        }
    `;
    document.head.appendChild(style);
});

// Detect mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || (window.innerWidth <= 768);
}

// Adjust button flee behavior for mobile
if (isMobileDevice()) {
    // Mobile devices use touchstart instead of mouseenter
    const originalInit = levels[1].init;
    levels[1].init = function(pg) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-flee';
        btn.textContent = 'Submit';
        btn.dataset.elementId = 'submit-btn-1';
        btn.style.left = '50%';
        btn.style.top = '50%';
        btn.style.transform = 'translate(-50%, -50%)';
        
        let moveCount = 0;
        let lastMoveTime = 0;
        
        const moveButton = () => {
            const now = Date.now();
            if (now - lastMoveTime < 300) return; // Prevent too rapid moves
            lastMoveTime = now;
            
            trackClick(btn.dataset.elementId);
            moveCount++;
            
            const maxX = pg.offsetWidth - btn.offsetWidth - 20;
            const maxY = pg.offsetHeight - btn.offsetHeight - 20;
            btn.style.left = Math.max(10, Math.random() * maxX) + 'px';
            btn.style.top = Math.max(10, Math.random() * maxY) + 'px';
            btn.style.transform = 'none';
            
            btn.style.transition = `all ${0.08 * (1 / state.difficultyMultiplier)}s ease-out`;
            
            if (moveCount > 5 && shouldShowFalseProgress()) {
                showFalseSuccess();
                moveCount = 0;
            }
        };
        
        // For mobile: move on touchstart (before click)
        btn.addEventListener('touchstart', (e) => {
            moveButton();
        }, { passive: true });
        
        // Also keep mouseenter for desktop
        btn.addEventListener('mouseenter', moveButton);
        
        btn.addEventListener('click', () => {
            state.failureStreak = 0;
            levelComplete();
        });
        
        pg.appendChild(btn);
    };
}

// Prevent context menu on long press
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('btn') || e.target.tagName === 'BUTTON') {
        e.preventDefault();
    }
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Recalculate playground if active
        if (!el.gameScreen.classList.contains('hidden')) {
            const pg = el.playground;
            // Reposition any absolute elements if needed
            const buttons = pg.querySelectorAll('.btn');
            buttons.forEach(btn => {
                const currentLeft = parseInt(btn.style.left) || 0;
                const currentTop = parseInt(btn.style.top) || 0;
                const maxX = pg.offsetWidth - btn.offsetWidth;
                const maxY = pg.offsetHeight - btn.offsetHeight;
                
                if (currentLeft > maxX) btn.style.left = maxX + 'px';
                if (currentTop > maxY) btn.style.top = maxY + 'px';
            });
        }
    }, 100);
});
