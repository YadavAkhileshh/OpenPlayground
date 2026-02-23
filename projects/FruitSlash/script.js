
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const timeEl = document.getElementById("time");
const endBox = document.getElementById("end");
const highEl = document.getElementById("high");

let fruits=[], trails=[];
let score=0, level=1, time=60;
let last={x:0,y:0};
let running=true;

const emojis=["🍎","🍉","🍌","🍓","🍍"];
const highScore = Number(localStorage.getItem("fruitHigh")||0);

class Fruit{
  constructor(){
    this.x=Math.random()*canvas.width;
    this.y=canvas.height+40;
    this.vx=(Math.random()-0.5)*2;
    this.vy=-(6+level);
    this.g=0.18;
    this.r=22;
    this.emoji=Math.random()<0.15?"💣":emojis[Math.floor(Math.random()*emojis.length)];
  }
  update(){
    this.x+=this.vx;
    this.y+=this.vy;
    this.vy+=this.g;
  }
  draw(){
    ctx.font="32px serif";
    ctx.fillText(this.emoji,this.x-16,this.y+16);
  }
}

function playSound(type){
  const a=new AudioContext();
  const o=a.createOscillator();
  o.frequency.value=type==="bomb"?120:650;
  o.connect(a.destination);
  o.start();
  o.stop(a.currentTime+0.08);
}

function spawn(){
  if(running) fruits.push(new Fruit());
}

function slash(x,y){
  if(!running) return;
  trails.push({x,y,life:10});
  fruits.forEach((f,i)=>{
    if(Math.hypot(x-f.x,y-f.y)<f.r){
      if(f.emoji==="💣"){
        playSound("bomb");
        endGame();
      }else{
        score++;
        playSound("slice");
        scoreEl.textContent=score;
      }
      fruits.splice(i,1);
    }
  });
}

function drawTrails(){
  trails.forEach((t,i)=>{
    ctx.strokeStyle=`rgba(255,255,255,${t.life/10})`;
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(last.x,last.y);
    ctx.lineTo(t.x,t.y);
    ctx.stroke();
    t.life--;
    if(t.life<=0) trails.splice(i,1);
  });
}

canvas.addEventListener("mousemove",e=>{
  const r=canvas.getBoundingClientRect();
  slash(e.clientX-r.left,e.clientY-r.top);
  last={x:e.clientX-r.left,y:e.clientY-r.top};
});

canvas.addEventListener("touchmove",e=>{
  e.preventDefault();
  const t=e.touches[0];
  const r=canvas.getBoundingClientRect();
  slash(t.clientX-r.left,t.clientY-r.top);
  last={x:t.clientX-r.left,y:t.clientY-r.top};
});

function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  fruits.forEach((f,i)=>{
    f.update(); f.draw();
    if(f.y>canvas.height+60) fruits.splice(i,1);
  });
  drawTrails();
  requestAnimationFrame(loop);
}

function endGame(){
  running=false;
  endBox.style.display="block";
  canvas.style.filter="blur(5px)";
  const best=Math.max(score,highScore);
  localStorage.setItem("fruitHigh",best);
  highEl.textContent=best;
}

setInterval(()=>{
  if(!running) return;
  time--;
  timeEl.textContent=time;
  if(time%15===0){
    level++;
    levelEl.textContent=level;
  }
  if(time<=0) endGame();
},1000);

setInterval(spawn,900);
loop();
