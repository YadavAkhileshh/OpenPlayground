class StellarDodge {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.W = 0;
    this.H = 0;
    this.running = false;
    this.keys = {};
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }
  resize() {
    this.W = this.cv.width = window.innerWidth;
    this.H = this.cv.height = window.innerHeight;
  }
  init() {
    this.ship = {
      x: this.W / 2,
      y: this.H - 140,
      w: 28,
      h: 48,
      vx: 0,
      vy: 0,
      speed: 5.5,
      boost: 100,
      shield: 100,
      angle: 0,
      trail: [],
    };
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
    this.stars = [];
    this.score = 0;
    this.wave = 1;
    this.spawnTimer = 0;
    this.spawnRate = 80;
    this.running = true;
    for (let i = 0; i < 160; i++)
      this.stars.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        s: Math.random() * 1.8 + 0.3,
        sp: Math.random() * 1.5 + 0.5,
      });
  }
  spawnAsteroid() {
    const x = Math.random() * this.W;
    const sz = 20 + Math.random() * 30 + this.wave * 3;
    const vx = (Math.random() - 0.5) * 2;
    const vy = 1.5 + Math.random() * 1.5 + this.wave * 0.2;
    const hp = sz > 40 ? 3 : sz > 30 ? 2 : 1;
    const pts = Math.floor(sz / 5);
    const sides = Math.floor(Math.random() * 4) + 5;
    const offsets = Array.from(
      { length: sides },
      () => 0.7 + Math.random() * 0.5,
    );
    this.asteroids.push({
      x,
      y: -sz,
      vx,
      vy,
      r: sz,
      rot: 0,
      rotSpd: (Math.random() - 0.5) * 0.03,
      hp,
      maxHp: hp,
      pts,
      sides,
      offsets,
      col: Math.random() < 0.15 ? "#C9A84C" : "#A0B4C8",
    });
  }
  shoot() {
    const s = this.ship;
    this.bullets.push({ x: s.x, y: s.y - s.h / 2, vy: -14, life: 60 });
    this.particles.push(
      ...Array.from({ length: 4 }, () => ({
        x: s.x,
        y: s.y - s.h / 2,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 4 - 1,
        life: 12,
        maxLife: 12,
        col: "#C9A84C",
        s: 2,
      })),
    );
  }
  update() {
    if (!this.running) return;
    const s = this.ship;
    let boosting = this.keys["ArrowUp"] || this.keys["w"];
    if (this.keys["ArrowLeft"] || this.keys["a"]) s.vx -= 0.7;
    if (this.keys["ArrowRight"] || this.keys["d"]) s.vx += 0.7;
    if (boosting && s.boost > 0) {
      s.vy -= 0.8;
      s.boost = Math.max(0, s.boost - 1);
    } else {
      s.vy += 0.15;
      s.boost = Math.min(100, s.boost + 0.4);
    }
    s.vx *= 0.88;
    s.vy *= 0.88;
    s.x += s.vx;
    s.y += s.vy;
    s.x = Math.max(s.w, Math.min(this.W - s.w, s.x));
    s.y = Math.max(80, Math.min(this.H - s.h, s.y));
    s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 18) s.trail.shift();
    // stars scroll
    this.stars.forEach((st) => {
      st.y += st.sp;
      if (st.y > this.H) st.y = 0;
    });
    // spawn
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnRate) {
      this.spawnAsteroid();
      this.spawnTimer = 0;
      this.spawnRate = Math.max(20, 80 - this.wave * 4);
    }
    // wave
    if (this.score > 0 && this.score % 500 === 0)
      this.wave = Math.floor(this.score / 500) + 1;
    // asteroids
    this.asteroids.forEach((a, ai) => {
      a.x += a.vx;
      a.y += a.vy;
      a.rot += a.rotSpd;
      if (a.y > this.H + 80) {
        this.asteroids.splice(ai, 1);
        return;
      }
      // hit bullets
      this.bullets.forEach((b, bi) => {
        if (Math.hypot(b.x - a.x, b.y - a.y) < a.r) {
          a.hp--;
          this.bullets.splice(bi, 1);
          for (let i = 0; i < 8; i++)
            this.particles.push({
              x: a.x,
              y: a.y,
              vx: (Math.random() - 0.5) * 7,
              vy: (Math.random() - 0.5) * 7,
              life: 20,
              maxLife: 20,
              col: a.col,
              s: Math.random() * 4 + 2,
            });
          if (a.hp <= 0) {
            this.score += a.pts * 10 * this.wave;
            this.asteroids.splice(ai, 1);
          }
        }
      });
      // hit ship
      if (s.shield > 0 && Math.hypot(a.x - s.x, a.y - s.y) < a.r + s.w * 0.8) {
        s.shield -= a.pts * 2;
        for (let i = 0; i < 12; i++)
          this.particles.push({
            x: s.x,
            y: s.y,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 9,
            life: 18,
            maxLife: 18,
            col: "#00E5FF",
            s: 3,
          });
        this.asteroids.splice(ai, 1);
        if (s.shield <= 0) {
          this.running = false;
          if (this.onDead) this.onDead();
        }
      }
    });
    // bullets
    this.bullets.forEach((b, i) => {
      b.y += b.vy;
      b.life--;
      if (b.life <= 0 || b.y < -10) this.bullets.splice(i, 1);
    });
    // particles
    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    });
    // auto score
    this.score++;
  }
  draw() {
    const ctx = this.ctx;
    const s = this.ship;
    ctx.fillStyle = "#06080F";
    ctx.fillRect(0, 0, this.W, this.H);
    // stars
    this.stars.forEach((st) => {
      ctx.fillStyle = `rgba(180,200,220,${st.s / 2.5})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.s / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    // trail
    s.trail.forEach((t, i) => {
      const a = i / s.trail.length;
      ctx.fillStyle = `rgba(0,229,255,${a * 0.3})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y + s.h / 2, 6 * a, 0, Math.PI * 2);
      ctx.fill();
    });
    // bullets
    this.bullets.forEach((b) => {
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#C9A84C";
      ctx.fillStyle = "#E8C97A";
      ctx.fillRect(b.x - 3, b.y - 8, 6, 16);
      ctx.shadowBlur = 0;
    });
    // asteroids
    this.asteroids.forEach((a) => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);
      ctx.beginPath();
      for (let i = 0; i < a.sides; i++) {
        const ang = (Math.PI * 2 * i) / a.sides;
        const r = a.r * a.offsets[i];
        if (i === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.fillStyle =
        a.hp < a.maxHp ? "rgba(255,51,85,.2)" : "rgba(160,180,200,.12)";
      ctx.strokeStyle = a.col;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = a.col;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    });
    // particles
    this.particles.forEach((p) => {
      const a = p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.col;
      ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    });
    ctx.globalAlpha = 1;
    // ship
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00E5FF";
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 1.5;
    ctx.fillStyle = "rgba(0,229,255,.15)";
    ctx.beginPath();
    ctx.moveTo(0, -s.h / 2);
    ctx.lineTo(-s.w / 2, s.h / 2);
    ctx.lineTo(0, s.h / 3);
    ctx.lineTo(s.w / 2, s.h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // gold accent
    ctx.fillStyle = "#C9A84C";
    ctx.strokeStyle = "#E8C97A";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -s.h / 3);
    ctx.lineTo(-s.w / 4, 0);
    ctx.lineTo(0, s.h / 6);
    ctx.lineTo(s.w / 4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
