class TimeParadox {
  constructor() {
    this.pastCanvas = document.getElementById("pastCanvas");
    this.presentCanvas = document.getElementById("presentCanvas");
    this.futureCanvas = document.getElementById("futureCanvas");
    this.pastCtx = this.pastCanvas.getContext("2d");
    this.presentCtx = this.presentCanvas.getContext("2d");
    this.futureCtx = this.futureCanvas.getContext("2d");
    this.canvases = [this.pastCanvas, this.presentCanvas, this.futureCanvas];
    this.canvases.forEach((c) => {
      c.width = 300;
      c.height = 400;
    });
    this.level = 1;
    this.integrity = 100;
    this.player = { x: 5, y: 5, trail: [] };
    this.goal = { x: 10, y: 15 };
    this.obstacles = [];
    this.timeline = 0;
    this.powers = {
      rewind: { cooldown: 0, duration: 3 },
      pause: { cooldown: 0, duration: 2 },
      forward: { cooldown: 0, duration: 3 },
    };
    this.keys = {};
    this.setupControls();
    this.generateLevel();
  }
  setupControls() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
      if (e.key === "1") this.usePower("rewind");
      if (e.key === "2") this.usePower("pause");
      if (e.key === "3") this.usePower("forward");
      if (e.key === "r") this.reset();
    });
  }
  generateLevel() {
    this.obstacles = [];
    const count = 5 + this.level * 2;
    for (let i = 0; i < count; i++) {
      this.obstacles.push({
        x: Math.floor(Math.random() * 15),
        y: Math.floor(Math.random() * 20),
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
      });
    }
  }
  usePower(power) {
    if (this.powers[power].cooldown > 0) return;
    this.powers[power].cooldown = 5;
    if (power === "rewind") {
      this.timeline = Math.max(0, this.timeline - 30);
    } else if (power === "pause") {
      this.timeline += 0;
    } else if (power === "forward") {
      this.timeline = Math.min(100, this.timeline + 30);
    }
    if (this.onPowerUse) this.onPowerUse(power);
  }
  update() {
    if (this.keys["w"] || this.keys["ArrowUp"])
      this.player.y = Math.max(0, this.player.y - 0.5);
    if (this.keys["s"] || this.keys["ArrowDown"])
      this.player.y = Math.min(20, this.player.y + 0.5);
    if (this.keys["a"] || this.keys["ArrowLeft"])
      this.player.x = Math.max(0, this.player.x - 0.5);
    if (this.keys["d"] || this.keys["ArrowRight"])
      this.player.x = Math.min(15, this.player.x + 0.5);
    this.player.trail.push({
      x: this.player.x,
      y: this.player.y,
      time: this.timeline,
    });
    if (this.player.trail.length > 50) this.player.trail.shift();
    this.obstacles.forEach((obs) => {
      obs.x += obs.vx * 0.1;
      obs.y += obs.vy * 0.1;
      if (obs.x < 0 || obs.x > 15) obs.vx *= -1;
      if (obs.y < 0 || obs.y > 20) obs.vy *= -1;
    });
    Object.keys(this.powers).forEach((key) => {
      if (this.powers[key].cooldown > 0) this.powers[key].cooldown -= 0.016;
    });
    this.timeline = (this.timeline + 0.5) % 100;
    const dx = this.player.x - this.goal.x;
    const dy = this.player.y - this.goal.y;
    if (Math.sqrt(dx * dx + dy * dy) < 1) {
      this.levelComplete();
    }
  }
  levelComplete() {
    this.level++;
    this.player = { x: 5, y: 5, trail: [] };
    this.generateLevel();
    if (this.onLevelComplete) this.onLevelComplete();
  }
  reset() {
    this.player = { x: 5, y: 5, trail: [] };
    this.timeline = 0;
    this.generateLevel();
  }
  render() {
    [this.pastCtx, this.presentCtx, this.futureCtx].forEach((ctx, i) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 300, 400);
      const timeOffset = i === 0 ? -30 : i === 2 ? 30 : 0;
      const effectiveTime = (this.timeline + timeOffset + 100) % 100;
      ctx.fillStyle = i === 0 ? "#4A90E2" : i === 1 ? "#9B59B6" : "#E74C3C";
      ctx.globalAlpha = 0.3;
      this.player.trail.forEach((point) => {
        ctx.fillRect(point.x * 20, point.y * 20, 10, 10);
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(this.player.x * 20, this.player.y * 20, 15, 15);
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(this.goal.x * 20, this.goal.y * 20, 15, 15);
      ctx.fillStyle = "#FF0000";
      this.obstacles.forEach((obs) => {
        ctx.fillRect(obs.x * 20, obs.y * 20, 12, 12);
      });
    });
  }
}
