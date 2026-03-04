document.addEventListener("DOMContentLoaded", () => {
  const keys = ["A", "S", "D", "F", "J", "K", "L"];

  const ui = {
    score: document.getElementById("score"),
    combo: document.getElementById("combo"),
    time: document.getElementById("time"),
    key: document.getElementById("keyDisplay"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayText: document.getElementById("overlayText"),
    startBtn: document.getElementById("startBtn"),
    wrapper: document.querySelector(".game-wrapper"),
  };

  const state = {
    running: false,
    score: 0,
    combo: 0,
    time: 30,
    currentKey: null,
    speed: 1200,
  };

  let timer;

  ui.startBtn.onclick = start;

  function start() {
    Sound.play("start");
    reset();
    state.running = true;
    ui.overlay.classList.add("hidden");
    nextKey();
    timer = setInterval(tick, 1000);
  }

  function reset() {
    state.score = 0;
    state.combo = 0;
    state.time = 30;
    state.speed = 1200;
    updateHUD();
  }

  function nextKey() {
    if (!state.running) return;

    state.currentKey = keys[Math.floor(Math.random() * keys.length)];
    ui.key.textContent = state.currentKey;
    ui.key.className = "";
  }

  function tick() {
    state.time--;
    updateHUD();
    if (state.time <= 0) end();
  }

  function end() {
    state.running = false;
    clearInterval(timer);

    ui.overlayTitle.textContent = "GAME OVER";
    ui.overlayText.textContent = `Score: ${state.score}`;
    ui.startBtn.textContent = "Play Again";
    ui.overlay.classList.remove("hidden");
  }

  function updateHUD() {
    ui.score.textContent = state.score;
    ui.combo.textContent = state.combo;
    ui.time.textContent = state.time;
  }

  document.addEventListener("keydown", (e) => {
    if (!state.running) return;

    const pressed = e.key.toUpperCase();

    if (pressed === state.currentKey) {
      Sound.play("hit");

      ui.key.classList.add("correct");
      document.body.classList.add("pulse-bg");
      setTimeout(() => document.body.classList.remove("pulse-bg"), 150);

      state.combo++;
      state.score += 10 + state.combo * 2;
      state.speed = Math.max(400, state.speed - 40);

      ui.key.classList.remove("combo-3", "combo-6", "combo-10");
      if (state.combo >= 10) ui.key.classList.add("combo-10");
      else if (state.combo >= 6) ui.key.classList.add("combo-6");
      else if (state.combo >= 3) ui.key.classList.add("combo-3");

      setTimeout(nextKey, 120);
    } else {
      Sound.play("wrong");

      state.combo = 0;
      ui.key.classList.add("wrong");

      ui.wrapper.classList.add("shake");
      setTimeout(() => ui.wrapper.classList.remove("shake"), 300);
    }

    updateHUD();
  });
});
