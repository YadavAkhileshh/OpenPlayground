const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const nodes = [
  {x:100,y:250},  // 0 source
  {x:300,y:100},  // 1
  {x:300,y:400},  // 2
  {x:600,y:250}   // 3 sink
];

const capacity = [
  [0,16,13,0],
  [0,0,10,12],
  [0,4,0,14],
  [0,0,0,0]
];

let residual;
let maxFlow = 0;

function drawGraph(highlightPath=[]) {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Draw edges
  for(let u=0;u<capacity.length;u++){
    for(let v=0;v<capacity.length;v++){
      if(capacity[u][v] > 0){
        ctx.beginPath();
        ctx.moveTo(nodes[u].x,nodes[u].y);
        ctx.lineTo(nodes[v].x,nodes[v].y);

        if(highlightPath.some(p=>p[0]===u && p[1]===v))
          ctx.strokeStyle = "#22c55e";
        else
          ctx.strokeStyle = "#94a3b8";

        ctx.stroke();

        ctx.fillStyle="black";
        ctx.fillText(
          `${residual[u][v]}/${capacity[u][v]}`,
          (nodes[u].x+nodes[v].x)/2,
          (nodes[u].y+nodes[v].y)/2
        );
      }
    }
  }

  // Draw nodes
  nodes.forEach((node,i)=>{
    ctx.beginPath();
    ctx.arc(node.x,node.y,25,0,2*Math.PI);
    ctx.fillStyle = i===0 ? "#3b82f6" :
                    i===3 ? "#ef4444" :
                    "#38bdf8";
    ctx.fill();
    ctx.fillStyle="white";
    ctx.fillText(i,node.x,node.y);
  });
}

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

async function runMaxFlow(){
  residual = capacity.map(row=>row.slice());
  maxFlow = 0;

  let parent = new Array(capacity.length);

  while(await bfs(0,3,parent)){
    let pathFlow = Infinity;

    for(let v=3;v!==0;v=parent[v]){
      let u = parent[v];
      pathFlow = Math.min(pathFlow,residual[u][v]);
    }

    let pathEdges=[];

    for(let v=3;v!==0;v=parent[v]){
      let u = parent[v];
      residual[u][v] -= pathFlow;
      residual[v][u] += pathFlow;
      pathEdges.push([u,v]);
    }

    maxFlow += pathFlow;

    drawGraph(pathEdges);
    await sleep(1000);
  }

  document.getElementById("result").textContent =
    `Max Flow = ${maxFlow}`;
}

async function bfs(s,t,parent){
  let visited = new Array(capacity.length).fill(false);
  let queue=[s];
  visited[s]=true;
  parent[s]=-1;

  while(queue.length){
    let u = queue.shift();

    for(let v=0;v<capacity.length;v++){
      if(!visited[v] && residual[u][v]>0){
        queue.push(v);
        parent[v]=u;
        visited[v]=true;
      }
    }
  }
  return visited[t];
}

function reset(){
  residual = capacity.map(row=>row.slice());
  maxFlow=0;
  document.getElementById("result").textContent="";
  drawGraph();
}

reset();
