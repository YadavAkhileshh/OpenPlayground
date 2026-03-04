/* ===========================
   MATRIX BACKGROUND
=========================== */

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = "01";
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for(let x=0;x<columns;x++){
drops[x]=1;
}

function drawMatrix(){
ctx.fillStyle="rgba(0,0,0,0.05)";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#00ff99";
ctx.font=fontSize+"px monospace";

for(let i=0;i<drops.length;i++){
const text = letters.charAt(Math.floor(Math.random()*letters.length));
ctx.fillText(text,i*fontSize,drops[i]*fontSize);

if(drops[i]*fontSize>canvas.height && Math.random()>0.975)
drops[i]=0;

drops[i]++;
}
}

setInterval(drawMatrix,33);

/* ===========================
   ATTACK FEED SIMULATION
=========================== */

const attackFeed = document.getElementById("attackFeed");

const countries = ["USA","China","Russia","Germany","Brazil","India","UK","France"];
const attackTypes = ["DDoS","Phishing","Malware","Ransomware","SQL Injection","Brute Force"];

function generateAttack(){
const country = countries[Math.floor(Math.random()*countries.length)];
const type = attackTypes[Math.floor(Math.random()*attackTypes.length)];
const time = new Date().toLocaleTimeString();

const li = document.createElement("li");
li.textContent = `[${time}] ${type} attack detected from ${country}`;

attackFeed.prepend(li);

if(attackFeed.children.length>20){
attackFeed.removeChild(attackFeed.lastChild);
}
}

setInterval(generateAttack,2000);

/* ===========================
   TERMINAL SIMULATION
=========================== */

const terminalOutput = document.getElementById("terminalOutput");

const commands = [
"Initializing firewall protocols...",
"Scanning network ports...",
"Encrypting data packets...",
"Monitoring suspicious activity...",
"Deploying countermeasures...",
"System integrity check complete.",
"Blocking unauthorized access attempt."
];

function generateTerminalLine(){
const cmd = commands[Math.floor(Math.random()*commands.length)];
terminalOutput.innerHTML += cmd + "\n";

terminalOutput.scrollTop = terminalOutput.scrollHeight;

if(terminalOutput.innerHTML.split("\n").length>30){
terminalOutput.innerHTML="";
}
}

setInterval(generateTerminalLine,1500);

/* ===========================
   THREAT LEVEL CHART
=========================== */

const threatCanvas = document.getElementById("threatChart");
const threatCtx = threatCanvas.getContext("2d");

let threatData = [];

function updateThreatChart(){

if(threatData.length>20){
threatData.shift();
}

threatData.push(Math.floor(Math.random()*100));

threatCtx.clearRect(0,0,threatCanvas.width,threatCanvas.height);

threatCtx.strokeStyle="#00ff99";
threatCtx.beginPath();

threatData.forEach((value,index)=>{
const x = index*(threatCanvas.width/20);
const y = threatCanvas.height - value*2;

if(index===0) threatCtx.moveTo(x,y);
else threatCtx.lineTo(x,y);
});

threatCtx.stroke();
}

setInterval(updateThreatChart,2000);
