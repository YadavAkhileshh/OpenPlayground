/**
 * Renderer System
 * 
 * Handles all HTML5 Canvas 2D rendering operations.
 * Responsible for visual presentation of the game state including:
 * - Maze grid and walls
 * - Player entity and ghosts
 * - Goals
 * - Particle effects
 * - Camera management (basic centering)
 */

class Renderer {
    /**
     * Create a Renderer instance.
     * @param {string} canvasId - The ID of the canvas element
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;

        // Visual state for effects
        this.camera = { x: 0, y: 0 };
        this.lastTime = 0;

        // Initialize size
        this.resize();

        // Handle window resizing
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Resize the canvas to fill the window.
     * Called on initialization and window resize events.
     */
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    /**
     * Clear the canvas with the background color.
     */
    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.BG;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Main Render Method.
     * Draws the entire game scene.
     * 
     * @param {Object} state - The current game state object
     * @param {Object} level - The current level data object
     * @param {ParticleSystem} particles - The particle system to render
     */
    render(state, level, particles) {
        this.clear();

        if (!state || !level) return;

        // Save context for camera/transform reset
        this.ctx.save();

        // Camera Logic:
        // Center the camera on the player.
        // We calculate the translation needed to put the player at center screen.
        const camX = -state.player.x + this.width / 2;
        const camY = -state.player.y + this.height / 2;

        this.ctx.translate(camX, camY);

        // Draw Layers
        this._drawGrid(level);
        this._drawWalls(level);
        this._drawGoal(level);
        this._drawPlayer(state.player);

        if (particles) {
            particles.render(this.ctx);
        }

        this._drawGhost(state.player); // Optional visual cue

        // Restore context to remove camera transform
        this.ctx.restore();
    }

    /**
     * Draw the background grid lines.
     * Helps visual orientation in the maze.
     * @param {Object} level 
     */
    _drawGrid(level) {
        // Only draw grid within level bounds
        const startX = 0;
        const startY = 0;
        const endX = level.width * CONFIG.GRID_SIZE;
        const endY = level.height * CONFIG.GRID_SIZE;

        this.ctx.strokeStyle = CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // Vertical lines
        for (let x = startX; x <= endX; x += CONFIG.GRID_SIZE) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += CONFIG.GRID_SIZE) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }

        this.ctx.stroke();
    }

    /**
     * Draw the maze walls.
     * Uses neon styling defined in constants.
     * @param {Object} level 
     */
    _drawWalls(level) {
        this.ctx.strokeStyle = CONFIG.COLORS.WALL_STROKE;
        this.ctx.lineWidth = 2;

        // Iterate through all walls in the level
        level.walls.forEach(wall => {
            // Fill
            this.ctx.fillStyle = CONFIG.COLORS.WALL;
            this.ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

            // Neon Glow effect (perf tweak: disable blur for walls if too slow)
            this.ctx.shadowColor = CONFIG.COLORS.PRIMARY;
            this.ctx.shadowBlur = 0;

            // Stroke border
            this.ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
        });
    }

    /**
     * Draw the goal/end zone.
     * Includes a pulsating animation effect.
     * @param {Object} level 
     */
    _drawGoal(level) {
        const { x, y } = level.end;

        this.ctx.save();
        this.ctx.translate(x, y);

        // Pulsing effect calculation
        const time = performance.now() / 500;
        const scale = 1 + Math.sin(time) * 0.1;

        this.ctx.scale(scale, scale);

        this.ctx.beginPath();
        this.ctx.arc(0, 0, CONFIG.PLAYER_RADIUS * 1.5, 0, Math.PI * 2);
        this.ctx.fillStyle = CONFIG.COLORS.GOAL;
        this.ctx.shadowColor = CONFIG.COLORS.GOAL;
        this.ctx.shadowBlur = 20; // Glow
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw the player character.
     * @param {Object} player 
     */
    _drawPlayer(player) {
        this.ctx.save();
        this.ctx.translate(player.x, player.y);

        // Main body
        this.ctx.beginPath();
        this.ctx.arc(0, 0, CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
        this.ctx.fillStyle = CONFIG.COLORS.PLAYER;
        this.ctx.shadowColor = CONFIG.COLORS.PLAYER;
        this.ctx.shadowBlur = 15; // Player Glow
        this.ctx.fill();

        // Inner core (white center)
        this.ctx.beginPath();
        this.ctx.arc(0, 0, CONFIG.PLAYER_RADIUS * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = "#fff";
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw specific visual cues for debug or effects.
     * @param {Object} player 
     */
    _drawGhost(player) {
        // Placeholder for future ghost mechanic
    }
}
