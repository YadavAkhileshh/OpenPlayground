class MeteorEngine {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.reset();
  }
  resize() {
    this.W = this.cv.width = window.innerWidth;
    this.H = this.cv.height = window.innerHeight;
  }
  reset() {
    this.ship = {
      x: this.W / 2,
      y: this.H - 120,
      w: 20,
      h: 32,
      hp: 100,
      vx: 0,
      vy: 0,
      invincible: 0,
    };
    this.bullets = [];
    this.meteors = [];
    this.particles = [];
    this.stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * this.W,
      y: Math.random() * this.H,
      s: Math.random() * 1.5 + 0.4,
      sp: Math.random() * 2 + 0.5,
    }));
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.bombs = 3;
    this.multi = 1;
    this.multiTimer = 0;
    this.spawnTimer = 0;
    this.running = false;
    this.keys = {};
  }
  spawnMeteor() {
    const types = ["small", "med", "large"];
    const t =
      this.wave > 3
        ? types[Math.floor(Math.random() * 3)]
        : types[Math.floor(Math.random() * 2)];
    const sizes = { small: 16, med: 26, large: 40 };
    const hp = { small: 1, med: 2, large: 4 };
    const pts = { small: 20, med: 40, large: 80 };
    const r = sizes[t];
    this.meteors.push({
      x: Math.random() * this.W,
      y: -r,
      vx: (Math.random() - 0.5) * (1 + this.wave * 0.2),
      vy: 1.5 + Math.random() * 1.5 + this.wave * 0.15,
      r,
      hp: hp[t],
      maxHp: hp[t],
      pts: pts[t],
      rot: 0,
      rotSpd: (Math.random() - 0.5) * 0.05,
      sides: t === "small" ? 5 : t === "med" ? 7 : 9,
      offsets: Array.from(
        { length: t === "small" ? 5 : t === "med" ? 7 : 9 },
        () => 0.7 + Math.random() * 0.5,
      ),
    });
  }
  bomb() {
    if (this.bombs <= 0) return;
    this.bombs--;
    this.meteors.forEach((m) => {
      for (let i = 0; i < 10; i++)
        this.particles.push({
          x: m.x,
          y: m.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 25,
          maxLife: 25,
          col: "#00E5FF",
          s: 4,
        });
    });
    this.score += this.meteors.length * 30 * this.multi;
    this.kills += this.meteors.length;
    this.meteors = [];
  }
  update() {
    if (!this.running) return;
    const s = this.ship;
    if (this.keys["a"] || this.keys["ArrowLeft"]) s.vx -= 0.7;
    if (this.keys["d"] || this.keys["ArrowRight"]) s.vx += 0.7;
    if (this.keys["w"] || this.keys["ArrowUp"]) s.vy -= 0.7;
    if (this.keys["s"] || this.keys["ArrowDown"]) s.vy += 0.7;
    s.vx *= 0.85;
    s.vy *= 0.85;
    s.x += s.vx;
    s.y += s.vy;
    s.x = Math.max(s.w, Math.min(this.W - s.w, s.x));
    s.y = Math.max(100, Math.min(this.H - s.h, s.y));
    if (s.invincible > 0) s.invincible--;
    this.stars.forEach((st) => {
      st.y += st.sp;
      if (st.y > this.H) st.y = 0;
    });
    this.spawnTimer++;
    const spawnRate = Math.max(20, 80 - this.wave * 6);
    if (this.spawnTimer >= spawnRate) {
      this.spawnMeteor();
      this.spawnTimer = 0;
    }
    if (this.score > 0 && this.score % (500 * this.wave) === 0)
      this.wave = Math.floor(this.score / 500) + 1;
    if (this.multiTimer > 0) this.multiTimer--;
    else this.multi = 1;
    this.bullets = this.bullets.filter((b) => {
      b.y += b.vy;
      let alive = b.y > -10;
      this.meteors.forEach((m, mi) => {
        if (Math.hypot(b.x - m.x, b.y - m.y) < m.r) {
          m.hp--;
          for (let j = 0; j < 5; j++)
            this.particles.push({
              x: m.x,
              y: m.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 18,
              maxLife: 18,
              col: "#FF2D78",
              s: 3,
            });
          if (m.hp <= 0) {
            this.kills++;
            this.score += m.pts * this.multi;
            this.multi = Math.min(8, this.multi + 0.5);
            this.multiTimer = 120;
            for (let j = 0; j < 12; j++)
              this.particles.push({
                x: m.x,
                y: m.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 28,
                maxLife: 28,
                col: "#FFE500",
                s: 4,
              });
            this.meteors.splice(mi, 1);
          }
          alive = false;
        }
      });
      return alive;
    });
    this.meteors.forEach((m, mi) => {
      m.x += m.vx;
      m.y += m.vy;
      m.rot += m.rotSpd;
      if (m.y > this.H + 60) {
        this.meteors.splice(mi, 1);
        return;
      }
      if (
        s.invincible <= 0 &&
        Math.hypot(m.x - s.x, m.y - s.y) < m.r + s.w * 0.7
      ) {
        s.hp -= m.hp * 10;
        s.invincible = 60;
        for (let j = 0; j < 15; j++)
          this.particles.push({
            x: s.x,
            y: s.y,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 9,
            life: 22,
            maxLife: 22,
            col: "#00E5FF",
            s: 3,
          });
        this.meteors.splice(mi, 1);
        if (s.hp <= 0) {
          this.running = false;
          if (this.onDead) this.onDead();
        }
      }
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
    const s = this.ship;
    ctx.fillStyle = "#04060D";
    ctx.fillRect(0, 0, this.W, this.H);
    this.stars.forEach((st) => {
      ctx.fillStyle = `rgba(200,220,255,${st.s / 2.2})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.s / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    this.bullets.forEach((b) => {
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#00E5FF";
      ctx.fillStyle = "#00E5FF";
      ctx.fillRect(b.x - 3, b.y - 8, 6, 16);
      ctx.shadowBlur = 0;
    });
    this.meteors.forEach((m) => {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rot);
      ctx.beginPath();
      for (let i = 0; i < m.sides; i++) {
        const a = (Math.PI * 2 * i) / m.sides;
        const r = m.r * m.offsets[i];
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(180,100,50,.15)";
      ctx.strokeStyle = "#C86432";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#C86432";
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    });
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
    const alpha =
      s.invincible > 0 ? 0.5 + Math.sin(Date.now() * 0.05) * 0.4 : 1;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00E5FF";
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(0,229,255,.1)";
    ctx.beginPath();
    ctx.moveTo(0, -s.h / 2);
    ctx.lineTo(-s.w / 2, s.h / 3);
    ctx.lineTo(0, (s.h / 2) * 0.4);
    ctx.lineTo(s.w / 2, s.h / 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FF2D78";
    ctx.strokeStyle = "#FF2D78";
    ctx.beginPath();
    ctx.moveTo(0, -s.h / 3);
    ctx.lineTo(-s.w * 0.3, s.h * 0.1);
    ctx.lineTo(0, 0);
    ctx.lineTo(s.w * 0.3, s.h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
