const Effects = {
  shake: 0,
  pulse: 1,

  beat() {
    this.pulse = 1.25;
    this.shake = 10;
  },

  damage() {
    this.shake = 25;
  },

  update(ctx) {
    this.pulse += (1 - this.pulse) * 0.15;
    this.shake *= 0.85;

    if (this.shake > 1) {
      ctx.translate(
        (Math.random() - 0.5) * this.shake,
        (Math.random() - 0.5) * this.shake,
      );
    }

    ctx.scale(this.pulse, this.pulse);
  },
};
