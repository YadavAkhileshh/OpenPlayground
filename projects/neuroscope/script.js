let weights1 = [Math.random(), Math.random()];
let weights2 = [Math.random(), Math.random()];
let bias1 = Math.random();
let bias2 = Math.random();

let iteration = 0;

const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

function sigmoid(x){
    return 1 / (1 + Math.exp(-x));
}

function forwardPass(input){

    let hidden1 = sigmoid(input * weights1[0] + bias1);
    let hidden2 = sigmoid(input * weights1[1] + bias1);

    let output = sigmoid(hidden1 * weights2[0] + hidden2 * weights2[1] + bias2);

    return {hidden1, hidden2, output};
}

function calculateLoss(output, target){
    return Math.pow(output - target, 2);
}

function trainStep(){

    let input = parseFloat(document.getElementById("inputValue").value);
    let lr = parseFloat(document.getElementById("learningRate").value);

    let target = 1;

    let forward = forwardPass(input);
    let loss = calculateLoss(forward.output, target);

    // Simple gradient approximation
    let error = forward.output - target;

    weights2[0] -= lr * error * forward.hidden1;
    weights2[1] -= lr * error * forward.hidden2;
    bias2 -= lr * error;

    iteration++;

    document.getElementById("iteration").innerText = iteration;
    document.getElementById("lossValue").innerText = loss.toFixed(4);
    document.getElementById("outputValue").innerText = forward.output.toFixed(4);

    drawNetwork(forward);
}

function drawNetwork(values){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Input Node
    drawNode(100,200,"Input");

    // Hidden Nodes
    drawNode(300,120,"H1");
    drawNode(300,280,"H2");

    // Output Node
    drawNode(500,200,"Out");

    // Connections
    drawLine(100,200,300,120);
    drawLine(100,200,300,280);
    drawLine(300,120,500,200);
    drawLine(300,280,500,200);
}

function drawNode(x,y,label){
    ctx.beginPath();
    ctx.arc(x,y,30,0,2*Math.PI);
    ctx.strokeStyle="#00f5ff";
    ctx.stroke();
    ctx.fillStyle="#00f5ff";
    ctx.fillText(label,x-15,y+5);
}

function drawLine(x1,y1,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle="#00f5ff";
    ctx.stroke();
}

drawNetwork({});