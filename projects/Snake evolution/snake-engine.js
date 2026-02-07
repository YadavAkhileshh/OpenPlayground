class SnakeGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.gridSize = 20;
    this.canvas.width = 600;
    this.canvas.height = 400;
    this.tileCount = {
      x: this.canvas.width / this.gridSize,
      y: this.canvas.height / this.gridSize,
    };
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = this.spawnFood();
    this.score = 0;
    this.hiscore = parseInt(localStorage.getItem("snakeHiScore")) || 0;
    this.speed = 1;
    this.gameRunning = false;
    this.gameOver = false;
    this.lastUpdate = 0;
    this.updateInterval = 150;
    this.setupControls();
  }
  setupControls() {
    document.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        e.preventDefault();
        if (this.gameOver) {
          this.reset();
        } else {
          this.gameRunning = !this.gameRunning;
        }
      }
      if (e.key === "ArrowUp" && this.direction.y === 0)
        this.nextDirection = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && this.direction.y === 0)
        this.nextDirection = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && this.direction.x === 0)
        this.nextDirection = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && this.direction.x === 0)
        this.nextDirection = { x: 1, y: 0 };
    });
  }
  spawnFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * this.tileCount.x),
        y: Math.floor(Math.random() * this.tileCount.y),
      };
    } while (
      this.snake.some((segment) => segment.x === food.x && segment.y === food.y)
    );
    return food;
  }
  update(timestamp) {
    if (!this.gameRunning || this.gameOver) return;
    if (timestamp - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = timestamp;
    this.direction = this.nextDirection;
    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y,
    };
    if (
      head.x < 0 ||
      head.x >= this.tileCount.x ||
      head.y < 0 ||
      head.y >= this.tileCount.y
    ) {
      this.gameOver = true;
      if (this.onGameOver) this.onGameOver();
      return;
    }
    if (
      this.snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      this.gameOver = true;
      if (this.onGameOver) this.onGameOver();
      return;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10 * this.speed;
      this.food = this.spawnFood();
      if (this.snake.length % 5 === 0 && this.updateInterval > 50) {
        this.updateInterval -= 10;
        this.speed++;
      }
      if (this.onScoreUpdate) this.onScoreUpdate();
    } else {
      this.snake.pop();
    }
    if (this.score > this.hiscore) {
      this.hiscore = this.score;
      localStorage.setItem("snakeHiScore", this.hiscore);
    }
  }
  render() {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let x = 0; x < this.tileCount.x; x++) {
      for (let y = 0; y < this.tileCount.y; y++) {
        this.ctx.strokeStyle = "#002200";
        this.ctx.strokeRect(
          x * this.gridSize,
          y * this.gridSize,
          this.gridSize,
          this.gridSize,
        );
      }
    }
    this.ctx.fillStyle = "#00FF00";
    this.snake.forEach((segment, index) => {
      const brightness = index === 0 ? 255 : 255 - index * 5;
      this.ctx.fillStyle = `rgb(0, ${Math.max(brightness, 100)}, 0)`;
      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2,
      );
    });
    this.ctx.fillStyle = "#FF0000";
    this.ctx.fillRect(
      this.food.x * this.gridSize + 2,
      this.food.y * this.gridSize + 2,
      this.gridSize - 4,
      this.gridSize - 4,
    );
  }
  reset() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = this.spawnFood();
    this.score = 0;
    this.speed = 1;
    this.updateInterval = 150;
    this.gameRunning = false;
    this.gameOver = false;
  }
}
