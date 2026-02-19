class VoidEngine {
  constructor(c) {
    this.c = c;
    this.ctx = c.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.reset();
  }
  resize() {
    this.W = this.c.width = window.innerWidth;
    this.H = this.c.height = window.innerHeight;
  }
  reset() {
    this.player = {
      x: this.W / 2,
      y: this.H / 2,
      r: 14,
      hp: 100,
      maxHp: 100,
      vx: 0,
      vy: 0,
      dash: 0,
      dashCd: 0,
      invincible: 0,
      angle: 0,
    };
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.pBullets = [];
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.gameRunning = false;
    this.mouse = { x: this.W / 2, y: this.H / 2 };
    this.keys = {};
    this.shooting = false;
    this.shootTimer = 0;
    this.stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * this.W,
      y: Math.random() * this.H,
      s: Math.random() * 2 + 0.5,
      b: Math.random(),
    }));
  }
  spawnWave() {
    const n = 4 + this.wave * 2;
    for (let i = 0; i < n; i++) {
      const side = Math.floor(Math.random() * 4);
      let ex, ey;
      if (side === 0) {
        ex = Math.random() * this.W;
        ey = -40;
      } else if (side === 1) {
        ex = this.W + 40;
        ey = Math.random() * this.H;
      } else if (side === 2) {
        ex = Math.random() * this.W;
        ey = this.H + 40;
      } else {
        ex = -40;
        ey = Math.random() * this.H;
      }
      const t =
        this.wave > 5
          ? Math.floor(Math.random() * 3)
          : Math.floor(Math.random() * 2);
      this.enemies.push({
        x: ex,
        y: ey,
        r: t === 2 ? 22 : t === 1 ? 18 : 14,
        hp: t === 2 ? 4 : t === 1 ? 2 : 1,
        maxHp: t === 2 ? 4 : t === 1 ? 2 : 1,
        type: t,
        vx: 0,
        vy: 0,
        angle: 0,
        shootTimer: t > 0 ? 60 : 999,
        t: 0,
      });
    }
  }
  update() {
    if (!this.gameRunning) return;
    const p = this.player;
    const dx = this.mouse.x - p.x,
      dy = this.mouse.y - p.y;
    p.angle = Math.atan2(dy, dx);
    // player movement
    const spd = 5;
    let mx = 0,
      my = 0;
    if (this.keys["a"] || this.keys["ArrowLeft"]) mx = -1;
    if (this.keys["d"] || this.keys["ArrowRight"]) mx = 1;
    if (this.keys["w"] || this.keys["ArrowUp"]) my = -1;
    if (this.keys["s"] || this.keys["ArrowDown"]) my = 1;
    if (mx || my) {
      const mag = Math.sqrt(mx * mx + my * my);
      p.vx = (mx / mag) * spd;
      p.vy = (my / mag) * spd;
    } else {
      p.vx *= 0.85;
      p.vy *= 0.85;
    }
    // dash
    if (this.keys[" "] && p.dashCd <= 0) {
      p.dash = 15;
      p.dashCd = 90;
      p.invincible = 20;
      for (let i = 0; i < 12; i++)
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 20,
          maxLife: 20,
          color: "#0ff",
          s: 4,
        });
    }
    if (p.dashCd > 0) p.dashCd--;
    if (p.dash > 0) {
      p.dash--;
      p.vx *= 1.8;
      p.vy *= 1.8;
    }
    if (p.invincible > 0) p.invincible--;
    p.x += p.vx;
    p.y += p.vy;
    p.x = Math.max(p.r, Math.min(this.W - p.r, p.x));
    p.y = Math.max(p.r, Math.min(this.H - p.r, p.y));
    // shoot
    if (this.shooting && this.shootTimer <= 0) {
      this.pBullets.push({
        x: p.x + Math.cos(p.angle) * 20,
        y: p.y + Math.sin(p.angle) * 20,
        vx: Math.cos(p.angle) * 14,
        vy: Math.sin(p.angle) * 14,
        life: 60,
      });
      this.shootTimer = 8;
    }
    if (this.shootTimer > 0) this.shootTimer--;
    // enemies
    this.enemies.forEach((e) => {
      e.t++;
      const edx = p.x - e.x,
        edy = p.y - e.y;
      const ed = Math.sqrt(edx * edx + edy * edy);
      e.vx = (edx / ed) * (e.type === 2 ? 1.5 : e.type === 1 ? 2 : 2.5);
      e.vy = (edy / ed) * (e.type === 2 ? 1.5 : e.type === 1 ? 2 : 2.5);
      e.x += e.vx;
      e.y += e.vy;
      e.angle = Math.atan2(edy, edx);
      // enemy shoot
      if (e.type === 1 && e.t % 80 === 0) {
        const ea = e.angle;
        for (let a = -1; a <= 1; a++)
          this.bullets.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(ea + a * 0.3) * 5,
            vy: Math.sin(ea + a * 0.3) * 5,
            life: 80,
          });
      }
      if (e.type === 2 && e.t % 60 === 0) {
        for (let i = 0; i < 6; i++) {
          const ra = (Math.PI * 2 * i) / 6;
          this.bullets.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(ra) * 4,
            vy: Math.sin(ra) * 4,
            life: 90,
          });
        }
      }
    });
    // player bullets hit enemies
    this.pBullets = this.pBullets.filter((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      let alive =
        b.life > 0 && b.x > 0 && b.x < this.W && b.y > 0 && b.y < this.H;
      this.enemies.forEach((e, i) => {
        if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + 5) {
          e.hp--;
          for (let j = 0; j < 6; j++)
            this.particles.push({
              x: e.x,
              y: e.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 15,
              maxLife: 15,
              color: e.type === 2 ? "#f0f" : e.type === 1 ? "#ff0" : "#0ff",
              s: 3,
            });
          if (e.hp <= 0) {
            this.kills++;
            this.score += 100 * this.combo;
            this.combo++;
            this.comboTimer = 120;
            for (let j = 0; j < 15; j++)
              this.particles.push({
                x: e.x,
                y: e.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: e.type === 2 ? "#f0f" : e.type === 1 ? "#ff0" : "#0ff",
                s: 5,
              });
            this.enemies.splice(i, 1);
          }
          alive = false;
        }
      });
      return alive;
    });
    // enemy bullets hit player
    if (p.invincible <= 0) {
      this.bullets.forEach((b, i) => {
        if (Math.hypot(b.x - p.x, b.y - p.y) < p.r + b.r) {
          {
            p.hp -= 10;
            p.invincible = 30;
            this.bullets.splice(i, 1);
            for (let j = 0; j < 8; j++)
              this.particles.push({
                x: p.x,
                y: p.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 20,
                maxLife: 20,
                color: "#f06",
                s: 4,
              });
          }
        }
      });
      // enemy touch player
      this.enemies.forEach((e, i) => {
        if (Math.hypot(e.x - p.x, e.y - p.y) < p.r + e.r) {
          p.hp -= 15;
          p.invincible = 30;
          this.enemies.splice(i, 1);
        }
      });
    }
    // bullets update
    this.bullets = this.bullets.filter((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      return (
        b.life > 0 &&
        b.x > -20 &&
        b.x < this.W + 20 &&
        b.y > -20 &&
        b.y < this.H + 20
      );
    });
    // particles
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.life--;
      return p.life > 0;
    });
    // combo timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
    } else {
      this.combo = 1;
    }
    // wave logic
    if (this.enemies.length === 0) {
      this.waveTimer++;
      if (this.waveTimer > 90) {
        this.wave++;
        this.waveTimer = 0;
        this.spawnWave();
      }
    }
    // game over
    if (p.hp <= 0) {
      this.gameRunning = false;
      if (this.onGameOver) this.onGameOver();
    }
  }
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = "#030308";
    ctx.fillRect(0, 0, this.W, this.H);
    // stars
    this.stars.forEach((s) => {
      const b = s.b + Math.sin(Date.now() * 0.001 + s.x) * 0.3;
      ctx.fillStyle = `rgba(255,255,255,${b * 0.6})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2);
      ctx.fill();
    });
    // grid
    ctx.strokeStyle = "rgba(0,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < this.W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.H);
      ctx.stroke();
    }
    for (let y = 0; y < this.H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.W, y);
      ctx.stroke();
    }
    // enemy bullets
    this.bullets.forEach((b) => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#f06";
      ctx.fillStyle = "#f06";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    // player bullets
    this.pBullets.forEach((b) => {
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#0ff";
      ctx.fillStyle = "#0ff";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    // enemies
    this.enemies.forEach((e) => {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);
      ctx.shadowBlur = 20;
      const colors = ["#0ff", "#ff0", "#f0f"];
      ctx.shadowColor = colors[e.type];
      ctx.strokeStyle = colors[e.type];
      ctx.lineWidth = 2;
      if (e.type === 0) {
        ctx.beginPath();
        ctx.moveTo(e.r, 0);
        ctx.lineTo(-e.r, -e.r * 0.7);
        ctx.lineTo(-e.r, e.r * 0.7);
        ctx.closePath();
        ctx.stroke();
      } else if (e.type === 1) {
        ctx.strokeRect(-e.r, -e.r, e.r * 2, e.r * 2);
      } else {
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(
            e.r * Math.cos((Math.PI / 3) * i),
            e.r * Math.sin((Math.PI / 3) * i),
          );
          ctx.lineTo(
            e.r * Math.cos((Math.PI / 3) * (i + 1)),
            e.r * Math.sin((Math.PI / 3) * (i + 1)),
          );
          ctx.stroke();
        }
      }
      // hp bar
      if (e.hp < e.maxHp) {
        ctx.fillStyle = "rgba(0,0,0,.6)";
        ctx.fillRect(-e.r, -e.r - 12, e.r * 2, 5);
        ctx.fillStyle = colors[e.type];
        ctx.fillRect(-e.r, -e.r - 12, e.r * 2 * (e.hp / e.maxHp), 5);
      }
      ctx.restore();
    });
    // player
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    const alpha =
      p.invincible > 0 ? 0.5 + Math.sin(Date.now() * 0.05) * 0.4 : 1;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#0ff";
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-12, -10);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-12, 10);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
    // particles
    this.particles.forEach((p) => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}
