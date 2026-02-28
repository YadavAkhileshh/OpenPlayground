class MindMaze {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.cellSize = 40;
    this.cols = 20;
    this.rows = 15;
    this.player = { x: 0, y: 0 };
    this.exit = { x: 19, y: 14 };
    this.memories = [];
    this.collectedMemories = [];
    this.energy = 100;
    this.level = 1;
    this.maze = this.generateMaze();
    this.spawnMemories();
    this.keys = {};
    this.setupControls();
  }
  setupControls() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });
    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }
  generateMaze() {
    const maze = Array(this.rows)
      .fill(null)
      .map(() => Array(this.cols).fill(1));
    const stack = [{ x: 0, y: 0 }];
    maze[0][0] = 0;
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y, maze);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        maze[next.y][next.x] = 0;
        stack.push(next);
      } else {
        stack.pop();
      }
    }
    return maze;
  }
  getUnvisitedNeighbors(x, y, maze) {
    const neighbors = [];
    const dirs = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ];
    dirs.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx >= 0 &&
        nx < this.cols &&
        ny >= 0 &&
        ny < this.rows &&
        maze[ny][nx] === 1
      ) {
        neighbors.push({ x: nx, y: ny });
      }
    });
    return neighbors;
  }
  spawnMemories() {
    this.memories = [];
    for (let i = 0; i < 3 + this.level; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.cols);
        y = Math.floor(Math.random() * this.rows);
      } while (this.maze[y][x] === 1 || (x === 0 && y === 0));
      this.memories.push({
        x,
        y,
        icon: ["💭", "🧩", "🌟", "💡", "🎨"][Math.floor(Math.random() * 5)],
      });
    }
  }
  update() {
    const speed = 0.3;
    if (
      (this.keys["w"] || this.keys["ArrowUp"]) &&
      this.canMove(this.player.x, this.player.y - speed)
    )
      this.player.y -= speed;
    if (
      (this.keys["s"] || this.keys["ArrowDown"]) &&
      this.canMove(this.player.x, this.player.y + speed)
    )
      this.player.y += speed;
    if (
      (this.keys["a"] || this.keys["ArrowLeft"]) &&
      this.canMove(this.player.x - speed, this.player.y)
    )
      this.player.x -= speed;
    if (
      (this.keys["d"] || this.keys["ArrowRight"]) &&
      this.canMove(this.player.x + speed, this.player.y)
    )
      this.player.x += speed;
    this.memories = this.memories.filter((m) => {
      const dx = this.player.x - m.x;
      const dy = this.player.y - m.y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
        this.collectedMemories.push(m);
        if (this.onMemoryCollect) this.onMemoryCollect(m);
        return false;
      }
      return true;
    });
    this.energy = Math.max(0, this.energy - 0.05);
    if (this.energy <= 0 && this.onEnergyDepleted) this.onEnergyDepleted();
    if (
      Math.abs(this.player.x - this.exit.x) < 0.5 &&
      Math.abs(this.player.y - this.exit.y) < 0.5
    ) {
      this.nextLevel();
    }
  }
  canMove(x, y) {
    const cellX = Math.floor(x);
    const cellY = Math.floor(y);
    return (
      cellX >= 0 &&
      cellX < this.cols &&
      cellY >= 0 &&
      cellY < this.rows &&
      this.maze[cellY][cellX] === 0
    );
  }
  teleport() {
    if (this.energy < 5) return false;
    let x, y;
    do {
      x = Math.floor(Math.random() * this.cols);
      y = Math.floor(Math.random() * this.rows);
    } while (this.maze[y][x] === 1);
    this.player = { x, y };
    this.energy -= 5;
    return true;
  }
  revealPath() {
    if (this.energy < 3) return false;
    this.energy -= 3;
    return true;
  }
  nextLevel() {
    this.level++;
    this.player = { x: 0, y: 0 };
    this.energy = Math.min(100, this.energy + 30);
    this.maze = this.generateMaze();
    this.spawnMemories();
    if (this.onLevelComplete) this.onLevelComplete();
  }
  render() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.ctx.fillStyle = this.maze[y][x] === 1 ? "#8B5CF6" : "#1F2937";
        this.ctx.fillRect(
          x * this.cellSize,
          y * this.cellSize,
          this.cellSize - 2,
          this.cellSize - 2,
        );
      }
    }
    this.ctx.fillStyle = "#F59E0B";
    this.ctx.fillRect(
      this.exit.x * this.cellSize,
      this.exit.y * this.cellSize,
      this.cellSize,
      this.cellSize,
    );
    this.memories.forEach((m) => {
      this.ctx.font = "30px Arial";
      this.ctx.fillText(
        m.icon,
        m.x * this.cellSize + 5,
        m.y * this.cellSize + 30,
      );
    });
    this.ctx.fillStyle = "#3B82F6";
    this.ctx.beginPath();
    this.ctx.arc(
      this.player.x * this.cellSize + this.cellSize / 2,
      this.player.y * this.cellSize + this.cellSize / 2,
      15,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();
  }
}
