import { CONFIG } from '../Config/Constants.js';

export class UISystem {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('swap-timer');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.controlsPanel = document.getElementById('controls-panel');
        this.uiPanel = document.getElementById('ui-panel');

        // Enhance UI with some dynamic elements if they don't exist
        this.createOverlay();
    }

    createOverlay() {
        // Create a flash overlay for damage/events
        this.overlay = document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.zIndex = '10';
        document.body.appendChild(this.overlay);
    }

    updateScore(score) {
        if (this.scoreElement) this.scoreElement.textContent = score;
    }

    showGameOver(score) {
        if (this.finalScoreElement) this.finalScoreElement.textContent = score;
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.remove('hidden');
            this.gameOverScreen.style.display = 'flex';
            this.gameOverScreen.style.flexDirection = 'column';
            this.gameOverScreen.style.animation = 'fadeIn 0.5s ease-out';
        }
        if (this.controlsPanel) this.controlsPanel.style.opacity = '0.3';
    }

    hideGameOver() {
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.add('hidden');
            this.gameOverScreen.style.display = 'none';
        }
        if (this.controlsPanel) this.controlsPanel.style.opacity = '1';
    }

    flashDamage() {
        this.overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        setTimeout(() => {
            this.overlay.style.backgroundColor = 'transparent';
        }, 100);
    }

    triggerSwapEffect() {
        this.overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        setTimeout(() => {
            this.overlay.style.backgroundColor = 'transparent';
        }, 100);
    }
}
