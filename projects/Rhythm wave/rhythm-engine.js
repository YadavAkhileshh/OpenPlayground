// Rhythm Game Engine
class RhythmGame {
  constructor() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.accuracy = 100;
    this.isPlaying = false;
    this.isPaused = false;

    // Hit statistics
    this.stats = {
      perfect: 0,
      good: 0,
      miss: 0,
      total: 0,
    };

    // Game elements
    this.notes = [];
    this.noteSpeed = 3;
    this.spawnTimer = 0;
    this.gameTime = 0;

    // Song patterns
    this.songs = [
      {
        name: "Neon Dreams",
        bpm: 120,
        pattern: this.generatePattern(120, "easy"),
        duration: 60000,
      },
      {
        name: "Electric Pulse",
        bpm: 140,
        pattern: this.generatePattern(140, "medium"),
        duration: 60000,
      },
      {
        name: "Cyber Storm",
        bpm: 180,
        pattern: this.generatePattern(180, "hard"),
        duration: 60000,
      },
    ];

    this.currentSong = 0;
    this.currentPattern = [];
    this.patternIndex = 0;
  }

  generatePattern(bpm, difficulty) {
    const pattern = [];
    const beatInterval = 60000 / bpm; // ms per beat
    const totalBeats =
      difficulty === "easy" ? 120 : difficulty === "medium" ? 160 : 200;

    for (let i = 0; i < totalBeats; i++) {
      const time = i * beatInterval;
      const lanes = [];

      // Easy: 1 note per beat
      // Medium: 1-2 notes per beat
      // Hard: 2-3 notes per beat
      const noteCount =
        difficulty === "easy"
          ? 1
          : difficulty === "medium"
            ? Math.random() > 0.5
              ? 1
              : 2
            : Math.floor(Math.random() * 2) + 1;

      for (let j = 0; j < noteCount; j++) {
        let lane;
        do {
          lane = Math.floor(Math.random() * 4);
        } while (lanes.includes(lane));
        lanes.push(lane);
      }

      pattern.push({ time, lanes });
    }

    return pattern;
  }

  start(songIndex = 0) {
    this.reset();
    this.currentSong = songIndex;
    this.currentPattern = [...this.songs[songIndex].pattern];
    this.isPlaying = true;
    this.isPaused = false;
    this.noteSpeed = songIndex === 0 ? 2.5 : songIndex === 1 ? 3 : 3.5;
  }

  pause() {
    this.isPaused = !this.isPaused;
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.accuracy = 100;
    this.notes = [];
    this.stats = { perfect: 0, good: 0, miss: 0, total: 0 };
    this.spawnTimer = 0;
    this.gameTime = 0;
    this.patternIndex = 0;
  }

  update(deltaTime) {
    if (!this.isPlaying || this.isPaused) return;

    this.gameTime += deltaTime;

    // Spawn notes based on pattern
    this.spawnTimer += deltaTime;
    if (this.patternIndex < this.currentPattern.length) {
      const nextNote = this.currentPattern[this.patternIndex];
      if (this.gameTime >= nextNote.time) {
        nextNote.lanes.forEach((lane) => {
          this.spawnNote(lane);
        });
        this.patternIndex++;
      }
    }

    // Update note positions
    this.notes.forEach((note) => {
      note.y += this.noteSpeed;
    });

    // Remove missed notes
    this.notes = this.notes.filter((note) => {
      if (note.y > 600) {
        if (!note.hit) {
          this.handleMiss();
        }
        return false;
      }
      return true;
    });

    // Check if song is over
    if (
      this.patternIndex >= this.currentPattern.length &&
      this.notes.length === 0
    ) {
      this.end();
    }
  }

  spawnNote(lane) {
    this.notes.push({
      lane: lane,
      y: -50,
      hit: false,
      id: Date.now() + Math.random(),
    });
  }

  hitNote(lane) {
    const hitZoneY = 520; // Position of hit zone
    const tolerance = 80;

    let bestNote = null;
    let bestDistance = Infinity;

    // Find closest note in the lane
    this.notes.forEach((note) => {
      if (note.lane === lane && !note.hit) {
        const distance = Math.abs(note.y - hitZoneY);
        if (distance < bestDistance && distance < tolerance) {
          bestDistance = distance;
          bestNote = note;
        }
      }
    });

    if (bestNote) {
      bestNote.hit = true;
      const timing = this.calculateTiming(bestDistance);
      this.handleHit(timing);
      return { hit: true, timing, noteId: bestNote.id };
    }

    return { hit: false };
  }

  calculateTiming(distance) {
    if (distance < 30) return "perfect";
    if (distance < 60) return "good";
    return "miss";
  }

  handleHit(timing) {
    if (timing === "perfect") {
      this.score += 100 * (this.combo + 1);
      this.combo++;
      this.stats.perfect++;
    } else if (timing === "good") {
      this.score += 50 * (this.combo + 1);
      this.combo++;
      this.stats.good++;
    }

    this.stats.total++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.updateAccuracy();
  }

  handleMiss() {
    this.combo = 0;
    this.stats.miss++;
    this.stats.total++;
    this.updateAccuracy();
  }

  updateAccuracy() {
    const perfectWeight = this.stats.perfect * 100;
    const goodWeight = this.stats.good * 80;
    const missWeight = this.stats.miss * 0;

    if (this.stats.total > 0) {
      this.accuracy = Math.round(
        ((perfectWeight + goodWeight + missWeight) / (this.stats.total * 100)) *
          100,
      );
    }
  }

  getGrade() {
    if (this.accuracy >= 95) return "S";
    if (this.accuracy >= 90) return "A";
    if (this.accuracy >= 80) return "B";
    if (this.accuracy >= 70) return "C";
    return "D";
  }

  end() {
    this.isPlaying = false;
  }
}

// Audio Visualizer
class AudioVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = canvas.offsetWidth;
    this.canvas.height = canvas.offsetHeight;

    this.bars = 32;
    this.barData = new Array(this.bars).fill(0);
    this.colors = ["#00D9FF", "#B026FF", "#FF0080", "#39FF14"];
  }

  update(isPlaying) {
    // Simulate audio data
    if (isPlaying) {
      for (let i = 0; i < this.bars; i++) {
        const target = Math.random() * 0.8 + 0.2;
        this.barData[i] += (target - this.barData[i]) * 0.3;
      }
    } else {
      for (let i = 0; i < this.bars; i++) {
        this.barData[i] *= 0.9;
      }
    }

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const barWidth = this.canvas.width / this.bars;
    const maxHeight = this.canvas.height;

    for (let i = 0; i < this.bars; i++) {
      const height = this.barData[i] * maxHeight;
      const x = i * barWidth;
      const y = maxHeight - height;

      const colorIndex = Math.floor((i / this.bars) * this.colors.length);
      const gradient = this.ctx.createLinearGradient(x, y, x, maxHeight);
      gradient.addColorStop(0, this.colors[colorIndex]);
      gradient.addColorStop(1, "transparent");

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth - 2, height);
    }
  }
}
