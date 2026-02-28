const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const nodes = [
  {x:150,y:100},
  {x:350,y:80},
  {x:550,y:100},
  {x:250,y:300},
  {x:450,y:300}
];

const edges = [
  [0,1],
  [1,2],
  [2,0],
  [1,3],
  [3,4]
];

let disc = [];
let low = [];
let stack = [];
let inStack = [];
let time = 0;
let sccCount = 0;

function drawGraph(highlightNode = -1, sccNodes = []) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  edges.forEach(([u,v]) => {
    ctx.beginPath();
    ctx.moveTo(nodes[u].x, nodes[u].y);
    ctx.lineTo(nodes[v].x, nodes[v].y);
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();
  });

  // Draw nodes
  nodes.forEach((node,i) => {
    ctx.beginPath();
    ctx.arc(node.x,node.y,20,0,2*Math.PI);

    if (sccNodes.includes(i))
      ctx.fillStyle = "#facc15";
    else if (i === highlightNode)
      ctx.fillStyle = "#38bdf8";
    else
      ctx.fillStyle = "#3b82f6";

    ctx.fill();

    ctx.fillStyle = "white";
    ctx.fillText(i,node.x,node.y);

    if (disc[i] !== undefined) {
      ctx.fillStyle = "black";
      ctx.fillText(`(${disc[i]},${low[i]})`, node.x, node.y+35);
    }
  });
}

function sleep(ms){
  return new Promise(r => setTimeout(r,ms));
}

async function runTarjan(){
  disc = new Array(nodes.length).fill(-1);
  low = new Array(nodes.length).fill(-1);
  inStack = new Array(nodes.length).fill(false);
  stack = [];
  time = 0;
  sccCount = 0;

  for(let i=0;i<nodes.length;i++){
    if(disc[i] === -1)
      await tarjanDFS(i);
  }

  document.getElementById("result").textContent =
    `Total SCCs Found: ${sccCount}`;
}

async function tarjanDFS(u){
  disc[u] = low[u] = time++;
  stack.push(u);
  inStack[u] = true;

  drawGraph(u);
  await sleep(700);

  for(let [from,to] of edges){
    if(from === u){
      if(disc[to] === -1){
        await tarjanDFS(to);
        low[u] = Math.min(low[u], low[to]);
      } else if(inStack[to]){
        low[u] = Math.min(low[u], disc[to]);
      }
    }
  }

  if(low[u] === disc[u]){
    let scc = [];
    while(true){
      let v = stack.pop();
      inStack[v] = false;
      scc.push(v);
      if(v === u) break;
    }

    sccCount++;
    drawGraph(-1, scc);
    await sleep(1000);
  }
}

function resetGraph(){
  disc = [];
  low = [];
  stack = [];
  inStack = [];
  time = 0;
  sccCount = 0;
  document.getElementById("result").textContent = "";
  drawGraph();
}

drawGraph();
