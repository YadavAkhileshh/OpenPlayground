/**
 * UIManager.js
 * Handles UI overlays, HUD updates, and menu interactions.
 */

import { eventManager } from '../core/EventManager.js';
import { Events, GameStates } from '../core/Settings.js';

export class UIManager {
    constructor() {
        // Elements
        this.startScreen = document.getElementById('start-screen');
        this.hud = document.getElementById('hud');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.loadingScreen = document.getElementById('loading-screen');

        this.scoreValue = document.getElementById('score-value');
        this.finalScoreValue = document.getElementById('final-score-value');
        this.inkMeterBar = document.getElementById('ink-meter-bar');

        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');

        this.setupListeners();
    }

    setupListeners() {
        this.startBtn.addEventListener('click', () => {
            eventManager.emit(Events.GAME_START);
            this.showHUD();
        });

        this.restartBtn.addEventListener('click', () => {
            eventManager.emit(Events.GAME_START); // Restart acts as start
            this.showHUD();
        });

        // Listen for game events
        eventManager.on(Events.GAME_OVER, (data) => {
            this.showGameOver(data ? data.score : 0);
        });

        eventManager.on(Events.SCORE_UPDATE, (score) => {
            this.updateScore(score);
        });

        // Hide loading screen initially if manual override needed, though Game.js handles state
        this.loadingScreen.classList.add('hidden');
    }

    showStartScreen() {
        this.hideAll();
        this.startScreen.classList.remove('hidden');
    }

    showHUD() {
        this.hideAll();
        this.hud.classList.remove('hidden');
    }

    showGameOver(score) {
        this.hideAll();
        this.finalScoreValue.innerText = Math.floor(score);
        this.gameOverScreen.classList.remove('hidden');
    }

    hideAll() {
        this.startScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.loadingScreen.classList.add('hidden');
    }

    updateScore(score) {
        this.scoreValue.innerText = Math.floor(score);
    }

    updateInkMeter(percentage) {
        this.inkMeterBar.style.transform = `scaleX(${percentage})`;
    }
}
