const rows = 20;
const cols = 20;
const gridElement = document.getElementById("grid");

let grid = [];
let start = null;
let end = null;
let mode = "wall";

function createGrid() {
  grid = [];
  gridElement.innerHTML = "";

  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.onclick = () => handleClick(r, c, cell);
      gridElement.appendChild(cell);

      row.push({
        row: r,
        col: c,
        f: 0,
        g: 0,
        h: 0,
        wall: false,
        parent: null
      });
    }
    grid.push(row);
  }
}

function setMode(m) {
  mode = m;
}

function handleClick(r, c, cell) {
  if (mode === "start") {
    clearClass("start");
    start = grid[r][c];
    cell.classList.add("start");
  } else if (mode === "end") {
    clearClass("end");
    end = grid[r][c];
    cell.classList.add("end");
  } else if (mode === "wall") {
    grid[r][c].wall = true;
    cell.classList.add("wall");
  }
}

function clearClass(className) {
  document.querySelectorAll("." + className)
    .forEach(el => el.classList.remove(className));
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

async function runAStar() {
  if (!start || !end) return alert("Set start and end!");

  let openSet = [start];
  let closedSet = [];

  while (openSet.length > 0) {

    let lowest = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowest].f)
        lowest = i;
    }

    let current = openSet[lowest];

    if (current === end) {
      drawPath(current);
      return;
    }

    openSet.splice(lowest, 1);
    closedSet.push(current);

    let neighbors = getNeighbors(current);

    for (let neighbor of neighbors) {
      if (closedSet.includes(neighbor) || neighbor.wall)
        continue;

      let tempG = current.g + 1;

      let newPath = false;
      if (!openSet.includes(neighbor)) {
        newPath = true;
        neighbor.h = heuristic(neighbor, end);
        openSet.push(neighbor);
      } else if (tempG < neighbor.g) {
        newPath = true;
      }

      if (newPath) {
        neighbor.g = tempG;
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;
      }
    }

    await sleep(20);
    colorCell(current.row, current.col, "visited");
  }

  alert("No Path Found!");
}

function getNeighbors(node) {
  let neighbors = [];
  let { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < rows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < cols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors;
}

function drawPath(node) {
  let temp = node;
  while (temp.parent) {
    colorCell(temp.row, temp.col, "path");
    temp = temp.parent;
  }
}

function colorCell(r, c, className) {
  const index = r * cols + c;
  gridElement.children[index].classList.add(className);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resetGrid() {
  createGrid();
  start = null;
  end = null;
}

createGrid();
