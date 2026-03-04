const FRUITS = [
  { e: "🍉", c: "#FF4444", pts: 10 },
  { e: "🍊", c: "#FF8800", pts: 15 },
  { e: "🍋", c: "#FFD600", pts: 12 },
  { e: "🍇", c: "#8800CC", pts: 20 },
  { e: "🍓", c: "#FF2266", pts: 18 },
  { e: "🍑", c: "#FF9966", pts: 14 },
  { e: "🥝", c: "#44BB00", pts: 16 },
];
class FruitEngine {
  constructor(cv) {
    this.cv = cv;
    this.ctx = cv.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.reset();
  }
  resize() {
    this.W = this.cv.width = window.innerWidth;
    this.H = this.cv.height = window.innerHeight;
  }
  reset() {
    this.fruits = [];
    this.bombs = [];
    this.particles = [];
    this.slashPoints = [];
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.sliced = 0;
    this.spawnTimer = 0;
    this.spawnRate = 90;
    this.running = false;
    this.mouse = { x: 0, y: 0 };
    this.prevMouse = { x: 0, y: 0 };
    this.slashTrail = [];
  }
  spawnFruit() {
    const f = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const x = 80 + Math.random() * (this.W - 160);
    const vy = -(8 + Math.random() * 7);
    const vx = (Math.random() - 0.5) * 4;
    this.fruits.push({
      x,
      y: this.H + 60,
      vx,
      vy,
      r: 34,
      emoji: f.e,
      color: f.c,
      pts: f.pts,
      rot: 0,
      rotSpd: (Math.random() - 0.5) * 0.08,
      sliced: false,
    });
  }
  spawnBomb() {
    const x = 80 + Math.random() * (this.W - 160);
    this.bombs.push({
      x,
      y: this.H + 60,
      vx: (Math.random() - 0.5) * 3,
      vy: -(7 + Math.random() * 5),
      r: 30,
      rot: 0,
      rotSpd: 0.06,
    });
  }
  checkSlash() {
    const mx = this.mouse.x,
      my = this.mouse.y,
      px = this.prevMouse.x,
      py = this.prevMouse.y;
    const dx = mx - px,
      dy = my - py;
    const spd = Math.hypot(dx, dy);
    if (spd < 8) return;
    this.fruits.forEach((f, i) => {
      if (f.sliced) return;
      if (
        Math.hypot(f.x - mx, f.y - my) < f.r + 20 ||
        Math.hypot(f.x - px, f.y - py) < f.r + 20
      ) {
        f.sliced = true;
        this.sliced++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        const pts = f.pts * Math.max(1, Math.floor(this.combo / 3));
        this.score += pts;
        for (let j = 0; j < 14; j++)
          this.particles.push({
            x: f.x,
            y: f.y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 25,
            maxLife: 25,
            col: f.color,
            s: 5 + Math.random() * 4,
          });
        if (this.onSlice) this.onSlice(f.x, f.y, pts);
      }
    });
    this.bombs.forEach((b, i) => {
      if (Math.hypot(b.x - mx, b.y - my) < b.r + 15) {
        this.lives--;
        this.combo = 0;
        this.bombs.splice(i, 1);
        if (this.onBomb) this.onBomb();
        if (this.lives <= 0) {
          this.running = false;
          if (this.onDead) this.onDead();
        }
      }
    });
  }
  update() {
    if (!this.running) return;
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnRate) {
      this.spawnFruit();
      this.spawnTimer = 0;
      this.spawnRate = Math.max(40, 90 - Math.floor(this.score / 200) * 5);
      if (Math.random() < 0.12) this.spawnBomb();
    }
    const G = 0.25;
    this.fruits = this.fruits.filter((f) => {
      f.x += f.vx;
      f.y += f.vy;
      f.vy += G;
      f.rot += f.rotSpd;
      if (!f.sliced && f.y > this.H + 80) {
        this.lives--;
        this.combo = 0;
        if (this.lives <= 0) {
          this.running = false;
          if (this.onDead) this.onDead();
        }
        return false;
      }
      return f.y < this.H + 120;
    });
    this.bombs = this.bombs.filter((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += G;
      b.rot += b.rotSpd;
      return b.y < this.H + 100;
    });
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.life--;
      return p.life > 0;
    });
    this.slashTrail.push({ x: this.mouse.x, y: this.mouse.y });
    if (this.slashTrail.length > 16) this.slashTrail.shift();
    this.checkSlash();
    this.prevMouse = { ...this.mouse };
  }
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = "#FFF8EE";
    ctx.fillRect(0, 0, this.W, this.H);
    // slash trail
    if (this.slashTrail.length > 2) {
      ctx.beginPath();
      ctx.moveTo(this.slashTrail[0].x, this.slashTrail[0].y);
      for (let i = 1; i < this.slashTrail.length; i++) {
        ctx.lineTo(this.slashTrail[i].x, this.slashTrail[i].y);
      }
      ctx.strokeStyle = "rgba(255,107,26,.5)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    // particles
    this.particles.forEach((p) => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    // fruits
    this.fruits.forEach((f) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.font = f.r * 1.6 + "px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (f.sliced) {
        ctx.globalAlpha = 0;
      } // hide sliced (particles show)
      ctx.fillText(f.emoji, 0, 0);
      ctx.restore();
    });
    // bombs
    this.bombs.forEach((b) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.font = "52px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💣", 0, 0);
      ctx.restore();
    });
    // cursor blade
    ctx.beginPath();
    ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(45,27,0,.7)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,107,26,.9)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
