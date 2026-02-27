const rows = 20;
const cols = 25;

let grid = [];
let start = null;
let goal = null;
let mode = "wall";

const gridContainer = document.getElementById("grid");

function createGrid() {
    gridContainer.innerHTML = "";
    grid = [];

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener("click", () => handleCellClick(r, c, cell));

            gridContainer.appendChild(cell);

            row.push({
                row: r,
                col: c,
                g: Infinity,
                h: 0,
                f: Infinity,
                parent: null,
                isWall: false,
                element: cell
            });
        }
        grid.push(row);
    }
}

function setMode(newMode) {
    mode = newMode;
    document.getElementById("output").innerText =
        `Mode: ${newMode.toUpperCase()}`;
}

function handleCellClick(r, c, cell) {
    const node = grid[r][c];

    if (mode === "start") {
        if (start) start.element.classList.remove("start");
        start = node;
        cell.classList.add("start");
    }
    else if (mode === "goal") {
        if (goal) goal.element.classList.remove("goal");
        goal = node;
        cell.classList.add("goal");
    }
    else if (mode === "wall") {
        node.isWall = !node.isWall;
        cell.classList.toggle("wall");
    }
}

function heuristic(a, b) {
    return Math.abs(a.row - b.row) +
           Math.abs(a.col - b.col); // Manhattan distance
}

function getNeighbors(node) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const neighbors = [];

    for (let [dr, dc] of dirs) {
        const nr = node.row + dr;
        const nc = node.col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            neighbors.push(grid[nr][nc]);
        }
    }
    return neighbors;
}

async function runAStar() {
    if (!start || !goal) {
        alert("Set start and goal!");
        return;
    }

    for (let row of grid) {
        for (let node of row) {
            node.g = Infinity;
            node.f = Infinity;
            node.parent = null;
            node.element.classList.remove("open", "closed", "path");
        }
    }

    start.g = 0;
    start.h = heuristic(start, goal);
    start.f = start.h;

    const openSet = [start];

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        if (current === goal) {
            reconstructPath(goal);
            document.getElementById("output").innerText =
                "Path found!";
            return;
        }

        current.element.classList.add("closed");

        for (let neighbor of getNeighbors(current)) {
            if (neighbor.isWall ||
                neighbor.element.classList.contains("closed"))
                continue;

            const tentativeG = current.g + 1;

            if (tentativeG < neighbor.g) {
                neighbor.parent = current;
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, goal);
                neighbor.f = neighbor.g + neighbor.h;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                    neighbor.element.classList.add("open");
                }
            }
        }

        await sleep(20);
    }

    document.getElementById("output").innerText =
        "No path found.";
}

function reconstructPath(node) {
    let current = node;
    while (current.parent) {
        current.element.classList.add("path");
        current = current.parent;
    }
}

function clearGrid() {
    start = null;
    goal = null;
    createGrid();
    document.getElementById("output").innerText =
        "Grid cleared.";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

createGrid();