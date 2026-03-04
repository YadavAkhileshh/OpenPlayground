const gridSize = 15;
let grid = [];
let start = { r: 0, c: 0 };
let end = { r: 14, c: 14 };

const gridContainer = document.getElementById("grid");

function generateGrid() {
  grid = [];
  gridContainer.innerHTML = "";

  for (let r = 0; r < gridSize; r++) {
    let row = [];
    for (let c = 0; c < gridSize; c++) {

      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (Math.random() < 0.25 && !(r === 0 && c === 0) && !(r === 14 && c === 14)) {
        cell.classList.add("wall");
        row.push(1);
      } else {
        row.push(0);
      }

      gridContainer.appendChild(cell);
    }
    grid.push(row);
  }

  paintCell(start.r, start.c, "start");
  paintCell(end.r, end.c, "end");
}

function paintCell(r, c, className) {
  const index = r * gridSize + c;
  gridContainer.children[index].classList.add(className);
}

function solveMaze() {

  const queue = [[start.r, start.c]];
  const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const parent = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

  visited[start.r][start.c] = true;

  const directions = [[1,0],[-1,0],[0,1],[0,-1]];

  const interval = setInterval(() => {

    if (queue.length === 0) {
      clearInterval(interval);
      return;
    }

    const [r, c] = queue.shift();

    if (r === end.r && c === end.c) {
      clearInterval(interval);
      reconstructPath(parent);
      return;
    }

    for (let [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nc >= 0 && nr < gridSize && nc < gridSize &&
          !visited[nr][nc] && grid[nr][nc] === 0) {

        visited[nr][nc] = true;
        parent[nr][nc] = [r, c];
        queue.push([nr, nc]);
        paintCell(nr, nc, "visited");
      }
    }

  }, 30);
}

function reconstructPath(parent) {
  let current = [end.r, end.c];

  while (current) {
    const [r, c] = current;
    paintCell(r, c, "path");
    current = parent[r][c];
  }
}

function resetGrid() {
  generateGrid();
}

generateGrid();
