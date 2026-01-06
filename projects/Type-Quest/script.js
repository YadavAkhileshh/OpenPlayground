const sentences = [
  "JavaScript is a versatile and widely-used programming language essential for modern web development.",
  "Typing speed and accuracy are critical skills for developers working on complex projects under deadlines.",
  "Frontend development requires a combination of logical thinking, creative design, and user experience considerations.",
  "Consistent practice in coding and typing improves both proficiency and efficiency over time.",
  "Clean code, proper structure, and maintainable design patterns are necessary for long-term project success.",
  "Debugging complex problems often requires patience, attention to detail, and deep understanding of the system.",
  "Efficient workflow allows developers to translate ideas into functional applications without unnecessary delays.",
  "Responsive and accessible design ensures that web applications are usable by everyone on all devices.",
  "Proper documentation and code readability enhance collaboration and make maintenance easier for future developers.",
  "Learning new frameworks and technologies regularly is essential to stay up-to-date in the fast-paced tech world."
];

const paragraphsPool = [
  "JavaScript enables interactive web applications across multiple platforms, allowing developers to create engaging and responsive user experiences. It is a fundamental language for both frontend and backend development, making it essential for any modern developer.",
  
  "Typing speed is a crucial skill that directly affects productivity and efficiency. Developers who type accurately can implement ideas faster and spend more time solving complex problems instead of focusing on mechanics.",
  
  "Frontend development combines logical reasoning, creative design, and understanding user behavior. Developers must create interfaces that are not only visually appealing but also intuitive, accessible, and responsive across all devices.",
  
  "Consistent practice enhances muscle memory and typing accuracy while improving mental focus. Over time, regular exercises in coding and typing lead to better performance and greater confidence in handling challenging tasks.",
  
  "Software development is a careful balance of functionality, readability, and maintainability. Writing clean, modular, and efficient code ensures that applications are reliable, scalable, and easier to debug in the long run.",
  
  "Learning to type quickly and accurately allows programmers to concentrate on problem-solving instead of keystrokes. Efficient typing contributes to better workflow, faster project completion, and reduced fatigue during long coding sessions.",
  
  "Complex applications demand thoughtful planning and attention to detail. Developers need to optimize performance, maintain readability, and ensure that the architecture supports future growth and new feature implementation."
];

const paragraphs = [];
for (let i = 0; i < 5; i++) {
  const pool = Math.random() < 0.5 ? sentences : paragraphsPool; // 50% chance
  const item = pool[Math.floor(Math.random() * pool.length)];
  paragraphs.push(item);
}

const totalLevels = 5;
let level = 0;
let timer = 60;
let interval;

let totalWpm = 0;
let totalAccuracy = 0;
let levelStartTime = 0;

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("start-btn");
const paragraphEl = document.getElementById("paragraph");
const inputEl = document.getElementById("input");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const levelEl = document.getElementById("level");
const progressBar = document.getElementById("progress-bar");

startBtn.onclick = startGame;

function startGame() {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  level = 0;
  totalWpm = 0;
  totalAccuracy = 0;
  nextLevel();
}

function nextLevel() {
  if (level === totalLevels) {
    endGame();
    return;
  }

  level++;
  levelEl.textContent = level;

  timer = 60;
  timerEl.textContent = timer;

  inputEl.value = "";
  inputEl.disabled = false;

  setTimeout(() => inputEl.focus(), 0);

  wpmEl.textContent = "0";
  accuracyEl.textContent = "0";
  progressBar.style.width = "0%";

  renderParagraph(paragraphs[level - 1]);

  levelStartTime = Date.now();

  clearInterval(interval);
  startTimer();
}

function renderParagraph(text) {
  paragraphEl.innerHTML = "";
  text.split("").forEach(char => {
    const span = document.createElement("span");
    span.textContent = char;
    paragraphEl.appendChild(span);
  });
}

inputEl.addEventListener("input", () => {
  const input = inputEl.value;
  const spans = paragraphEl.querySelectorAll("span");

  spans.forEach((span, i) => {
    if (input[i] == null) {
      span.classList.remove("correct", "incorrect");
    } else if (input[i] === span.textContent) {
      span.classList.add("correct");
      span.classList.remove("incorrect");
    } else {
      span.classList.add("incorrect");
      span.classList.remove("correct");
    }
  });

  progressBar.style.width =
    (input.length / spans.length) * 100 + "%";
});

inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    finishLevel();
  }
});

function startTimer() {
  interval = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 0) finishLevel();
  }, 1000);
}

function finishLevel() {
  clearInterval(interval);
  inputEl.disabled = true;

  // Accurate WPM
  const timeTakenSeconds = Math.max(
    1,
    Math.floor((Date.now() - levelStartTime) / 1000)
  );

  const maxChars = paragraphEl.textContent.length;
  const typedChars = Math.min(inputEl.value.length, maxChars);
  const wordsTyped = typedChars / 5;

  const wpm = Math.round((wordsTyped / timeTakenSeconds) * 60);
  totalWpm += wpm;

  // Accuracy
  const spans = paragraphEl.querySelectorAll("span");
  let correctChars = 0;
  spans.forEach(span => {
    if (span.classList.contains("correct")) correctChars++;
  });

  const accuracy = Math.round((correctChars / spans.length) * 100);
  totalAccuracy += accuracy;

  wpmEl.textContent = wpm;
  accuracyEl.textContent = accuracy;

  setTimeout(nextLevel, 700);
}

function endGame() {
  gameScreen.innerHTML = `
    <div style="text-align:center; padding:40px 10px;">
      <h1>🎮 Typing Speed Arcade</h1>
      <p style="opacity:0.8;">Game Completed</p>
    </div>
  `;

  const board = document.getElementById("scoreboard-container");
  board.innerHTML = `
    <div id="scoreboard">
      <h2>🏁 Final Score</h2>
      <p><b>Average WPM:</b> ${Math.round(totalWpm / totalLevels)}</p>
      <p><b>Average Accuracy:</b> ${Math.round(totalAccuracy / totalLevels)}%</p>
      <button id="restart">Restart</button>
      <button id="quit">Quit</button>
    </div>
  `;

  document.getElementById("restart").onclick = () => location.reload();

  document.getElementById("quit").onclick = () => {
    board.innerHTML = "";
    gameScreen.innerHTML = `
      <div style="text-align:center; padding:40px 10px;">
        <h1>🎮 Typing Speed Arcade</h1>
        <p style="opacity:0.8;">Thanks for playing!</p>
        <button id="play-again">Play Again</button>
      </div>
    `;

    document.getElementById("play-again").onclick = () => location.reload();
  };
}
