let level = 1;
let score = 0;
let lives = 3;
let progress = 0;

const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const puzzleTitle = document.getElementById("puzzleTitle");
const puzzleText = document.getElementById("puzzleText");
const logList = document.getElementById("logList");
const progressFill = document.getElementById("progressFill");

const puzzles = [
    {
        title: "Arrays – Sum",
        question: "Given array [1, 2, 3, 4, 5], what is the sum?",
        answer: "15",
        points: 10
    },
    {
        title: "Arrays – Max Element",
        question: "Find the maximum element in [7, 2, 9, 4].",
        answer: "9",
        points: 15
    },
    {
        title: "Strings – Reverse",
        question: "Reverse the string 'code'.",
        answer: "edoc",
        points: 20
    },
    {
        title: "Stacks – LIFO",
        question: "If stack = [1,2,3] and pop() is called, what is removed?",
        answer: "3",
        points: 20
    },
    {
        title: "Logic – Time Complexity",
        question: "What is the time complexity of binary search? (Big-O)",
        answer: "o(log n)",
        points: 25
    }
];

function loadPuzzle() {
    const puzzle = puzzles[level - 1];
    if (!puzzle) {
        log("🏆 You conquered AlgoArena!");
        puzzleTitle.textContent = "Victory!";
        puzzleText.textContent = "All DSA puzzles completed.";
        return;
    }
    puzzleTitle.textContent = `Level ${level}: ${puzzle.title}`;
    puzzleText.textContent = puzzle.question;
}

document.getElementById("submitAnswer").addEventListener("click", submitAnswer);

function submitAnswer() {
    const input = document.getElementById("answerInput").value.trim().toLowerCase();
    const correct = puzzles[level - 1].answer.toLowerCase();

    if (input === correct) {
        score += puzzles[level - 1].points;
        progress += 20;
        log(`✅ Correct! +${puzzles[level - 1].points} points`);
        level++;
    } else {
        lives--;
        log("❌ Wrong answer! Lost a life.");
    }

    updateUI();
    checkGameState();
    document.getElementById("answerInput").value = "";
}

function updateUI() {
    levelEl.textContent = level;
    scoreEl.textContent = score;
    progressFill.style.width = Math.min(progress, 100) + "%";
    livesEl.textContent = "❤️".repeat(lives);
}

function checkGameState() {
    if (lives <= 0) {
        puzzleTitle.textContent = "Game Over";
        puzzleText.textContent = "You ran out of lives.";
        log("💀 Game Over");
        return;
    }
    loadPuzzle();
}

function log(message) {
    const li = document.createElement("li");
    li.textContent = message;
    logList.prepend(li);
}

loadPuzzle();
updateUI();