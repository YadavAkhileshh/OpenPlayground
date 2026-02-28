class PongEngine {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.keys = {};
    this.mode = "1p";
    this.diff = "med";
    this.scoreR = 0;
    this.scoreB = 0;
    this.maxScore = 7;
    this.rally = 0;
    this.maxRally = 0;
    this.matches = 0;
  }
  resize() {
    this.W = this.cv.width = window.innerWidth;
    this.H = this.cv.height = window.innerHeight;
  }
  init() {
    const PH = 100,
      PW = 14;
    this.padR = { x: 40, y: this.H / 2 - PH / 2, w: PW, h: PH, vy: 0 };
    this.padB = {
      x: this.W - 40 - PW,
      y: this.H / 2 - PH / 2,
      w: PW,
      h: PH,
      vy: 0,
    };
    this.ball = {
      x: this.W / 2,
      y: this.H / 2,
      r: 10,
      vx: 0,
      vy: 0,
      trail: [],
    };
    this.particles = [];
    this.running = false;
    this.paused = true;
    this.scoreR = 0;
    this.scoreB = 0;
    this.rally = 0;
  }
  launchBall() {
    const ang = Math.random() * 0.6 - 0.3 + (Math.random() < 0.5 ? 0 : Math.PI);
    const spd = 6;
    this.ball.x = this.W / 2;
    this.ball.y = this.H / 2;
    this.ball.vx = Math.cos(ang) * spd;
    this.ball.vy = Math.sin(ang) * spd;
    this.ball.trail = [];
    this.paused = false;
  }
  update() {
    if (!this.running || this.paused) return;
    const b = this.ball;
    // trail
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 12) b.trail.shift();
    b.x += b.vx;
    b.y += b.vy;
    // walls
    if (b.y - b.r < 0) {
      b.y = b.r;
      b.vy = Math.abs(b.vy);
    }
    if (b.y + b.r > this.H) {
      b.y = this.H - b.r;
      b.vy = -Math.abs(b.vy);
    }
    // AI for red (1P) or player 2 controls
    if (this.mode === "1p") {
      const speed = { easy: 3, med: 4.5, hard: 6.5 }[this.diff];
      const target = b.y - this.padR.h / 2;
      const dist = target - this.padR.y;
      this.padR.vy = Math.sign(dist) * Math.min(Math.abs(dist), speed);
    } else {
      if (this.keys["w"]) this.padR.vy = -6;
      else if (this.keys["s"]) this.padR.vy = 6;
      else this.padR.vy *= 0.8;
    }
    if (this.keys["ArrowUp"]) this.padB.vy = -6;
    else if (this.keys["ArrowDown"]) this.padB.vy = 6;
    else this.padB.vy *= 0.8;
    this.padR.y = Math.max(
      0,
      Math.min(this.H - this.padR.h, this.padR.y + this.padR.vy),
    );
    this.padB.y = Math.max(
      0,
      Math.min(this.H - this.padB.h, this.padB.y + this.padB.vy),
    );
    // collisions
    const hitPad = (pad, isLeft) => {
      if (
        b.x - b.r < pad.x + pad.w &&
        b.x + b.r > pad.x &&
        b.y > pad.y &&
        b.y < pad.y + pad.h
      ) {
        const rel = (b.y - (pad.y + pad.h / 2)) / (pad.h / 2);
        const ang = rel * (Math.PI / 3);
        const spd = Math.min(Math.hypot(b.vx, b.vy) * 1.05, 18);
        b.vx = isLeft
          ? Math.abs(Math.cos(ang) * spd)
          : -Math.abs(Math.cos(ang) * spd);
        b.vy = Math.sin(ang) * spd;
        this.rally++;
        if (this.rally > this.maxRally) this.maxRally = this.rally;
        for (let i = 0; i < 10; i++)
          this.particles.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 20,
            maxLife: 20,
            col: isLeft ? "#FF4060" : "#4080FF",
          });
        return true;
      }
    };
    hitPad(this.padR, true);
    hitPad(this.padB, false);
    // score
    if (b.x < 0) {
      this.scoreB++;
      this.rally = 0;
      this.paused = true;
      if (this.onScore) this.onScore("B");
    }
    if (b.x > this.W) {
      this.scoreR++;
      this.rally = 0;
      this.paused = true;
      if (this.onScore) this.onScore("R");
    }
    if (this.scoreR >= this.maxScore || this.scoreB >= this.maxScore) {
      this.running = false;
      if (this.onGameOver) this.onGameOver();
    }
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.88;
      p.vy *= 0.88;
      p.life--;
      return p.life > 0;
    });
  }
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = "#07090F";
    ctx.fillRect(0, 0, this.W, this.H);
    // center line
    ctx.setLineDash([10, 14]);
    ctx.strokeStyle = "rgba(255,255,255,.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.W / 2, 0);
    ctx.lineTo(this.W / 2, this.H);
    ctx.stroke();
    ctx.setLineDash([]);
    // trail
    this.ball.trail.forEach((t, i) => {
      const a = i / this.ball.trail.length;
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.ball.r * a, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    // ball glow
    const grad = ctx.createRadialGradient(
      this.ball.x,
      this.ball.y,
      0,
      this.ball.x,
      this.ball.y,
      30,
    );
    grad.addColorStop(0, "rgba(255,255,255,.4)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, 30, 0, Math.PI * 2);
    ctx.fill();
    // ball
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#fff";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // paddles
    [
      [this.padR, "#FF4060"],
      [this.padB, "#4080FF"],
    ].forEach(([p, col]) => {
      ctx.shadowBlur = 20;
      ctx.shadowColor = col;
      const g = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      g.addColorStop(0, col);
      g.addColorStop(0.5, "#fff");
      g.addColorStop(1, col);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    // particles
    this.particles.forEach((p) => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
