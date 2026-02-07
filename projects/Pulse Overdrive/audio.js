const AudioEngine = {
  ctx: new (window.AudioContext || window.webkitAudioContext)(),

  beat() {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.value = 120;
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
    o.stop(this.ctx.currentTime + 0.12);
  },

  hit() {
    const o = this.ctx.createOscillator();
    o.frequency.value = 70;
    o.connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + 0.15);
  },
};
