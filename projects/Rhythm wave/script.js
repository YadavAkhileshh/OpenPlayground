// Rhythm Wave Main Controller
const game = new RhythmGame();
let visualizer;
let animationFrame;
let lastTime = Date.now();

// DOM Elements
const notesLayer = document.getElementById("notesLayer");
const feedbackDisplay = document.getElementById("feedbackDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const comboDisplay = document.getElementById("comboDisplay");
const accuracyDisplay = document.getElementById("accuracyDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const gameOverModal = document.getElementById("gameOverModal");
const songButtons = document.querySelectorAll(".song-btn");
const hitZones = document.querySelectorAll(".hit-zone");

let selectedSong = 0;

// Initialize
function init() {
  const canvas = document.getElementById("audioVisualizer");
  visualizer = new AudioVisualizer(canvas);

  setupEventListeners();
  visualizer.update(false);
}

function setupEventListeners() {
  // Song selection
  songButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      songButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSong = index;
    });
  });

  // Start button
  startBtn.addEventListener("click", startGame);

  // Pause button
  pauseBtn.addEventListener("click", () => {
    game.pause();
    pauseBtn.textContent = game.isPaused ? "▶ RESUME" : "⏸ PAUSE";
  });

  // Play again
  playAgainBtn.addEventListener("click", () => {
    gameOverModal.classList.add("hidden");
    startGame();
  });

  // Keyboard controls
  document.addEventListener("keydown", handleKeyPress);

  // Mobile touch (optional)
  hitZones.forEach((zone, index) => {
    zone.addEventListener("click", () => handleNoteHit(index));
  });
}

function startGame() {
  game.start(selectedSong);
  startBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
  notesLayer.innerHTML = "";
  lastTime = Date.now();
  gameLoop();
}

function gameLoop() {
  if (!game.isPlaying) {
    showGameOver();
    return;
  }

  const currentTime = Date.now();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  game.update(deltaTime);
  updateUI();
  renderNotes();
  visualizer.update(!game.isPaused);

  animationFrame = requestAnimationFrame(gameLoop);
}

function handleKeyPress(e) {
  if (!game.isPlaying || game.isPaused) return;

  const keyMap = { a: 0, s: 1, d: 2, f: 3 };
  const lane = keyMap[e.key.toLowerCase()];

  if (lane !== undefined) {
    handleNoteHit(lane);
    hitZones[lane].classList.add("pressed");
    setTimeout(() => hitZones[lane].classList.remove("pressed"), 100);
  }
}

function handleNoteHit(lane) {
  const result = game.hitNote(lane);

  if (result.hit) {
    showFeedback(result.timing);
    removeNoteElement(result.noteId);
    hitZones[lane].classList.add("active");
    setTimeout(() => hitZones[lane].classList.remove("active"), 200);

    if (result.timing === "perfect") {
      createParticles(lane);
    }
  }
}

function renderNotes() {
  // Remove old note elements
  const existingNotes = notesLayer.querySelectorAll(".note");
  const existingIds = Array.from(existingNotes).map((n) => n.dataset.id);
  const currentIds = game.notes.map((n) => n.id.toString());

  existingNotes.forEach((noteEl) => {
    if (!currentIds.includes(noteEl.dataset.id)) {
      noteEl.remove();
    }
  });

  // Update or create note elements
  game.notes.forEach((note) => {
    let noteEl = notesLayer.querySelector(`[data-id="${note.id}"]`);

    if (!noteEl) {
      noteEl = document.createElement("div");
      noteEl.className = `note lane-${note.lane}`;
      noteEl.dataset.id = note.id;
      notesLayer.appendChild(noteEl);
    }

    noteEl.style.top = note.y + "px";

    if (note.hit) {
      noteEl.classList.add("hit");
    }
  });
}

function removeNoteElement(noteId) {
  const noteEl = notesLayer.querySelector(`[data-id="${noteId}"]`);
  if (noteEl) {
    noteEl.classList.add("hit");
    setTimeout(() => noteEl.remove(), 300);
  }
}

function showFeedback(timing) {
  const feedback = document.createElement("div");
  feedback.className = `hit-feedback ${timing}`;
  feedback.textContent = timing.toUpperCase();
  feedbackDisplay.appendChild(feedback);

  setTimeout(() => feedback.remove(), 600);
}

function createParticles(lane) {
  const colors = ["#00D9FF", "#B026FF", "#FF0080", "#39FF14"];
  const laneWidth = 25;
  const centerX = lane * laneWidth + laneWidth / 2;

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = `${centerX}%`;
    particle.style.bottom = "30px";
    particle.style.backgroundColor = colors[lane];

    const angle = (Math.PI * 2 * i) / 8;
    const distance = 50;
    particle.style.setProperty("--tx", Math.cos(angle) * distance + "px");
    particle.style.setProperty("--ty", Math.sin(angle) * distance + "px");

    notesLayer.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}

function updateUI() {
  scoreDisplay.textContent = game.score.toLocaleString();
  comboDisplay.textContent = game.combo + "x";
  accuracyDisplay.textContent = game.accuracy + "%";

  // Combo glow effect
  if (game.combo > 0 && game.combo % 10 === 0) {
    comboDisplay.parentElement.classList.add("combo-glow");
    setTimeout(
      () => comboDisplay.parentElement.classList.remove("combo-glow"),
      500,
    );
  }
}

function showGameOver() {
  cancelAnimationFrame(animationFrame);

  document.getElementById("finalScore").textContent =
    game.score.toLocaleString();
  document.getElementById("maxCombo").textContent = game.maxCombo + "x";
  document.getElementById("finalAccuracy").textContent = game.accuracy + "%";
  document.getElementById("gradeDisplay").textContent = game.getGrade();
  document.getElementById("perfectCount").textContent = game.stats.perfect;
  document.getElementById("goodCount").textContent = game.stats.good;
  document.getElementById("missCount").textContent = game.stats.miss;

  gameOverModal.classList.remove("hidden");
  pauseBtn.classList.add("hidden");
  startBtn.classList.remove("hidden");
}

// Handle window resize
window.addEventListener("resize", () => {
  if (visualizer) {
    visualizer.canvas.width = visualizer.canvas.offsetWidth;
    visualizer.canvas.height = visualizer.canvas.offsetHeight;
  }
});

// Initialize on load
window.addEventListener("load", init);
