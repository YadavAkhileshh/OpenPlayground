const gridSize = 5;
let agentPos = 0;
let goalPos = 24;

let Q = {};
let episode = 0;
let totalReward = 0;

initializeQ();

function initializeQ(){
    for(let s=0; s<gridSize*gridSize; s++){
        Q[s] = {up:0, down:0, left:0, right:0};
    }
}

function renderGrid(){
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    for(let i=0; i<gridSize*gridSize; i++){
        const cell = document.createElement("div");
        cell.classList.add("cell");

        if(i === agentPos) cell.classList.add("agent");
        if(i === goalPos) cell.classList.add("goal");

        grid.appendChild(cell);
    }
}

function chooseAction(state, epsilon){
    if(Math.random() < epsilon){
        const actions = ["up","down","left","right"];
        return actions[Math.floor(Math.random()*4)];
    } else {
        return Object.keys(Q[state]).reduce((a,b)=> Q[state][a] > Q[state][b] ? a : b);
    }
}

function step(action){

    let reward = -1;
    let newPos = agentPos;

    if(action === "up" && agentPos >= gridSize) newPos -= gridSize;
    if(action === "down" && agentPos < gridSize*(gridSize-1)) newPos += gridSize;
    if(action === "left" && agentPos % gridSize !== 0) newPos -= 1;
    if(action === "right" && agentPos % gridSize !== gridSize-1) newPos += 1;

    if(newPos === goalPos){
        reward = 100;
    }

    agentPos = newPos;
    totalReward += reward;

    return reward;
}

function trainAgent(){

    const alpha = parseFloat(document.getElementById("alpha").value);
    const gamma = parseFloat(document.getElementById("gamma").value);
    const epsilon = parseFloat(document.getElementById("epsilon").value);

    let state = agentPos;

    let action = chooseAction(state, epsilon);

    let reward = step(action);

    let nextState = agentPos;

    let maxFuture = Math.max(...Object.values(Q[nextState]));

    Q[state][action] =
        Q[state][action] +
        alpha * (reward + gamma * maxFuture - Q[state][action]);

    episode++;

    document.getElementById("episode").innerText = episode;
    document.getElementById("totalReward").innerText = totalReward;

    renderGrid();
}

function resetWorld(){
    agentPos = 0;
    totalReward = 0;
    episode = 0;
    initializeQ();
    renderGrid();
}

renderGrid();