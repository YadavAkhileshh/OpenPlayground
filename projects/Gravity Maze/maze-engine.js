class GravityMaze {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.gravity = { x: 0, y: 1 };
    this.ball = { x: 50, y: 50, radius: 15, vx: 0, vy: 0 };
    this.walls = [];
    this.goal = { x: 0, y: 0, radius: 25 };
    this.currentLevel = 1;
    this.moves = 0;
    this.time = 0;
    this.isComplete = false;
    this.levels = this.generateLevels();
    this.loadLevel(1);
  }
  generateLevels() {
    return [
      {
        walls: [
          [0, 0, 800, 20],
          [0, 580, 800, 20],
          [0, 0, 20, 600],
          [780, 0, 20, 600],
        ],
        start: { x: 50, y: 50 },
        goal: { x: 700, y: 500 },
      },
      {
        walls: [
          [0, 0, 800, 20],
          [0, 580, 800, 20],
          [0, 0, 20, 600],
          [780, 0, 20, 600],
          [300, 200, 20, 200],
        ],
        start: { x: 50, y: 50 },
        goal: { x: 700, y: 500 },
      },
      {
        walls: [
          [0, 0, 800, 20],
          [0, 580, 800, 20],
          [0, 0, 20, 600],
          [780, 0, 20, 600],
          [200, 100, 400, 20],
          [200, 400, 400, 20],
        ],
        start: { x: 50, y: 300 },
        goal: { x: 700, y: 300 },
      },
    ];
  }
  loadLevel(level) {
    const levelData = this.levels[level - 1];
    this.walls = levelData.walls;
    this.ball.x = levelData.start.x;
    this.ball.y = levelData.start.y;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.goal.x = levelData.goal.x;
    this.goal.y = levelData.goal.y;
    this.currentLevel = level;
    this.moves = 0;
    this.time = 0;
    this.isComplete = false;
  }
  setGravity(direction) {
    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    this.gravity = directions[direction];
    this.moves++;
  }
  update() {
    if (this.isComplete) return;
    this.ball.vx += this.gravity.x * 0.5;
    this.ball.vy += this.gravity.y * 0.5;
    this.ball.vx *= 0.98;
    this.ball.vy *= 0.98;
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.checkWallCollisions();
    this.checkGoal();
  }
  checkWallCollisions() {
    this.walls.forEach((wall) => {
      const [x, y, w, h] = wall;
      if (
        this.ball.x + this.ball.radius > x &&
        this.ball.x - this.ball.radius < x + w &&
        this.ball.y + this.ball.radius > y &&
        this.ball.y - this.ball.radius < y + h
      ) {
        if (Math.abs(this.ball.vx) > Math.abs(this.ball.vy)) {
          this.ball.x =
            this.ball.vx > 0 ? x - this.ball.radius : x + w + this.ball.radius;
          this.ball.vx *= -0.5;
        } else {
          this.ball.y =
            this.ball.vy > 0 ? y - this.ball.radius : y + h + this.ball.radius;
          this.ball.vy *= -0.5;
        }
      }
    });
  }
  checkGoal() {
    const dx = this.ball.x - this.goal.x;
    const dy = this.ball.y - this.goal.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this.ball.radius + this.goal.radius) {
      this.isComplete = true;
    }
  }
  render() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.walls.forEach((wall) => {
      this.ctx.fillStyle = "#00D9FF";
      this.ctx.fillRect(wall[0], wall[1], wall[2], wall[3]);
    });
    this.ctx.fillStyle = "#7FFF00";
    this.ctx.beginPath();
    this.ctx.arc(this.goal.x, this.goal.y, this.goal.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = "#FF006E";
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
