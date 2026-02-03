const Game = {
  lvl: 1,
  echoes: 5,
  cellSize: 45,
  player: { x: 0, y: 0 },
  init() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.fx = new Effects();
    AudioEngine.init();
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    this.setup();
    window.addEventListener("keydown", (e) => this.handleInput(e));
    this.loop();
  },
  setup() {
    const c = 8 + this.lvl,
      r = 6 + this.lvl;
    this.maze = this.gen(c, r);
    this.player = { x: 0, y: 0 };
    this.exit = { x: c - 1, y: r - 1 };
    this.echoes = 5 + Math.floor(this.lvl / 2);
    this.updateHUD();
  },
  gen(cols, rows) {
    let grid = Array(cols * rows).fill(15),
      stack = [0],
      vis = new Set([0]);
    while (stack.length) {
      let curr = stack[stack.length - 1],
        x = curr % cols,
        y = Math.floor(curr / cols);
      let n = [
        [x, y - 1, 1, 4],
        [x + 1, y, 2, 8],
        [x, y + 1, 4, 1],
        [x - 1, y, 8, 2],
      ]
        .map((v) => ({
          nx: v[0],
          ny: v[1],
          b: v[2],
          o: v[3],
          i: v[1] * cols + v[0],
        }))
        .filter(
          (v) =>
            v.nx >= 0 &&
            v.nx < cols &&
            v.ny >= 0 &&
            v.ny < rows &&
            !vis.has(v.i),
        );
      if (n.length) {
        let next = n[Math.floor(Math.random() * n.length)];
        grid[curr] -= next.b;
        grid[next.i] -= next.o;
        vis.add(next.i);
        stack.push(next.i);
      } else stack.pop();
    }
    return { grid, cols, rows };
  },
  handleInput(e) {
    let idx = this.player.y * this.maze.cols + this.player.x;
    if (e.key === "w" && !(this.maze.grid[idx] & 1)) this.player.y--;
    if (e.key === "s" && !(this.maze.grid[idx] & 4)) this.player.y++;
    if (e.key === "a" && !(this.maze.grid[idx] & 8)) this.player.x--;
    if (e.key === "d" && !(this.maze.grid[idx] & 2)) this.player.x++;
    if (e.code === "Space" && this.echoes > 0) {
      this.echoes--;
      this.fx.createEcho(
        this.player.x * this.cellSize + 22,
        this.player.y * this.cellSize + 22,
      );
      AudioEngine.pulse();
      this.updateHUD();
    }
    if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
      this.lvl++;
      this.setup();
    }
    if (this.echoes <= 0 && !this.fx.echoes.length) {
      /* Game Over Check logic */
    }
  },
  updateHUD() {
    document.getElementById("lvl").innerText = this.lvl;
    document.getElementById("echoes").innerText = this.echoes;
  },
  loop() {
    this.ctx.fillStyle = "#020b02";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.fx.update();
    this.fx.draw(this.ctx, this.maze, this.player, this.cellSize, this.echoes);
    this.ctx.fillStyle = "#00ff41";
    this.ctx.fillRect(
      this.player.x * this.cellSize + 15,
      this.player.y * this.cellSize + 15,
      15,
      15,
    );
    requestAnimationFrame(() => this.loop());
  },
};
