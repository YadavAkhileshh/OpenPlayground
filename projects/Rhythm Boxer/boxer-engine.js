class RhythmBoxer {
  constructor() {
    this.lanes = ["a", "s", "d", "f"];
    this.targets = [];
    this.combo = 0;
    this.score = 0;
    this.health = 100;
    this.round = 1;
    this.gameRunning = false;
    this.targetSpeed = 3;
    this.keys = {};
    this.setupControls();
  }

  setupControls() {
    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (this.lanes.includes(key) && !this.keys[key]) {
        this.keys[key] = true;
        this.checkHit(key);
      }
    });
  }

  start() {
    this.gameRunning = true;
    this.spawnTargets();
  }

  spawnTargets() {
    if (!this.gameRunning) return;
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
    this.targets.push({ lane, y: 0, hit: false });
    setTimeout(() => this.spawnTargets(), 800 - this.round * 50);
  }

  checkHit(key) {
    const hitZone = 550;
    const tolerance = 50;
    const target = this.targets.find(
      (t) => t.lane === key && !t.hit && Math.abs(t.y - hitZone) < tolerance,
    );
    if (target) {
      target.hit = true;
      const distance = Math.abs(target.y - hitZone);
      if (distance < 20) {
        this.combo++;
        this.score += 10 * this.combo;
        if (this.onHit) this.onHit("perfect");
      } else {
        this.combo++;
        this.score += 5 * this.combo;
        if (this.onHit) this.onHit("good");
      }
    } else {
      this.combo = 0;
      this.health -= 5;
      if (this.onMiss) this.onMiss();
    }
  }

  update() {
    this.targets.forEach((t, i) => {
      t.y += this.targetSpeed;
      if (t.y > 600 && !t.hit) {
        this.combo = 0;
        this.health -= 10;
        this.targets.splice(i, 1);
      } else if (t.hit && t.y > 650) {
        this.targets.splice(i, 1);
      }
    });
    if (this.health <= 0 && this.onGameOver) this.onGameOver();
  }

  render(ctx, width, height) {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#FFB238";
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 550);
    ctx.lineTo(width, 550);
    ctx.stroke();
    ctx.setLineDash([]);

    this.targets.forEach((t) => {
      const laneIndex = this.lanes.indexOf(t.lane);
      const x = laneIndex * (width / 4) + width / 8;
      ctx.fillStyle = t.hit ? "#00F5D4" : "#FF0844";
      ctx.shadowBlur = 20;
      ctx.shadowColor = t.hit ? "#00F5D4" : "#FF0844";
      ctx.beginPath();
      ctx.arc(x, t.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
}
