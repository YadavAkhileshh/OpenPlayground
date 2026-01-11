const wordBank = {
  easy: [
    "apple","bread","chair","table","river","house","green","happy","music","cloud",
    "clock","window","garden","street","family","friend","school","light","water","flower",
    "sunset","morning","evening","paper","pencil","mirror","button","pillow","blanket","cup",
    "plate","spoon","market","shop","train","smile","laugh","quiet","noise","dream",
    "story","beach","sand","stone","grass","leaf","rain","wind","snow"
  ],
  medium: [
    "journey","picture","station","weather","holiday","message","village","cityscape","traffic","kitchen",
    "bedroom","library","college","meeting","teacher","student","language","culture","history","future",
    "present","memory","emotion","feeling","balance","comfort","energy","freedom","nature","forest",
    "mountain","valley","island","ocean","desert","sunrise","sunlight","shadow","silence","motion",
    "pattern","texture","quality","success","failure","choice","decision","purpose"
  ],
  hard: [
    "adventure","mysterious","celebration","imagination","confidence","destination","experience","knowledge","perspective","atmosphere",
    "opportunity","responsibility","determination","independence","communication","inspiration","creativity","personality","curiosity","motivation",
    "achievement","recognition","discipline","concentration","transformation","expectation","appreciation","understanding","collaboration","exploration",
    "perseverance","significance","satisfaction","development","consequence","improvement","observation","interpretation","expression","innovation",
    "connection","reputation","environment","possibility","reflection","contribution","realization","commitment"
  ]
};

let selectedWord = "";
let attemptsLeft = 3;
let timeLeft = 30;
let timer;

const scrambledWordEl = document.getElementById("scrambledWord");
const guessInput = document.getElementById("guessInput");
const attemptsEl = document.getElementById("attempts");
const timeEl = document.getElementById("time");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");
const submitBtn = document.getElementById("submitBtn");
const startBtn = document.getElementById("startBtn");
const gameUI = document.getElementById("gameUI");

guessInput.disabled = true;

function scrambleWord(word) {
  return word.split("").sort(() => Math.random() - 0.5).join("");
}

function getRandomWord() {
  const levels = Object.keys(wordBank);
  const level = levels[Math.floor(Math.random() * levels.length)];
  const words = wordBank[level];
  return words[Math.floor(Math.random() * words.length)];
}

function startGame() {
  gameUI.style.display = "block";
  selectedWord = getRandomWord();
  scrambledWordEl.textContent = scrambleWord(selectedWord);

  attemptsLeft = 3;
  timeLeft = 30;

  attemptsEl.textContent = attemptsLeft;
  timeEl.textContent = timeLeft;
  messageEl.textContent = "";
  guessInput.value = "";
  guessInput.disabled = false;
  restartBtn.style.display = "none";

  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  timeEl.textContent = timeLeft;

  if (timeLeft === 0) {
    endGame(false, `⏰ Time's up! The word was: ${selectedWord}`);
  }
}

function checkGuess() {
  const guess = guessInput.value.toLowerCase().trim();
  if (!guess) return;

  if (guess === selectedWord) {
    endGame(true, "🎉 Correct! You cracked the word!");
  } else {
    attemptsLeft--;
    attemptsEl.textContent = attemptsLeft;
    messageEl.textContent = "❌ Incorrect guess. Try again!";
    messageEl.className = "message error";

    if (attemptsLeft === 0) {
      endGame(false, `💥 No attempts left! Word was: ${selectedWord}`);
    }
  }

  guessInput.value = "";
}

function endGame(win, text) {
  clearInterval(timer);
  messageEl.textContent = text;
  messageEl.className = win ? "message success" : "message error";
  guessInput.disabled = true;
  restartBtn.style.display = "block";
}

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  startGame();
});

submitBtn.addEventListener("click", checkGuess);
restartBtn.addEventListener("click", startGame);

guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkGuess();
});
