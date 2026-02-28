let players = [];
let scores = [0, 0];
let currentPlayer = 0;
let currentQuestion = 0;

const questions = [
    {
        q: "What is the time complexity of linear search?",
        options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
        answer: 1
    },
    {
        q: "Which data structure uses FIFO?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        answer: 1
    },
    {
        q: "What does HTML stand for?",
        options: [
            "HyperText Markup Language",
            "HighText Machine Language",
            "HyperTool Markup Language",
            "None"
        ],
        answer: 0
    },
    {
        q: "Which is NOT a JavaScript data type?",
        options: ["Number", "Boolean", "Float", "Undefined"],
        answer: 2
    }
];

const setup = document.querySelector(".setup");
const scoreboard = document.getElementById("scoreboard");
const gameArea = document.getElementById("gameArea");
const turnText = document.getElementById("turnText");
const questionEl = document.getElementById("question");
const optionBtns = document.querySelectorAll(".option");
const logList = document.getElementById("logList");

document.getElementById("startGame").addEventListener("click", startGame);

function startGame() {
    const p1 = document.getElementById("player1").value || "Player 1";
    const p2 = document.getElementById("player2").value || "Player 2";

    players = [p1, p2];

    document.getElementById("p1Name").textContent = p1;
    document.getElementById("p2Name").textContent = p2;

    setup.classList.add("hidden");
    scoreboard.classList.remove("hidden");
    gameArea.classList.remove("hidden");

    loadQuestion();
}

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        endGame();
        return;
    }

    turnText.textContent = `${players[currentPlayer]}'s Turn`;
    questionEl.textContent = questions[currentQuestion].q;

    optionBtns.forEach((btn, i) => {
        btn.textContent = questions[currentQuestion].options[i];
        btn.onclick = () => answer(i);
    });
}

function answer(choice) {
    const correct = questions[currentQuestion].answer;

    if (choice === correct) {
        scores[currentPlayer] += 10;
        log(`✅ ${players[currentPlayer]} answered correctly (+10)`);
    } else {
        log(`❌ ${players[currentPlayer]} answered wrong`);
    }

    updateScores();
    currentPlayer = (currentPlayer + 1) % 2;
    currentQuestion++;
    loadQuestion();
}

function updateScores() {
    document.getElementById("p1Score").textContent = scores[0];
    document.getElementById("p2Score").textContent = scores[1];
}

function endGame() {
    let result = "It's a tie!";
    if (scores[0] > scores[1]) result = `${players[0]} Wins!`;
    if (scores[1] > scores[0]) result = `${players[1]} Wins!`;

    questionEl.textContent = "Game Over";
    turnText.textContent = result;
    log(`🏆 ${result}`);
}

function log(msg) {
    const li = document.createElement("li");
    li.textContent = msg;
    logList.prepend(li);
}