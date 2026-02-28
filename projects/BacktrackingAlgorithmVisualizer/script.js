const boardEl = document.getElementById("board");
const statusText = document.getElementById("status");

let N = 8;
let board = [];

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

// ---------- CREATE BOARD ----------
function createBoard(n){
  boardEl.innerHTML="";
  boardEl.style.gridTemplateColumns = `repeat(${n}, 45px)`;

  board = Array.from({length:n},()=>Array(n).fill(0));

  for(let r=0;r<n;r++){
    for(let c=0;c<n;c++){
      const cell=document.createElement("div");
      cell.className="cell "+((r+c)%2===0?"light":"dark");
      cell.id=`cell-${r}-${c}`;
      boardEl.appendChild(cell);
    }
  }
}

// ---------- SAFE CHECK ----------
function isSafe(row,col){
  for(let i=0;i<row;i++){
    if(board[i][col]) return false;
  }

  for(let i=row-1,j=col-1;i>=0&&j>=0;i--,j--){
    if(board[i][j]) return false;
  }

  for(let i=row-1,j=col+1;i>=0&&j<N;i--,j++){
    if(board[i][j]) return false;
  }

  return true;
}

// ---------- VISUAL HELPERS ----------
function getCell(r,c){
  return document.getElementById(`cell-${r}-${c}`);
}

async function placeQueen(r,c){
  const cell=getCell(r,c);
  cell.textContent="♛";
  cell.classList.add("placed");
  await sleep(250);
}

async function removeQueen(r,c){
  const cell=getCell(r,c);
  cell.textContent="";
  cell.classList.remove("placed");
  cell.classList.add("backtrack");
  await sleep(250);
  cell.classList.remove("backtrack");
}

// ---------- BACKTRACKING ----------
async function solve(row=0){
  if(row===N){
    statusText.textContent="✔ Solution Found!";
    return true;
  }

  for(let col=0;col<N;col++){

    const cell=getCell(row,col);
    cell.classList.add("try");
    await sleep(120);

    if(isSafe(row,col)){
      board[row][col]=1;
      cell.classList.remove("try");

      await placeQueen(row,col);

      if(await solve(row+1)) return true;

      board[row][col]=0;
      await removeQueen(row,col);
    }

    cell.classList.remove("try");
  }

  return false;
}

// ---------- START ----------
document.getElementById("startBtn").onclick = async ()=>{
  N = Number(document.getElementById("sizeInput").value);
  statusText.textContent="Solving...";
  createBoard(N);
  await solve();
};