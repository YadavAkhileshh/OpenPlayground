const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let nodes = [];
let edges = [];
let connectMode = false;
let selected = null;

// Node class
class Node {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.color = "#38bdf8";
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillText(this.id, this.x - 4, this.y + 4);
  }
}

// Draw everything
function drawGraph() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // edges
  edges.forEach(([a,b]) => {
    const n1 = nodes[a];
    const n2 = nodes[b];

    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  });

  nodes.forEach(n => n.draw());
}

// Add node
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const clickedNode = nodes.find(
    n => Math.hypot(n.x-x, n.y-y) < 20
  );

  if (connectMode) {
    if (clickedNode) {
      if (!selected) {
        selected = clickedNode;
      } else {
        edges.push([selected.id, clickedNode.id]);
        selected = null;
        drawGraph();
      }
    }
  } else {
    nodes.push(new Node(x,y,nodes.length));
    drawGraph();
  }
});

// Build adjacency list
function getAdj() {
  const adj = Array.from({length:nodes.length},()=>[]);
  edges.forEach(([a,b])=>{
    adj[a].push(b);
    adj[b].push(a);
  });
  return adj;
}

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

// BFS
async function bfs() {
  if (!nodes.length) return;

  const adj = getAdj();
  let q = [0];
  let vis = Array(nodes.length).fill(false);
  vis[0] = true;

  while(q.length){
    const u = q.shift();
    nodes[u].color = "#f59e0b";
    drawGraph();
    await sleep(500);

    for(let v of adj[u]){
      if(!vis[v]){
        vis[v]=true;
        q.push(v);
      }
    }

    nodes[u].color = "#22c55e";
    drawGraph();
  }
}

// DFS
async function dfsUtil(u, vis, adj){
  vis[u]=true;
  nodes[u].color="#ef4444";
  drawGraph();
  await sleep(500);

  for(let v of adj[u]){
    if(!vis[v]){
      await dfsUtil(v, vis, adj);
    }
  }

  nodes[u].color="#22c55e";
  drawGraph();
}

async function dfs(){
  if(!nodes.length) return;
  const adj = getAdj();
  let vis = Array(nodes.length).fill(false);
  await dfsUtil(0, vis, adj);
}

// Controls
document.getElementById("connectMode").onclick=()=>{
  connectMode=!connectMode;
};

document.getElementById("bfsBtn").onclick=bfs;
document.getElementById("dfsBtn").onclick=dfs;

document.getElementById("clearBtn").onclick=()=>{
  nodes=[];
  edges=[];
  drawGraph();
};

drawGraph();