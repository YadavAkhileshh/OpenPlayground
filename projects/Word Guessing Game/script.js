const questions = [
    { word: "javascript", hint: "Popular language for web development" },
    { word: "browser", hint: "Used to access websites" },
    { word: "developer", hint: "Person who writes code" },
    { word: "computer", hint: "Electronic machine for processing data" },
    { word: "keyboard", hint: "Used to type letters" },
    { word: "internet", hint: "Global network of computers" },
    { word: "variable", hint: "Stores data in programming" },
    { word: "function", hint: "Block of reusable code" },
    { word: "html", hint: "Structure of web pages" },
    { word: "css", hint: "Used for styling web pages" }
];

let currentQuestion = 0;
let secretWord = "";
let guessedLetters = [];
let attempts = 6;
let score = 0;

const wordDiv = document.getElementById("word");
const attemptsSpan = document.getElementById("attempts");
const messageDiv = document.getElementById("message");
const hintDiv = document.getElementById("hint");
const questionDiv = document.getElementById("question");

function startGame() {
    if (currentQuestion >= questions.length) {
        document.querySelector(".container").innerHTML = `
            <h2>Game Over 🎮</h2>
            <p>Your Final Score:</p>
            <h1>${score} / ${questions.length}</h1>
        `;
        return;
    }

    secretWord = questions[currentQuestion].word;
    guessedLetters = [];
    attempts = 6;

    questionDiv.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    hintDiv.textContent = "Hint: " + questions[currentQuestion].hint;
    attemptsSpan.textContent = attempts;
    messageDiv.textContent = "";

    updateWordDisplay();
}

function updateWordDisplay() {
    let display = "";
    for (let letter of secretWord) {
        display += guessedLetters.includes(letter) ? letter + " " : "_ ";
    }
    wordDiv.textContent = display.trim();
}

function guessLetter() {
    const input = document.getElementById("letter");
    const letter = input.value.toLowerCase();
    input.value = "";

    if (!letter.match(/[a-z]/)) {
        messageDiv.textContent = "Enter a valid letter!";
        return;
    }

    if (guessedLetters.includes(letter)) {
        messageDiv.textContent = "Already guessed!";
        return;
    }

    guessedLetters.push(letter);

    if (!secretWord.includes(letter)) {
        attempts--;
        attemptsSpan.textContent = attempts;
        messageDiv.textContent = "Wrong guess!";
    } else {
        messageDiv.textContent = "Correct!";
    }

    updateWordDisplay();

    if (!wordDiv.textContent.includes("_")) {
        score++;
        currentQuestion++;
        setTimeout(startGame, 1000);
    } else if (attempts === 0) {
        currentQuestion++;
        setTimeout(startGame, 1000);
    }
}

startGame();