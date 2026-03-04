class StackEngine {
  constructor(cv) {
    this.cv = cv;
    this.ctx = cv.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.reset();
  }
  resize() {
    this.W = this.cv.width = window.innerWidth;
    this.H = this.cv.height = window.innerHeight;
  }
  reset() {
    this.BLOCK_H = 28;
    const startW = Math.min(this.W * 0.55, 320);
    this.stack = [
      {
        x: this.W / 2 - startW / 2,
        w: startW,
        y: this.H - 60,
        color: "#1C1C1C",
      },
    ];
    this.moving = { x: -100, w: startW, dir: 1, speed: 3.5 };
    this.height = 0;
    this.perfects = 0;
    this.running = false;
    this.camY = 0;
    this.targetCamY = 0;
    this.fallingBlocks = [];
    this.colors = [
      "#E63B2E",
      "#2D5BE3",
      "#1C9E4A",
      "#D4900A",
      "#8B3FC8",
      "#C4473A",
      "#1A7ABF",
    ];
    this.colorIdx = 0;
  }
  getTopBlock() {
    return this.stack[this.stack.length - 1];
  }
  drop() {
    if (!this.running) return;
    const top = this.getTopBlock();
    const mov = this.moving;
    // overlap calculation
    const left = Math.max(top.x, mov.x);
    const right = Math.min(top.x + top.w, mov.x + mov.w);
    const overlap = right - left;
    if (overlap <= 0) {
      this.running = false;
      if (this.onGameOver) this.onGameOver();
      return;
    }
    const perfect = Math.abs(overlap - top.w) < 4;
    const newW = perfect ? top.w : overlap;
    const newX = perfect ? top.x : left;
    const newY = top.y - this.BLOCK_H;
    this.colorIdx = (this.colorIdx + 1) % this.colors.length;
    this.stack.push({
      x: newX,
      w: newW,
      y: newY,
      color: this.colors[this.colorIdx],
    });
    // chop off
    if (!perfect) {
      const chopX = mov.x < top.x ? mov.x : right;
      const chopW = mov.w - overlap;
      this.fallingBlocks.push({
        x: chopX,
        y: newY,
        w: chopW,
        vy: 0,
        color: this.colors[this.colorIdx],
      });
    }
    this.height++;
    if (perfect) {
      this.perfects++;
      if (this.onPerfect) this.onPerfect();
    }
    // camera
    this.targetCamY = this.height * this.BLOCK_H;
    // speed up
    this.moving.speed = Math.min(9, 3.5 + this.height * 0.12);
    this.moving.w = newW;
    this.moving.x = -newW;
    if (this.onDrop) this.onDrop(perfect);
  }
  update() {
    if (!this.running) return;
    const mov = this.moving;
    const top = this.getTopBlock();
    mov.x += mov.speed * mov.dir;
    if (mov.x + mov.w > this.W + 10) mov.dir = -1;
    if (mov.x < -mov.w - 10) mov.dir = 1;
    this.camY += (this.targetCamY - this.camY) * 0.1;
    this.fallingBlocks = this.fallingBlocks.filter((b) => {
      b.vy += 0.8;
      b.y += b.vy;
      return b.y < this.H + this.camY + 200;
    });
  }
  draw() {
    const ctx = this.ctx;
    const cam = this.camY;
    ctx.fillStyle = "#F0EDE8";
    ctx.fillRect(0, 0, this.W, this.H);
    // grid bg
    ctx.strokeStyle = "rgba(28,28,28,.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < this.W; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.H);
      ctx.stroke();
    }
    for (let y = cam % 28; y < this.H; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.W, y);
      ctx.stroke();
    }
    // stack
    this.stack.forEach((b) => {
      const dy = b.y + cam;
      if (dy > this.H + 50 || dy < -this.BLOCK_H) return;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, dy, b.w, this.BLOCK_H - 3);
      // shine
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.fillRect(b.x, dy, b.w, 5);
    });
    // falling blocks
    this.fallingBlocks.forEach((b) => {
      const dy = b.y + cam;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, dy, b.w, this.BLOCK_H - 3);
      ctx.globalAlpha = 1;
    });
    // moving block
    const top = this.getTopBlock();
    const movY = top.y - this.BLOCK_H + cam;
    ctx.fillStyle = this.colors[this.colorIdx];
    ctx.fillRect(this.moving.x, movY, this.moving.w, this.BLOCK_H - 3);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillRect(this.moving.x, movY, this.moving.w, 5);
    // shadow under moving
    ctx.fillStyle = "rgba(28,28,28,.15)";
    ctx.fillRect(top.x, movY + this.BLOCK_H, top.w, 4);
  }
}
