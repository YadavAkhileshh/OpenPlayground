/**
 * UI Manager
 * Handles HUD updates, menus, and the timeline visualization
 */

class UIManager {
    constructor() {
        // Elements
        this.hud = document.getElementById('hud');
        this.levelDisplay = document.getElementById('current-level');
        this.timerDisplay = document.getElementById('elapsed-time');
        this.timelineTrack = document.getElementById('timeline-track');
        this.delayDisplay = document.getElementById('delay-ms');

        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.victoryOverlay = document.getElementById('victory-overlay');
        this.tutorialPanel = document.getElementById('tutorial-panel');

        this.markers = []; // Pool of DOM elements for timeline
    }

    /**
     * Update the visual timeline with buffered inputs
     * @param {Array} buffer - The input buffer from InputHandler
     * @param {number} delay - The current delay in ms
     * @param {number} currentTime - The current game time
     */
    updateTimeline(buffer, delay, currentTime) {
        // Clear existing markers (naive approach, could optimize with object pooling)
        this.timelineTrack.innerHTML = '<div id="timeline-cursor"></div>';

        // The track represents a window of time. 
        // Let's say the track width represents [currentTime - delay, currentTime + future]
        // Actually, the "Delay" line is fixed.
        // We want to show inputs traveling towards the "Execute" line.
        // Execute Line is at 20% from left? Or let's make Execute Line the left edge?
        // Let's say:
        // Left Edge = Execution Time (Current Time - Delay)
        // Right Edge = Buffer Future

        // A better visualization:
        // A conveyor belt moving Left.
        // Fixed cursor at some point.

        // Let's stick to the plan:
        // The "Cursor" at 20% mark represents "NOW" (Input Time).
        // Inputs appear at the Cursor.
        // They drift to the RIGHT? No, they drift to the Left to be executed? 
        // "Delay" means execution happens LATER.
        // So logic: Input happens at T. Execution at T+Delay.
        // If we view time flowing Left to Right:
        // T is on the left. T+Delay is on the right.
        // But usually "Incoming" events flow Right to Left (like DDR).

        // Let's try:
        // Cursor line is "Action Execution".
        // Inputs spawn at "Action Created" distance and move towards Cursor.

        // Distance = Delay.
        // Input created at T.
        // executed at T + Delay.
        // Current Game Time = G.

        // We want to see inputs that are WAITING to be executed.
        // These inputs have timestamp > (G - Delay).
        // They will be executed when timestamp == (G - Delay).
        // So effectively, they are "in the future" of the Game State.

        // Visual:
        // | Execution Line (Left) | ------------------ | Input Line (Right) |
        // Inputs travel Left.

        const trackWidth = this.timelineTrack.clientWidth;
        // Map delay to width.
        // If Delay is 1000ms.
        // Position 0 = Executing Now.
        // Position 100% = Inputting Now (1000ms in future relative to game state).

        // If an input has timestamp `ts`.
        // It executes at `ts + Delay`.
        // We are currently at `G` (System Time? No, Game Logic Time matches Real Time usually).
        // Wait, "Delayed execution" means:
        // Logic processes events from `Performance.now() - Delay`.

        // So:
        // Execution Pointer = Now - Delay.
        // Input Pointer = Now.

        // For a buffered input with timestamp `ts`.
        // It is `ts - (Now - Delay)` milliseconds away from execution.
        // value = `ts - Now + Delay`.
        // When `ts == Now` (just created), value = Delay. (Right side)
        // When `ts == Now - Delay` (execution), value = 0. (Left side)

        // So Position % = (ts - (Now - Delay)) / Delay * 100
        //                = (ts - Now + Delay) / Delay * 100

        const now = performance.now();
        const executionTime = now - delay;

        buffer.forEach(input => {
            const timeUntilExecution = input.timestamp - executionTime;
            const pct = (timeUntilExecution / delay) * 100;

            if (pct >= 0 && pct <= 100) {
                const el = document.createElement('div');
                el.className = 'timeline-marker';
                el.style.left = `${pct}%`;
                this.timelineTrack.appendChild(el);
            }
        });

        // Update delay text
        this.delayDisplay.textContent = delay;
    }

    updateHUD(level, time) {
        this.levelDisplay.textContent = level;
        this.timerDisplay.textContent = Utils.formatTime(time);
    }

    showScreen(screenId) {
        this.hud.classList.add('hidden');
        this.menuOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
        this.victoryOverlay.classList.add('hidden');
        this.tutorialPanel.classList.add('hidden'); // usually separate overlay logic

        if (screenId === 'hud') {
            this.hud.classList.remove('hidden');
        } else if (screenId === 'menu') {
            this.menuOverlay.classList.remove('hidden');
        } else if (screenId === 'gameover') {
            this.gameOverOverlay.classList.remove('hidden');
        } else if (screenId === 'victory') {
            this.victoryOverlay.classList.remove('hidden');
        }
    }

    toggleTutorial(show) {
        if (show) {
            this.tutorialPanel.classList.remove('hidden');
        } else {
            this.tutorialPanel.classList.add('hidden');
        }
    }
}
