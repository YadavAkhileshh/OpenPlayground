const gridEl = document.getElementById("grid");
const ROWS = 18;
const COLS = 25;

let grid = [];
let start = { r: 2, c: 2 };
let end = { r: 15, c: 20 };

// Create grid
function createGrid() {
  gridEl.innerHTML = "";
  grid = [];

  for (let r = 0; r < ROWS; r++) {
    let row = [];
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (r === start.r && c === start.c) cell.classList.add("start");
      if (r === end.r && c === end.c) cell.classList.add("end");

      cell.onclick = () => {
        if (!cell.classList.contains("start") &&
            !cell.classList.contains("end")) {
          cell.classList.toggle("wall");
        }
      };

      gridEl.appendChild(cell);
      row.push(cell);
    }
    grid.push(row);
  }
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// BFS Pathfinding
async function bfs() {
  let queue = [[start.r, start.c]];
  let visited = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(false)
  );
  let parent = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(null)
  );

  visited[start.r][start.c] = true;

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  while (queue.length) {
    const [r,c] = queue.shift();

    if (!(r === start.r && c === start.c)) {
      grid[r][c].classList.add("visited");
      await sleep(30);
    }

    if (r === end.r && c === end.c) break;

    for (let [dr,dc] of dirs) {
      let nr = r + dr;
      let nc = c + dc;

      if (
        nr>=0 && nc>=0 &&
        nr<ROWS && nc<COLS &&
        !visited[nr][nc] &&
        !grid[nr][nc].classList.contains("wall")
      ) {
        visited[nr][nc] = true;
        parent[nr][nc] = [r,c];
        queue.push([nr,nc]);
      }
    }
  }

  // Draw path
  let cur = [end.r, end.c];
  while (cur) {
    const [r,c] = cur;
    if (!(r===start.r && c===start.c))
      grid[r][c].classList.add("path");

    await sleep(40);
    cur = parent[r][c];
  }
}

// Events
document.getElementById("startAlgo").onclick = bfs;
document.getElementById("clearGrid").onclick = createGrid;

// Init
createGrid();