const AudioEngine = {
  ctx: null,
  master: null,
  filter: null,
  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1000;
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.filter.connect(this.master);
    this.master.connect(this.ctx.destination);
    this.startDrone();
  },
  startDrone() {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 40;
    g.gain.value = 0.05;
    osc.connect(g);
    g.connect(this.filter);
    osc.start();
  },
  pulse() {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 1.5);
    g.gain.setValueAtTime(0.4, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.5);
  },
  step() {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 60;
    g.gain.setValueAtTime(0.03, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  },
  warn() {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.value = 220;
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  },
};
