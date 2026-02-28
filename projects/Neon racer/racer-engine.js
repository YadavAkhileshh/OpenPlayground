class NeonRacer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 1000;
    this.canvas.height = 600;
    this.player = {
      x: 500,
      y: 500,
      width: 40,
      height: 60,
      speed: 0,
      maxSpeed: 15,
      angle: 0,
    };
    this.obstacles = [];
    this.powerups = [];
    this.lap = 1;
    this.maxLaps = 3;
    this.checkpoint = 0;
    this.time = 0;
    this.score = 0;
    this.boost = 100;
    this.gameRunning = false;
    this.keys = {};
    this.setupControls();
    this.generateTrack();
  }
  setupControls() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });
    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }
  generateTrack() {
    for (let i = 0; i < 10; i++) {
      this.obstacles.push({
        x: Math.random() * 900 + 50,
        y: Math.random() * 500 + 50,
        width: 40,
        height: 40,
      });
    }
    for (let i = 0; i < 5; i++) {
      this.powerups.push({
        x: Math.random() * 900 + 50,
        y: Math.random() * 500 + 50,
        radius: 15,
        type: "boost",
      });
    }
  }
  start() {
    this.gameRunning = true;
    this.time = 0;
    this.score = 0;
    this.lap = 1;
  }
  update() {
    if (!this.gameRunning) return;
    this.time += 0.016;
    if (this.keys["ArrowLeft"]) this.player.angle -= 0.05;
    if (this.keys["ArrowRight"]) this.player.angle += 0.05;
    if (this.keys["ArrowUp"])
      this.player.speed = Math.min(
        this.player.maxSpeed,
        this.player.speed + 0.3,
      );
    else if (this.keys["ArrowDown"])
      this.player.speed = Math.max(0, this.player.speed - 0.5);
    else this.player.speed *= 0.98;
    this.player.x += Math.sin(this.player.angle) * this.player.speed;
    this.player.y -= Math.cos(this.player.angle) * this.player.speed;
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.canvas.width) this.player.x = this.canvas.width;
    if (this.player.y < 0) this.player.y = 0;
    if (this.player.y > this.canvas.height) this.player.y = this.canvas.height;
    this.obstacles.forEach((obs) => {
      const dx = this.player.x - obs.x;
      const dy = this.player.y - obs.y;
      if (Math.abs(dx) < 40 && Math.abs(dy) < 40) {
        this.player.speed *= 0.5;
      }
    });
    this.powerups = this.powerups.filter((p) => {
      const dx = this.player.x - p.x;
      const dy = this.player.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        this.boost = Math.min(100, this.boost + 30);
        this.score += 50;
        return false;
      }
      return true;
    });
    if (this.player.y < 50 && this.checkpoint === 3) {
      this.lap++;
      this.checkpoint = 0;
      this.score += 100;
      if (this.lap > this.maxLaps) {
        this.gameRunning = false;
        if (this.onFinish) this.onFinish();
      }
    }
    this.boost = Math.max(0, this.boost - 0.05);
  }
  render() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "#1E3A8A";
    this.ctx.lineWidth = 2;
    for (let i = 0; i < this.canvas.width; i += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }
    for (let i = 0; i < this.canvas.height; i += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();
    }
    this.ctx.fillStyle = "#FF1493";
    this.obstacles.forEach((obs) => {
      this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
    this.ctx.fillStyle = "#FFD700";
    this.powerups.forEach((p) => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);
    this.ctx.rotate(this.player.angle);
    this.ctx.fillStyle = "#00FFFF";
    this.ctx.fillRect(
      -this.player.width / 2,
      -this.player.height / 2,
      this.player.width,
      this.player.height,
    );
    this.ctx.restore();
  }
}
