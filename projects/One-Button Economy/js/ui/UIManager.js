/**
 * UIManager.js
 * 
 * Manages the DOM-based UI.
 */

import { GameEvents } from '../core/EventManager.js';
import { EVENTS } from '../core/Constants.js';

export class UIManager {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-ui'),
            gameOver: document.getElementById('game-over-screen')
        };

        this.elements = {
            score: document.getElementById('score-display'),
            health: document.getElementById('health-display'),
            level: document.getElementById('level-display'),
            messages: document.getElementById('message-log'),
            finalScore: document.getElementById('final-score')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        GameEvents.on(EVENTS.GAME_START, () => this.showScreen('game'));
        GameEvents.on(EVENTS.GAME_OVER, (score) => this.showGameOver(score));

        GameEvents.on(EVENTS.SCORE_UPDATED, (score) => {
            if (this.elements.score) this.elements.score.innerText = `Score: ${score}`;
        });

        GameEvents.on(EVENTS.ENTITY_DAMAGED, (data) => {
            // If player, update health
            // We'd need to know if it's the player. 
            // Ideally GameManager passes exact health values via an event.
        });

        GameEvents.on('UPDATE_UI', (data) => {
            if (this.elements.health && data.health !== undefined) {
                this.elements.health.innerText = `HP: ${Math.floor(data.health)}`;
                this.elements.health.style.width = `${data.health}%`; // Simple bar
            }
            if (this.elements.level && data.level !== undefined) {
                this.elements.level.innerText = `Level: ${data.level}`;
            }
        });

        GameEvents.on(EVENTS.MESSAGE_LOGGED, (msg) => this.logMessage(msg));
    }

    showScreen(screenName) {
        // Hide all
        Object.values(this.screens).forEach(el => {
            if (el) el.style.display = 'none';
        });

        // Show target
        if (this.screens[screenName]) {
            this.screens[screenName].style.display = 'flex'; // or block
        }
    }

    showGameOver(score) {
        this.showScreen('gameOver');
        if (this.elements.finalScore) {
            this.elements.finalScore.innerText = score;
        }
    }

    logMessage(msg) {
        if (!this.elements.messages) return;

        const el = document.createElement('div');
        el.className = 'ui-message';
        el.innerText = msg;

        this.elements.messages.appendChild(el);

        // Fade out remove
        setTimeout(() => {
            el.style.opacity = 0;
            setTimeout(() => el.remove(), 500);
        }, 3000);

        // Auto scroll
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
}
