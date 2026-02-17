class CrystalCollector {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.canvas.width = 800;
    this.canvas.height = 600;

    this.player = { x: 400, y: 300, radius: 15, speed: 3 };
    this.crystals = [];
    this.collected = [];
    this.energy = 100;
    this.level = 1;
    this.value = 0;
    this.keys = {};

    this.setupControls();
    this.spawnCrystals();
  }

  setupControls() {
    document.addEventListener("keydown", (e) => (this.keys[e.key] = true));
    document.addEventListener("keyup", (e) => (this.keys[e.key] = false));
  }

  spawnCrystals() {
    this.crystals = [];
    const types = [
      { emoji: "💎", value: 10, color: "#FF1493" },
      { emoji: "💚", value: 15, color: "#00FF00" },
      { emoji: "💙", value: 20, color: "#0000FF" },
      { emoji: "💠", value: 50, color: "#FFD700" },
    ];

    for (let i = 0; i < 10 + this.level * 2; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      this.crystals.push({
        x: Math.random() * 750 + 25,
        y: Math.random() * 550 + 25,
        type: type.emoji,
        value: type.value,
        color: type.color,
        radius: 15,
      });
    }
  }

  update() {
    if ((this.keys["w"] || this.keys["ArrowUp"]) && this.player.y > 15)
      this.player.y -= this.player.speed;
    if ((this.keys["s"] || this.keys["ArrowDown"]) && this.player.y < 585)
      this.player.y += this.player.speed;
    if ((this.keys["a"] || this.keys["ArrowLeft"]) && this.player.x > 15)
      this.player.x -= this.player.speed;
    if ((this.keys["d"] || this.keys["ArrowRight"]) && this.player.x < 785)
      this.player.x += this.player.speed;

    this.crystals = this.crystals.filter((c) => {
      const dx = this.player.x - c.x;
      const dy = this.player.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.player.radius + c.radius) {
        this.collected.push(c.type);
        this.value += c.value;
        this.energy = Math.min(100, this.energy + 10);
        if (this.onCollect) this.onCollect();
        return false;
      }
      return true;
    });

    this.energy = Math.max(0, this.energy - 0.05);

    if (this.crystals.length === 0) {
      this.level++;
      this.spawnCrystals();
    }

    if (this.energy <= 0 && this.onGameOver) this.onGameOver();
  }

  render() {
    this.ctx.fillStyle = "#1a0a00";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.crystals.forEach((c) => {
      this.ctx.fillStyle = c.color;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = c.color;
      this.ctx.font = "25px Arial";
      this.ctx.fillText(c.type, c.x - 12, c.y + 8);
      this.ctx.shadowBlur = 0;
    });

    this.ctx.fillStyle = "#FFD700";
    this.ctx.beginPath();
    this.ctx.arc(
      this.player.x,
      this.player.y,
      this.player.radius,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();
    this.ctx.strokeStyle = "#FFA500";
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }
}
