const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let G1 = [];
let G2 = [];
let secretPermutation = [];
let nodes = 6;

function generateGraphs() {
    G1 = generateRandomGraph(nodes);
    secretPermutation = shuffle([...Array(nodes).keys()]);
    G2 = permuteGraph(G1, secretPermutation);

    log("Secret graph pair generated.");
    drawGraph(G1, 150);
    drawGraph(G2, 450);
}

function generateRandomGraph(n) {
    const graph = Array.from({length:n},()=>Array(n).fill(0));
    for(let i=0;i<n;i++){
        for(let j=i+1;j<n;j++){
            if(Math.random()>0.5){
                graph[i][j]=1;
                graph[j][i]=1;
            }
        }
    }
    return graph;
}

function permuteGraph(graph, perm) {
    const n = graph.length;
    const newGraph = Array.from({length:n},()=>Array(n).fill(0));
    for(let i=0;i<n;i++){
        for(let j=0;j<n;j++){
            newGraph[i][j]=graph[perm[i]][perm[j]];
        }
    }
    return newGraph;
}

function runProtocol() {
    const challenge = Math.random()>0.5?1:2;

    log("Verifier challenges with Graph " + challenge);

    if(challenge===1){
        log("Prover reveals permutation mapping to G1.");
    }else{
        log("Prover reveals permutation mapping to G2.");
    }

    log("Verifier checks mapping validity.");
    log("Round completed. Probability of cheating decreases.");
}

function drawGraph(graph, offsetX){
    const radius=120;
    const centerY=200;
    const centerX=offsetX;

    ctx.clearRect(offsetX-150,0,300,400);

    const positions=[];

    for(let i=0;i<nodes;i++){
        const angle=(2*Math.PI/nodes)*i;
        const x=centerX+radius*Math.cos(angle);
        const y=centerY+radius*Math.sin(angle);
        positions.push({x,y});
    }

    for(let i=0;i<nodes;i++){
        for(let j=i+1;j<nodes;j++){
            if(graph[i][j]===1){
                ctx.beginPath();
                ctx.moveTo(positions[i].x,positions[i].y);
                ctx.lineTo(positions[j].x,positions[j].y);
                ctx.strokeStyle="#f4e9cd";
                ctx.stroke();
            }
        }
    }

    positions.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,15,0,2*Math.PI);
        ctx.fillStyle="#c9a227";
        ctx.fill();
    });
}

function shuffle(arr){
    return arr.sort(()=>Math.random()-0.5);
}

function log(text){
    document.getElementById("log").textContent += text+"\n";
}

function reset(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    document.getElementById("log").textContent="";
}