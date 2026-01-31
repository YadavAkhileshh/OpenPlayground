document.addEventListener("DOMContentLoaded", () => {
  // Title animation on load
  document.querySelector(".game-title")?.classList.add("title-pulse");

  class ReflexTapArena {
    constructor() {
      this.arena = document.getElementById("arena");

      this.ui = {
        score: document.getElementById("score"),
        combo: document.getElementById("combo"),
        time: document.getElementById("time"),
        highScore: document.getElementById("highScore"),
        accuracy: document.getElementById("accuracy"),
        gamesPlayed: document.getElementById("gamesPlayed"),
      };

      this.overlay = document.getElementById("gameOverlay");
      this.overlayTitle = document.getElementById("overlayTitle");
      this.overlayText = document.getElementById("overlayText");
      this.startBtn = document.getElementById("startBtn");

      this.settings = this.loadSettings();
      this.stats = this.loadStats();

      this.state = {
        running: false,
        score: 0,
        combo: 0,
        hits: 0,
        misses: 0,
        time: 30,
        activeTarget: null,
        spawnRate: 1200,
      };

      this.timer = null;

      this.bindUI();
      this.applyTheme();
      this.renderStats();
    }

    bindUI() {
      this.startBtn.onclick = () => this.start();

      document.getElementById("difficulty").onchange = (e) => {
        this.settings.difficulty = e.target.value;
        this.saveSettings();
      };

      document.getElementById("theme").onchange = (e) => {
        this.settings.theme = e.target.value;
        this.applyTheme();
        this.saveSettings();
      };
    }

    start() {
      // Reset overlay text (important for replay)
      this.overlayTitle.textContent = "REFLEX TAP ARENA";
      this.overlayText.textContent =
        "Speed beats precision. Precision beats panic.";
      this.startBtn.textContent = "Start Game";

      this.overlay.classList.add("hidden");

      this.resetGame();
      this.state.running = true;

      document.querySelector(".game-title")?.classList.add("title-pulse");

      this.loop();

      clearInterval(this.timer);
      this.timer = setInterval(() => this.tick(), 1000);
    }

    loop() {
      if (!this.state.running) return;

      this.spawnTarget();

      this.state.spawnRate = Math.max(
        400,
        this.state.spawnRate - this.difficultyStep(),
      );

      setTimeout(() => this.loop(), this.state.spawnRate);
    }

    spawnTarget() {
      const t = document.createElement("div");
      t.className = "target";

      t.style.left = Math.random() * (this.arena.clientWidth - 60) + "px";
      t.style.top = Math.random() * (this.arena.clientHeight - 60) + "px";

      t.onclick = () => this.hit(t);

      this.clearActive();
      this.state.activeTarget = t;
      this.arena.appendChild(t);

      setTimeout(() => {
        if (this.arena.contains(t)) this.miss(t);
      }, 900);
    }

    hit(target) {
      if (!this.state.running) return;

      target.classList.add("hit");

      this.state.hits++;
      this.state.combo++;
      this.state.score += 10 + this.state.combo * 2;

      setTimeout(() => target.remove(), 160);
      this.updateHUD(true);
    }

    miss(target) {
      target.classList.add("miss");

      this.state.combo = 0;
      this.state.misses++;

      setTimeout(() => target.remove(), 200);
      this.updateHUD();
    }

    tick() {
      this.state.time--;
      this.updateHUD();

      if (this.state.time <= 0) {
        this.end();
      }
    }

    end() {
      this.state.running = false;
      clearInterval(this.timer);

      this.stats.games++;
      this.stats.highScore = Math.max(this.stats.highScore, this.state.score);

      this.saveStats();
      this.renderStats();

      const total = this.state.hits + this.state.misses || 1;
      const accuracy = Math.round((this.state.hits / total) * 100);

      this.overlayTitle.textContent = "GAME OVER";
      this.overlayText.textContent = `Score: ${this.state.score} • Accuracy: ${accuracy}%`;
      this.startBtn.textContent = "Play Again";

      this.overlay.classList.remove("hidden");
    }

    updateHUD(pulseScore = false) {
      this.ui.score.textContent = this.state.score;
      this.ui.combo.textContent = this.state.combo;
      this.ui.time.textContent = this.state.time;

      if (pulseScore) {
        this.ui.score.classList.remove("pulse");
        void this.ui.score.offsetWidth;
        this.ui.score.classList.add("pulse");
      }
    }

    renderStats() {
      const total = this.stats.hits + this.stats.misses || 1;
      this.ui.highScore.textContent = this.stats.highScore;
      this.ui.gamesPlayed.textContent = this.stats.games;
      this.ui.accuracy.textContent =
        Math.round((this.stats.hits / total) * 100) + "%";
    }

    difficultyStep() {
      return this.settings.difficulty === "hard"
        ? 60
        : this.settings.difficulty === "easy"
          ? 15
          : 30;
    }

    clearActive() {
      if (this.state.activeTarget) {
        this.state.activeTarget.remove();
      }
    }

    applyTheme() {
      document.body.className = this.settings.theme;
    }

    loadSettings() {
      return (
        JSON.parse(localStorage.getItem("rta-settings")) || {
          difficulty: "normal",
          theme: "dark",
          cursorTrail: true,
        }
      );
    }

    saveSettings() {
      localStorage.setItem("rta-settings", JSON.stringify(this.settings));
    }

    loadStats() {
      return (
        JSON.parse(localStorage.getItem("rta-stats")) || {
          games: 0,
          highScore: 0,
          hits: 0,
          misses: 0,
        }
      );
    }

    saveStats() {
      this.stats.hits += this.state.hits;
      this.stats.misses += this.state.misses;

      localStorage.setItem("rta-stats", JSON.stringify(this.stats));
    }

    resetGame() {
      this.arena.innerHTML = "";
      this.state.score = 0;
      this.state.combo = 0;
      this.state.hits = 0;
      this.state.misses = 0;
      this.state.time = 30;
      this.state.spawnRate = 1200;
    }
  }

  new ReflexTapArena();
});
