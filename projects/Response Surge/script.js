const arena = document.getElementById("arena");
const signal = document.getElementById("signal");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const timeEl = document.getElementById("time");

const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");

let state = {
  running: false,
  score: 0,
  streak: 0,
  time: 30,
  current: "ready",
};

let timer;
let waitingTimeout = null;

// ---- START GAME ----
startBtn.onclick = start;

// Clicking READY starts game
arena.onclick = () => {
  if (!state.running && state.current === "ready") {
    start();
  } else {
    attempt();
  }
};

// Space key also works
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!state.running && state.current === "ready") {
      start();
    } else {
      attempt();
    }
  }
});

function start() {
  clearTimeout(waitingTimeout);

  state = {
    running: true,
    score: 0,
    streak: 0,
    time: 30,
    current: "waiting",
  };

  overlay.classList.add("hidden");
  updateHUD();
  nextSignal();

  timer = setInterval(tick, 1000);
}

function tick() {
  state.time--;
  timeEl.textContent = state.time;
  if (state.time <= 0) end();
}

function nextSignal() {
  if (!state.running) return;

  arena.className = "arena";
  signal.textContent = "WAIT";
  state.current = "waiting";

  waitingTimeout = setTimeout(
    () => {
      arena.classList.add("green");
      signal.textContent = "GO!";
      state.current = "green";
      Sound.play("go");
    },
    Math.random() * 1500 + 700,
  );
}

function attempt() {
  if (!state.running) return;

  if (state.current === "green") {
    state.score += 10 + state.streak * 2;
    state.streak++;
    Sound.play("hit");

    arena.classList.add("green");
    setTimeout(() => arena.classList.remove("green"), 250);
  } else {
    state.streak = 0;
    Sound.play("fail");

    arena.classList.add("fail", "shake");
    setTimeout(() => arena.classList.remove("shake"), 300);
  }

  updateHUD();
  nextSignal();
}

function updateHUD() {
  scoreEl.textContent = state.score;
  streakEl.textContent = state.streak;
}

function end() {
  clearInterval(timer);
  clearTimeout(waitingTimeout);

  state.running = false;
  state.current = "ready";

  overlayText.textContent = `Final Score: ${state.score}`;
  overlay.classList.remove("hidden");

  signal.textContent = "READY";
}
