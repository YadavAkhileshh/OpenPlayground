/* ===================================
   ContrastClash - Game Engine Module
   Game Logic, Challenges & Scoring
   =================================== */

/**
 * Game Engine - Manages game state, challenges, and scoring
 */

class GameEngine {
    constructor() {
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.gameMode = 'quick'; // quick, timed, deceptive, precision
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.challengesCompleted = 0;
        this.challengesFailed = 0;
        this.currentChallenge = null;
        this.timeRemaining = 60;
        this.timerInterval = null;
        this.startTime = null;
        this.hintsUsed = 0;

        // Challenge types and their requirements
        this.challengeTypes = {
            aa: { name: 'WCAG AA Normal', ratio: 4.5, tolerance: 0.3 },
            aaLarge: { name: 'WCAG AA Large', ratio: 3.0, tolerance: 0.3 },
            aaa: { name: 'WCAG AAA Normal', ratio: 7.0, tolerance: 0.3 },
            aaaLarge: { name: 'WCAG AAA Large', ratio: 4.5, tolerance: 0.3 },
            precision: { name: 'Precision Target', ratio: 0, tolerance: 0.2 } // Ratio set dynamically
        };

        // Difficulty settings
        this.difficulty = {
            quick: { timeLimit: 0, pointsMultiplier: 1, streakBonus: 10 },
            timed: { timeLimit: 60, pointsMultiplier: 1.5, streakBonus: 15 },
            deceptive: { timeLimit: 90, pointsMultiplier: 2, streakBonus: 20 },
            precision: { timeLimit: 120, pointsMultiplier: 2.5, streakBonus: 25 }
        };

        // Load high scores from localStorage
        this.loadHighScores();
    }

    /**
     * Initialize a new game
     * @param {string} mode - Game mode (quick, timed, deceptive, precision)
     */
    startGame(mode = 'quick') {
        this.gameMode = mode;
        this.gameState = 'playing';
        this.score = 0;
        this.streak = 0;
        this.challengesCompleted = 0;
        this.challengesFailed = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();

        // Set time limit based on mode
        const modeSettings = this.difficulty[mode];
        this.timeRemaining = modeSettings.timeLimit;

        // Start timer if mode has time limit
        if (this.timeRemaining > 0) {
            this.startTimer();
        }

        // Generate first challenge
        this.generateChallenge();
    }

    /**
     * Start the game timer
     */
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    /**
     * Stop the game timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Generate a new challenge based on game mode
     */
    generateChallenge() {
        let challengeType;

        switch (this.gameMode) {
            case 'quick':
            case 'timed':
                // Random standard challenge
                const types = ['aa', 'aaLarge', 'aaa', 'aaaLarge'];
                challengeType = types[Math.floor(Math.random() * types.length)];
                break;

            case 'deceptive':
                // Deceptive challenges with similar-looking colors
                challengeType = Math.random() > 0.5 ? 'aa' : 'aaa';
                break;

            case 'precision':
                // Precision challenges with specific ratio targets
                challengeType = 'precision';
                break;

            default:
                challengeType = 'aa';
        }

        const challenge = this.createChallenge(challengeType);
        this.currentChallenge = challenge;

        return challenge;
    }

    /**
     * Create a challenge object
     * @param {string} type - Challenge type
     * @returns {Object} Challenge object
     */
    createChallenge(type) {
        const challengeConfig = this.challengeTypes[type];
        let targetRatio = challengeConfig.ratio;

        // For precision mode, generate random target ratio
        if (type === 'precision') {
            targetRatio = 3.0 + Math.random() * 10; // Random ratio between 3 and 13
        }

        const challenge = {
            type: type,
            name: challengeConfig.name,
            targetRatio: targetRatio,
            tolerance: challengeConfig.tolerance,
            startTime: Date.now(),
            hintsUsed: 0
        };

        // For deceptive mode, generate starting colors
        if (this.gameMode === 'deceptive') {
            const baseColor = ColorMath.generateRandomColor();
            challenge.suggestedBackground = baseColor;
            challenge.deceptiveForeground = ColorMath.generateDeceptiveColor(baseColor);
        }

        return challenge;
    }

    /**
     * Check if the current color combination meets the challenge requirements
     * @param {string} foreground - Foreground hex color
     * @param {string} background - Background hex color
     * @returns {Object} Result object with success status and details
     */
    checkChallenge(foreground, background) {
        if (!this.currentChallenge) {
            return { success: false, message: 'No active challenge' };
        }

        const ratio = ColorMath.getContrastRatio(foreground, background);
        const target = this.currentChallenge.targetRatio;
        const tolerance = this.currentChallenge.tolerance;

        // Check if ratio is within tolerance
        const difference = Math.abs(ratio - target);
        const success = difference <= tolerance || ratio >= target;

        // Calculate time taken
        const timeTaken = (Date.now() - this.currentChallenge.startTime) / 1000;

        // Calculate points
        let points = 0;
        if (success) {
            points = this.calculatePoints(timeTaken, difference, this.currentChallenge.hintsUsed);
        }

        return {
            success: success,
            ratio: ratio,
            target: target,
            difference: difference,
            timeTaken: timeTaken,
            points: points,
            message: this.getResultMessage(success, ratio, target)
        };
    }

    /**
     * Calculate points for a successful challenge
     * @param {number} timeTaken - Time taken in seconds
     * @param {number} difference - Difference from target ratio
     * @param {number} hintsUsed - Number of hints used
     * @returns {number} Points earned
     */
    calculatePoints(timeTaken, difference, hintsUsed) {
        const modeSettings = this.difficulty[this.gameMode];

        // Base points
        let points = 100;

        // Speed bonus (faster = more points)
        if (timeTaken < 5) {
            points += 50;
        } else if (timeTaken < 10) {
            points += 30;
        } else if (timeTaken < 15) {
            points += 10;
        }

        // Accuracy bonus (closer to target = more points)
        if (difference < 0.1) {
            points += 50; // Perfect match
        } else if (difference < 0.2) {
            points += 25;
        }

        // Streak bonus
        points += this.streak * modeSettings.streakBonus;

        // Mode multiplier
        points = Math.floor(points * modeSettings.pointsMultiplier);

        // Hint penalty
        points -= hintsUsed * 20;

        return Math.max(0, points);
    }

    /**
     * Submit the current challenge answer
     * @param {string} foreground - Foreground hex color
     * @param {string} background - Background hex color
     * @returns {Object} Result object
     */
    submitChallenge(foreground, background) {
        const result = this.checkChallenge(foreground, background);

        if (result.success) {
            this.handleSuccess(result);
        } else {
            this.handleFailure(result);
        }

        return result;
    }

    /**
     * Handle successful challenge completion
     * @param {Object} result - Challenge result
     */
    handleSuccess(result) {
        this.score += result.points;
        this.streak++;
        this.challengesCompleted++;

        if (this.streak > this.bestStreak) {
            this.bestStreak = this.streak;
        }

        // Generate next challenge after a short delay
        setTimeout(() => {
            this.generateChallenge();
        }, 100);
    }

    /**
     * Handle failed challenge
     * @param {Object} result - Challenge result
     */
    handleFailure(result) {
        this.streak = 0;
        this.challengesFailed++;

        // In quick mode, allow retry
        if (this.gameMode === 'quick') {
            // Keep same challenge
        } else {
            // Generate new challenge
            setTimeout(() => {
                this.generateChallenge();
            }, 100);
        }
    }

    /**
     * Skip the current challenge
     */
    skipChallenge() {
        this.streak = 0;
        this.challengesFailed++;
        this.generateChallenge();
    }

    /**
     * Get a hint for the current challenge
     * @param {string} currentFg - Current foreground color
     * @param {string} currentBg - Current background color
     * @returns {Object} Hint object
     */
    getHint(currentFg, currentBg) {
        if (!this.currentChallenge) {
            return null;
        }

        this.currentChallenge.hintsUsed++;
        this.hintsUsed++;

        const currentRatio = ColorMath.getContrastRatio(currentFg, currentBg);
        const targetRatio = this.currentChallenge.targetRatio;

        let hintMessage = '';
        let hintColor = null;

        if (currentRatio < targetRatio) {
            hintMessage = 'Increase contrast - try a lighter or darker color';
            hintColor = ColorMath.getHintColor(currentBg, currentFg, targetRatio);
        } else if (currentRatio > targetRatio + this.currentChallenge.tolerance) {
            hintMessage = 'Decrease contrast - try a color closer to the background';
        } else {
            hintMessage = 'You\'re very close! Fine-tune your selection';
        }

        return {
            message: hintMessage,
            suggestedColor: hintColor,
            currentRatio: currentRatio,
            targetRatio: targetRatio
        };
    }

    /**
     * Get result message based on success and ratio
     * @param {boolean} success - Whether challenge was successful
     * @param {number} ratio - Actual contrast ratio
     * @param {number} target - Target contrast ratio
     * @returns {string} Result message
     */
    getResultMessage(success, ratio, target) {
        if (success) {
            const difference = Math.abs(ratio - target);
            if (difference < 0.1) {
                return '🎯 Perfect! Exact match!';
            } else if (difference < 0.3) {
                return '✨ Excellent! Very close!';
            } else {
                return '✓ Success! Challenge completed!';
            }
        } else {
            if (ratio < target) {
                return '❌ Not enough contrast. Try again!';
            } else {
                return '❌ Too much contrast for this challenge!';
            }
        }
    }

    /**
     * End the current game
     */
    endGame() {
        this.gameState = 'gameOver';
        this.stopTimer();

        // Calculate final stats
        const totalChallenges = this.challengesCompleted + this.challengesFailed;
        const accuracy = totalChallenges > 0
            ? Math.round((this.challengesCompleted / totalChallenges) * 100)
            : 0;

        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);

        const finalStats = {
            score: this.score,
            challengesCompleted: this.challengesCompleted,
            challengesFailed: this.challengesFailed,
            bestStreak: this.bestStreak,
            accuracy: accuracy,
            gameTime: gameTime,
            hintsUsed: this.hintsUsed,
            mode: this.gameMode
        };

        // Save high score
        this.saveHighScore(finalStats);

        return finalStats;
    }

    /**
     * Pause the game
     */
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopTimer();
        }
    }

    /**
     * Resume the game
     */
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            if (this.difficulty[this.gameMode].timeLimit > 0) {
                this.startTimer();
            }
        }
    }

    /**
     * Load high scores from localStorage
     */
    loadHighScores() {
        try {
            const stored = localStorage.getItem('contrastClashHighScores');
            this.highScores = stored ? JSON.parse(stored) : {
                quick: [],
                timed: [],
                deceptive: [],
                precision: []
            };
        } catch (error) {
            console.error('Error loading high scores:', error);
            this.highScores = {
                quick: [],
                timed: [],
                deceptive: [],
                precision: []
            };
        }
    }

    /**
     * Save high score to localStorage
     * @param {Object} stats - Game statistics
     */
    saveHighScore(stats) {
        try {
            const modeScores = this.highScores[stats.mode] || [];

            // Add new score
            modeScores.push({
                score: stats.score,
                date: new Date().toISOString(),
                accuracy: stats.accuracy,
                streak: stats.bestStreak
            });

            // Sort by score (descending) and keep top 10
            modeScores.sort((a, b) => b.score - a.score);
            this.highScores[stats.mode] = modeScores.slice(0, 10);

            // Save to localStorage
            localStorage.setItem('contrastClashHighScores', JSON.stringify(this.highScores));
        } catch (error) {
            console.error('Error saving high score:', error);
        }
    }

    /**
     * Get high scores for a specific mode
     * @param {string} mode - Game mode
     * @returns {Array} Array of high scores
     */
    getHighScores(mode) {
        return this.highScores[mode] || [];
    }

    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getState() {
        return {
            gameState: this.gameState,
            gameMode: this.gameMode,
            score: this.score,
            streak: this.streak,
            bestStreak: this.bestStreak,
            challengesCompleted: this.challengesCompleted,
            challengesFailed: this.challengesFailed,
            timeRemaining: this.timeRemaining,
            currentChallenge: this.currentChallenge,
            hintsUsed: this.hintsUsed
        };
    }

    /**
     * Reset the game engine
     */
    reset() {
        this.stopTimer();
        this.gameState = 'menu';
        this.score = 0;
        this.streak = 0;
        this.challengesCompleted = 0;
        this.challengesFailed = 0;
        this.currentChallenge = null;
        this.timeRemaining = 60;
        this.hintsUsed = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
