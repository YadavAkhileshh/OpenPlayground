let level = 1;
let xp = Number(localStorage.getItem("xp")) || 0;
let progress = 0;

const levelEl = document.getElementById("playerLevel");
const xpEl = document.getElementById("playerXP");
const questionText = document.getElementById("questionText");
const progressFill = document.getElementById("progressFill");
const logList = document.getElementById("gameLog");

const questions = [
    {
        title: "Level 1 – Basics",
        question: "What is the output of:\n\nconsole.log(typeof []);",
        answer: "object",
        xp: 10
    },
    {
        title: "Level 2 – Logic",
        question: "What will this return?\n\nBoolean('false')",
        answer: "true",
        xp: 15
    },
    {
        title: "Level 3 – Arrays",
        question: "Fill the blank:\n\nconst arr = [1,2,3];\narr.push(4);\nconsole.log(arr.length);\n// ____",
        answer: "4",
        xp: 20
    },
    {
        title: "Level 4 – Scope",
        question: "Is let block scoped or function scoped?",
        answer: "block",
        xp: 25
    }
];

function loadLevel() {
    const q = questions[level - 1];
    if (!q) {
        alert("🎉 Game Completed!");
        return;
    }
    document.getElementById("questionTitle").textContent = q.title;
    questionText.textContent = q.question;
}

document.getElementById("submitAnswer").addEventListener("click", submitAnswer);

function submitAnswer() {
    const input = document.getElementById("answerInput").value.trim().toLowerCase();
    const correct = questions[level - 1].answer;

    if (input === correct) {
        gainXP(questions[level - 1].xp);
        log(`✅ Correct! +${questions[level - 1].xp} XP`);
        level++;
        progress += 25;
        updateUI();
        loadLevel();
    } else {
        log("❌ Incorrect. Try again!");
    }

    document.getElementById("answerInput").value = "";
}

function gainXP(amount) {
    xp += amount;
    localStorage.setItem("xp", xp);
}

function updateUI() {
    levelEl.textContent = level;
    xpEl.textContent = xp;
    progressFill.style.width = Math.min(progress, 100) + "%";
}

function log(message) {
    const li = document.createElement("li");
    li.textContent = message;
    logList.prepend(li);
}

updateUI();
loadLevel();