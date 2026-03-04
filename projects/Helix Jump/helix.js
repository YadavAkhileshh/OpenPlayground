class HelixGame {
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
    this.cx = this.W / 2;
  }

  reset() {
    this.ball = { x: this.cx, y: 100, vy: 0, r: 14, trail: [] };
    this.platforms = [];
    this.rotation = 0;
    this.targetRot = 0;
    this.score = 0;
    this.level = 1;
    this.speed = 3;
    this.camY = 0;
    this.gameOver = false;
    this.generating = 0;
    this.buildInitial();
  }

  buildInitial() {
    for (let i = 0; i < 12; i++) this.addPlatform(-i * 160);
  }

  addPlatform(yPos) {
    const gapStart = Math.random() * Math.PI * 2;
    const gapSize = Math.PI * 0.55 + Math.random() * 0.3;
    const danger = this.score > 5 && Math.random() < 0.25;
    this.platforms.push({
      y: yPos,
      r: 120,
      gapStart,
      gapSize,
      rotation: 0,
      color: danger ? "#FF3366" : "#004E89",
      isDanger: danger,
    });
  }

  rotate(dir) {
    this.targetRot += (dir * Math.PI) / 4;
  }

  update() {
    const b = this.ball;
    b.vy += 0.55;
    b.y += b.vy;

    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 12) b.trail.shift();

    const worldY = b.y - this.camY;

    this.platforms.forEach((p) => {
      p.rotation = this.rotation;
      const platY = p.y + this.camY;

      if (Math.abs(worldY - platY) < b.r + 8 && b.vy > 0) {
        const angle =
          (Math.atan2(b.y - this.cy, b.x - this.cx) -
            p.rotation +
            Math.PI * 10) %
          (Math.PI * 2);
        const inGap = angle > p.gapStart && angle < p.gapStart + p.gapSize;

        if (!inGap) {
          if (p.isDanger) {
            this.gameOver = true;
            if (this.onGameOver) this.onGameOver();
            return;
          }
          b.vy = -10;
          b.y = platY - b.r - 8;
          this.score++;
          this.speed = 3 + this.score * 0.1;
        } else {
          b.y = platY + b.r + 9;
        }
      }
    });

    this.camY = this.camY + (-b.y + this.H * 0.3 - this.camY) * 0.08;
    this.rotation = this.rotation + (this.targetRot - this.rotation) * 0.18;

    if (this.platforms.length > 0) {
      const lowestY = Math.min(...this.platforms.map((p) => p.y));
      if (lowestY > b.y - this.H) {
        this.addPlatform(lowestY - 160);
      }
    }

    this.platforms = this.platforms.filter(
      (p) => p.y + this.camY < this.H + 200,
    );

    if (b.y > this.H + 200 && !this.gameOver) {
      this.gameOver = true;
      if (this.onGameOver) this.onGameOver();
    }
  }

  draw() {
    const ctx = this.ctx;
    const b = this.ball;

    ctx.fillStyle = "#EFEFD0";
    ctx.fillRect(0, 0, this.W, this.H);

    this.platforms.forEach((p) => {
      const py = p.y + this.camY;
      if (py < -100 || py > this.H + 100) return;

      ctx.save();
      ctx.translate(this.cx, py);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      ctx.arc(0, 0, p.r, p.gapStart + p.gapSize, p.gapStart + Math.PI * 2);
      ctx.arc(
        0,
        0,
        p.r - 20,
        p.gapStart + Math.PI * 2,
        p.gapStart + p.gapSize,
        true,
      );
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.isDanger ? "#ff3366" : "#004E89";
      ctx.fill();
      ctx.restore();
    });

    b.trail.forEach((t, i) => {
      const a = i / b.trail.length;
      ctx.beginPath();
      ctx.arc(
        t.x,
        t.y + this.H * 0.3 - b.y + b.y,
        b.r * (a * 0.7 + 0.3),
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = `rgba(255,107,53,${a * 0.4})`;
      ctx.fill();
    });

    ctx.beginPath();
    ctx.arc(b.x, b.y + this.H * 0.3 - b.y + b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6B35";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#FF6B35";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
