// ============================================
// ChaosButtons - State Management
// Global state, chaos level, and tracking
// ============================================

const ChaosState = {
    // Core counters
    interactionCount: 0,
    score: 0,
    liesDetected: 0,
    
    // Chaos system
    chaosLevel: 1,
    maxChaosLevel: 5,
    interactionsPerLevel: 5,
    
    // Button states
    buttonStates: new Map(),
    
    // Mutation tracking
    lastMutationTime: Date.now(),
    mutationInterval: 3000, // 3 seconds
    
    // Behavior history
    behaviorHistory: [],
    
    // Initialize button state
    initButton(buttonId) {
        if (!this.buttonStates.has(buttonId)) {
            this.buttonStates.set(buttonId, {
                id: buttonId,
                behaviors: [],
                clickCount: 0,
                lastClicked: null,
                isDelayed: false,
                isMutating: false,
                position: { x: 0, y: 0 }
            });
        }
        return this.buttonStates.get(buttonId);
    },
    
    // Get button state
    getButtonState(buttonId) {
        return this.buttonStates.get(buttonId) || this.initButton(buttonId);
    },
    
    // Update button state
    updateButtonState(buttonId, updates) {
        const state = this.getButtonState(buttonId);
        Object.assign(state, updates);
        this.buttonStates.set(buttonId, state);
    },
    
    // Add behavior to button
    addBehavior(buttonId, behavior) {
        const state = this.getButtonState(buttonId);
        if (!state.behaviors.includes(behavior)) {
            state.behaviors.push(behavior);
            this.behaviorHistory.push({
                buttonId,
                behavior,
                timestamp: Date.now(),
                chaosLevel: this.chaosLevel
            });
        }
    },
    
    // Remove behavior from button
    removeBehavior(buttonId, behavior) {
        const state = this.getButtonState(buttonId);
        state.behaviors = state.behaviors.filter(b => b !== behavior);
    },
    
    // Clear all behaviors from button
    clearBehaviors(buttonId) {
        const state = this.getButtonState(buttonId);
        state.behaviors = [];
    },
    
    // Increment interaction
    incrementInteraction() {
        this.interactionCount++;
        this.updateChaosLevel();
        this.updateUI();
    },
    
    // Update chaos level based on interactions
    updateChaosLevel() {
        const newLevel = Math.min(
            Math.floor(this.interactionCount / this.interactionsPerLevel) + 1,
            this.maxChaosLevel
        );
        
        if (newLevel !== this.chaosLevel) {
            this.chaosLevel = newLevel;
            this.onChaosLevelChange(newLevel);
        }
    },
    
    // Chaos level change handler
    onChaosLevelChange(newLevel) {
        console.log(`Chaos level increased to ${newLevel}`);
        
        // Update arena class
        const arena = document.querySelector('.button-arena');
        if (arena) {
            arena.className = 'button-arena';
            arena.classList.add(`chaos-level-${newLevel}`);
        }
        
        // Trigger screen shake for high chaos
        if (newLevel >= 4) {
            document.body.classList.add('screen-shake');
            setTimeout(() => {
                document.body.classList.remove('screen-shake');
            }, 500);
        }
        
        // Update cursor for max chaos
        if (newLevel === this.maxChaosLevel) {
            document.body.classList.add('chaos-cursor');
        }
    },
    
    // Add score
    addScore(points) {
        this.score += points;
        this.updateUI();
    },
    
    // Increment lies detected
    incrementLies() {
        this.liesDetected++;
        this.updateUI();
    },
    
    // Update UI elements
    updateUI() {
        // Update interaction count
        const interactionEl = document.getElementById('interaction-count');
        if (interactionEl) {
            interactionEl.textContent = this.interactionCount;
        }
        
        // Update chaos level
        const chaosLevelEl = document.getElementById('chaos-level');
        if (chaosLevelEl) {
            chaosLevelEl.textContent = this.chaosLevel;
        }
        
        // Update score
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
        
        // Update lies count
        const liesEl = document.getElementById('lies-count');
        if (liesEl) {
            liesEl.textContent = this.liesDetected;
        }
        
        // Update chaos fill bar
        const chaosFill = document.getElementById('chaos-fill');
        if (chaosFill) {
            const percentage = (this.chaosLevel / this.maxChaosLevel) * 100;
            chaosFill.style.width = `${percentage}%`;
        }
    },
    
    // Reset state
    reset() {
        this.interactionCount = 0;
        this.score = 0;
        this.liesDetected = 0;
        this.chaosLevel = 1;
        this.buttonStates.clear();
        this.behaviorHistory = [];
        this.lastMutationTime = Date.now();
        
        // Reset UI
        this.updateUI();
        
        // Reset arena class
        const arena = document.querySelector('.button-arena');
        if (arena) {
            arena.className = 'button-arena chaos-level-1';
        }
        
        // Reset cursor
        document.body.classList.remove('chaos-cursor');
        
        // Remove all behavior classes from buttons
        document.querySelectorAll('.chaos-btn').forEach(btn => {
            btn.className = 'chaos-btn';
        });
        
        console.log('Chaos state reset');
    },
    
    // Get random button
    getRandomButton() {
        const buttons = Array.from(document.querySelectorAll('.chaos-btn'));
        return buttons[Math.floor(Math.random() * buttons.length)];
    },
    
    // Seeded random number generator for reproducible chaos
    seed: 12345,
    
    seededRandom() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    },
    
    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(this.seededRandom() * (max - min + 1)) + min;
    },
    
    // Random choice from array
    randomChoice(array) {
        return array[Math.floor(this.seededRandom() * array.length)];
    },
    
    // Weighted random choice
    weightedChoice(choices) {
        const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
        let random = this.seededRandom() * totalWeight;
        
        for (const choice of choices) {
            random -= choice.weight;
            if (random <= 0) {
                return choice.value;
            }
        }
        
        return choices[choices.length - 1].value;
    },
    
    // Check if mutation should occur
    shouldMutate() {
        const now = Date.now();
        const timeSinceLastMutation = now - this.lastMutationTime;
        
        // Mutation chance increases with chaos level
        const mutationChance = this.chaosLevel * 0.15;
        
        if (timeSinceLastMutation >= this.mutationInterval && this.seededRandom() < mutationChance) {
            this.lastMutationTime = now;
            return true;
        }
        
        return false;
    },
    
    // Get chaos multiplier
    getChaosMultiplier() {
        return 1 + (this.chaosLevel - 1) * 0.5;
    },
    
    // Export state for debugging
    exportState() {
        return {
            interactionCount: this.interactionCount,
            score: this.score,
            liesDetected: this.liesDetected,
            chaosLevel: this.chaosLevel,
            buttonStates: Array.from(this.buttonStates.entries()),
            behaviorHistory: this.behaviorHistory
        };
    },
    
    // Import state for debugging
    importState(state) {
        this.interactionCount = state.interactionCount;
        this.score = state.score;
        this.liesDetected = state.liesDetected;
        this.chaosLevel = state.chaosLevel;
        this.buttonStates = new Map(state.buttonStates);
        this.behaviorHistory = state.behaviorHistory;
        this.updateUI();
    }
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
    window.ChaosState = ChaosState;
}
