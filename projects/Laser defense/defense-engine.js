class LaserDefense {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = canvas.offsetWidth;
    this.canvas.height = canvas.offsetHeight;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.energy = 500;
    this.wave = 1;
    this.destroyed = 0;
    this.score = 0;
    this.selectedTower = null;
    this.waveActive = false;
    this.enemiesInWave = 10;
    this.setupCanvas();
  }

  setupCanvas() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.placeTower(x, y);
    });
  }

  placeTower(x, y) {
    if (!this.selectedTower) return;
    const costs = { basic: 50, rapid: 100, sniper: 150, beam: 200 };
    if (this.energy >= costs[this.selectedTower]) {
      this.towers.push({
        x,
        y,
        type: this.selectedTower,
        range: 100,
        damage: 10,
        cooldown: 0,
        maxCooldown: this.selectedTower === "rapid" ? 30 : 60,
      });
      this.energy -= costs[this.selectedTower];
    }
  }

  startWave() {
    this.waveActive = true;
    this.spawnEnemies();
  }

  spawnEnemies() {
    for (let i = 0; i < this.enemiesInWave; i++) {
      setTimeout(() => {
        this.enemies.push({
          x: -50,
          y: Math.random() * this.canvas.height,
          health: 20 + this.wave * 10,
          maxHealth: 20 + this.wave * 10,
          speed: 1 + this.wave * 0.1,
          radius: 15,
        });
      }, i * 1000);
    }
  }

  update() {
    if (!this.waveActive) return;

    this.enemies.forEach((e, i) => {
      e.x += e.speed;
      if (e.x > this.canvas.width + 50) {
        this.enemies.splice(i, 1);
        this.energy -= 20;
      }
    });

    this.towers.forEach((t) => {
      if (t.cooldown > 0) {
        t.cooldown--;
        return;
      }
      const target = this.enemies.find((e) => {
        const dx = e.x - t.x;
        const dy = e.y - t.y;
        return Math.sqrt(dx * dx + dy * dy) < t.range;
      });
      if (target) {
        t.cooldown = t.maxCooldown;
        this.projectiles.push({
          x: t.x,
          y: t.y,
          tx: target.x,
          ty: target.y,
          speed: 10,
          damage: t.damage,
          type: t.type,
        });
      }
    });

    this.projectiles.forEach((p, i) => {
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      p.x += (dx / dist) * p.speed;
      p.y += (dy / dist) * p.speed;

      const hit = this.enemies.find(
        (e) => Math.sqrt((e.x - p.x) ** 2 + (e.y - p.y) ** 2) < e.radius,
      );

      if (hit) {
        hit.health -= p.damage;
        this.projectiles.splice(i, 1);
        if (hit.health <= 0) {
          const idx = this.enemies.indexOf(hit);
          this.enemies.splice(idx, 1);
          this.destroyed++;
          this.score += 10 * this.wave;
          this.energy += 5;
        }
      }

      if (dist < 5) this.projectiles.splice(i, 1);
    });

    if (this.enemies.length === 0 && this.waveActive) {
      this.waveActive = false;
      this.wave++;
      this.enemiesInWave += 5;
      if (this.onWaveComplete) this.onWaveComplete();
    }
  }

  render() {
    this.ctx.fillStyle = "rgba(0,0,0,0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "rgba(0,245,255,0.2)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    this.towers.forEach((t) => {
      const colors = {
        basic: "#FF3366",
        rapid: "#FFD93D",
        sniper: "#6BCF7F",
        beam: "#A259FF",
      };
      this.ctx.fillStyle = colors[t.type];
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = colors[t.type];
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    this.projectiles.forEach((p) => {
      this.ctx.strokeStyle = "#00F5FF";
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = "#00F5FF";
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x - 10, p.y);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    });

    this.enemies.forEach((e) => {
      this.ctx.fillStyle = "#FF3366";
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = "#FF3366";
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = "#FFD93D";
      this.ctx.fillRect(e.x - 20, e.y - 25, 40 * (e.health / e.maxHealth), 5);
    });
  }
}
