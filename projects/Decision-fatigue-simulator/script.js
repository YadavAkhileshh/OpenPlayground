const startBtn = document.getElementById("startBtn");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const fatigueEl = document.getElementById("fatigue");
const roundEl = document.getElementById("round");
const timeEl = document.getElementById("time");
const app = document.querySelector(".app");

let round = 1;
let fatigue = 0;
let timer;
let timeLeft;
let startTime;

const questions = [
  "Choose a door",
  "Pick a color",
  "Select a path",
  "Choose a tool",
  "Pick a number",
  "Select a symbol",
  "Choose a direction",
  "Pick a shape",
  "Select a pattern",
  "Make a final choice"
];

startBtn.onclick = () => {
  startBtn.style.display = "none";
  nextRound();
};

function nextRound() {
  if (round > 10) {
    endSimulation();
    return;
  }

  roundEl.textContent = round;
  questionEl.textContent = questions[round - 1];
  optionsEl.innerHTML = "";

  const optionCount = fatigue < 30 ? 2 : fatigue < 60 ? 3 : 4;
  timeLeft = fatigue < 40 ? 5 : fatigue < 70 ? 4 : 3;
  timeEl.textContent = timeLeft;

  startTime = Date.now();

  for (let i = 0; i < optionCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = "Option " + (i + 1);
    btn.onclick = () => choose();
    optionsEl.appendChild(btn);
  }

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      choose(true);
    }
  }, 1000);

  if (fatigue > 60) {
    app.classList.add("fatigued");
  } else {
    app.classList.remove("fatigued");
  }
}

function choose(timeout = false) {
  clearInterval(timer);

  const reactionTime = (Date.now() - startTime) / 1000;
  fatigue += timeout ? 10 : Math.min(8, reactionTime * 2);

  fatigue = Math.min(100, Math.round(fatigue));
  fatigueEl.textContent = fatigue + "%";

  round++;
  setTimeout(nextRound, 400);
}

function endSimulation() {
  app.classList.remove("fatigued");
  questionEl.textContent = "Simulation Complete";
  optionsEl.innerHTML = `
    <p>Your mind shows signs of <strong>${fatigue < 40 ? "low" : fatigue < 70 ? "moderate" : "high"}</strong> decision fatigue.</p>
    <p>Take breaks. Fewer decisions = better decisions.</p>
  `;
}