const words = [
  "javascript","typescript","algorithm","asynchronous",
  "functionality","optimization","encryption","authentication",
  "authorization","repository","continuous","integration",
  "documentation","refactoring","debugging","responsiveness",
  "accessibility","animation","interaction","interface",
  "frameworks","frontend","backend","deployment",
  "visualization","datastructure","recursion","polymorphism",
  "inheritance","synchronization","serialization","concurrency",
  "multithreading","virtualization","hangmanchallenge","collaboration",
  "community","innovation","creativity","problemsolving","imagination",
  "determination","achievement","responsibility","development",
  "exploration","technology","performance","complexity"
];

let selectedWord;
let guessedLetters;
let lives;

const wordEl = document.getElementById("word");
const keyboardEl = document.getElementById("keyboard");
const livesEl = document.getElementById("lives");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart");

const hangmanParts = ["head","body","left-arm","right-arm","left-leg","right-leg"];

function initGame() {
  selectedWord = words[Math.floor(Math.random() * words.length)];
  guessedLetters = [];
  lives = hangmanParts.length;
  livesEl.textContent = lives;
  messageEl.textContent = "";
  messageEl.className = "message";

  hangmanParts.forEach(id => {
    document.getElementById(id).style.display = "none";
  });

  renderWord();
  renderKeyboard();
}

function renderWord() {
  wordEl.innerHTML = "";
  selectedWord.split("").forEach(letter => {
    const span = document.createElement("span");
    span.textContent = guessedLetters.includes(letter) ? letter : "";
    wordEl.appendChild(span);
  });

  // Win condition: all letters guessed AND lives > 0
  if (selectedWord.split("").every(l => guessedLetters.includes(l)) && lives > 0) {
    messageEl.textContent = "🎉 You Win!";
    messageEl.classList.add("win");
    disableKeyboard();
  }
}

function renderKeyboard() {
  keyboardEl.innerHTML = "";
  for(let i=97;i<=122;i++){
    const letter = String.fromCharCode(i);
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.addEventListener("click", ()=>handleGuess(letter,btn));
    keyboardEl.appendChild(btn);
  }
}

function handleGuess(letter, button) {
  button.disabled = true;

  if(selectedWord.includes(letter)){
    guessedLetters.push(letter);
    renderWord();
  } else {
    lives--;
    livesEl.textContent = lives;

    const partIndex = hangmanParts.length - lives - 1;
    if(partIndex >=0 && partIndex<hangmanParts.length){
      document.getElementById(hangmanParts[partIndex]).style.display = "block";
    }

    // Lose condition
    if(lives === 0){
      messageEl.textContent = `❌ You Lose! The word was "${selectedWord}"`;
      messageEl.classList.add("lose");
      revealWord();
      disableKeyboard();
    }
  }
}

function revealWord(){
  guessedLetters = selectedWord.split("");
  renderWord();
}

function disableKeyboard(){
  document.querySelectorAll(".keyboard button").forEach(btn=>btn.disabled=true);
}

restartBtn.addEventListener("click", initGame);

initGame();
