// ==========================================================
// PSYCHOLOGICAL PROFILING SIMULATOR
// ==========================================================

const confidenceEl = document.getElementById("confidence");
const accuracyEl = document.getElementById("accuracy");
const timerEl = document.getElementById("timer");
const chatLog = document.getElementById("chatLog");
const profileChoices = document.getElementById("profileChoices");
const restartBtn = document.getElementById("restartBtn");

let confidence = 50;
let accuracy = 0;
let timeLeft = 180;
let gameOver = false;
let currentStage = 0;

// ==========================================================
// SOUND SYSTEM
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

function addMessage(text){
    const div = document.createElement("div");
    div.classList.add("message","npc");
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// ==========================================================
// SUBJECT DATA
// ==========================================================

const subject = {
    traits:["Defensive","Control-Oriented","Impulsive"],
    logs:[
        "I don't like when people question my authority.",
        "I had to act fast. There wasn't time to think.",
        "If something goes wrong, it's usually not my fault.",
        "I prefer to handle things my way.",
        "People misunderstand my intentions."
    ]
};

// ==========================================================
// PROFILE OPTIONS
// ==========================================================

const traitOptions = [
    "Logical",
    "Empathetic",
    "Impulsive",
    "Defensive",
    "Control-Oriented",
    "Introverted"
];

// ==========================================================
// GAME FLOW
// ==========================================================

function startStage(){
    if(currentStage >= subject.logs.length){
        endGame();
        return;
    }

    addMessage(subject.logs[currentStage]);
    renderChoices();
}

function renderChoices(){
    profileChoices.innerHTML = "";

    traitOptions.forEach(trait=>{
        const btn = document.createElement("button");
        btn.textContent = trait;
        btn.onclick = ()=>selectTrait(trait);
        profileChoices.appendChild(btn);
    });
}

function selectTrait(trait){
    if(gameOver) return;

    if(subject.traits.includes(trait)){
        accuracy += 10;
        confidence += 5;
        beep(900,100);
    } else {
        confidence -= 10;
        beep(200,100);
    }

    updateStats();
    currentStage++;
    setTimeout(startStage,600);
}

// ==========================================================
// UPDATE STATS
// ==========================================================

function updateStats(){
    confidenceEl.textContent = confidence;
    accuracyEl.textContent = accuracy;

    if(confidence <= 0){
        gameOver = true;
        addMessage("You misjudged the subject. Profiling failed.");
        profileChoices.innerHTML = "";
    }
}

// ==========================================================
// TIMER
// ==========================================================

function updateTimer(){
    if(gameOver) return;

    timeLeft--;
    timerEl.textContent = timeLeft;

    if(timeLeft <= 0){
        gameOver = true;
        addMessage("Session ended. Time expired.");
        profileChoices.innerHTML = "";
    }
}

setInterval(updateTimer,1000);

// ==========================================================
// END GAME
// ==========================================================

function endGame(){
    gameOver = true;
    profileChoices.innerHTML = "";

    if(accuracy >= 20){
        addMessage("Profile Complete. High Psychological Accuracy.");
    } else {
        addMessage("Profile Incomplete. Insufficient data interpretation.");
    }
}

// ==========================================================
// RESTART
// ==========================================================

restartBtn.onclick = ()=>{
    confidence = 50;
    accuracy = 0;
    timeLeft = 180;
    gameOver = false;
    currentStage = 0;
    chatLog.innerHTML = "";
    updateStats();
    startStage();
};

// ==========================================================
// INIT
// ==========================================================

updateStats();
startStage();