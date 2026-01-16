const seqEl = document.getElementById("sequence");
const optEl = document.getElementById("options");
const statusEl = document.getElementById("status");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const bar = document.getElementById("bar");
const game = document.getElementById("game");

let level = 1;
let streak = 0;
let answer = 0;
let timer;

bestEl.textContent = localStorage.best || 0;

function r(n){ return Math.floor(Math.random()*n); }

function pattern() {
  const type = r(4);
  let seq = [];
  if(type === 0){
    let a = r(5)+1, d = r(level+2)+1;
    for(let i=0;i<4;i++) seq.push(a+i*d);
    answer = a+4*d;
  }
  if(type === 1){
    let a = r(4)+2;
    seq = [a, a*2, a, a*2];
    answer = a;
  }
  if(type === 2){
    let a = r(5)+1;
    seq = [a, a+2, a+6, a+12];
    answer = a+20;
  }
  if(type === 3){
    let a = r(6)+1;
    seq = [a, a+1, a+3, a+6];
    answer = a+10;
  }
  return seq;
}

function startTimer(){
  clearInterval(timer);
  bar.style.transform = "scaleX(1)";
  let t = 100;
  timer = setInterval(()=>{
    t--;
    bar.style.transform = `scaleX(${t/100})`;
    if(t<=0) lose();
  },30);
}

function render(){
  seqEl.innerHTML = "";
  optEl.innerHTML = "";
  statusEl.textContent = "";
  levelEl.textContent = level;
  streakEl.textContent = streak;

  const seq = pattern();

  seq.forEach(n=>{
    const d=document.createElement("div");
    d.className="box";
    d.textContent=n;
    seqEl.appendChild(d);
  });

  const m=document.createElement("div");
  m.className="box missing";
  m.textContent="?";
  seqEl.appendChild(m);

  const set=new Set([answer]);
  while(set.size<4) set.add(answer+r(16)-8);

  [...set].sort(()=>Math.random()-0.5).forEach(v=>{
    const o=document.createElement("div");
    o.className="option";
    o.textContent=v;
    o.onclick=()=>check(v);
    optEl.appendChild(o);
  });

  startTimer();
}

function check(v){
  clearInterval(timer);
  if(v===answer){
    streak++;
    level++;
    statusEl.textContent="PERFECT";
    statusEl.className="status good";
    setTimeout(render,500);
  } else lose();
}

function lose(){
  clearInterval(timer);
  streak=0;
  statusEl.textContent="WRONG";
  statusEl.className="status bad";
  game.classList.add("shake");
  setTimeout(()=>game.classList.remove("shake"),350);
  if(level-1>bestEl.textContent){
    localStorage.best=level-1;
    bestEl.textContent=level-1;
  }
  level=1;
  setTimeout(render,700);
}

document.getElementById("reset").onclick=()=>{
  level=1;
  streak=0;
  render();
};

render();
