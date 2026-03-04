// =====================================================
// SOCIAL ENGINEERING SIMULATOR
// =====================================================

const trustEl = document.getElementById("trust");
const suspicionEl = document.getElementById("suspicion");
const timerEl = document.getElementById("timer");
const chatLog = document.getElementById("chatLog");
const choicesDiv = document.getElementById("choices");
const restartBtn = document.getElementById("restartBtn");

let trust = 50;
let suspicion = 0;
let timeLeft = 120;
let gameOver = false;
let currentNode = null;

// =====================================================
// SOUND
// =====================================================

function beep(freq=500,duration=100){
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value=freq;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(()=>osc.stop(),duration);
}

// =====================================================
// MESSAGE SYSTEM
// =====================================================

function addMessage(text, sender){
    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// =====================================================
// DIALOGUE TREE
// =====================================================

const dialogue = {

start:{
    npc:"Hello. Who are you?",
    choices:[
        {text:"I'm from IT support.", trust:+10, suspicion:+5, next:"it"},
        {text:"Just checking system logs.", trust:0, suspicion:+10, next:"logs"},
        {text:"None of your business.", trust:-10, suspicion:+20, next:"hostile"}
    ]
},

it:{
    npc:"IT? I wasn't informed.",
    choices:[
        {text:"Emergency maintenance.", trust:+15, suspicion:+5, next:"convince"},
        {text:"Check your email.", trust:+5, suspicion:+10, next:"convince"}
    ]
},

logs:{
    npc:"Why are you accessing logs?",
    choices:[
        {text:"Security audit.", trust:+5, suspicion:+5, next:"convince"},
        {text:"System anomaly detected.", trust:+10, suspicion:+5, next:"convince"}
    ]
},

hostile:{
    npc:"This seems suspicious.",
    choices:[
        {text:"Sorry, wrong person.", trust:-5, suspicion:+5, next:"start"},
        {text:"You talk too much.", trust:-15, suspicion:+30, next:"fail"}
    ]
},

convince:{
    npc:"What exactly do you need?",
    choices:[
        {text:"Your access credentials.", trust:+20, suspicion:+10, next:"final"},
        {text:"Temporary login token.", trust:+10, suspicion:+5, next:"final"}
    ]
},

final:{
    npc:"Hmm...",
    choices:[
        {text:"Trust me. This is urgent.", trust:+20, suspicion:+10, next:"success"},
        {text:"Give me access now.", trust:-5, suspicion:+20, next:"fail"}
    ]
},

success:{
    npc:"Alright. Access granted.",
    choices:[]
},

fail:{
    npc:"Security alerted!",
    choices:[]
}

};

// =====================================================
// GAME LOGIC
// =====================================================

function renderNode(nodeKey){
    currentNode = dialogue[nodeKey];
    choicesDiv.innerHTML = "";

    addMessage(currentNode.npc,"npc");

    currentNode.choices.forEach(choice=>{
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.onclick = ()=>{
            handleChoice(choice);
        };
        choicesDiv.appendChild(btn);
    });
}

function handleChoice(choice){
    if(gameOver) return;

    addMessage(choice.text,"player");

    trust += choice.trust;
    suspicion += choice.suspicion;

    updateStats();

    beep(600,80);

    if(suspicion >= 100){
        endGame("Security traced you.");
        return;
    }

    if(trust >= 100){
        endGame("You successfully manipulated the target.");
        return;
    }

    if(choice.next === "success"){
        endGame("Access granted. You win.");
        return;
    }

    if(choice.next === "fail"){
        endGame("You were exposed.");
        return;
    }

    setTimeout(()=>renderNode(choice.next),800);
}

function updateStats(){
    trustEl.textContent = trust;
    suspicionEl.textContent = suspicion;
}

function endGame(message){
    gameOver = true;
    addMessage(message,"npc");
    choicesDiv.innerHTML = "";
    document.body.style.filter="grayscale(1)";
}

// =====================================================
// TIMER
// =====================================================

function updateTimer(){
    if(gameOver) return;

    timeLeft--;
    timerEl.textContent = timeLeft;

    if(timeLeft <= 0){
        endGame("Time ran out.");
    }
}

setInterval(updateTimer,1000);

// =====================================================
// RESTART
// =====================================================

restartBtn.onclick = ()=>{
    trust = 50;
    suspicion = 0;
    timeLeft = 120;
    gameOver = false;
    chatLog.innerHTML = "";
    document.body.style.filter="none";
    updateStats();
    renderNode("start");
};

// =====================================================
// INIT
// =====================================================

updateStats();
renderNode("start");