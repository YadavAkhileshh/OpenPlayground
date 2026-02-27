const COLORS = [
  "#FF6B9D",
  "#FFB347",
  "#7EC8E3",
  "#A8E6CF",
  "#DDA0DD",
  "#F6D365",
];
class FloodEngine {
  constructor() {
    this.size = 10;
    this.maxMoves = 20;
    this.grid = [];
    this.moves = 0;
    this.flooded = new Set();
    this.running = false;
  }
  init(size) {
    this.size = size;
    this.maxMoves = size === 10 ? 20 : size === 14 ? 28 : 36;
    this.grid = Array.from({ length: size }, () =>
      Array.from(
        { length: size },
        () => COLORS[Math.floor(Math.random() * COLORS.length)],
      ),
    );
    this.moves = 0;
    this.flooded = new Set();
    this.recalcFlooded();
    this.running = true;
  }
  recalcFlooded() {
    this.flooded = new Set();
    const target = this.grid[0][0];
    const queue = [[0, 0]];
    while (queue.length) {
      const [r, c] = queue.shift();
      const key = r + "," + c;
      if (this.flooded.has(key)) continue;
      if (this.grid[r][c] !== target) continue;
      this.flooded.add(key);
      [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ].forEach(([nr, nc]) => {
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size)
          queue.push([nr, nc]);
      });
    }
  }
  flood(color) {
    if (!this.running) return;
    if (color === this.grid[0][0]) return;
    this.moves++;
    // repaint flooded
    this.flooded.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      this.grid[r][c] = color;
    });
    // expand flood fill
    const newFlooded = new Set(this.flooded);
    const expand = [...this.flooded];
    while (expand.length) {
      const [r, c] = expand.shift().split(",").map(Number);
      [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ].forEach(([nr, nc]) => {
        if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) return;
        const key = nr + "," + nc;
        if (!newFlooded.has(key) && this.grid[nr][nc] === color) {
          newFlooded.add(key);
          expand.push(key);
        }
      });
    }
    this.flooded = newFlooded;
    const total = this.size * this.size;
    if (this.flooded.size === total) {
      this.running = false;
      if (this.onWin) this.onWin();
      return;
    }
    if (this.moves >= this.maxMoves) {
      this.running = false;
      if (this.onLose) this.onLose();
    }
  }
  getPct() {
    return this.flooded.size / (this.size * this.size);
  }
}
