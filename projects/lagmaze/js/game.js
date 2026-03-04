/**
 * Game Engine
 * 
 * The central controller for the LagMaze application.
 * Manages the game loop, state transitions, entity updates, and system orchestration.
 * 
 * CORE RESPONSIBILITIES:
 * 1. Initialization: Sets up all subsystems (Input, Audio, Renderer, UI).
 * 2. Game Loop: Maintains a fixed timestep update loop using requestAnimationFrame.
 * 3. State Management: transitions between MENU, PLAYING, GAMEOVER, and VICTORY states.
 * 4. Input Processing: Reads buffered inputs from InputHandler and applies them based on the delay.
 * 5. Physics: Updates player position, checks collisions, and handles boundaries.
 * 6. Rendering: Delegates drawing to the Renderer and ParticleSystem.
 * 7. Audio: Triggers sound effects based on game events.
 * 
 * TECHNICAL DETAILS:
 * - Uses a delta-time based update loop for frame-rate independence.
 * - Handles the unique "Time Delay" mechanic by querying the InputHandler for inputs
 *   that are `delay` milliseconds old.
 * - Manages the Player entity state directly.
 */

class GameEngine {
    /**
     * Create a new GameEngine instance.
     * Initializes all sub-systems and sets default state.
     */
    constructor() {
        // Systems
        // InputHandler: Captures and buffers keyboard events
        this.input = new InputHandler();

        // Renderer: Handles Canvas 2D drawing
        this.renderer = new Renderer('game-canvas');

        // ParticleSystem: Manages visual effects (sparks, trails)
        this.particles = new ParticleSystem();

        // UIManager: Updates the DOM-based HUD and menus
        this.ui = new UIManager();

        // AudioSystem: Synthesizes sound effects and music
        this.audio = new AudioSystem();

        // LevelManager: Stores and parses level data
        this.levels = new LevelManager();

        // Loop controls
        this.running = false; // Is the game loop active?
        this.lastTime = 0;    // Timestamp of the last frame
        this.accumulator = 0; // Physics time accumulator (not currently used but good for fixed timestep)

        // Game State Container
        this.state = {
            status: 'MENU', // Current Game Phase: MENU, PLAYING, GAMEOVER, VICTORY
            levelIndex: 0,  // Current Level ID
            startTime: 0,   // Timestamp when the level started
            currentTime: 0, // Game time (elapsed)

            // Entities
            player: {
                x: 0,
                y: 0,
                vx: 0, // Velocity X
                vy: 0, // Velocity Y
                speed: 0,
                direction: { x: 0, y: 0 }
            },

            // Level Data (Walls, Start, End)
            level: null
        };

        // Bind loop context
        this.loop = this.loop.bind(this);
    }

    /**
     * Initialize the game.
     * Sets up event listeners for UI buttons and initializes subsystems.
     */
    init() {
        this.ui.showScreen('menu');

        // Setup UI callbacks
        // Start Game Button
        document.getElementById('btn-start').addEventListener('click', () => {
            this.audio.resume(); // AudioContext requires user gesture
            this.audio.play('ui_click');
            this.startGame();
        });

        // Tutorial Button
        document.getElementById('btn-tutorial').addEventListener('click', () => {
            this.audio.play('ui_click');
            this.ui.toggleTutorial(true);
        });

        // Close Tutorial Button
        document.getElementById('btn-close-tutorial').addEventListener('click', () => {
            this.audio.play('ui_click');
            this.ui.toggleTutorial(false);
        });

        // Retry Button (Game Over screen)
        document.getElementById('btn-retry').addEventListener('click', () => {
            this.audio.play('ui_click');
            this.restartLevel();
        });

        // Next Level Button (Victory screen)
        document.getElementById('btn-next-level').addEventListener('click', () => {
            this.audio.play('ui_click');
            this.nextLevel();
        });

        // Start input listening (but buffer won't process actions until PLAYING state)
        this.input.init();
        this.audio.init();
    }

    /**
     * Start the game loop.
     */
    startLoop() {
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    /**
     * Stop the game loop.
     */
    stopLoop() {
        this.running = false;
    }

    /**
     * Begin the game from the first level.
     */
    startGame() {
        this.loadLevel(0);
        this.state.status = 'PLAYING';
        this.ui.showScreen('hud');
        this.startLoop();
    }

    /**
     * Restart the current level.
     */
    restartLevel() {
        this.loadLevel(this.state.levelIndex);
        this.state.status = 'PLAYING';
        this.ui.showScreen('hud');
    }

    /**
     * Advance to the next level.
     * If no more levels exist, resets to menu.
     */
    nextLevel() {
        const nextIdx = this.state.levelIndex + 1;
        if (this.levels.getLevel(nextIdx)) {
            this.loadLevel(nextIdx);
            this.state.status = 'PLAYING';
            this.ui.showScreen('hud');
        } else {
            // End of content
            alert("All timelines synchronized. Resetting... (Demo Complete)");
            this.loadLevel(0);
            this.ui.showScreen('menu');
            this.state.status = 'MENU';
        }
    }

    /**
     * Load specific level data by index.
     * Resets player position and input buffer.
     * @param {number} index - The level index to load
     */
    loadLevel(index) {
        this.state.levelIndex = index;
        const levelData = this.levels.getLevel(index);
        this.state.level = levelData;

        // Reset Player State
        this.state.player = {
            x: levelData.start.x,
            y: levelData.start.y,
            vx: 0,
            vy: 0,
            speed: 0,
            direction: { x: 0, y: 0 }
        };

        // Clear collision particles
        this.particles.clear();

        // Important: Reset inputs so queue is empty
        this.input.reset();
        this.state.startTime = performance.now();
    }

    /**
     * The Main Game Loop.
     * Called via requestAnimationFrame.
     * @param {number} timestamp - Current high-resolution time
     */
    loop(timestamp) {
        if (!this.running) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.loop);
    }

    /**
     * Update game logic.
     * @param {number} deltaTime - Time elapsed since last frame (ms)
     */
    update(deltaTime) {
        if (this.state.status !== 'PLAYING') return;

        const now = performance.now();
        const levelDelay = this.state.level.delay || CONFIG.DEFAULT_DELAY_MS;

        // 1. Process delayed inputs
        // Fetch inputs that were created `levelDelay` ms ago.
        const inputs = this.input.getReadyInputs(now, levelDelay);

        inputs.forEach(input => {
            this.processInput(input);
        });

        // 2. Physics & Movement
        this.updatePhysics(deltaTime);

        // 3. Particles
        this.particles.update();

        // 4. UI Updates
        // Update the Timeline visualization.
        // We pass the *future* buffer to show what is coming up.
        this.ui.updateTimeline(this.input.getFutureBuffer(), levelDelay, now);
        this.ui.updateHUD(this.state.levelIndex + 1, now - this.state.startTime);
    }

    /**
     * Apply a single input action to the player.
     * @param {Object} input - The input event { action, type }
     */
    processInput(input) {
        const player = this.state.player;
        const dir = DIRECTIONS[input.action];

        if (input.type === 'START') {
            // Apply velocity based on direction
            if (dir) {
                this.state.player.direction = dir;

                if (input.action === 'UP') player.vy = -1;
                if (input.action === 'DOWN') player.vy = 1;
                if (input.action === 'LEFT') player.vx = -1;
                if (input.action === 'RIGHT') player.vx = 1;

                this.audio.play('move');
            }
        } else if (input.type === 'STOP') {
            // Stop logic: only stop if the key release matches current velocity direction
            if (input.action === 'UP' && player.vy === -1) player.vy = 0;
            if (input.action === 'DOWN' && player.vy === 1) player.vy = 0;
            if (input.action === 'LEFT' && player.vx === -1) player.vx = 0;
            if (input.action === 'RIGHT' && player.vx === 1) player.vx = 0;
        }

        // Normalize checks (optional, simplistic here)
    }

    /**
     * specific checks for walls, boundaries, and goal.
     * @param {number} deltaTime 
     */
    updatePhysics(deltaTime) {
        const player = this.state.player;
        const level = this.state.level;
        const speed = CONFIG.MOVE_SPEED * (deltaTime / 1000);

        // Calculate proposed position
        let nextX = player.x + player.vx * speed;
        let nextY = player.y + player.vy * speed;

        // Collision Checks
        // Check Horizontal Collision
        let collidedX = false;
        level.walls.forEach(wall => {
            if (Utils.rectCircleColliding({ x: nextX, y: player.y, r: CONFIG.PLAYER_RADIUS }, wall)) {
                collidedX = true;
            }
        });
        if (!collidedX) player.x = nextX;

        // Check Vertical Collision
        let collidedY = false;
        level.walls.forEach(wall => {
            if (Utils.rectCircleColliding({ x: player.x, y: nextY, r: CONFIG.PLAYER_RADIUS }, wall)) {
                collidedY = true;
            }
        });
        if (!collidedY) player.y = nextY;

        if (collidedX || collidedY) {
            // Collision feedback
            this.audio.play('collision');

            // Emit sparks at the approximate collision point
            const px = collidedX ?
                (player.vx > 0 ? player.x + CONFIG.PLAYER_RADIUS : player.x - CONFIG.PLAYER_RADIUS) :
                player.x;
            const py = collidedY ?
                (player.vy > 0 ? player.y + CONFIG.PLAYER_RADIUS : player.y - CONFIG.PLAYER_RADIUS) :
                player.y;

            this.particles.emit(px, py, CONFIG.COLORS.DANGER, 5);
        }

        // Emitter trail
        if (Math.abs(player.vx) > 0 || Math.abs(player.vy) > 0) {
            if (Math.random() > 0.5) {
                this.particles.emit(player.x, player.y, CONFIG.COLORS.PLAYER_GHOST, 1);
            }
        }

        // Bounds checking (Keep player inside world)
        player.x = Utils.clamp(player.x, 0, level.width * CONFIG.GRID_SIZE);
        player.y = Utils.clamp(player.y, 0, level.height * CONFIG.GRID_SIZE);

        // Goal Check
        const distToGoal = Math.hypot(player.x - level.end.x, player.y - level.end.y);
        // If close enough to enter goal
        if (distToGoal < CONFIG.PLAYER_RADIUS + CONFIG.GRID_SIZE / 2) {
            this.handleWin();
        }
    }

    /**
     * Handle Level Completion.
     */
    handleWin() {
        this.state.status = 'VICTORY';
        this.audio.play('goal');
        this.ui.showScreen('victory');

        // Celebration Fireworks
        this.particles.emit(this.state.player.x, this.state.player.y, CONFIG.COLORS.GOAL, 50);
        this.particles.emit(this.state.level.end.x, this.state.level.end.y, '#ffffff', 50);
    }

    /**
     * Render the current frame.
     */
    render() {
        this.renderer.render(this.state, this.state.level, this.particles);
    }
}
