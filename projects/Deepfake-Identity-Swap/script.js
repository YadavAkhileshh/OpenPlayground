// ==========================================================
// DEEPFAKE IDENTITY SWAP
// ==========================================================

const trustEl = document.getElementById("trust");
const suspicionEl = document.getElementById("suspicion");
const timerEl = document.getElementById("timer");
const chatLog = document.getElementById("chatLog");
const choicesDiv = document.getElementById("choices");
const restartBtn = document.getElementById("restartBtn");

let trust = 50;
let suspicion = 0;
let timeLeft = 180;
let gameOver = false;
let stage = 0;

// ==========================================================
// TARGET PROFILE
// ==========================================================

const targetProfile = {
    name:"Alex",
    personality:["Sarcastic","Tech-savvy","Introverted"],
    habits:["Hates meetings","Loves open-source","Sleeps late"],
    insideJokes:["The pizza incident","Server meltdown 2022"]
};

// ==========================================================
// CHAT EVENTS
// ==========================================================

const scenarios = [
{
    message:"Alex, are you joining the meeting today?",
    correct:"Hates meetings",
    options:[
        "Yeah sure, love meetings!",
        "Do I have to? Meetings drain me.",
        "Meetings are the best part of my day."
    ]
},
{
    message:"Hey Alex, still coding that open-source project?",
    correct:"Loves open-source",
    options:[
        "Yeah, it's my passion project.",
        "Nah, I hate open-source stuff.",
        "Open-source is pointless."
    ]
},
{
    message:"Remember the pizza incident?",
    correct:"The pizza incident",
    options:[
        "We don't talk about that...",
        "What pizza incident?",
        "That was hilarious."
    ]
}
];

// ==========================================================
// SOUND
// ==========================================================

function beep(freq=600,duration=80){
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value=freq;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(()=>osc.stop(),duration);
}

// ==========================================================
// MESSAGE SYSTEM
// ==========================================================

function addMessage(text, type){
    const div = document.createElement("div");
    div.classList.add("message", type);
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// ==========================================================
// GAME FLOW
// ==========================================================

function startScenario(){
    if(stage >= scenarios.length){
        endGame();
        return;
    }

    const scenario = scenarios[stage];
    addMessage("Group: " + scenario.message, "member");
    renderOptions(scenario);
}

function renderOptions(scenario){
    choicesDiv.innerHTML = "";

    scenario.options.forEach(option=>{
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.onclick = ()=>selectOption(option, scenario.correct);
        choicesDiv.appendChild(btn);
    });
}

function selectOption(option, correct){
    if(gameOver) return;

    addMessage("You: " + option, "player");

    if(option.includes(correct) || option === "We don't talk about that..." && correct==="The pizza incident"){
        trust += 15;
        beep(900,100);
    } else {
        suspicion += 20;
        beep(200,100);
    }

    updateStats();

    if(suspicion >= 100){
        endGame("You were exposed as an impostor.");
        return;
    }

    stage++;
    setTimeout(startScenario,800);
}

// ==========================================================
// UPDATE STATS
// ==========================================================

function updateStats(){
    trustEl.textContent = trust;
    suspicionEl.textContent = suspicion;
}

// ==========================================================
// TIMER
// ==========================================================

function updateTimer(){
    if(gameOver) return;

    timeLeft--;
    timerEl.textContent = timeLeft;

    if(timeLeft <= 0){
        endGame("Time ran out. Suspicion grew too high.");
    }
}

setInterval(updateTimer,1000);

// ==========================================================
// END GAME
// ==========================================================

function endGame(message){
    gameOver = true;
    choicesDiv.innerHTML = "";
    addMessage(message, "member");
}

// ==========================================================
// RESTART
// ==========================================================

restartBtn.onclick = ()=>{
    trust = 50;
    suspicion = 0;
    timeLeft = 180;
    gameOver = false;
    stage = 0;
    chatLog.innerHTML = "";
    updateStats();
    startScenario();
};

// ==========================================================
// INIT
// ==========================================================

updateStats();
startScenario();