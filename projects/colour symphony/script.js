const game = new ColorSymphony(document.getElementById("symphonyCanvas"));
const harmonyFill = document.getElementById("harmonyFill");
const harmonyValue = document.getElementById("harmonyValue");
const rhythmScore = document.getElementById("rhythmScore");
const comboCount = document.getElementById("comboCount");
const colorNotes = document.querySelectorAll(".color-note");
const clearBtn = document.getElementById("clearBtn");
const playBtn = document.getElementById("playBtn");
const recordBtn = document.getElementById("recordBtn");
const modeRadios = document.querySelectorAll('input[name="mode"]');
const challengeDisplay = document.getElementById("challengeDisplay");
const patternSequence = document.getElementById("patternSequence");
const startChallengeBtn = document.getElementById("startChallengeBtn");
const feedbackFlash = document.getElementById("feedbackFlash");
colorNotes.forEach((btn) => {
  btn.addEventListener("click", () => {
    const note = btn.dataset.note;
    const color = getComputedStyle(btn).getPropertyValue("--note-color");
    game.setColor(note, color);
    colorNotes.forEach((b) => (b.style.transform = "scale(1)"));
    btn.style.transform = "scale(1.1)";
    btn.style.boxShadow = `0 0 30px ${color}`;
  });
});
clearBtn.addEventListener("click", () => game.clear());
playBtn.addEventListener("click", () => {
  game.strokes.forEach((stroke, i) => {
    setTimeout(() => game.playNote(stroke.note), i * 200);
  });
});
modeRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    game.mode = e.target.value;
    if (e.target.value === "challenge") {
      challengeDisplay.classList.add("active");
    } else {
      challengeDisplay.classList.remove("active");
    }
  });
});
startChallengeBtn.addEventListener("click", () => {
  const pattern = game.generateChallenge();
  patternSequence.innerHTML = "";
  pattern.forEach((note) => {
    const noteEl = document.createElement("div");
    noteEl.className = "pattern-note";
    noteEl.textContent = note;
    noteEl.style.background = game.notes[note].color;
    patternSequence.appendChild(noteEl);
  });
  game.clear();
});
game.onHarmonyUpdate = () => {
  harmonyFill.style.width = game.harmony + "%";
  harmonyValue.textContent = Math.round(game.harmony) + "%";
};
game.onSuccess = () => {
  feedbackFlash.className = "feedback-flash success";
  setTimeout(() => (feedbackFlash.className = "feedback-flash"), 500);
  rhythmScore.textContent = game.rhythmScore;
  comboCount.textContent = game.combos;
  game.generateChallenge();
  const pattern = game.challengePattern;
  patternSequence.innerHTML = "";
  pattern.forEach((note) => {
    const noteEl = document.createElement("div");
    noteEl.className = "pattern-note";
    noteEl.textContent = note;
    noteEl.style.background = game.notes[note].color;
    patternSequence.appendChild(noteEl);
  });
  game.clear();
};
game.onError = () => {
  feedbackFlash.className = "feedback-flash error";
  setTimeout(() => (feedbackFlash.className = "feedback-flash"), 500);
  game.userPattern = [];
};
window.addEventListener("resize", () => {
  const oldWidth = game.canvas.width;
  const oldHeight = game.canvas.height;
  game.canvas.width = game.canvas.offsetWidth;
  game.canvas.height = game.canvas.offsetHeight;
  const scaleX = game.canvas.width / oldWidth;
  const scaleY = game.canvas.height / oldHeight;
  game.strokes.forEach((stroke) => {
    stroke.points.forEach((point) => {
      point.x *= scaleX;
      point.y *= scaleY;
    });
  });
  game.render();
});
