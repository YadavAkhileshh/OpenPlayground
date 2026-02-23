let network = {};
let weightsIH = [];
let weightsHO = [];
let learningRate = 0.1;
let loss = 0;

const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

function randomWeight() {
    return Math.random() * 2 - 1;
}

function buildNetwork() {
    const input = parseInt(document.getElementById("inputNodes").value);
    const hidden = parseInt(document.getElementById("hiddenNodes").value);
    const output = parseInt(document.getElementById("outputNodes").value);

    learningRate = parseFloat(document.getElementById("learningRate").value);

    network = { input, hidden, output };

    weightsIH = Array.from({length: hidden}, () =>
        Array.from({length: input}, randomWeight)
    );

    weightsHO = Array.from({length: output}, () =>
        Array.from({length: hidden}, randomWeight)
    );

    drawNetwork();
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function forward(inputs) {
    let hiddenOutputs = weightsIH.map(row =>
        sigmoid(row.reduce((sum,w,i)=>sum + w*inputs[i],0))
    );

    let finalOutputs = weightsHO.map(row =>
        sigmoid(row.reduce((sum,w,i)=>sum + w*hiddenOutputs[i],0))
    );

    return { hiddenOutputs, finalOutputs };
}

function train() {
    const inputs = [1, 0];
    const targets = [1];

    let {hiddenOutputs, finalOutputs} = forward(inputs);

    loss = 0.5 * Math.pow(targets[0] - finalOutputs[0],2);

    document.getElementById("lossValue").innerText = loss.toFixed(4);

    // Backpropagation (simplified)
    let outputErrors = targets.map((t,i)=>t-finalOutputs[i]);

    weightsHO = weightsHO.map((row,i)=>
        row.map((w,j)=>
            w + learningRate * outputErrors[i] * hiddenOutputs[j]
        )
    );

    drawNetwork();
}

function drawNetwork() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const inputX = 150;
    const hiddenX = 400;
    const outputX = 650;

    drawLayer(network.input, inputX);
    drawLayer(network.hidden, hiddenX);
    drawLayer(network.output, outputX);

    drawConnections(inputX, hiddenX, weightsIH);
    drawConnections(hiddenX, outputX, weightsHO);
}

function drawLayer(nodes, x) {
    for(let i=0;i<nodes;i++){
        const y = 100 + i*80;
        ctx.beginPath();
        ctx.arc(x,y,20,0,Math.PI*2);
        ctx.fillStyle="#58a6ff";
        ctx.fill();
    }
}

function drawConnections(x1,x2,weights) {
    weights.forEach((row,i)=>{
        row.forEach((w,j)=>{
            ctx.beginPath();
            ctx.moveTo(x1,100+j*80);
            ctx.lineTo(x2,100+i*80);
            ctx.strokeStyle = w>0?"#2ea043":"#f85149";
            ctx.lineWidth = Math.abs(w)*2;
            ctx.stroke();
        });
    });
}

buildNetwork();