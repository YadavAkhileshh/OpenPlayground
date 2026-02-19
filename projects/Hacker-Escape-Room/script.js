// =======================================================
// HACKER ESCAPE ROOM - ADVANCED VERSION
// 350+ LINES CYBER TERMINAL ENGINE
// =======================================================

const output = document.getElementById("output");
const input = document.getElementById("commandInput");
const timerEl = document.getElementById("timer");
const levelEl = document.getElementById("level");
const restartBtn = document.getElementById("restartBtn");

let timeLeft = 300;
let currentLevel = 1;
let gameOver = false;

// =======================================================
// TERMINAL SYSTEM
// =======================================================

class Terminal {
    constructor() {
        this.currentDir = "home";
        this.filesystem = {
            home: ["readme.txt", "vault.enc"],
            secure: ["password.db"],
        };
    }

    print(text) {
        output.innerHTML += text + "\n";
        output.scrollTop = output.scrollHeight;
    }

    clear() {
        output.innerHTML = "";
    }

    ls() {
        const files = this.filesystem[this.currentDir];
        this.print(files.join("   "));
    }

    cd(dir) {
        if (this.filesystem[dir]) {
            this.currentDir = dir;
            this.print("Moved to " + dir);
        } else {
            this.print("Directory not found.");
        }
    }

    cat(file) {
        if (file === "readme.txt") {
            this.print("System breach simulation.");
        } else if (file === "vault.enc") {
            this.print("Encrypted file. Use hack command.");
        } else {
            this.print("File not found.");
        }
    }
}

const terminal = new Terminal();

// =======================================================
// SOUND SYSTEM
// =======================================================

function beep(freq=400,duration=100){
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value=freq;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(()=>osc.stop(),duration);
}

// =======================================================
// GLITCH EFFECT
// =======================================================

function glitch(){
    document.body.classList.add("glitch");
    setTimeout(()=>document.body.classList.remove("glitch"),200);
}

// =======================================================
// LEVEL SYSTEM
// =======================================================

class Level {
    constructor(id) {
        this.id = id;
        this.completed = false;
    }
    start(){}
    handle(cmd){}
}

// ================= LEVEL 1 =================

class PasswordLevel extends Level {
    constructor(){
        super(1);
        this.password="shadow";
        this.await=false;
    }

    start(){
        terminal.print("Encrypted Vault detected.");
        terminal.print("Use 'hack' to begin cracking.");
    }

    handle(cmd){
        if(cmd==="hack"){
            terminal.print("Enter password:");
            this.await=true;
        }
        else if(this.await){
            if(cmd===this.password){
                terminal.print("Access granted.");
                beep(800,200);
                this.completed=true;
            }else{
                terminal.print("Wrong password.");
                glitch();
            }
            this.await=false;
        }
        else{
            terminal.print("Unknown command.");
        }
    }
}

// ================= LEVEL 2 =================

class LogicLevel extends Level {
    constructor(){
        super(2);
        this.answer="42";
    }

    start(){
        terminal.print("Solve this:");
        terminal.print("What is the answer to life, universe & everything?");
    }

    handle(cmd){
        if(cmd===this.answer){
            terminal.print("Correct.");
            this.completed=true;
            beep(900,200);
        }else{
            terminal.print("Incorrect.");
        }
    }
}

// ================= LEVEL 3 =================

class SequenceLevel extends Level{
    constructor(){
        super(3);
        this.sequence=["ping","scan","inject"];
        this.step=0;
    }

    start(){
        terminal.print("Execute correct command sequence.");
    }

    handle(cmd){
        if(cmd===this.sequence[this.step]){
            this.step++;
            terminal.print("Step "+this.step+" correct.");
            if(this.step===this.sequence.length){
                this.completed=true;
                terminal.print("System Rooted.");
            }
        }else{
            terminal.print("Sequence failed.");
            this.step=0;
        }
    }
}

// =======================================================
// GAME CONTROLLER
// =======================================================

let levels=[
    new PasswordLevel(),
    new LogicLevel(),
    new SequenceLevel()
];

let activeLevel=levels[0];
activeLevel.start();

function nextLevel(){
    currentLevel++;
    if(currentLevel>levels.length){
        terminal.print("ESCAPE SUCCESSFUL.");
        gameOver=true;
        return;
    }
    levelEl.textContent=currentLevel;
    activeLevel=levels[currentLevel-1];
    terminal.print("\n--- LEVEL "+currentLevel+" ---");
    activeLevel.start();
}

// =======================================================
// COMMAND PARSER
// =======================================================

function handleCommand(cmd){
    if(cmd==="help"){
        terminal.print("Commands: help, ls, cd, cat, clear, hack");
    }
    else if(cmd==="ls"){
        terminal.ls();
    }
    else if(cmd.startsWith("cd")){
        const dir=cmd.split(" ")[1];
        terminal.cd(dir);
    }
    else if(cmd.startsWith("cat")){
        const file=cmd.split(" ")[1];
        terminal.cat(file);
    }
    else if(cmd==="clear"){
        terminal.clear();
    }
    else{
        activeLevel.handle(cmd);
        if(activeLevel.completed){
            nextLevel();
        }
    }
}

// =======================================================
// INPUT
// =======================================================

input.addEventListener("keydown",e=>{
    if(e.key==="Enter" && !gameOver){
        const cmd=input.value.trim();
        terminal.print("> "+cmd);
        handleCommand(cmd);
        input.value="";
    }
});

// =======================================================
// TIMER
// =======================================================

function updateTimer(){
    if(gameOver) return;
    timeLeft--;
    timerEl.textContent=timeLeft;
    if(timeLeft<=0){
        terminal.print("SYSTEM LOCKDOWN.");
        gameOver=true;
    }
}

setInterval(updateTimer,1000);

// =======================================================
// RESTART
// =======================================================

restartBtn.addEventListener("click",()=>{
    timeLeft=300;
    currentLevel=1;
    gameOver=false;
    levelEl.textContent=1;
    terminal.clear();
    activeLevel=levels[0];
    activeLevel.completed=false;
    activeLevel.start();
});