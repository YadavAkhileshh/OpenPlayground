/**
 * @file manager.js
 * @description The backbone of the WindowPong experience. This script manages the lifecycle
 * of the game, including window spawning, state coordination, and the primary game loop.
 * 
 * CORE RESPONSIBILITIES:
 * 1. SPAWNING PADDLE AND BALL WINDOWS: Uses the window.open API to create discrete 
 *    operating system windows that act as game entities.
 * 2. EVENT ORCHESTRATION: Listens to position updates from paddles and coordinates
 *    the physics engine to calculate the ball's next position.
 * 3. SCORE MANAGEMENT: Updates the UI and triggers celebratory or failure effects.
 * 4. ROUND FLOW: Manages the transition between rounds and game-over states.
 * 5. WINDOW MANAGEMENT: Ensures secondary windows stay focused and active.
 */

(function () {
    /** 
     * UI Element References 
     * ----------------------------------------------------------------------
     */
    const elBtnLaunch = document.getElementById('btn-launch');
    const elBtnStart = document.getElementById('btn-start');
    const elBtnReset = document.getElementById('btn-reset');
    const elScoreP1 = document.getElementById('score-p1');
    const elScoreP2 = document.getElementById('score-p2');
    const elStatus = document.getElementById('status-msg');
    const elSetupRow = document.getElementById('setup-controls');
    const elGameRow = document.getElementById('game-controls');

    /**
     * Window References
     * These will hold the handles to the pop-up windows.
     * ----------------------------------------------------------------------
     */
    let winBall = null;
    let winP1 = null;
    let winP2 = null;
    let loopId = null;

    /**
     * Initialization & Event Listeners
     * ----------------------------------------------------------------------
     */

    // Initialize secondary systems
    document.addEventListener('DOMContentLoaded', async () => {
        PongParticles.init();
        PongAudio.init();

        const report = PongUtils.getSystemReport();
        PongLogger.info(`System Initialized. Display: ${report.screenWidth}x${report.screenHeight}`);

        // Boot up the terminal menu
        await PongMenu.boot();
    });

    /**
     * Sets the status message with a typing effect for better immersion.
     * @param {string} msg 
     */
    function updateStatus(msg) {
        PongEffects.type('status-msg', msg);
    }

    /**
     * Launches the game windows one by one with a delay to evade pop-up blockers
     * and provide better user feedback.
     */
    async function launchWindows() {
        PongLogger.info("Attempting to launch game windows...");

        const sw = window.screen.availWidth;
        const sh = window.screen.availHeight;

        // Configuration sets for our three game entities
        const configs = [
            {
                name: 'pong_ball',
                url: 'ball.html',
                w: 100, h: 100,
                x: (sw / 2) - 50, y: (sh / 2) - 50
            },
            {
                name: 'pong_p1',
                url: 'paddle.html?side=1',
                w: 150, h: 400,
                x: 100, y: (sh / 2) - 200
            },
            {
                name: 'pong_p2',
                url: 'paddle.html?side=2',
                w: 150, h: 400,
                x: sw - 250, y: (sh / 2) - 200
            }
        ];

        const handles = [];

        for (const config of configs) {
            const features = `width=${config.w},height=${config.h},left=${config.x},top=${config.y},menubar=no,status=no,toolbar=no,location=no,resizable=no`;

            PongLogger.info(`Opening ${config.name}...`);
            const win = window.open(config.url, config.name, features);

            if (!win) {
                PongLogger.error(`FAILED to open ${config.name}.`);
                PongLogger.warn("CAUSE: Pop-ups are likely blocked in your browser.");
                PongLogger.warn("SOLUTION: Click the 'Pop-up blocked' icon in the URL bar and select 'Always allow'.");

                alert("POP-UPS BLOCKED: Please allow pop-ups for this site to play WindowPong.");
                return null;
            }

            PongLogger.info(`Successfully opened ${config.name}.`);
            handles.push(win);

            // Sequential delay to prevent browser throttling
            await new Promise(r => setTimeout(r, 400));
        }

        return handles;
    }

    /**
     * RECOVERY & FOCUS LOGIC
     * ----------------------------------------------------------------------
     */

    /**
     * Checks if all required game windows are still open.
     */
    function checkWindowsHealth() {
        if (!winBall || winBall.closed) { PongLogger.error("Ball window lost!"); return false; }
        if (!winP1 || winP1.closed) { PongLogger.error("Player 1 window lost!"); return false; }
        if (!winP2 || winP2.closed) { PongLogger.error("Player 2 window lost!"); return false; }
        return true;
    }

    /**
     * Brings all game windows to the front. 
     * Crucial when clicking 'Start' as the focus usually remains on the terminal.
     */
    function refocusWindows() {
        if (winBall) winBall.focus();
        if (winP1) winP1.focus();
        if (winP2) winP2.focus();
        PongLogger.info("Refocusing game elements...");
    }

    elBtnLaunch.addEventListener('click', async () => {
        const windows = await launchWindows();
        if (!windows) return;

        winBall = windows[0];
        winP1 = windows[1];
        winP2 = windows[2];

        PongMenu.showGameControls();
        PongLogger.info("All windows active. Click Start Match to begin.");
    });

    elBtnStart.addEventListener('click', () => {
        if (PongState.getPhase() === 'PLAYING') return;

        if (!checkWindowsHealth()) {
            PongLogger.warn("Restart required: Some windows were closed.");
            return;
        }

        // BRING WINDOWS TO FRONT
        refocusWindows();

        PongLogger.info("Starting Match...");
        PongMenu.triggerGlitch();
        document.body.classList.add('game-start-flash');
        setTimeout(() => document.body.classList.remove('game-start-flash'), 800);

        PongState.setPhase('PLAYING');
        PongPhysics.resetBall();
        startGameLoop();

        updateStatus('MATCH IN PROGRESS');
        elBtnStart.disabled = true;
    });

    elBtnReset.addEventListener('click', () => {
        PongLogger.warn("Resetting game environment...");
        location.reload();
    });

    // --- Communication Bridge ---

    PongComm.on('PADDLE_UPDATE', (data) => {
        PongPhysics.updatePaddle(data.side, data.bounds);
        PongState.addPaddle(data.side);
    });

    // --- Central Game Loop ---

    function startGameLoop() {
        if (loopId) cancelAnimationFrame(loopId);

        function tick() {
            if (PongState.getPhase() !== 'PLAYING') return;

            // Health check periodically
            if (Math.random() < 0.01 && !checkWindowsHealth()) {
                PongState.setPhase('SETUP');
                return;
            }

            const pos = PongPhysics.updateBall();

            // Dispatch movement message to the Ball window
            PongComm.broadcast('BALL_MOVE', pos);

            const result = PongPhysics.checkCollisions();
            if (result) {
                handleEvent(result);
            }

            loopId = requestAnimationFrame(tick);
        }
        tick();
    }

    /**
     * Logic for handling hits and scores.
     * @param {string} type - Collision event type
     */
    function handleEvent(type) {
        if (type === 'HIT_P1' || type === 'HIT_P2') {
            const side = type.endsWith('1') ? '1' : '2';

            // Notify the specific paddle window to flash
            PongComm.broadcast('FLASH_HIT', { side });
            PongAudio.playHit();

            // Visual feedback on the terminal
            const x = side === '1' ? 100 : window.innerWidth - 100;
            PongParticles.spawn(x, window.innerHeight / 2, side === '1' ? '#00ff41' : '#ff00ff');

            PongLogger.info(`Speed Burst: ${Math.abs(PongPhysics.getBallPos().vx).toFixed(1)} px/f`);
            PongEffects.shake('status-msg');

        } else if (type === 'SCORE_P1' || type === 'SCORE_P2') {
            const winner = type.endsWith('1') ? 1 : 2;
            const res = PongState.updateScore(winner);

            PongLogger.warn(`POINT AWARDED TO PLAYER ${winner}`);

            elScoreP1.innerText = res.p1;
            elScoreP2.innerText = res.p2;

            // Feedback sequence
            PongComm.broadcast('MISS_FLASH');
            PongAudio.playMiss();
            PongState.setPhase('ROUND_OVER');
            PongMenu.triggerGlitch();

            updateStatus(`POINT FOR PLAYER ${winner}!`);
            PongParticles.spawn(window.innerWidth / 2, window.innerHeight / 2, '#ffffff', 60);

            setTimeout(() => {
                const globalWinner = PongState.checkVictory();
                if (globalWinner) {
                    PongAudio.playScore();
                    updateStatus(`GLORY TO PLAYER ${globalWinner}!`);
                    elBtnStart.innerText = 'Launch New Cycle';
                    elBtnStart.disabled = false;
                    PongState.setPhase('SETUP');
                    PongLogger.info(`Game concluded. Winner: Player ${globalWinner}`);
                } else {
                    updateStatus('RESYNCING ROUND...');
                    setTimeout(() => {
                        // Refocus windows before starting next round
                        refocusWindows();
                        PongPhysics.resetBall();
                        PongState.setPhase('PLAYING');
                        startGameLoop();
                    }, 1200);
                }
            }, 1000);
        }
    }

})();
