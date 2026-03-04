class ColorSymphony {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = canvas.offsetWidth;
    this.canvas.height = canvas.offsetHeight;
    this.strokes = [];
    this.currentColor = null;
    this.isDrawing = false;
    this.harmony = 0;
    this.rhythmScore = 0;
    this.combos = 0;
    this.mode = "freestyle";
    this.challengePattern = [];
    this.userPattern = [];
    this.notes = {
      C: { freq: 261.63, color: "#FF6B6B" },
      D: { freq: 293.66, color: "#FFA500" },
      E: { freq: 329.63, color: "#FFD93D" },
      F: { freq: 349.23, color: "#6BCF7F" },
      G: { freq: 392.0, color: "#4A90E2" },
      A: { freq: 440.0, color: "#5B4FE8" },
      B: { freq: 493.88, color: "#B565D8" },
    };
    this.audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    this.setupCanvas();
  }
  setupCanvas() {
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseleave", () => this.stopDrawing());
  }
  setColor(note, color) {
    this.currentColor = { note, color };
  }
  startDrawing(e) {
    if (!this.currentColor) return;
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.strokes.push({
      points: [{ x, y }],
      color: this.currentColor.color,
      note: this.currentColor.note,
    });
    this.playNote(this.currentColor.note);
    if (this.mode === "challenge") {
      this.userPattern.push(this.currentColor.note);
      this.checkPattern();
    }
  }
  draw(e) {
    if (!this.isDrawing || !this.currentColor) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const currentStroke = this.strokes[this.strokes.length - 1];
    currentStroke.points.push({ x, y });
    this.render();
  }
  stopDrawing() {
    this.isDrawing = false;
    this.calculateHarmony();
  }
  playNote(note) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.frequency.value = this.notes[note].freq;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.5,
    );
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }
  calculateHarmony() {
    const uniqueNotes = new Set(this.strokes.map((s) => s.note));
    const noteCount = uniqueNotes.size;
    this.harmony = Math.min(100, (noteCount / 7) * 100);
    if (this.onHarmonyUpdate) this.onHarmonyUpdate();
  }
  generateChallenge() {
    this.challengePattern = [];
    const noteKeys = Object.keys(this.notes);
    const length = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < length; i++) {
      this.challengePattern.push(
        noteKeys[Math.floor(Math.random() * noteKeys.length)],
      );
    }
    this.userPattern = [];
    return this.challengePattern;
  }
  checkPattern() {
    const userStr = this.userPattern.join("");
    const challengeStr = this.challengePattern
      .slice(0, this.userPattern.length)
      .join("");
    if (
      userStr === challengeStr &&
      this.userPattern.length === this.challengePattern.length
    ) {
      this.combos++;
      this.rhythmScore += 100 * this.combos;
      if (this.onSuccess) this.onSuccess();
      return true;
    } else if (userStr !== challengeStr) {
      this.combos = 0;
      if (this.onError) this.onError();
      return false;
    }
    return null;
  }
  clear() {
    this.strokes = [];
    this.harmony = 0;
    this.userPattern = [];
    this.render();
    if (this.onHarmonyUpdate) this.onHarmonyUpdate();
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      this.ctx.strokeStyle = stroke.color;
      this.ctx.lineWidth = 8;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = stroke.color;
      this.ctx.beginPath();
      this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    });
  }
}
