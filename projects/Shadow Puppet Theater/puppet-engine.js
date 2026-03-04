class ShadowPuppet {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.puppets = [];
    this.lightIntensity = 70;
    this.score = 0;
    this.act = 1;
    this.audienceMood = 3;
  }

  addPuppet(shape, x, y) {
    this.puppets.push({ shape, x, y, scale: 1, rotation: 0 });
  }

  updateLight(intensity) {
    this.lightIntensity = intensity;
  }

  movePuppet(index, dx, dy) {
    if (this.puppets[index]) {
      this.puppets[index].x += dx;
      this.puppets[index].y += dy;
    }
  }

  clear() {
    this.puppets = [];
  }

  render() {
    this.ctx.fillStyle = "#f5f5dc";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const opacity = this.lightIntensity / 100;

    this.puppets.forEach((p) => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.scale(p.scale, p.scale);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = `rgba(0,0,0,${opacity})`;

      if (p.shape === "person") {
        this.ctx.beginPath();
        this.ctx.arc(0, -30, 15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillRect(-10, -15, 20, 40);
        this.ctx.fillRect(-25, 0, 15, 30);
        this.ctx.fillRect(10, 0, 15, 30);
      } else if (p.shape === "bird") {
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(-20, -10);
        this.ctx.lineTo(-40, -5);
        this.ctx.lineTo(-20, 0);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(20, -10);
        this.ctx.lineTo(40, -5);
        this.ctx.lineTo(20, 0);
        this.ctx.fill();
      } else if (p.shape === "dog") {
        this.ctx.fillRect(-20, 0, 40, 25);
        this.ctx.fillRect(-25, -20, 15, 25);
        this.ctx.beginPath();
        this.ctx.arc(-17, -25, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillRect(-20, 20, 10, 15);
        this.ctx.fillRect(10, 20, 10, 15);
      } else if (p.shape === "tree") {
        this.ctx.fillRect(-5, 0, 10, 40);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -30);
        this.ctx.lineTo(-25, 0);
        this.ctx.lineTo(25, 0);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (p.shape === "house") {
        this.ctx.fillRect(-30, 0, 60, 40);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -30);
        this.ctx.lineTo(-35, 0);
        this.ctx.lineTo(35, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillRect(-10, 15, 15, 25);
      } else if (p.shape === "sun") {
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          this.ctx.lineTo(Math.cos(angle) * 40, Math.sin(angle) * 40);
          this.ctx.lineWidth = 5;
          this.ctx.stroke();
        }
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }
}
