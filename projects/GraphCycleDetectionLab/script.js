const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const nodes = [
  { x: 150, y: 100 },
  { x: 350, y: 80 },
  { x: 550, y: 120 },
  { x: 250, y: 300 },
  { x: 450, y: 320 }
];

let edges = [
  [0,1],
  [1,2],
  [2,3],
  [3,0],
  [3,4]
];

let visited = [];
let recStack = [];
let foundCycle = false;

function drawGraph(highlightNode = -1, cycleEdge = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  edges.forEach(edge => {
    const [a, b] = edge;
    ctx.beginPath();
    ctx.moveTo(nodes[a].x, nodes[a].y);
    ctx.lineTo(nodes[b].x, nodes[b].y);
    ctx.strokeStyle = (cycleEdge && cycleEdge[0] === a && cycleEdge[1] === b)
      ? "red" : "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw nodes
  nodes.forEach((node, i) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = i === highlightNode ? "#38bdf8" : "#3b82f6";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(i, node.x, node.y);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startDetection() {
  resetGraph();
  const type = document.getElementById("graphType").value;

  visited = new Array(nodes.length).fill(false);
  recStack = new Array(nodes.length).fill(false);
  foundCycle = false;

  for (let i = 0; i < nodes.length; i++) {
    if (!visited[i]) {
      if (type === "undirected") {
        if (await dfsUndirected(i, -1)) break;
      } else {
        if (await dfsDirected(i)) break;
      }
    }
  }

  document.getElementById("result").textContent =
    foundCycle ? "Cycle Detected!" : "No Cycle Found!";
}

async function dfsUndirected(node, parent) {
  visited[node] = true;
  drawGraph(node);
  await sleep(500);

  for (let [u, v] of edges) {
    let neighbor = null;
    if (u === node) neighbor = v;
    else if (v === node) neighbor = u;

    if (neighbor !== null) {
      if (!visited[neighbor]) {
        if (await dfsUndirected(neighbor, node)) return true;
      } else if (neighbor !== parent) {
        drawGraph(node, [node, neighbor]);
        foundCycle = true;
        return true;
      }
    }
  }

  return false;
}

async function dfsDirected(node) {
  visited[node] = true;
  recStack[node] = true;

  drawGraph(node);
  await sleep(500);

  for (let [u, v] of edges) {
    if (u === node) {
      if (!visited[v]) {
        if (await dfsDirected(v)) return true;
      } else if (recStack[v]) {
        drawGraph(node, [u, v]);
        foundCycle = true;
        return true;
      }
    }
  }

  recStack[node] = false;
  return false;
}

function resetGraph() {
  document.getElementById("result").textContent = "";
  drawGraph();
}

drawGraph();
