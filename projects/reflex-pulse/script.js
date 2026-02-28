/**
 * REFLEX PULSE
 * One-Button Reflex Game
 * v1.1 - Added accuracy display in milliseconds
 * 
 * A simple reflex game where players must click when an expanding
 * circle aligns with a fixed target ring.
 */

(function() {
    'use strict';

    // ========================================
    // GAME CONFIGURATION
    // ========================================
    
    const CONFIG = {
        // Timing (in milliseconds)
        countdownDuration: 3000,
        countdownInterval: 1000,
        
        // Circle expansion
        baseExpansionDuration: 2000,  // Time for circle to reach ring
        speedIncreaseRate: 0.92,      // Multiplier each success (lower = faster)
        minExpansionDuration: 600,    // Fastest possible speed
        
        // Hit detection
        hitTolerance: 0.12,           // Percentage tolerance for "perfect" hit
        
        // Feedback timing
        successDisplayTime: 800,
        failDisplayTime: 1200,
        
        // Animation
        expansionUpdateInterval: 16   // ~60fps
    };

    // ========================================
    // GAME STATE
    // ========================================
    
    /**
     * Game States:
     * - idle: Waiting for player to start
     * - countdown: 3-2-1 countdown before playing
     * - playing: Circle is expanding, waiting for click
     * - success: Brief success feedback
     * - gameover: Game ended, showing final score
     */
    const STATES = {
        IDLE: 'idle',
        COUNTDOWN: 'countdown',
        PLAYING: 'playing',
        SUCCESS: 'success',
        GAMEOVER: 'gameover'
    };

    let gameState = {
        current: STATES.IDLE,
        score: 0,
        currentSpeed: CONFIG.baseExpansionDuration,
        expansionProgress: 0,  // 0 to 1 (1 = reached ring)
        animationId: null,
        countdownValue: 3,
        inputEnabled: true,  // Prevent double-tap restart
        lastAccuracyMs: 0  // Track accuracy in milliseconds for display
    };

    // ========================================
    // DOM ELEMENTS
    // ========================================
    
    const elements = {
        container: document.getElementById('gameContainer'),
        title: document.getElementById('gameTitle'),
        scoreDisplay: document.getElementById('scoreDisplay'),
        scoreValue: document.getElementById('scoreValue'),
        arena: document.getElementById('arena'),
        targetRing: document.getElementById('targetRing'),
        pulseCircle: document.getElementById('pulseCircle'),
        message: document.getElementById('message'),
        messageText: document.getElementById('messageText'),
        countdown: document.getElementById('countdown')
    };

    // ========================================
    // STATE MANAGEMENT
    // ========================================
    
    /**
     * Transition to a new game state
     * @param {string} newState - The state to transition to
     */
    function setState(newState) {
        const previousState = gameState.current;
        gameState.current = newState;
        
        // Clean up previous state
        cleanupState(previousState);
        
        // Initialize new state
        initializeState(newState);
    }

    /**
     * Clean up when leaving a state
     * @param {string} state - The state being exited
     */
    function cleanupState(state) {
        switch (state) {
            case STATES.PLAYING:
                stopExpansion();
                break;
            case STATES.COUNTDOWN:
                elements.countdown.classList.remove('visible');
                break;
            case STATES.SUCCESS:
            case STATES.GAMEOVER:
                clearFeedback();
                break;
        }
    }

    /**
     * Initialize when entering a state
     * @param {string} state - The state being entered
     */
    function initializeState(state) {
        switch (state) {
            case STATES.IDLE:
                handleIdleState();
                break;
            case STATES.COUNTDOWN:
                handleCountdownState();
                break;
            case STATES.PLAYING:
                handlePlayingState();
                break;
            case STATES.SUCCESS:
                handleSuccessState();
                break;
            case STATES.GAMEOVER:
                handleGameoverState();
                break;
        }
    }

    // ========================================
    // STATE HANDLERS
    // ========================================
    
    /**
     * Handle idle state - waiting to start
     */
    function handleIdleState() {
        // Reset game values
        gameState.score = 0;
        gameState.currentSpeed = CONFIG.baseExpansionDuration;
        gameState.inputEnabled = true;
        
        // Update UI
        elements.title.classList.remove('hidden');
        elements.scoreDisplay.classList.remove('visible');
        elements.message.classList.remove('hidden');
        elements.messageText.textContent = 'Tap to Start';
        elements.messageText.className = 'message-text';
        elements.scoreValue.textContent = '0';
        
        // Reset circle
        resetCircle();
    }

    /**
     * Handle countdown state - 3, 2, 1...
     */
    function handleCountdownState() {
        gameState.countdownValue = 3;
        
        // Reset game values for new game
        gameState.score = 0;
        gameState.currentSpeed = CONFIG.baseExpansionDuration;
        elements.scoreValue.textContent = '0';
        
        // Hide idle UI
        elements.title.classList.add('hidden');
        elements.message.classList.add('hidden');
        
        // Reset and hide the circle during countdown
        resetCircle();
        
        // Show score
        elements.scoreDisplay.classList.add('visible');
        
        // Start countdown
        showCountdownNumber();
    }

    /**
     * Display countdown numbers
     */
    function showCountdownNumber() {
        if (gameState.current !== STATES.COUNTDOWN) return;
        
        if (gameState.countdownValue > 0) {
            elements.countdown.textContent = gameState.countdownValue;
            elements.countdown.classList.add('visible');
            
            // Brief pulse animation
            setTimeout(() => {
                elements.countdown.classList.remove('visible');
            }, 700);
            
            gameState.countdownValue--;
            
            setTimeout(() => {
                showCountdownNumber();
            }, CONFIG.countdownInterval);
        } else {
            // Countdown complete, start playing
            setState(STATES.PLAYING);
        }
    }

    /**
     * Handle playing state - circle expanding
     */
    function handlePlayingState() {
        elements.message.classList.add('hidden');
        resetCircle();
        startExpansion();
    }

    /**
     * Handle success state - player hit at right moment
     */
    function handleSuccessState() {
        gameState.score++;
        elements.scoreValue.textContent = gameState.score;
        
        // Increase speed
        gameState.currentSpeed = Math.max(
            CONFIG.minExpansionDuration,
            gameState.currentSpeed * CONFIG.speedIncreaseRate
        );
        
        // Visual feedback
        elements.targetRing.classList.add('success');
        elements.pulseCircle.classList.add('success');
        elements.arena.classList.add('success-pulse');
        
        // Show message
        elements.message.classList.remove('hidden');
        elements.messageText.textContent = 'Perfect!';
        elements.messageText.className = 'message-text success';
        
        // Continue to next round
        setTimeout(() => {
            if (gameState.current === STATES.SUCCESS) {
                setState(STATES.PLAYING);
            }
        }, CONFIG.successDisplayTime);
    }

    /**
     * Handle gameover state - player missed
     */
    function handleGameoverState() {
        // Disable input temporarily to prevent accidental restart
        gameState.inputEnabled = false;
        
        // Visual feedback
        elements.targetRing.classList.add('fail');
        elements.pulseCircle.classList.add('fail');
        elements.container.classList.add('shake');
        
        // Show message
        elements.message.classList.remove('hidden');
        
        const tooEarly = gameState.expansionProgress < (1 - CONFIG.hitTolerance);
        const accuracySign = gameState.lastAccuracyMs >= 0 ? '+' : '';
        const failMsg = tooEarly ? 'Too Early!' : 'Too Late!';
        elements.messageText.textContent = `${failMsg} (${accuracySign}${gameState.lastAccuracyMs}ms)`;
        elements.messageText.className = 'message-text fail';
        
        // Show restart prompt after delay and re-enable input
        setTimeout(() => {
            if (gameState.current === STATES.GAMEOVER) {
                const finalScore = gameState.score;
                elements.messageText.textContent = `Score: ${finalScore} — Tap to Retry`;
                elements.messageText.className = 'message-text';
                gameState.inputEnabled = true;
            }
        }, CONFIG.failDisplayTime);
    }

    // ========================================
    // CIRCLE EXPANSION
    // ========================================
    
    let expansionStartTime = 0;

    /**
     * Reset circle to initial state
     */
    function resetCircle() {
        gameState.expansionProgress = 0;
        elements.pulseCircle.classList.remove('active', 'expanding', 'success', 'fail');
        elements.pulseCircle.style.width = '0';
        elements.pulseCircle.style.height = '0';
    }

    /**
     * Start the circle expansion animation
     */
    function startExpansion() {
        resetCircle();
        elements.pulseCircle.classList.add('active', 'expanding');
        expansionStartTime = performance.now();
        
        updateExpansion();
    }

    /**
     * Update circle size each frame
     */
    function updateExpansion() {
        if (gameState.current !== STATES.PLAYING) return;
        
        const elapsed = performance.now() - expansionStartTime;
        gameState.expansionProgress = elapsed / gameState.currentSpeed;
        
        // Calculate circle size - allow it to grow beyond 100% (past the ring)
        const size = gameState.expansionProgress * 100;
        elements.pulseCircle.style.width = `${size}%`;
        elements.pulseCircle.style.height = `${size}%`;
        
        // Check if circle passed the ring (too late) - fail when clearly past
        if (gameState.expansionProgress > 1.3) {
            setState(STATES.GAMEOVER);
            return;
        }
        
        // Continue animation
        gameState.animationId = requestAnimationFrame(updateExpansion);
    }

    /**
     * Stop the expansion animation
     */
    function stopExpansion() {
        if (gameState.animationId) {
            cancelAnimationFrame(gameState.animationId);
            gameState.animationId = null;
        }
    }

    // ========================================
    // HIT DETECTION
    // ========================================
    
    /**
     * Check if the current click is a successful hit
     * @returns {boolean} True if hit is within tolerance
     */
    function checkHit() {
        const progress = gameState.expansionProgress;
        const lowerBound = 1 - CONFIG.hitTolerance;
        const upperBound = 1 + CONFIG.hitTolerance;
        
        // Calculate accuracy in milliseconds
        const elapsed = performance.now() - expansionStartTime;
        const deltaMs = Math.round(elapsed - gameState.currentSpeed);
        gameState.lastAccuracyMs = deltaMs;
        
        return progress >= lowerBound && progress <= upperBound;
    }

    // ========================================
    // FEEDBACK & UI HELPERS
    // ========================================
    
    /**
     * Clear visual feedback classes
     */
    function clearFeedback() {
        elements.targetRing.classList.remove('success', 'fail');
        elements.pulseCircle.classList.remove('success', 'fail');
        elements.arena.classList.remove('success-pulse');
        elements.container.classList.remove('shake');
    }

    // ========================================
    // INPUT HANDLING
    // ========================================
    
    /**
     * Handle player input (click/tap)
     * @param {Event} event - The input event
     */
    function handleInput(event) {
        // Ignore input if disabled (prevents accidental restart)
        if (!gameState.inputEnabled) return;
        
        switch (gameState.current) {
            case STATES.IDLE:
            case STATES.GAMEOVER:
                // Start new game
                setState(STATES.COUNTDOWN);
                break;
                
            case STATES.PLAYING:
                // Check if hit is successful
                if (checkHit()) {
                    setState(STATES.SUCCESS);
                } else {
                    setState(STATES.GAMEOVER);
                }
                break;
                
            case STATES.COUNTDOWN:
            case STATES.SUCCESS:
                // Ignore input during these states
                break;
        }
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    
    /**
     * Initialize the game
     */
    function init() {
        // Bind input events
        elements.container.addEventListener('click', handleInput);
        elements.container.addEventListener('touchend', handleInput);
        
        // Prevent double-tap zoom on mobile
        elements.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Start in idle state
        setState(STATES.IDLE);
    }

    // Start the game when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
