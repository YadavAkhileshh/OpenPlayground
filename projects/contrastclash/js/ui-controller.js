/* ===================================
   ContrastClash - UI Controller Module
   DOM Manipulation & Visual Feedback
   =================================== */

/**
 * UI Controller - Manages all DOM interactions and visual feedback
 */

class UIController {
    constructor() {
        this.elements = {};
        this.currentColors = {
            foreground: '#000000',
            background: '#FFFFFF'
        };
        this.confettiParticles = [];
        this.animationFrameId = null;

        // Initialize DOM elements
        this.initializeElements();
        this.setupCanvas();
    }

    /**
     * Initialize all DOM element references
     */
    initializeElements() {
        // Score elements
        this.elements.score = document.getElementById('score');
        this.elements.streak = document.getElementById('streak');
        this.elements.streakFire = document.getElementById('streakFire');
        this.elements.timer = document.getElementById('timer');

        // Challenge elements
        this.elements.challengeTitle = document.getElementById('challengeTitle');
        this.elements.challengeDescription = document.getElementById('challengeDescription');
        this.elements.targetRatio = document.getElementById('targetRatio');
        this.elements.targetStandard = document.getElementById('targetStandard');

        // Color picker elements
        this.elements.bgPicker = document.getElementById('bgPicker');
        this.elements.fgPicker = document.getElementById('fgPicker');
        this.elements.bgSwatch = document.getElementById('bgSwatch');
        this.elements.fgSwatch = document.getElementById('fgSwatch');
        this.elements.bgHex = document.getElementById('bgHex');
        this.elements.fgHex = document.getElementById('fgHex');

        // Contrast display elements
        this.elements.contrastRatio = document.getElementById('contrastRatio');
        this.elements.statusIndicator = document.getElementById('statusIndicator');
        this.elements.statusText = document.getElementById('statusText');
        this.elements.textPreview = document.getElementById('textPreview');

        // Standard status elements
        this.elements.statusAA = document.getElementById('statusAA');
        this.elements.statusAALarge = document.getElementById('statusAALarge');
        this.elements.statusAAA = document.getElementById('statusAAA');
        this.elements.statusAAALarge = document.getElementById('statusAAALarge');

        // Button elements
        this.elements.submitBtn = document.getElementById('submitBtn');
        this.elements.skipBtn = document.getElementById('skipBtn');
        this.elements.hintBtn = document.getElementById('hintBtn');

        // Overlay elements
        this.elements.feedbackOverlay = document.getElementById('feedbackOverlay');
        this.elements.feedbackIcon = document.getElementById('feedbackIcon');
        this.elements.feedbackTitle = document.getElementById('feedbackTitle');
        this.elements.feedbackMessage = document.getElementById('feedbackMessage');
        this.elements.feedbackPoints = document.getElementById('feedbackPoints');

        this.elements.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.elements.finalScore = document.getElementById('finalScore');
        this.elements.challengesCompleted = document.getElementById('challengesCompleted');
        this.elements.bestStreak = document.getElementById('bestStreak');
        this.elements.accuracy = document.getElementById('accuracy');
        this.elements.playAgainBtn = document.getElementById('playAgainBtn');
        this.elements.mainMenuBtn = document.getElementById('mainMenuBtn');

        this.elements.startOverlay = document.getElementById('startOverlay');
        this.elements.modeQuick = document.getElementById('modeQuick');
        this.elements.modeTimed = document.getElementById('modeTimed');
        this.elements.modeDeceptive = document.getElementById('modeDeceptive');
        this.elements.modePrecision = document.getElementById('modePrecision');

        // Canvas
        this.elements.confettiCanvas = document.getElementById('confettiCanvas');
    }

    /**
     * Setup confetti canvas
     */
    setupCanvas() {
        if (this.elements.confettiCanvas) {
            this.elements.confettiCanvas.width = window.innerWidth;
            this.elements.confettiCanvas.height = window.innerHeight;
            this.ctx = this.elements.confettiCanvas.getContext('2d');

            // Resize canvas on window resize
            window.addEventListener('resize', () => {
                this.elements.confettiCanvas.width = window.innerWidth;
                this.elements.confettiCanvas.height = window.innerHeight;
            });
        }
    }

    /**
     * Update score display
     * @param {number} score - Current score
     */
    updateScore(score) {
        if (this.elements.score) {
            this.elements.score.textContent = score;
            this.elements.score.classList.add('animate-score');
            setTimeout(() => {
                this.elements.score.classList.remove('animate-score');
            }, 400);
        }
    }

    /**
     * Update streak display
     * @param {number} streak - Current streak
     */
    updateStreak(streak) {
        if (this.elements.streak) {
            this.elements.streak.textContent = streak;

            // Show fire emoji for streaks >= 3
            if (streak >= 3) {
                this.elements.streakFire.classList.add('active');
                this.elements.streak.classList.add('animate-streak');
                setTimeout(() => {
                    this.elements.streak.classList.remove('animate-streak');
                }, 500);
            } else {
                this.elements.streakFire.classList.remove('active');
            }
        }
    }

    /**
     * Update timer display
     * @param {number} timeRemaining - Time remaining in seconds
     */
    updateTimer(timeRemaining) {
        if (this.elements.timer) {
            this.elements.timer.textContent = timeRemaining;

            // Add warning animation when time is low
            if (timeRemaining <= 10 && timeRemaining > 0) {
                this.elements.timer.classList.add('warning');
            } else {
                this.elements.timer.classList.remove('warning');
            }
        }
    }

    /**
     * Update challenge display
     * @param {Object} challenge - Challenge object
     */
    updateChallenge(challenge) {
        if (challenge) {
            this.elements.challengeTitle.textContent = challenge.name;
            this.elements.targetRatio.textContent = ColorMath.formatRatio(challenge.targetRatio);

            // Set description based on challenge type
            let description = '';
            switch (challenge.type) {
                case 'aa':
                    description = 'Create a color combination meeting WCAG AA standard for normal text';
                    this.elements.targetStandard.textContent = '(WCAG AA)';
                    break;
                case 'aaLarge':
                    description = 'Create a color combination meeting WCAG AA standard for large text';
                    this.elements.targetStandard.textContent = '(WCAG AA Large)';
                    break;
                case 'aaa':
                    description = 'Create a color combination meeting WCAG AAA standard for normal text';
                    this.elements.targetStandard.textContent = '(WCAG AAA)';
                    break;
                case 'aaaLarge':
                    description = 'Create a color combination meeting WCAG AAA standard for large text';
                    this.elements.targetStandard.textContent = '(WCAG AAA Large)';
                    break;
                case 'precision':
                    description = 'Hit the exact target contrast ratio!';
                    this.elements.targetStandard.textContent = '(Precision)';
                    break;
            }

            this.elements.challengeDescription.textContent = description;

            // Animate challenge card
            document.querySelector('.challenge-card').classList.add('entering');
            setTimeout(() => {
                document.querySelector('.challenge-card').classList.remove('entering');
            }, 500);
        }
    }

    /**
     * Update color preview
     * @param {string} foreground - Foreground hex color
     * @param {string} background - Background hex color
     */
    updateColorPreview(foreground, background) {
        this.currentColors.foreground = foreground;
        this.currentColors.background = background;

        // Update swatches
        if (this.elements.bgSwatch) {
            this.elements.bgSwatch.style.backgroundColor = background;
            this.elements.bgSwatch.classList.add('morphing');
            setTimeout(() => {
                this.elements.bgSwatch.classList.remove('morphing');
            }, 500);
        }

        if (this.elements.fgSwatch) {
            this.elements.fgSwatch.style.backgroundColor = foreground;
            this.elements.fgSwatch.classList.add('morphing');
            setTimeout(() => {
                this.elements.fgSwatch.classList.remove('morphing');
            }, 500);
        }

        // Update hex displays
        if (this.elements.bgHex) {
            this.elements.bgHex.textContent = background.toUpperCase();
        }

        if (this.elements.fgHex) {
            this.elements.fgHex.textContent = foreground.toUpperCase();
        }

        // Update text preview
        if (this.elements.textPreview) {
            this.elements.textPreview.style.backgroundColor = background;
            this.elements.textPreview.style.color = foreground;
            this.elements.textPreview.classList.add('updating');
            setTimeout(() => {
                this.elements.textPreview.classList.remove('updating');
            }, 300);
        }

        // Update contrast ratio
        this.updateContrastRatio(foreground, background);
    }

    /**
     * Update contrast ratio display
     * @param {string} foreground - Foreground hex color
     * @param {string} background - Background hex color
     */
    updateContrastRatio(foreground, background) {
        const ratio = ColorMath.getContrastRatio(foreground, background);
        const compliance = ColorMath.getComplianceStatus(ratio);

        // Update ratio display
        if (this.elements.contrastRatio) {
            this.elements.contrastRatio.textContent = ColorMath.formatRatio(ratio);
            this.elements.contrastRatio.classList.add('updating');
            setTimeout(() => {
                this.elements.contrastRatio.classList.remove('updating');
            }, 300);
        }

        // Update status indicator
        this.updateStatusIndicator(ratio);

        // Update standard compliance indicators
        this.updateStandardIndicators(compliance);
    }

    /**
     * Update status indicator based on ratio
     * @param {number} ratio - Contrast ratio
     */
    updateStatusIndicator(ratio) {
        let statusText = '';
        let indicatorColor = '';

        if (ratio >= 7.0) {
            statusText = 'Excellent!';
            indicatorColor = '#00f2fe';
        } else if (ratio >= 4.5) {
            statusText = 'Good';
            indicatorColor = '#4facfe';
        } else if (ratio >= 3.0) {
            statusText = 'Fair';
            indicatorColor = '#fee140';
        } else {
            statusText = 'Poor';
            indicatorColor = '#ff6b6b';
        }

        if (this.elements.statusText) {
            this.elements.statusText.textContent = statusText;
        }

        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.style.backgroundColor = indicatorColor;
        }
    }

    /**
     * Update WCAG standard compliance indicators
     * @param {Object} compliance - Compliance status object
     */
    updateStandardIndicators(compliance) {
        const standards = [
            { element: this.elements.statusAA, passes: compliance.aa },
            { element: this.elements.statusAALarge, passes: compliance.aaLarge },
            { element: this.elements.statusAAA, passes: compliance.aaa },
            { element: this.elements.statusAAALarge, passes: compliance.aaaLarge }
        ];

        standards.forEach(({ element, passes }) => {
            if (element && element.parentElement) {
                const card = element.parentElement;
                if (passes) {
                    card.classList.add('pass');
                    card.classList.remove('fail');
                } else {
                    card.classList.add('fail');
                    card.classList.remove('pass');
                }
            }
        });
    }

    /**
     * Show feedback overlay
     * @param {Object} result - Challenge result
     */
    showFeedback(result) {
        if (!this.elements.feedbackOverlay) return;

        // Set feedback content
        if (result.success) {
            this.elements.feedbackIcon.textContent = '✓';
            this.elements.feedbackIcon.classList.add('success');
            this.elements.feedbackIcon.classList.remove('failure');
            this.elements.feedbackTitle.textContent = 'Success!';
            this.elements.feedbackMessage.textContent = result.message;
            this.elements.feedbackPoints.textContent = `+${result.points}`;

            // Trigger confetti
            this.triggerConfetti();
        } else {
            this.elements.feedbackIcon.textContent = '✗';
            this.elements.feedbackIcon.classList.add('failure');
            this.elements.feedbackIcon.classList.remove('success');
            this.elements.feedbackTitle.textContent = 'Try Again!';
            this.elements.feedbackMessage.textContent = result.message;
            this.elements.feedbackPoints.textContent = '+0';
        }

        // Show overlay
        this.elements.feedbackOverlay.classList.add('active');

        // Hide after 2 seconds
        setTimeout(() => {
            this.elements.feedbackOverlay.classList.remove('active');
        }, 2000);
    }

    /**
     * Show game over screen
     * @param {Object} stats - Final game statistics
     */
    showGameOver(stats) {
        if (!this.elements.gameOverOverlay) return;

        // Update stats
        this.elements.finalScore.textContent = stats.score;
        this.elements.challengesCompleted.textContent = stats.challengesCompleted;
        this.elements.bestStreak.textContent = stats.bestStreak;
        this.elements.accuracy.textContent = `${stats.accuracy}%`;

        // Show overlay
        this.elements.gameOverOverlay.classList.add('active');
    }

    /**
     * Hide game over screen
     */
    hideGameOver() {
        if (this.elements.gameOverOverlay) {
            this.elements.gameOverOverlay.classList.remove('active');
        }
    }

    /**
     * Show start screen
     */
    showStartScreen() {
        if (this.elements.startOverlay) {
            this.elements.startOverlay.classList.add('active');
        }
    }

    /**
     * Hide start screen
     */
    hideStartScreen() {
        if (this.elements.startOverlay) {
            this.elements.startOverlay.classList.remove('active');
        }
    }

    /**
     * Show hint message
     * @param {Object} hint - Hint object
     */
    showHint(hint) {
        if (!hint) return;

        // Create hint notification
        const hintElement = document.createElement('div');
        hintElement.className = 'hint-notification animate-slide-down';
        hintElement.innerHTML = `
            <div class="hint-content">
                <span class="hint-icon">💡</span>
                <p class="hint-message">${hint.message}</p>
            </div>
        `;

        // Style the hint
        hintElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--warning-gradient);
            color: var(--color-bg-dark);
            padding: 1rem 2rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 1001;
            font-weight: 600;
        `;

        document.body.appendChild(hintElement);

        // Remove after 3 seconds
        setTimeout(() => {
            hintElement.classList.add('animate-fade-out');
            setTimeout(() => {
                document.body.removeChild(hintElement);
            }, 300);
        }, 3000);

        // If hint has suggested color, update picker
        if (hint.suggestedColor) {
            this.elements.fgPicker.value = hint.suggestedColor;
        }
    }

    /**
     * Trigger confetti animation
     */
    triggerConfetti() {
        if (!this.ctx) return;

        // Create confetti particles
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fee140'];

        for (let i = 0; i < 50; i++) {
            this.confettiParticles.push({
                x: Math.random() * this.elements.confettiCanvas.width,
                y: -10,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }

        // Start animation if not already running
        if (!this.animationFrameId) {
            this.animateConfetti();
        }
    }

    /**
     * Animate confetti particles
     */
    animateConfetti() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.elements.confettiCanvas.width, this.elements.confettiCanvas.height);

        // Update and draw particles
        this.confettiParticles = this.confettiParticles.filter(particle => {
            particle.y += particle.speedY;
            particle.x += particle.speedX;
            particle.rotation += particle.rotationSpeed;

            // Draw particle
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation * Math.PI / 180);
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            this.ctx.restore();

            // Keep particle if still on screen
            return particle.y < this.elements.confettiCanvas.height;
        });

        // Continue animation if particles remain
        if (this.confettiParticles.length > 0) {
            this.animationFrameId = requestAnimationFrame(() => this.animateConfetti());
        } else {
            this.animationFrameId = null;
        }
    }

    /**
     * Add button press animation
     * @param {HTMLElement} button - Button element
     */
    animateButtonPress(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 200);
    }

    /**
     * Reset UI to initial state
     */
    reset() {
        this.updateScore(0);
        this.updateStreak(0);
        this.updateTimer(60);
        this.hideGameOver();
        this.currentColors = {
            foreground: '#000000',
            background: '#FFFFFF'
        };

        // Reset color pickers
        if (this.elements.bgPicker) this.elements.bgPicker.value = '#FFFFFF';
        if (this.elements.fgPicker) this.elements.fgPicker.value = '#000000';

        // Update preview
        this.updateColorPreview('#000000', '#FFFFFF');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
