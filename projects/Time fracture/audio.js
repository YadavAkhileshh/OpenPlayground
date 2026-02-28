const AudioEngine = {
  ctx: new (window.AudioContext || window.webkitAudioContext)(),

  playBeep(freq = 440, dur = 0.1) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.value = freq;
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    o.stop(this.ctx.currentTime + dur);
  },
};
