const menuView = document.getElementById("menu-view");
const gameView = document.getElementById("game-view");
const playButton = document.getElementById("play-button");
const backButton = document.getElementById("back-button");
const boardElement = document.getElementById("board");
const keyboardElement = document.getElementById("keyboard");
const messageElement = document.getElementById("message");

const ROWS = 6;
const COLS = 5;

const WORDS = [
  "APPLE",
  "HOUSE",
  "SMILE",
  "CLOUD",
  "RIVER",
  "MUSIC",
  "BOOKS",
  "GHOST"
];

let hiddenWord = "";
let currentRow = 0;
let currentCol = 0;
let isFinished = false;

function showView(viewToShow, viewToHide) {
  viewToHide.classList.add("is-hidden");
  viewToShow.classList.add("view-enter");
  viewToShow.classList.remove("is-hidden");
  requestAnimationFrame(() => {
    viewToShow.classList.remove("view-enter");
  });
}

function chooseWord() {
  const index = Math.floor(Math.random() * WORDS.length);
  hiddenWord = WORDS[index];
}

function createBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      boardElement.appendChild(cell);
    }
  }
}

const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"]
];

function createKeyboard() {
  keyboardElement.innerHTML = "";
  KEY_ROWS.forEach((row) => {
    row.forEach((keyLabel) => {
      const key = document.createElement("button");
      key.textContent = keyLabel === "DEL" ? "⌫" : keyLabel;
      key.dataset.key = keyLabel;
      const classes = ["key"];
      if (keyLabel === "ENTER" || keyLabel === "DEL") {
        classes.push("key-wide");
      }
      key.className = classes.join(" ");
      key.addEventListener("click", () => handleKey(keyLabel));
      keyboardElement.appendChild(key);
    });
  });
}

function setMessage(text, type) {
  messageElement.textContent = text;
  messageElement.className = "message-container";
  if (type === "success") {
    messageElement.classList.add("message-success");
  }
  if (type === "error") {
    messageElement.classList.add("message-error");
  }
}

function getCell(row, col) {
  return boardElement.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
}

function currentGuess() {
  let result = "";
  for (let col = 0; col < COLS; col += 1) {
    const cell = getCell(currentRow, col);
    result += cell.textContent || "";
  }
  return result;
}

function handleLetter(letter) {
  if (isFinished) return;
  if (currentCol >= COLS) return;
  const cell = getCell(currentRow, currentCol);
  cell.textContent = letter;
  cell.classList.add("filled");
  currentCol += 1;
}

function handleDelete() {
  if (isFinished) return;
  if (currentCol === 0) return;
  currentCol -= 1;
  const cell = getCell(currentRow, currentCol);
  cell.textContent = "";
  cell.classList.remove("filled", "cell-correct", "cell-present", "cell-absent");
}

function updateKeyboardKey(letter, result) {
  const button = keyboardElement.querySelector(`[data-key="${letter}"]`);
  if (!button) return;
  if (result === "correct") {
    button.classList.add("key-dark");
    button.classList.remove("key-disabled");
    return;
  }
  if (result === "present") {
    if (!button.classList.contains("key-dark")) {
      button.classList.remove("key-disabled");
    }
    return;
  }
  if (result === "absent") {
    if (!button.classList.contains("key-dark")) {
      button.classList.add("key-disabled");
    }
  }
}

function handleEnter() {
  if (isFinished) return;
  if (currentCol < COLS) {
    setMessage("Complete the word.", "error");
    return;
  }

  const guess = currentGuess();
  const word = hiddenWord;
  const wordLetters = word.split("");
  const guessLetters = guess.split("");

  const result = new Array(COLS).fill("absent");
  const used = new Array(COLS).fill(false);

  for (let i = 0; i < COLS; i += 1) {
    if (guessLetters[i] === wordLetters[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < COLS; i += 1) {
    if (result[i] === "correct") continue;
    const letter = guessLetters[i];
    const index = wordLetters.findIndex(
      (wLetter, j) => wLetter === letter && !used[j]
    );
    if (index !== -1) {
      result[i] = "present";
      used[index] = true;
    }
  }

  for (let col = 0; col < COLS; col += 1) {
    const cell = getCell(currentRow, col);
    cell.classList.remove("cell-correct", "cell-present", "cell-absent");
    if (result[col] === "correct") {
      cell.classList.add("cell-correct");
    } else if (result[col] === "present") {
      cell.classList.add("cell-present");
    } else {
      cell.classList.add("cell-absent");
    }
    updateKeyboardKey(guess[col], result[col]);
  }

  if (guess === hiddenWord) {
    isFinished = true;
    setMessage("Correct! You solved it.", "success");
    return;
  }

  currentRow += 1;
  currentCol = 0;

  if (currentRow >= ROWS) {
    isFinished = true;
    setMessage(`The word was ${hiddenWord}.`, "error");
  } else {
    setMessage("", null);
  }
}

function handleKey(label) {
  if (label === "ENTER") {
    handleEnter();
  } else if (label === "DEL") {
    handleDelete();
  } else {
    handleLetter(label);
  }
}

function handlePhysicalKey(event) {
  const key = event.key;
  if (key === "Enter") {
    handleEnter();
  } else if (key === "Backspace") {
    handleDelete();
  } else {
    const upper = key.toUpperCase();
    if (/^[A-Z]$/.test(upper)) {
      handleLetter(upper);
    }
  }
}

function resetGame() {
  chooseWord();
  currentRow = 0;
  currentCol = 0;
  isFinished = false;
  createBoard();
  createKeyboard();
  setMessage("", null);
}

playButton.addEventListener("click", () => {
  showView(gameView, menuView);
  resetGame();
});

backButton.addEventListener("click", () => {
  showView(menuView, gameView);
  setMessage("", null);
});

window.addEventListener("keydown", handlePhysicalKey);
