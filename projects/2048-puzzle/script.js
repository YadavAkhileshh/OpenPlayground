const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");

let board = Array(16).fill(0);
let score = 0;

function draw() {
  boardEl.innerHTML = "";
  board.forEach(v => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.value = v;
    tile.textContent = v === 0 ? "" : v;
    boardEl.appendChild(tile);
  });
}

function addTile() {
  const empty = board
    .map((v, i) => v === 0 ? i : null)
    .filter(v => v !== null);

  if (!empty.length) return;

  const idx = empty[Math.floor(Math.random() * empty.length)];
  board[idx] = Math.random() > 0.9 ? 4 : 2;
}

function slide(row) {
  row = row.filter(v => v);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
    }
  }
  return row.filter(v => v);
}

function rotate(times) {
  while (times--) {
    board = board.map((_, i) =>
      board[(i % 4) * 4 + 3 - Math.floor(i / 4)]
    );
  }
}

function move(dir) {
  rotate(dir);
  let moved = false;

  for (let i = 0; i < 4; i++) {
    const row = board.slice(i * 4, i * 4 + 4);
    const newRow = slide(row);
    while (newRow.length < 4) newRow.push(0);
    if (row.toString() !== newRow.toString()) moved = true;
    board.splice(i * 4, 4, ...newRow);
  }

  rotate((4 - dir) % 4);

  if (moved) {
    addTile();
    scoreEl.textContent = score;
    draw();
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move(0);
  if (e.key === "ArrowUp") move(1);
  if (e.key === "ArrowRight") move(2);
  if (e.key === "ArrowDown") move(3);
});

// Start
addTile();
addTile();
draw();
