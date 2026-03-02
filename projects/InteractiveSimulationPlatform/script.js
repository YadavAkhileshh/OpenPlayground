const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let running = false;
let gravity = 0.5;
let speedFactor = 1;

const particles = [];

function randomColor(){
  return `hsl(${Math.random()*360},70%,55%)`;
}

function createParticles(){
  particles.length = 0;
  for(let i=0;i<20;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*200,
      vx: (Math.random()*4-2),
      vy: Math.random()*2,
      r: 10 + Math.random()*10,
      color: randomColor()
    });
  }
}

function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p=>{

    p.vy += gravity * speedFactor;
    p.x += p.vx * speedFactor;
    p.y += p.vy * speedFactor;

    /* bounce walls */
    if(p.x - p.r < 0 || p.x + p.r > canvas.width){
      p.vx *= -1;
    }

    /* floor bounce */
    if(p.y + p.r > canvas.height){
      p.y = canvas.height - p.r;
      p.vy *= -0.8;
    }

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  });

  if(running) requestAnimationFrame(update);
}

/* Controls */
document.getElementById("startBtn")
  .addEventListener("click",()=>{
    if(!running){
      running=true;
      update();
    }
  });

document.getElementById("pauseBtn")
  .addEventListener("click",()=>{
    running=false;
  });

document.getElementById("resetBtn")
  .addEventListener("click",()=>{
    running=false;
    createParticles();
    ctx.clearRect(0,0,canvas.width,canvas.height);
  });

document.getElementById("gravity")
  .addEventListener("input",e=>{
    gravity = Number(e.target.value);
  });

document.getElementById("speed")
  .addEventListener("input",e=>{
    speedFactor = Number(e.target.value);
  });

createParticles();
update();