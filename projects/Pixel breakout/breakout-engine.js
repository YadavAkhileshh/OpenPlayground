class BreakoutGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.score = 0;
    this.hiscore = parseInt(localStorage.getItem("breakoutHiScore")) || 0;
    this.lives = 3;
    this.level = 1;
    this.gameRunning = false;
    this.paddle = { x: 350, y: 560, width: 100, height: 15, speed: 8 };
    this.ball = { x: 400, y: 540, radius: 8, dx: 4, dy: -4 };
    this.bricks = [];
    this.powerups = [];
    this.keys = {};
    this.colors = [
      "#FF0000",
      "#FF7F00",
      "#FFFF00",
      "#00FF00",
      "#00FFFF",
      "#0000FF",
      "#8B00FF",
    ];
    this.setupControls();
    this.createBricks();
  }
  setupControls() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
      if (e.key === " ") {
        e.preventDefault();
        if (!this.gameRunning) this.start();
      }
    });
    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }
  createBricks() {
    this.bricks = [];
    const rows = 5 + this.level;
    const cols = 10;
    const brickWidth = 70;
    const brickHeight = 20;
    const padding = 5;
    const offsetTop = 50;
    const offsetLeft = 35;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          x: offsetLeft + c * (brickWidth + padding),
          y: offsetTop + r * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          visible: true,
          color: this.colors[r % this.colors.length],
          hits: Math.floor(r / 3) + 1,
        });
      }
    }
  }
  start() {
    this.gameRunning = true;
    this.ball.dx = 4 + this.level * 0.5;
    this.ball.dy = -4 - this.level * 0.5;
  }
  update() {
    if (!this.gameRunning) return;
    if (this.keys["ArrowLeft"] && this.paddle.x > 0)
      this.paddle.x -= this.paddle.speed;
    if (
      this.keys["ArrowRight"] &&
      this.paddle.x < this.canvas.width - this.paddle.width
    )
      this.paddle.x += this.paddle.speed;
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    if (
      this.ball.x + this.ball.radius > this.canvas.width ||
      this.ball.x - this.ball.radius < 0
    )
      this.ball.dx *= -1;
    if (this.ball.y - this.ball.radius < 0) this.ball.dy *= -1;
    if (
      this.ball.y + this.ball.radius > this.paddle.y &&
      this.ball.x > this.paddle.x &&
      this.ball.x < this.paddle.x + this.paddle.width &&
      this.ball.dy > 0
    ) {
      this.ball.dy *= -1;
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
      this.ball.dx = (hitPos - 0.5) * 10;
    }
    if (this.ball.y > this.canvas.height) {
      this.lives--;
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        this.resetBall();
      }
    }
    this.bricks.forEach((brick) => {
      if (brick.visible && this.collision(this.ball, brick)) {
        this.ball.dy *= -1;
        brick.hits--;
        if (brick.hits <= 0) {
          brick.visible = false;
          this.score += 10 * this.level;
          if (Math.random() < 0.1)
            this.spawnPowerup(brick.x + brick.width / 2, brick.y);
        }
      }
    });
    this.powerups = this.powerups.filter((p) => {
      p.y += 3;
      if (this.collision(p, this.paddle)) {
        this.activatePowerup(p.type);
        return false;
      }
      return p.y < this.canvas.height;
    });
    if (this.bricks.every((b) => !b.visible)) this.nextLevel();
    if (this.score > this.hiscore) {
      this.hiscore = this.score;
      localStorage.setItem("breakoutHiScore", this.hiscore);
    }
  }
  collision(circle, rect) {
    const distX = Math.abs(circle.x - rect.x - rect.width / 2);
    const distY = Math.abs(circle.y - rect.y - rect.height / 2);
    if (distX > rect.width / 2 + circle.radius) return false;
    if (distY > rect.height / 2 + circle.radius) return false;
    if (distX <= rect.width / 2) return true;
    if (distY <= rect.height / 2) return true;
    const dx = distX - rect.width / 2;
    const dy = distY - rect.height / 2;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
  }
  spawnPowerup(x, y) {
    const types = ["multiball", "widepaddle", "fastball"];
    this.powerups.push({
      x,
      y,
      width: 30,
      height: 15,
      type: types[Math.floor(Math.random() * types.length)],
    });
  }
  activatePowerup(type) {
    if (this.powerupCallback) this.powerupCallback(type);
  }
  resetBall() {
    this.ball.x = this.paddle.x + this.paddle.width / 2;
    this.ball.y = this.paddle.y - 20;
    this.ball.dx = 4;
    this.ball.dy = -4;
    this.gameRunning = false;
  }
  nextLevel() {
    this.level++;
    this.createBricks();
    this.resetBall();
  }
  gameOver() {
    this.gameRunning = false;
    if (this.gameOverCallback) this.gameOverCallback();
  }
  render() {
    this.ctx.fillStyle = "#001100";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#00FF00";
    this.ctx.fillRect(
      this.paddle.x,
      this.paddle.y,
      this.paddle.width,
      this.paddle.height,
    );
    this.ctx.fillStyle = "#FFFF00";
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.bricks.forEach((brick) => {
      if (brick.visible) {
        this.ctx.fillStyle = brick.color;
        this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });
    this.powerups.forEach((p) => {
      this.ctx.fillStyle = "#00FFFF";
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
    });
  }
}
