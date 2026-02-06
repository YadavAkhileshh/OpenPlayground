const startBtn = document.getElementById("startBtn");
const decisionArea = document.getElementById("decisionArea");
const optionsBox = document.getElementById("options");
const questionTitle = document.getElementById("questionTitle");
const timerBox = document.getElementById("timer");

const decisionCountEl = document.getElementById("decisionCount");
const correctCountEl = document.getElementById("correctCount");
const avgTimeEl = document.getElementById("avgTime");
const fatigueScoreEl = document.getElementById("fatigueScore");
const insightsBox = document.getElementById("insights");

let decisions = [];
let startTime = 0;
let fatigueScore = 0;
let timerInterval;

startBtn.addEventListener("click", startSession);

function startSession() {
  decisions = [];
  fatigueScore = 0;
  updateStats();
  decisionArea.classList.remove("hidden");
  insightsBox.classList.add("hidden");
  nextDecision();
}

function nextDecision() {
  clearInterval(timerInterval);

  const difficulty = document.getElementById("difficulty").value;
  const pressure = document.getElementById("pressure").value;

  const decision = generateDecision(difficulty);
  renderDecision(decision, pressure);
}

function generateDecision(difficulty) {
  const baseOptions = ["Option A", "Option B", "Option C", "Option D"];
  let correctIndex = Math.floor(Math.random() * baseOptions.length);

  if (difficulty === "hard") {
    correctIndex = Math.floor(Math.random() * baseOptions.length);
  }

  return {
    question: "Choose the best option",
    options: baseOptions,
    correctIndex
  };
}

function renderDecision(decision, pressure) {
  questionTitle.textContent = decision.question;
  optionsBox.innerHTML = "";
  startTime = Date.now();

  decision.options.forEach((opt, index) => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.textContent = opt;
    btn.onclick = () => selectOption(index, decision.correctIndex);
    optionsBox.appendChild(btn);
  });

  if (pressure !== "none") {
    let timeLeft = pressure === "high" ? 3 : 6;
    timerBox.textContent = `Time left: ${timeLeft}s`;

    timerInterval = setInterval(() => {
      timeLeft--;
      timerBox.textContent = `Time left: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        selectOption(-1, decision.correctIndex);
      }
    }, 1000);
  } else {
    timerBox.textContent = "";
  }
}

function selectOption(selected, correct) {
  const responseTime = Date.now() - startTime;
  const isCorrect = selected === correct;

  decisions.push({ responseTime, isCorrect });
  updateFatigue(responseTime, isCorrect);
  updateStats();

  if (decisions.length >= 10) {
    endSession();
  } else {
    nextDecision();
  }
}

function updateFatigue(time, correct) {
  fatigueScore += time > 3000 ? 2 : 1;
  if (!correct) fatigueScore += 2;

  if (fatigueScore > 15) {
    document.body.classList.add("fatigued");
  }
}

function updateStats() {
  decisionCountEl.textContent = decisions.length;
  correctCountEl.textContent = decisions.filter(d => d.isCorrect).length;

  const avg =
    decisions.reduce((a, b) => a + b.responseTime, 0) /
    (decisions.length || 1);

  avgTimeEl.textContent = Math.round(avg);
  fatigueScoreEl.textContent = fatigueScore;
}

function endSession() {
  decisionArea.classList.add("hidden");
  generateInsights();
  saveSession();
}

function generateInsights() {
  const accuracy =
    decisions.filter(d => d.isCorrect).length / decisions.length;

  let message = "Balanced cognitive performance.";

  if (accuracy < 0.5) message = "Decision quality dropped significantly.";
  if (fatigueScore > 20) message = "High decision fatigue detected.";

  insightsBox.innerHTML = `
    <h3>Behavioral Insights</h3>
    <p>Total Decisions: ${decisions.length}</p>
    <p>Accuracy: ${(accuracy * 100).toFixed(0)}%</p>
    <p>${message}</p>
  `;
  insightsBox.classList.remove("hidden");
}

function saveSession() {
  const history = JSON.parse(localStorage.getItem("fatigueSessions")) || [];
  history.push({
    date: new Date().toISOString(),
    fatigueScore,
    decisions
  });
  localStorage.setItem("fatigueSessions", JSON.stringify(history));
}