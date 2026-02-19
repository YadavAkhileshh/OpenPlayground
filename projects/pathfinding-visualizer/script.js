const gridElement = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const clearBtn = document.getElementById("clearBtn");
const speedSlider = document.getElementById("speedSlider");

const rows = 20;
const cols = 30;

let grid = [];
let startNode = {row:10, col:5};
let endNode = {row:10, col:25};
let mouseDown = false;
let delay = 20;

function createGrid(){
    grid = [];
    gridElement.innerHTML = "";

    for(let r=0;r<rows;r++){
        const row = [];
        for(let c=0;c<cols;c++){
            const node = document.createElement("div");
            node.classList.add("node");

            if(r === startNode.row && c === startNode.col)
                node.classList.add("start");
            if(r === endNode.row && c === endNode.col)
                node.classList.add("end");

            node.addEventListener("mousedown",()=>{
                mouseDown = true;
                toggleWall(r,c);
            });

            node.addEventListener("mouseover",()=>{
                if(mouseDown) toggleWall(r,c);
            });

            gridElement.appendChild(node);

            row.push({
                row:r,
                col:c,
                isWall:false,
                distance:Infinity,
                previous:null
            });
        }
        grid.push(row);
    }
}

document.body.addEventListener("mouseup",()=>mouseDown=false);

function toggleWall(r,c){
    if((r===startNode.row && c===startNode.col) ||
       (r===endNode.row && c===endNode.col)) return;

    grid[r][c].isWall = !grid[r][c].isWall;
    const index = r*cols+c;
    gridElement.children[index].classList.toggle("wall");
}

function getNeighbors(node){
    const neighbors = [];
    const {row,col} = node;

    if(row>0) neighbors.push(grid[row-1][col]);
    if(row<rows-1) neighbors.push(grid[row+1][col]);
    if(col>0) neighbors.push(grid[row][col-1]);
    if(col<cols-1) neighbors.push(grid[row][col+1]);

    return neighbors.filter(n=>!n.isWall);
}

async function dijkstra(){
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];

    start.distance = 0;

    const unvisited = grid.flat();

    while(unvisited.length){
        unvisited.sort((a,b)=>a.distance-b.distance);
        const closest = unvisited.shift();

        if(closest.isWall) continue;
        if(closest.distance === Infinity) return;

        const index = closest.row*cols+closest.col;
        gridElement.children[index].classList.add("visited");

        if(closest === end){
            await drawPath(end);
            return;
        }

        const neighbors = getNeighbors(closest);

        for(const neighbor of neighbors){
            const alt = closest.distance + 1;
            if(alt < neighbor.distance){
                neighbor.distance = alt;
                neighbor.previous = closest;
            }
        }

        await sleep(delay);
    }
}

async function drawPath(end){
    let current = end;
    while(current){
        const index = current.row*cols+current.col;
        gridElement.children[index].classList.add("path");
        current = current.previous;
        await sleep(delay);
    }
}

function sleep(ms){
    return new Promise(res=>setTimeout(res,ms));
}

startBtn.addEventListener("click",()=>{
    delay = 101 - speedSlider.value;
    dijkstra();
});

clearBtn.addEventListener("click",()=>{
    startNode = {row:10,col:5};
    endNode = {row:10,col:25};
    createGrid();
});

createGrid();
