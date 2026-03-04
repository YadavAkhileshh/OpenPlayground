const board = document.getElementById("board");
const size = 3; // 3x3 boxes
let currentPlayer = 1;
let score = {1: 0, 2: 0};

const boxes = [];
const hLines = [];
const vLines = [];

function buildBoard() {
  board.innerHTML = "";
  boxes.length = 0;
  hLines.length = 0;
  vLines.length = 0;
for (let r = 0; r < size * 2 + 1; r++) {
  for (let c = 0; c < size * 2 + 1; c++) {

    if (r % 2 === 0 && c % 2 === 0) {
      const dot = document.createElement("div");
      dot.className = "dot";
      board.appendChild(dot);

    } else if (r % 2 === 0 && c % 2 === 1) {
      const line = document.createElement("div");
      line.className = "h-line";
      line.dataset.r = r;
      line.dataset.c = c;
      line.onclick = () => selectLine(line, "h");
      hLines.push(line);
      board.appendChild(line);

    } else if (r % 2 === 1 && c % 2 === 0) {
      const line = document.createElement("div");
      line.className = "v-line";
      line.dataset.r = r;
      line.dataset.c = c;
      line.onclick = () => selectLine(line, "v");
      vLines.push(line);
      board.appendChild(line);

    } else {
      const box = document.createElement("div");
      box.className = "box";
      box.dataset.r = r;
      box.dataset.c = c;
      boxes.push(box);
      board.appendChild(box);
    }
  }
}
}


function selectLine(line) {
  if (line.classList.contains("active")) return;

  line.classList.add("active");

  // Add player color
  if (currentPlayer === 1) {
    line.classList.add("p1");
  } else {
    line.classList.add("p2");
  }

  let completed = checkBoxes();

  if (!completed) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }

  updateUI();
}

function checkBoxes() {
  let boxCompleted = false;

  boxes.forEach(box => {
    if (box.classList.contains("p1") || box.classList.contains("p2")) return;

    const r = parseInt(box.dataset.r);
    const c = parseInt(box.dataset.c);

    const top = document.querySelector(`.h-line[data-r="${r-1}"][data-c="${c}"]`);
    const bottom = document.querySelector(`.h-line[data-r="${r+1}"][data-c="${c}"]`);
    const left = document.querySelector(`.v-line[data-r="${r}"][data-c="${c-1}"]`);
    const right = document.querySelector(`.v-line[data-r="${r}"][data-c="${c+1}"]`);

    if (top?.classList.contains("active") &&
        bottom?.classList.contains("active") &&
        left?.classList.contains("active") &&
        right?.classList.contains("active")) {

      box.classList.add(currentPlayer === 1 ? "p1" : "p2");
      score[currentPlayer]++;
      boxCompleted = true;
    }
  });

  return boxCompleted;
}

function updateUI() {
  document.getElementById("p1").textContent = score[1];
  document.getElementById("p2").textContent = score[2];

  checkGameEnd();
}


function checkGameEnd() {
  if (score[1] + score[2] === size * size) {
    let winner =
      score[1] > score[2] ? "Player 1 Wins 🎉" :
      score[2] > score[1] ? "Player 2 Wins 🎉" :
      "It's a Draw 🤝";

    document.getElementById("turn").textContent = winner;
    return;
    board.style.pointerEvents = "none";
  }
}

document.getElementById("startBtn").onclick = () => {
  score = {1: 0, 2: 0};
  currentPlayer = 1;

  board.style.pointerEvents = "auto";
  document.getElementById("turn").textContent = "Player 1 Turn";
  document.getElementById("startBtn").textContent = "Restart Game";

  buildBoard();
  updateUI();
};
