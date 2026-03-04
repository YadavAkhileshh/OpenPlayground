class BubblePhysics {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = canvas.offsetWidth;
    this.canvas.height = canvas.offsetHeight;
    this.bubbles = [];
    this.links = [];
    this.gravity = 0.5;
    this.bounce = 0.8;
    this.floatForce = 0.5;
    this.mode = "create";
    this.bubbleSize = 30;
    this.bubbleColor = "#FF6B9D";
    this.popped = 0;
    this.chain = 0;
    this.score = 0;
    this.linkStart = null;
    this.setupCanvas();
  }

  setupCanvas() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleClick(x, y);
    });
  }

  handleClick(x, y) {
    if (this.mode === "create") {
      this.createBubble(x, y);
    } else if (this.mode === "pop") {
      this.popBubble(x, y);
    } else if (this.mode === "link") {
      this.linkBubbles(x, y);
    }
  }

  createBubble(x, y) {
    const hue = this.bubbleColor === "rainbow" ? Math.random() * 360 : null;
    this.bubbles.push({
      x,
      y,
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 4 - 2,
      radius: this.bubbleSize,
      color: hue !== null ? `hsl(${hue},70%,60%)` : this.bubbleColor,
      floating: true,
    });
  }

  popBubble(x, y) {
    const index = this.bubbles.findIndex((b) => {
      const dx = b.x - x;
      const dy = b.y - y;
      return Math.sqrt(dx * dx + dy * dy) < b.radius;
    });
    if (index !== -1) {
      this.bubbles.splice(index, 1);
      this.popped++;
      this.chain++;
      this.score += 10 * this.chain;
      if (this.onPop) this.onPop();
    }
  }

  linkBubbles(x, y) {
    const bubble = this.bubbles.find((b) => {
      const dx = b.x - x;
      const dy = b.y - y;
      return Math.sqrt(dx * dx + dy * dy) < b.radius;
    });
    if (bubble) {
      if (!this.linkStart) {
        this.linkStart = bubble;
      } else if (this.linkStart !== bubble) {
        this.links.push({ b1: this.linkStart, b2: bubble });
        this.linkStart = null;
      }
    }
  }

  update() {
    this.bubbles.forEach((b) => {
      if (b.floating) {
        b.vy -= this.floatForce * 0.1;
      }
      b.vy += this.gravity * 0.1;
      b.x += b.vx;
      b.y += b.vy;

      if (b.x - b.radius < 0 || b.x + b.radius > this.canvas.width) {
        b.vx *= -this.bounce;
      }
      if (b.y - b.radius < 0 || b.y + b.radius > this.canvas.height) {
        b.vy *= -this.bounce;
      }

      b.x = Math.max(b.radius, Math.min(this.canvas.width - b.radius, b.x));
      b.y = Math.max(b.radius, Math.min(this.canvas.height - b.radius, b.y));
    });

    this.bubbles.forEach((b1, i) => {
      this.bubbles.slice(i + 1).forEach((b2) => {
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = b1.radius + b2.radius;
        if (dist < minDist) {
          const angle = Math.atan2(dy, dx);
          const overlap = (minDist - dist) / 2;
          b1.x -= Math.cos(angle) * overlap;
          b1.y -= Math.sin(angle) * overlap;
          b2.x += Math.cos(angle) * overlap;
          b2.y += Math.sin(angle) * overlap;
          const dvx = (b2.vx - b1.vx) * 0.5;
          const dvy = (b2.vy - b1.vy) * 0.5;
          b1.vx += dvx;
          b1.vy += dvy;
          b2.vx -= dvx;
          b2.vy -= dvy;
        }
      });
    });
  }

  render() {
    this.ctx.fillStyle = "rgba(255,255,255,0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.links.forEach((link) => {
      this.ctx.strokeStyle = "rgba(78,205,196,0.5)";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(link.b1.x, link.b1.y);
      this.ctx.lineTo(link.b2.x, link.b2.y);
      this.ctx.stroke();
    });

    this.bubbles.forEach((b) => {
      const gradient = this.ctx.createRadialGradient(
        b.x - b.radius * 0.3,
        b.y - b.radius * 0.3,
        0,
        b.x,
        b.y,
        b.radius,
      );
      gradient.addColorStop(0, "rgba(255,255,255,0.8)");
      gradient.addColorStop(0.5, b.color);
      gradient.addColorStop(1, "rgba(0,0,0,0.1)");
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });
  }

  clear() {
    this.bubbles = [];
    this.links = [];
    this.popped = 0;
    this.chain = 0;
    this.score = 0;
  }
}
