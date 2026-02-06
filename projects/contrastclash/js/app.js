/* ===================================
   ContrastClash - Main Application
   Application Orchestration & Event Handling
   =================================== */

/**
 * Main Application - Coordinates game engine and UI controller
 */

class ContrastClashApp {
    constructor() {
        this.gameEngine = null;
        this.uiController = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    init() {
        if (this.isInitialized) return;

        // Initialize game engine and UI controller
        this.gameEngine = new GameEngine();
        this.uiController = new UIController();

        // Setup event listeners
        this.setupEventListeners();

        // Show start screen
        this.uiController.showStartScreen();

        this.isInitialized = true;

        console.log('ContrastClash initialized successfully!');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Color picker events
        this.uiController.elements.bgPicker.addEventListener('input', (e) => {
            this.handleColorChange();
        });

        this.uiController.elements.fgPicker.addEventListener('input', (e) => {
            this.handleColorChange();
        });

        // Button events
        this.uiController.elements.submitBtn.addEventListener('click', () => {
            this.handleSubmit();
        });

        this.uiController.elements.skipBtn.addEventListener('click', () => {
            this.handleSkip();
        });

        this.uiController.elements.hintBtn.addEventListener('click', () => {
            this.handleHint();
        });

        // Game over screen buttons
        this.uiController.elements.playAgainBtn.addEventListener('click', () => {
            this.handlePlayAgain();
        });

        this.uiController.elements.mainMenuBtn.addEventListener('click', () => {
            this.handleMainMenu();
        });

        // Mode selection buttons
        this.uiController.elements.modeQuick.addEventListener('click', () => {
            this.startGame('quick');
        });

        this.uiController.elements.modeTimed.addEventListener('click', () => {
            this.startGame('timed');
        });

        this.uiController.elements.modeDeceptive.addEventListener('click', () => {
            this.startGame('deceptive');
        });

        this.uiController.elements.modePrecision.addEventListener('click', () => {
            this.startGame('precision');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Setup timer update interval
        setInterval(() => {
            this.updateGameState();
        }, 100);
    }

    /**
     * Start a new game
     * @param {string} mode - Game mode
     */
    startGame(mode) {
        // Hide start screen
        this.uiController.hideStartScreen();

        // Reset UI
        this.uiController.reset();

        // Start game engine
        this.gameEngine.startGame(mode);

        // Update UI with initial challenge
        const state = this.gameEngine.getState();
        this.uiController.updateChallenge(state.currentChallenge);
        this.uiController.updateScore(state.score);
        this.uiController.updateStreak(state.streak);

        // Set initial colors
        const bgColor = this.uiController.elements.bgPicker.value;
        const fgColor = this.uiController.elements.fgPicker.value;
        this.uiController.updateColorPreview(fgColor, bgColor);

        // For deceptive mode, set suggested colors
        if (mode === 'deceptive' && state.currentChallenge.suggestedBackground) {
            this.uiController.elements.bgPicker.value = state.currentChallenge.suggestedBackground;
            if (state.currentChallenge.deceptiveForeground) {
                this.uiController.elements.fgPicker.value = state.currentChallenge.deceptiveForeground;
            }
            this.handleColorChange();
        }

        console.log(`Game started in ${mode} mode`);
    }

    /**
     * Handle color picker changes
     */
    handleColorChange() {
        const bgColor = this.uiController.elements.bgPicker.value;
        const fgColor = this.uiController.elements.fgPicker.value;

        // Update UI preview
        this.uiController.updateColorPreview(fgColor, bgColor);
    }

    /**
     * Handle submit button click
     */
    handleSubmit() {
        if (this.gameEngine.gameState !== 'playing') return;

        const bgColor = this.uiController.elements.bgPicker.value;
        const fgColor = this.uiController.elements.fgPicker.value;

        // Submit challenge
        const result = this.gameEngine.submitChallenge(fgColor, bgColor);

        // Show feedback
        this.uiController.showFeedback(result);

        // Animate button
        this.uiController.animateButtonPress(this.uiController.elements.submitBtn);

        // Update UI
        const state = this.gameEngine.getState();
        this.uiController.updateScore(state.score);
        this.uiController.updateStreak(state.streak);

        // Update challenge after delay
        setTimeout(() => {
            if (this.gameEngine.gameState === 'playing') {
                this.uiController.updateChallenge(state.currentChallenge);
            }
        }, 2100);

        console.log('Challenge submitted:', result);
    }

    /**
     * Handle skip button click
     */
    handleSkip() {
        if (this.gameEngine.gameState !== 'playing') return;

        // Skip challenge
        this.gameEngine.skipChallenge();

        // Animate button
        this.uiController.animateButtonPress(this.uiController.elements.skipBtn);

        // Update UI
        const state = this.gameEngine.getState();
        this.uiController.updateChallenge(state.currentChallenge);
        this.uiController.updateStreak(state.streak);

        console.log('Challenge skipped');
    }

    /**
     * Handle hint button click
     */
    handleHint() {
        if (this.gameEngine.gameState !== 'playing') return;

        const bgColor = this.uiController.elements.bgPicker.value;
        const fgColor = this.uiController.elements.fgPicker.value;

        // Get hint
        const hint = this.gameEngine.getHint(fgColor, bgColor);

        // Show hint
        this.uiController.showHint(hint);

        // Animate button
        this.uiController.animateButtonPress(this.uiController.elements.hintBtn);

        // Update color if hint has suggestion
        if (hint && hint.suggestedColor) {
            setTimeout(() => {
                this.handleColorChange();
            }, 100);
        }

        console.log('Hint requested:', hint);
    }

    /**
     * Handle play again button click
     */
    handlePlayAgain() {
        // Hide game over screen
        this.uiController.hideGameOver();

        // Get last game mode
        const lastMode = this.gameEngine.gameMode;

        // Start new game with same mode
        this.startGame(lastMode);

        console.log('Playing again');
    }

    /**
     * Handle main menu button click
     */
    handleMainMenu() {
        // Hide game over screen
        this.uiController.hideGameOver();

        // Reset game engine
        this.gameEngine.reset();

        // Show start screen
        this.uiController.showStartScreen();

        console.log('Returned to main menu');
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyPress(e) {
        // Only handle shortcuts during gameplay
        if (this.gameEngine.gameState !== 'playing') return;

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.handleSubmit();
                break;
            case 'h':
            case 'H':
                e.preventDefault();
                this.handleHint();
                break;
            case 's':
            case 'S':
                e.preventDefault();
                this.handleSkip();
                break;
            case 'Escape':
                e.preventDefault();
                this.gameEngine.pauseGame();
                break;
        }
    }

    /**
     * Update game state (called periodically)
     */
    updateGameState() {
        if (this.gameEngine.gameState !== 'playing') return;

        const state = this.gameEngine.getState();

        // Update timer if game has time limit
        if (state.timeRemaining > 0) {
            this.uiController.updateTimer(state.timeRemaining);
        }

        // Check if game should end
        if (state.gameState === 'gameOver') {
            this.handleGameOver();
        }
    }

    /**
     * Handle game over
     */
    handleGameOver() {
        const stats = this.gameEngine.endGame();
        this.uiController.showGameOver(stats);

        console.log('Game over:', stats);
    }

    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getState() {
        return {
            engine: this.gameEngine.getState(),
            colors: this.uiController.currentColors
        };
    }
}

// Initialize app when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new ContrastClashApp();
    app.init();
});

// Expose app globally for debugging
window.ContrastClashApp = app;
