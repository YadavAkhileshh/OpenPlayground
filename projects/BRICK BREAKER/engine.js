const BB_COLORS = [
  ["#00CED1", "rgba(0,206,209,.3)"],
  ["#E040FB", "rgba(224,64,251,.3)"],
  ["#C9A84C", "rgba(201,168,76,.3)"],
  ["#FF4560", "rgba(255,69,96,.3)"],
  ["#00E676", "rgba(0,230,118,.3)"],
  ["#FF9100", "rgba(255,145,0,.3)"],
];
const POWERUPS = ["WIDE", "MULTI", "FAST", "SLOW", "EXTRA"];
class BrickEngine {
  constructor(cv) {
    this.cv = cv;
    this.ctx = cv.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.keys = {};
    this.mouse = { x: 0 };
    this.reset();
  }
  resize() {
    this.W = this.cv.width = window.innerWidth;
    this.H = this.cv.height = window.innerHeight;
  }
  reset() {
    this.paddle = {
      x: this.W / 2 - 60,
      y: this.H - 60,
      w: 120,
      h: 14,
      speed: 9,
    };
    this.balls = [];
    this.bricks = [];
    this.particles = [];
    this.drops = [];
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.launched = false;
    this.running = false;
    this.buildLevel();
  }
  buildLevel() {
    this.bricks = [];
    const cols = 10,
      rows = Math.min(4 + this.level, 10),
      bw = (this.W - 80) / cols,
      bh = 30;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const hp = r < 2 ? 1 : r < 4 ? 2 : 3;
        const [col, glow] = BB_COLORS[(r + c) % BB_COLORS.length];
        this.bricks.push({
          x: 40 + c * bw,
          y: 80 + r * (bh + 5),
          w: bw - 5,
          h: bh,
          hp,
          maxHp: hp,
          col,
          glow,
          powerup:
            Math.random() < 0.08
              ? POWERUPS[Math.floor(Math.random() * POWERUPS.length)]
              : null,
        });
      }
    this.balls = [
      { x: this.W / 2, y: this.H - 90, vx: 0, vy: 0, r: 9, trail: [] },
    ];
    this.launched = false;
  }
  launch() {
    if (this.launched) return;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    this.balls[0].vx = Math.cos(ang) * 8;
    this.balls[0].vy = Math.sin(ang) * 8;
    this.launched = true;
  }
  applyPower(type) {
    if (type === "WIDE") this.paddle.w = Math.min(220, this.paddle.w + 50);
    else if (type === "MULTI") {
      const b = this.balls[0];
      this.balls.push({ ...b, vx: -b.vx, trail: [] });
      this.balls.push({ ...b, vy: -Math.abs(b.vy), trail: [] });
    } else if (type === "EXTRA") this.lives++;
    else if (type === "FAST")
      this.balls.forEach((b) => {
        b.vx *= 1.3;
        b.vy *= 1.3;
      });
    else if (type === "SLOW")
      this.balls.forEach((b) => {
        b.vx *= 0.7;
        b.vy *= 0.7;
      });
    if (this.onPower) this.onPower(type);
  }
  update() {
    if (!this.running) return;
    const pad = this.paddle;
    const tw = pad.w;
    pad.x = Math.max(0, Math.min(this.W - tw, this.mouse.x - tw / 2));
    if (!this.launched) {
      this.balls[0].x = pad.x + tw / 2;
      return;
    }
    this.balls.forEach((b, bi) => {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 10) b.trail.shift();
      b.x += b.vx;
      b.y += b.vy;
      if (b.x - b.r < 0) {
        b.x = b.r;
        b.vx = Math.abs(b.vx);
      }
      if (b.x + b.r > this.W) {
        b.x = this.W - b.r;
        b.vx = -Math.abs(b.vx);
      }
      if (b.y - b.r < 60) {
        b.y = 60 + b.r;
        b.vy = Math.abs(b.vy);
      }
      if (
        b.y + b.r > pad.y &&
        b.y + b.r < pad.y + pad.h + b.vy &&
        b.x > pad.x &&
        b.x < pad.x + tw
      ) {
        const rel = (b.x - (pad.x + tw / 2)) / (tw / 2);
        const ang = -Math.PI / 2 + rel * (Math.PI / 3);
        const spd = Math.hypot(b.vx, b.vy);
        b.vx = Math.cos(ang) * spd;
        b.vy = Math.sin(ang) * spd;
        b.y = pad.y - b.r;
      }
      if (b.y > this.H + 40) {
        this.balls.splice(bi, 1);
      }
      this.bricks.forEach((br, bri) => {
        if (
          b.x + b.r > br.x &&
          b.x - b.r < br.x + br.w &&
          b.y + b.r > br.y &&
          b.y - b.r < br.y + br.h
        ) {
          const fromLeft = Math.abs(b.x - (br.x + br.w));
          const fromRight = Math.abs(b.x - br.x);
          const fromTop = Math.abs(b.y - (br.y + br.h));
          const fromBot = Math.abs(b.y - br.y);
          const minD = Math.min(fromLeft, fromRight, fromTop, fromBot);
          if (minD === fromTop || minD === fromBot) b.vy *= -1;
          else b.vx *= -1;
          br.hp--;
          for (let i = 0; i < 8; i++)
            this.particles.push({
              x: br.x + br.w / 2,
              y: br.y + br.h / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 20,
              maxLife: 20,
              col: br.col,
              s: 4,
            });
          this.score += 10 * (br.maxHp - br.hp + 1) * this.level;
          if (br.hp <= 0) {
            if (br.powerup)
              this.drops.push({
                x: br.x + br.w / 2,
                y: br.y,
                type: br.powerup,
                vy: 2.5,
              });
            this.bricks.splice(bri, 1);
          }
        }
      });
    });
    if (this.balls.length === 0) {
      this.lives--;
      if (this.lives <= 0) {
        this.running = false;
        if (this.onDead) this.onDead();
        return;
      }
      this.balls = [
        { x: this.W / 2, y: this.H - 90, vx: 0, vy: 0, r: 9, trail: [] },
      ];
      this.launched = false;
    }
    if (this.bricks.length === 0) {
      this.level++;
      this.paddle.w = Math.max(80, this.paddle.w - 10);
      this.buildLevel();
      if (this.onLevelUp) this.onLevelUp();
    }
    this.drops = this.drops.filter((d) => {
      d.y += d.vy;
      if (
        d.y > pad.y &&
        d.y < pad.y + pad.h &&
        Math.abs(d.x - pad.x - pad.w / 2) < pad.w / 2
      ) {
        this.applyPower(d.type);
        return false;
      }
      return d.y < this.H + 30;
    });
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.life--;
      return p.life > 0;
    });
  }
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = "#09080E";
    ctx.fillRect(0, 0, this.W, this.H);
    this.bricks.forEach((br) => {
      ctx.fillStyle = br.col;
      ctx.shadowBlur = 10;
      ctx.shadowColor = br.glow;
      const crack = 1 - br.hp / br.maxHp;
      ctx.globalAlpha = 0.9 - crack * 0.2;
      ctx.beginPath();
      ctx.roundRect(br.x, br.y, br.w, br.h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.fillRect(br.x, br.y, br.w, 5);
    });
    this.particles.forEach((p) => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    this.drops.forEach((d) => {
      ctx.font = "1.1rem serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        { WIDE: "↔", MULTI: "×3", FAST: "⚡", SLOW: "❄", EXTRA: "❤" }[d.type] ||
          "◆",
        d.x,
        d.y,
      );
    });
    this.balls.forEach((b) => {
      b.trail.forEach((t, i) => {
        const a = i / b.trail.length;
        ctx.globalAlpha = a * 0.4;
        ctx.fillStyle = "#00CED1";
        ctx.beginPath();
        ctx.arc(t.x, t.y, b.r * a, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00CED1";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    const pad = this.paddle;
    const pg = ctx.createLinearGradient(pad.x, pad.y, pad.x, pad.y + pad.h);
    pg.addColorStop(0, "rgba(0,206,209,.9)");
    pg.addColorStop(1, "rgba(0,206,209,.4)");
    ctx.fillStyle = pg;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00CED1";
    ctx.beginPath();
    ctx.roundRect(pad.x, pad.y, pad.w, pad.h, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
