const COLORS = [
  "#000",
  "#00ffff",
  "#ffff00",
  "#a020f0",
  "#00ff00",
  "#ff0000",
  "#0000ff",
  "#ffa500",
];
const SHAPES = [
  [[[1, 1, 1, 1]]], // I
  [
    [
      [2, 2],
      [2, 2],
    ],
  ], // O
  [
    [
      [0, 3, 0],
      [3, 3, 3],
    ],
  ], // T
  [
    [
      [0, 4, 4],
      [4, 4, 0],
    ],
  ], // S
  [
    [
      [5, 5, 0],
      [0, 5, 5],
    ],
  ], // Z
  [
    [
      [6, 0, 0],
      [6, 6, 6],
    ],
  ], // J
  [
    [
      [0, 0, 7],
      [7, 7, 7],
    ],
  ],
]; // L
class TetrisGame {
  constructor(canvas, nextCanvas) {
    this.canvas = canvas;
    this.nextCanvas = nextCanvas;
    this.ctx = canvas.getContext("2d");
    this.nextCtx = nextCanvas.getContext("2d");
    this.canvas.width = 300;
    this.canvas.height = 600;
    this.blockSize = 30;
    this.cols = 10;
    this.rows = 20;
    this.board = Array(this.rows)
      .fill(null)
      .map(() => Array(this.cols).fill(0));
    this.piece = null;
    this.nextPiece = null;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.dropInterval = 1000;
    this.lastDrop = Date.now();
    this.setupControls();
    this.spawnPiece();
    this.spawnNextPiece();
  }
  setupControls() {
    document.addEventListener("keydown", (e) => {
      if (this.gameOver) return;
      if (e.key === "ArrowLeft") this.movePiece(-1, 0);
      if (e.key === "ArrowRight") this.movePiece(1, 0);
      if (e.key === "ArrowDown") this.movePiece(0, 1);
      if (e.key === "ArrowUp") this.rotatePiece();
      if (e.key === " ") {
        e.preventDefault();
        this.hardDrop();
      }
      if (e.key === "Enter" && this.gameOver) this.reset();
    });
  }
  spawnPiece() {
    this.piece = this.nextPiece || this.randomPiece();
    this.piece.x = Math.floor(this.cols / 2) - 1;
    this.piece.y = 0;
    this.spawnNextPiece();
    if (this.collision()) {
      this.gameOver = true;
      if (this.onGameOver) this.onGameOver();
    }
  }
  spawnNextPiece() {
    this.nextPiece = this.randomPiece();
  }
  randomPiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return { shape: shape[0], x: 0, y: 0 };
  }
  movePiece(dx, dy) {
    this.piece.x += dx;
    this.piece.y += dy;
    if (this.collision()) {
      this.piece.x -= dx;
      this.piece.y -= dy;
      if (dy > 0) this.lockPiece();
    }
  }
  rotatePiece() {
    const original = this.piece.shape;
    this.piece.shape = this.piece.shape[0].map((val, i) =>
      this.piece.shape.map((row) => row[i]).reverse(),
    );
    if (this.collision()) this.piece.shape = original;
  }
  hardDrop() {
    while (!this.collision()) {
      this.piece.y++;
    }
    this.piece.y--;
    this.lockPiece();
  }
  collision() {
    for (let y = 0; y < this.piece.shape.length; y++) {
      for (let x = 0; x < this.piece.shape[y].length; x++) {
        if (
          this.piece.shape[y][x] &&
          (this.board[y + this.piece.y] &&
            this.board[y + this.piece.y][x + this.piece.x]) !== 0
        ) {
          return true;
        }
        if (
          this.piece.shape[y][x] &&
          (y + this.piece.y >= this.rows ||
            x + this.piece.x < 0 ||
            x + this.piece.x >= this.cols)
        ) {
          return true;
        }
      }
    }
    return false;
  }
  lockPiece() {
    for (let y = 0; y < this.piece.shape.length; y++) {
      for (let x = 0; x < this.piece.shape[y].length; x++) {
        if (this.piece.shape[y][x]) {
          this.board[y + this.piece.y][x + this.piece.x] =
            this.piece.shape[y][x];
        }
      }
    }
    this.clearLines();
    this.spawnPiece();
  }
  clearLines() {
    let linesCleared = 0;
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.board[y].every((cell) => cell !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.cols).fill(0));
        linesCleared++;
        y++;
      }
    }
    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += [0, 40, 100, 300, 1200][linesCleared] * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropInterval = Math.max(100, 1000 - this.level * 100);
      if (this.onScoreUpdate) this.onScoreUpdate();
    }
  }
  update() {
    if (this.gameOver) return;
    const now = Date.now();
    if (now - this.lastDrop > this.dropInterval) {
      this.movePiece(0, 1);
      this.lastDrop = now;
    }
  }
  render() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x]) {
          this.ctx.fillStyle = COLORS[this.board[y][x]];
          this.ctx.fillRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize - 1,
            this.blockSize - 1,
          );
        }
      }
    }
    if (this.piece) {
      this.piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            this.ctx.fillStyle = COLORS[cell];
            this.ctx.fillRect(
              (this.piece.x + x) * this.blockSize,
              (this.piece.y + y) * this.blockSize,
              this.blockSize - 1,
              this.blockSize - 1,
            );
          }
        });
      });
    }
    this.nextCtx.fillStyle = "#000";
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    if (this.nextPiece) {
      const offsetX = Math.floor((4 - this.nextPiece.shape[0].length) / 2);
      const offsetY = Math.floor((4 - this.nextPiece.shape.length) / 2);
      this.nextPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            this.nextCtx.fillStyle = COLORS[cell];
            this.nextCtx.fillRect(
              (offsetX + x) * 30,
              (offsetY + y) * 30,
              29,
              29,
            );
          }
        });
      });
    }
  }
  reset() {
    this.board = Array(this.rows)
      .fill(null)
      .map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.dropInterval = 1000;
    this.spawnPiece();
    if (this.onScoreUpdate) this.onScoreUpdate();
  }
}
