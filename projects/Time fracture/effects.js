const Effects = {
  shakeIntensity: 0,

  screenShake(ctx) {
    if (this.shakeIntensity > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(dx, dy);
      this.shakeIntensity *= 0.9;
    }
  },

  triggerShake(power = 20) {
    this.shakeIntensity = power;
  },

  glow(ctx, x, y, r, color) {
    ctx.shadowBlur = 30;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
  },
};
