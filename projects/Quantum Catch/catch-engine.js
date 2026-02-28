class QuantumCatch {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 1000;
    this.canvas.height = 600;
    this.particles = [];
    this.antimatter = [];
    this.score = 0;
    this.wave = 1;
    this.mouseX = 500;
    this.mouseY = 300;
    this.player = { x: 500, y: 300, radius: 20 };
    this.setupCanvas();
    this.spawnWave();
  }
  setupCanvas() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
    this.canvas.addEventListener("click", () => this.collapseWave());
  }
  spawnWave() {
    for (let i = 0; i < 5 + this.wave * 2; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        radius: 8,
        superposed: true,
        states: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
      });
    }
    for (let i = 0; i < 2 + this.wave; i++) {
      this.antimatter.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: Math.random() * 3 - 1.5,
        vy: Math.random() * 3 - 1.5,
        radius: 10,
      });
    }
  }
  collapseWave() {
    this.particles.forEach((p) => {
      if (p.superposed) {
        p.superposed = false;
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        if (Math.sqrt(dx * dx + dy * dy) < 100) {
          this.score += 10;
          this.createBurst(p.x, p.y);
        }
      }
    });
  }
  createBurst(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      setTimeout(() => {
        const particle = document.createElement("div");
        particle.style.position = "fixed";
        particle.style.width = "5px";
        particle.style.height = "5px";
        particle.style.background = "#00FFF5";
        particle.style.borderRadius = "50%";
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
      }, i * 50);
    }
  }
  update() {
    this.player.x += (this.mouseX - this.player.x) * 0.1;
    this.player.y += (this.mouseY - this.player.y) * 0.1;
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      const dx = p.x - this.player.x;
      const dy = p.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.player.radius + p.radius && !p.superposed) {
        this.score += 5;
        return false;
      }
      return true;
    });
    this.antimatter.forEach((a) => {
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > this.canvas.width) a.vx *= -1;
      if (a.y < 0 || a.y > this.canvas.height) a.vy *= -1;
      const dx = a.x - this.player.x;
      const dy = a.y - this.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < this.player.radius + a.radius) {
        this.score = Math.max(0, this.score - 20);
      }
    });
    if (this.particles.length === 0 && this.antimatter.length === 0) {
      this.wave++;
      this.spawnWave();
      if (this.onWaveComplete) this.onWaveComplete();
    }
  }
  render() {
    this.ctx.fillStyle = "rgba(0,8,20,0.2)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = p.superposed ? 0.6 : 1;
      this.ctx.fillStyle = p.superposed ? "#FF0080" : "#00FFF5";
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      if (p.superposed) {
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc(p.x + 20, p.y + 20, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });
    this.antimatter.forEach((a) => {
      this.ctx.fillStyle = "#FF1744";
      this.ctx.beginPath();
      this.ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = "#FF1744";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    });
    this.ctx.fillStyle = "#B026FF";
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "#B026FF";
    this.ctx.beginPath();
    this.ctx.arc(
      this.player.x,
      this.player.y,
      this.player.radius,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }
}
