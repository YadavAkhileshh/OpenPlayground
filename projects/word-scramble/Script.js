const WORDS = [
  { w: "tree", h: "Has leaves" },
  { w: "forest", h: "Wildlife home" },
  { w: "planet", h: "Earth is one" },
  { w: "biodiversity", h: "Variety of life" },
  { w: "sustainability", h: "Eco balance" }
];

let state = {
  word: "",
  hint: "",
  xp: 0,
  level: 1,
  combo: 1,
  time: 30,
  paused: false,
  timer: null
};

const $ = id => document.getElementById(id);

function shuffle(word) {
  return word.split("").sort(() => Math.random() - 0.5).join("");
}

function loadWord() {
  const pool = WORDS.slice(0, state.level + 2);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  state.word = pick.w;
  state.hint = pick.h;
  $("scrambled").textContent = shuffle(state.word);
  $("hint").textContent = "Hint hidden";
  $("input").value = "";
  startTimer();
}

function startTimer() {
  clearInterval(state.timer);
  state.time = Math.max(15, 30 - state.level * 2);
  $("time").textContent = state.time;

  state.timer = setInterval(() => {
    if (state.paused) return;
    state.time--;
    $("time").textContent = state.time;
    if (state.time <= 0) fail("⏰ Time up!");
  }, 1000);
}

function success() {
  state.xp += 10 * state.combo;
  state.combo++;
  if (state.xp >= state.level * 50) {
    state.level++;
    alert("LEVEL UP! 🎉");
  }
  updateUI("Correct! 🔥");
  loadWord();
}

function fail(msg) {
  state.combo = 1;
  updateUI(msg);
  loadWord();
}

function updateUI(msg) {
  $("xp").textContent = state.xp;
  $("level").textContent = state.level;
  $("combo").textContent = "x" + state.combo;
  $("message").textContent = msg;
}

$("check").onclick = () => {
  if ($("input").value.toLowerCase() === state.word) success();
  else fail("Wrong ❌");
};

$("hintBtn").onclick = () => {
  if (state.xp >= 5) {
    state.xp -= 5;
    $("hint").textContent = "Hint: " + state.hint;
    $("xp").textContent = state.xp;
  }
};

$("pause").onclick = () => {
  state.paused = true;
  $("pauseScreen").style.display = "flex";
};

$("resume").onclick = () => {
  state.paused = false;
  $("pauseScreen").style.display = "none";
};

$("input").addEventListener("keyup", e => {
  if (e.key === "Enter") $("check").click();
});

loadWord();
