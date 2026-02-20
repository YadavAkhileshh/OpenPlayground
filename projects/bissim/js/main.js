/**
 * @fileoverview Main entry point for BiasSim.
 * Orchestrates the application flow: Setup -> Injection -> Interaction -> Reveal.
 */

import { SCENARIOS } from './data/scenarios.js';
import { randomChoice, shuffle } from './utils/math.js';
import { biasManager } from './engine/bias/biasManager.js';
import { logger } from './engine/tracking/interactLog.js';
import { mouseTracker } from './engine/tracking/mouseTracker.js';
import { calculator } from './engine/analytics/calculator.js';
import { insights } from './engine/analytics/insights.js';
import { renderer } from './ui/renderer.js';
import { animator } from './ui/animations.js';
import { visualizer } from './ui/visualizer.js';
import { $ } from './utils/dom.js';

class BiasSimApp {
    constructor() {
        this.currentScenario = null;
        this.startTime = null;
        this.timerInterval = null;
    }

    /**
     * Initializes the application.
     */
    init() {
        console.log('BiasSim Initializing...');

        // 1. Select a Random Scenario
        const baseScenario = randomChoice(SCENARIOS);

        // 2. Apply Bias
        // The manager chooses a strategy (Decoy, Scarcity, etc) and modifies products
        this.currentScenario = biasManager.applyRandomBias(baseScenario);

        // 3. Update UI Header
        $('#session-id').textContent = `Session: ${logger.sessionId.substring(0, 8)}`;
        $('.logo .version').textContent = `v1.0 (${biasManager.activeBiasType.toUpperCase()})`;

        // 4. Start Tracking Engines
        const targetId = biasManager.getTargetId();
        logger.init(targetId);
        mouseTracker.start();

        // 5. Render UI
        // Shuffle products so the "target" isn't always in same spot (unless specific bias needs order like Decoy)
        // Note: Decoy injection inserts specific position, so we might NOT want to shuffle fully if order matters.
        // For Decoy, usually target + decoy should be close.
        // Let's rely on the bias engine to have ordered them if needed, or shuffle if not.
        // For now, we render as is to preserve logic of bias engine.
        renderer.render(this.currentScenario.products, this.handleSelection.bind(this));

        // 6. Start Timer
        this.startTimer();

        // 7. Initialize Listeners
        this.setupEventListeners();

        console.log('BiasSim Ready.');
    }

    /**
     * Handles the user selecting a product.
     * @param {string} productId 
     */
    async handleSelection(productId) {
        // Stop tracking
        this.stopTimer();
        mouseTracker.stop();
        logger.recordSelection(productId);

        // Trigger Animations
        await animator.playRevealSequence();

        // Calculate Results
        this.generateReport();
    }

    /**
     * Generates and visualizes the post-experiment report.
     */
    generateReport() {
        // 1. Get raw session data
        const sessionData = logger.exportSession();

        // 2. Calculate Influence Score
        const score = calculator.calculateScore(sessionData);

        // 3. Generate Textual Insights
        const biasInfo = biasManager.getExplanation();
        const insightHtml = insights.generateInsight(sessionData, biasInfo);

        // 4. Visualize Mouse Path
        const pathData = mouseTracker.getPath();
        visualizer.renderMousePath(pathData);

        // 5. Update Dashboard DOM
        visualizer.updateDashboard({
            score,
            duration: sessionData.duration,
            insightHtml
        });
    }

    /**
     * Starts the header timer.
     */
    startTimer() {
        this.startTime = Date.now();
        const timerEl = $('#timer');

        this.timerInterval = setInterval(() => {
            const delta = Math.floor((Date.now() - this.startTime) / 1000);
            const m = Math.floor(delta / 60).toString().padStart(2, '0');
            const s = (delta % 60).toString().padStart(2, '0');
            timerEl.textContent = `${m}:${s}`;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    setupEventListeners() {
        // Restart Button
        $('#btn-restart').addEventListener('click', () => {
            window.location.reload();
        });

        // Details Button (could just show raw JSON log)
        $('#btn-details').addEventListener('click', () => {
            console.log(logger.exportSession());
            alert('Full session logs dumped to Console.');
        });
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    const app = new BiasSimApp();
    app.init();
});
