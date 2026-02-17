class MagicGarden {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.plants = [];
    this.magic = 100;
    this.growth = 0;
    this.blooms = 0;
    this.particles = [];
    this.currentSpell = null;
  }

  castSpell(spell, x, y) {
    if (this.magic < 10) return;
    this.magic -= 10;
    this.currentSpell = spell;

    if (spell === "grow") {
      this.plants.push({ x, y, type: "plant", size: 0, maxSize: 40, age: 0 });
    } else if (spell === "bloom") {
      this.plants.push({ x, y, type: "flower", size: 0, maxSize: 30, age: 0 });
      this.blooms++;
    } else if (spell === "rain") {
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: 0,
          vy: 5,
          type: "rain",
        });
      }
    } else if (spell === "sun") {
      this.plants.forEach((p) => (p.size = Math.min(p.maxSize, p.size + 5)));
    } else if (spell === "fairy") {
      this.particles.push({
        x,
        y,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        type: "fairy",
        life: 100,
      });
    } else if (spell === "butterfly") {
      this.particles.push({
        x,
        y,
        vx: Math.random() * 3 - 1.5,
        vy: Math.random() * 3 - 1.5,
        type: "butterfly",
        life: 150,
      });
    }

    this.createSparkles(x, y);
  }

  createSparkles(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        type: "sparkle",
        life: 30,
      });
    }
  }

  update() {
    this.plants.forEach((p, i) => {
      p.age++;
      p.size = Math.min(p.maxSize, p.size + 0.5);
      if (p.age > 500) this.plants.splice(i, 1);
    });

    this.particles = this.particles.filter((p) => {
      p.x += p.vx || 0;
      p.y += p.vy || 0;
      if (p.life !== undefined) {
        p.life--;
        return p.life > 0;
      }
      if (p.type === "rain") return p.y < this.canvas.height;
      return true;
    });

    this.magic = Math.min(100, this.magic + 0.05);
    this.growth = Math.min(100, (this.plants.length / 20) * 100);
  }

  render() {
    this.ctx.fillStyle = "#87CEEB";
    this.ctx.fillRect(0, 0, this.canvas.width, 300);
    this.ctx.fillStyle = "#98D8C8";
    this.ctx.fillRect(0, 300, this.canvas.width, 300);

    this.plants.forEach((p) => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);

      if (p.type === "plant") {
        this.ctx.fillStyle = "#2ECC71";
        this.ctx.fillRect(-5, 0, 10, -p.size);
        this.ctx.fillStyle = "#27AE60";
        this.ctx.beginPath();
        this.ctx.arc(0, -p.size, 8, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === "flower") {
        this.ctx.fillStyle = "#E74C3C";
        for (let i = 0; i < 5; i++) {
          this.ctx.beginPath();
          this.ctx.arc(
            Math.cos((i * Math.PI * 2) / 5) * 10,
            Math.sin((i * Math.PI * 2) / 5) * 10 - p.size,
            8,
            0,
            Math.PI * 2,
          );
          this.ctx.fill();
        }
        this.ctx.fillStyle = "#F39C12";
        this.ctx.beginPath();
        this.ctx.arc(0, -p.size, 6, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    this.particles.forEach((p) => {
      if (p.type === "sparkle") {
        this.ctx.fillStyle = "rgba(255,215,0," + p.life / 30 + ")";
        this.ctx.fillRect(p.x, p.y, 3, 3);
      } else if (p.type === "rain") {
        this.ctx.strokeStyle = "#3498DB";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x, p.y + 10);
        this.ctx.stroke();
      } else {
        this.ctx.font = "20px Arial";
        this.ctx.fillText(p.type === "fairy" ? "🧚" : "🦋", p.x, p.y);
      }
    });
  }
}
