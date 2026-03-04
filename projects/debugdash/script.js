let level = 1;
let score = 0;
let lives = 3;
let progress = 0;
let selected = null;
let hintUsed = false;

const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const codeBox = document.getElementById("codeBox");
const titleEl = document.getElementById("challengeTitle");
const logList = document.getElementById("logList");
const progressFill = document.getElementById("progressFill");
const hintText = document.getElementById("hintText");

const challenges = [
    {
        title: "Level 1 – Syntax Error",
        code: "console.log('Hello World)",
        type: "syntax",
        hint: "Check string quotes."
    },
    {
        title: "Level 2 – Runtime Error",
        code: "let x;\nconsole.log(x.length);",
        type: "runtime",
        hint: "Accessing property of undefined."
    },
    {
        title: "Level 3 – Logical Error",
        code: "for(let i=0;i<=5;i++){sum+=i}",
        type: "logic",
        hint: "Variable initialization or loop condition."
    },
    {
        title: "Level 4 – No Error",
        code: "const a = [1,2,3];\nconsole.log(a.length);",
        type: "none",
        hint: "This code runs fine."
    }
];

document.querySelectorAll(".options button").forEach(btn => {
    btn.addEventListener("click", () => {
        selected = btn.dataset.type;
        log(`Selected: ${selected}`);
    });
});

document.getElementById("submitAnswer").addEventListener("click", submitAnswer);
document.getElementById("showHint").addEventListener("click", showHint);

function loadLevel() {
    const c = challenges[level - 1];
    if (!c) {
        titleEl.textContent = "🏆 All Levels Completed!";
        codeBox.textContent = "You mastered debugging!";
        return;
    }
    titleEl.textContent = c.title;
    codeBox.textContent = c.code;
    hintUsed = false;
    hintText.textContent = "Hint available.";
}

function submitAnswer() {
    if (!selected) return;

    const correct = challenges[level - 1].type;

    if (selected === correct) {
        score += hintUsed ? 5 : 10;
        progress += 25;
        log("✅ Correct Debug!");
        level++;
    } else {
        lives--;
        log("❌ Wrong Debug Type");
    }

    updateUI();
    checkGameState();
    selected = null;
}

function showHint() {
    if (hintUsed) return;
    hintText.textContent = challenges[level - 1].hint;
    hintUsed = true;
}

function updateUI() {
    levelEl.textContent = level;
    scoreEl.textContent = score;
    livesEl.textContent = "❤️".repeat(lives);
    progressFill.style.width = Math.min(progress, 100) + "%";
}

function checkGameState() {
    if (lives <= 0) {
        titleEl.textContent = "Game Over";
        codeBox.textContent = "You ran out of lives.";
        log("💀 Game Over");
        return;
    }
    loadLevel();
}

function log(msg) {
    const li = document.createElement("li");
    li.textContent = msg;
    logList.prepend(li);
}

loadLevel();
updateUI();