/**
 * SCRIPT.JS - Main Game Engine
 * Handles game loop, initialization, input, and state management
 */

class Game {
  constructor() {
    // Canvas setup
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = CONFIG.CANVAS.WIDTH;
    this.canvas.height = CONFIG.CANVAS.HEIGHT;

    // Game state
    this.state = CONFIG.GAME_STATES.MENU;
    this.score = 0;
    this.goldCollected = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.difficulty = 1;

    // Game entities
    this.player = new Player(CONFIG.PLAYER.START_X, CONFIG.PLAYER.START_Y);
    this.obstacles = [];
    this.goldCoins = [];
    this.particles = [];

    // Input tracking
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
    };

    // Timers
    this.lastObstacleSpawn = 0;
    this.lastGoldSpawn = 0;
    this.obstacleSpawnRate = CONFIG.OBSTACLES.SPAWN_RATE;

    // Effects
    this.screenShake = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    // Animation frame
    this.animationFrameId = null;

    // UI elements
    this.scoreElement = document.getElementById("score");
    this.goldElement = document.getElementById("gold");
    this.timeElement = document.getElementById("time");
    this.startBtn = document.getElementById("startBtn");
    this.restartBtn = document.getElementById("restartBtn");
    this.gameOverDiv = document.getElementById("gameOver");

    // Initialize
    this.init();
  }

  /**
   * Initialize game and setup event listeners
   */
  init() {
    // Button events
    this.startBtn.addEventListener("click", () => this.startGame());
    this.restartBtn.addEventListener("click", () => this.restartGame());

    // Keyboard events
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));

    // Prevent arrow key scrolling
    window.addEventListener("keydown", (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
    });

    // Draw initial screen
    this.drawMenu();
  }

  /**
   * Handle key down events
   */
  handleKeyDown(e) {
    if (this.state !== CONFIG.GAME_STATES.PLAYING) return;

    if (CONFIG.isKeyInGroup(e.key, "LEFT")) this.keys.left = true;
    if (CONFIG.isKeyInGroup(e.key, "RIGHT")) this.keys.right = true;
    if (CONFIG.isKeyInGroup(e.key, "UP")) this.keys.up = true;
    if (CONFIG.isKeyInGroup(e.key, "DOWN")) this.keys.down = true;
  }

  /**
   * Handle key up events
   */
  handleKeyUp(e) {
    if (CONFIG.isKeyInGroup(e.key, "LEFT")) this.keys.left = false;
    if (CONFIG.isKeyInGroup(e.key, "RIGHT")) this.keys.right = false;
    if (CONFIG.isKeyInGroup(e.key, "UP")) this.keys.up = false;
    if (CONFIG.isKeyInGroup(e.key, "DOWN")) this.keys.down = false;
  }

  /**
   * Start the game
   */
  startGame() {
    this.state = CONFIG.GAME_STATES.PLAYING;
    this.startBtn.style.display = "none";
    this.gameOverDiv.style.display = "none";
    this.startTime = Date.now();
    this.lastObstacleSpawn = this.startTime;
    this.lastGoldSpawn = this.startTime;
    this.gameLoop();
  }

  /**
   * Restart the game
   */
  restartGame() {
    // Reset all game state
    this.score = 0;
    this.goldCollected = 0;
    this.elapsedTime = 0;
    this.difficulty = 1;
    this.obstacles = [];
    this.goldCoins = [];
    this.particles = [];
    this.obstacleSpawnRate = CONFIG.OBSTACLES.SPAWN_RATE;
    this.player.reset();

    // Reset UI
    this.restartBtn.style.display = "none";
    this.updateUI();

    // Start game
    this.startGame();
  }

  /**
   * Main game loop
   */
  gameLoop() {
    if (this.state !== CONFIG.GAME_STATES.PLAYING) return;

    // Update game state
    this.update();

    // Render game
    this.render();

    // Continue loop
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Update game state
   */
  update() {
    const currentTime = Date.now();
    this.elapsedTime = (currentTime - this.startTime) / 1000;

    // Update difficulty
    this.updateDifficulty();

    // Update score based on time survived
    this.score = Math.floor(
      this.elapsedTime * CONFIG.SCORING.POINTS_PER_SECOND * this.difficulty,
    );

    // Spawn obstacles
    if (currentTime - this.lastObstacleSpawn > this.obstacleSpawnRate) {
      this.spawnObstacle();
      this.lastObstacleSpawn = currentTime;
    }

    // Spawn gold
    if (currentTime - this.lastGoldSpawn > CONFIG.GOLD.SPAWN_RATE) {
      if (Math.random() < CONFIG.GOLD.SPAWN_CHANCE) {
        this.spawnGold();
      }
      this.lastGoldSpawn = currentTime;
    }

    // Update player
    this.player.update(this.keys, this.canvas.width, this.canvas.height);

    // Update obstacles
    this.obstacles.forEach((obstacle) => obstacle.update());
    CollisionManager.removeOutOfBounds(
      this.obstacles,
      this.canvas.width,
      this.canvas.height,
    );
    this.obstacles = CollisionManager.cleanupEntities(this.obstacles);

    // Update gold
    this.goldCoins.forEach((gold) => gold.update());
    CollisionManager.removeOutOfBounds(
      this.goldCoins,
      this.canvas.width,
      this.canvas.height,
    );
    this.goldCoins = CollisionManager.cleanupEntities(this.goldCoins);

    // Update particles
    this.particles.forEach((particle) => particle.update());
    this.particles = CollisionManager.cleanupEntities(this.particles);

    // Check collisions
    this.checkCollisions();

    // Update screen shake
    if (this.screenShake > 0) {
      this.shakeX = (Math.random() - 0.5) * CONFIG.EFFECTS.SHAKE_INTENSITY;
      this.shakeY = (Math.random() - 0.5) * CONFIG.EFFECTS.SHAKE_INTENSITY;
      this.screenShake--;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Update UI
    this.updateUI();
  }

  /**
   * Update difficulty based on time
   */
  updateDifficulty() {
    const newDifficulty = Math.min(
      CONFIG.DIFFICULTY.MAX_LEVEL,
      1 + Math.floor(this.elapsedTime / CONFIG.DIFFICULTY.TIME_PER_LEVEL),
    );

    if (newDifficulty > this.difficulty) {
      this.difficulty = newDifficulty;
      this.obstacleSpawnRate *= CONFIG.DIFFICULTY.SPAWN_MULTIPLIER_PER_LEVEL;
    }
  }

  /**
   * Spawn a new obstacle
   */
  spawnObstacle() {
    const obstacle = Obstacle.createRandom(this.canvas.width, this.difficulty);
    this.obstacles.push(obstacle);
  }

  /**
   * Spawn a new gold coin
   */
  spawnGold() {
    const gold = Gold.createRandom(this.canvas.width);
    this.goldCoins.push(gold);
  }

  /**
   * Check all collisions
   */
  checkCollisions() {
    // Check player-obstacle collision
    const hitObstacle = CollisionManager.checkPlayerObstacles(
      this.player,
      this.obstacles,
    );
    if (hitObstacle) {
      this.gameOver();
      return;
    }

    // Check player-gold collision
    const collectedGold = CollisionManager.checkPlayerGold(
      this.player,
      this.goldCoins,
    );
    if (collectedGold.length > 0) {
      collectedGold.forEach((gold) => {
        this.goldCollected++;
        this.score += gold.points * this.difficulty;
        this.createCollectionEffect(gold.x, gold.y);
      });
    }
  }

  /**
   * Create particle effect when gold is collected
   */
  createCollectionEffect(x, y) {
    const particles = Particle.createExplosion(
      x,
      y,
      CONFIG.PARTICLES.COLORS.COLLECTION,
      CONFIG.PARTICLES.COLLECTION_COUNT,
    );
    this.particles.push(...particles);
  }

  /**
   * Create particle effect on collision
   */
  createCollisionEffect(x, y) {
    const particles = Particle.createExplosion(
      x,
      y,
      CONFIG.PARTICLES.COLORS.COLLISION,
      CONFIG.PARTICLES.COLLISION_COUNT,
    );
    this.particles.push(...particles);
    this.screenShake = CONFIG.EFFECTS.SHAKE_DURATION;
  }

  /**
   * Handle game over
   */
  gameOver() {
    this.state = CONFIG.GAME_STATES.GAME_OVER;
    this.createCollisionEffect(this.player.x, this.player.y);

    // Update final stats
    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("finalGold").textContent = this.goldCollected;
    document.getElementById("finalTime").textContent =
      this.elapsedTime.toFixed(1);

    // Show game over screen
    this.gameOverDiv.style.display = "block";
    this.restartBtn.style.display = "inline-block";

    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Update UI elements
   */
  updateUI() {
    this.scoreElement.textContent = this.score;
    this.goldElement.textContent = this.goldCollected;
    this.timeElement.textContent = this.elapsedTime.toFixed(1) + "s";
  }

  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply screen shake
    this.ctx.save();
    this.ctx.translate(this.shakeX, this.shakeY);

    // Draw grid background effect
    this.drawGrid();

    // Draw entities
    this.obstacles.forEach((obstacle) => obstacle.draw(this.ctx));
    this.goldCoins.forEach((gold) => gold.draw(this.ctx));
    this.particles.forEach((particle) => particle.draw(this.ctx));
    this.player.draw(this.ctx);

    // Draw difficulty indicator
    this.drawDifficultyIndicator();

    this.ctx.restore();
  }

  /**
   * Draw cyberpunk grid background
   */
  drawGrid() {
    this.ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
    this.ctx.lineWidth = 1;

    const gridSize = 50;

    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw difficulty level indicator
   */
  drawDifficultyIndicator() {
    this.ctx.fillStyle = "rgba(255, 0, 255, 0.5)";
    this.ctx.font = "bold 16px Courier New";
    this.ctx.textAlign = "right";
    this.ctx.fillText(`LEVEL ${this.difficulty}`, this.canvas.width - 10, 25);
    this.ctx.textAlign = "left";
  }

  /**
   * Draw menu screen
   */
  drawMenu() {
    this.ctx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();

    // Draw title on canvas
    this.ctx.fillStyle = "#00ffff";
    this.ctx.font = "bold 48px Courier New";
    this.ctx.textAlign = "center";
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "#00ffff";
    this.ctx.fillText(
      "NEON RUSH",
      this.canvas.width / 2,
      this.canvas.height / 2 - 50,
    );

    // Draw instructions
    this.ctx.font = "20px Courier New";
    this.ctx.fillStyle = "#ff00ff";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#ff00ff";
    this.ctx.fillText(
      "Dodge obstacles and collect gold!",
      this.canvas.width / 2,
      this.canvas.height / 2 + 20,
    );

    this.ctx.shadowBlur = 0;
    this.ctx.textAlign = "left";
  }
}

// Initialize game when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
});
