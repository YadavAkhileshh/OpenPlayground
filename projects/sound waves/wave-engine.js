class SoundWave {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 400;
    this.frequency = 440;
    this.amplitude = 0.5;
    this.phase = 0;
    this.audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    this.oscillator = null;
    this.gainNode = null;
    this.score = 0;
    this.targetFreq = 440;
  }
  setFrequency(freq) {
    this.frequency = freq;
    if (this.oscillator) {
      this.oscillator.frequency.value = freq;
    }
  }
  playSound() {
    if (this.oscillator) return;
    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.oscillator.frequency.value = this.frequency;
    this.oscillator.type = "sine";
    this.gainNode.gain.value = 0.3;
    this.oscillator.start();
  }
  stopSound() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
  }
  checkMatch() {
    const diff = Math.abs(this.frequency - this.targetFreq);
    if (diff < 5) {
      this.score += 100;
      this.targetFreq = Math.floor(Math.random() * 700) + 200;
      return true;
    }
    return false;
  }
  update() {
    this.phase += 0.05;
  }
  render() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "#06B6D4";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    for (let x = 0; x < this.canvas.width; x++) {
      const y =
        this.canvas.height / 2 +
        Math.sin(x * 0.02 * (this.frequency / 100) + this.phase) *
          this.amplitude *
          100;
      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    this.ctx.strokeStyle = "#EC4899";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for (let x = 0; x < this.canvas.width; x++) {
      const y =
        this.canvas.height / 2 +
        Math.cos(x * 0.02 * (this.frequency / 100) + this.phase) *
          this.amplitude *
          80;
      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
  }
}
