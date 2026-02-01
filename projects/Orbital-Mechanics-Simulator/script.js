const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const energyEl = document.getElementById("energy");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");

const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// ================= STATE =================
let score = 0;

// ================= SHIP =================
let ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  angle: 0,
  energy: 100
};

// ================= STARS =================
const stars = Array.from({ length: 160 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 2 + 0.5,
  speed: Math.random() * 0.8 + 0.3
}));

// ================= ORBS =================
const orbs = Array.from({ length: 10 }, () => spawnOrb());

function spawnOrb() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 6
  };
}

// ================= PARTICLES =================
const particles = [];

function spawnTrail(x,y){
  particles.push({
    x,y,
    vx:(Math.random()-0.5)*1,
    vy:(Math.random()-0.5)*1,
    life:30
  });
}

// ================= RESET =================
function reset(){
  ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    angle: 0,
    energy: 100
  };
  score = 0;
}
document.addEventListener("keydown",e=>{
  if(e.code==="KeyR") reset();
});

// ================= UPDATE =================
function update(){
  // Drift
  if(keys["ArrowLeft"]||keys["KeyA"]) ship.angle -= 0.05;
  if(keys["ArrowRight"]||keys["KeyD"]) ship.angle += 0.05;

  // Boost
  if((keys["ArrowUp"]||keys["KeyW"]) && ship.energy>0){
    ship.vx += Math.cos(ship.angle)*0.12;
    ship.vy += Math.sin(ship.angle)*0.12;
    ship.energy -= 0.15;
  }

  // Dash
  if(keys["Space"] && ship.energy>10){
    ship.vx += Math.cos(ship.angle)*1.2;
    ship.vy += Math.sin(ship.angle)*1.2;
    ship.energy -= 5;
  }

  // Movement
  ship.x += ship.vx;
  ship.y += ship.vy;

  // Friction
  ship.vx *= 0.99;
  ship.vy *= 0.99;

  // Wrap
  if(ship.x<0) ship.x=canvas.width;
  if(ship.x>canvas.width) ship.x=0;
  if(ship.y<0) ship.y=canvas.height;
  if(ship.y>canvas.height) ship.y=0;

  spawnTrail(ship.x,ship.y);

  // Orbs
  orbs.forEach(o=>{
    if(Math.hypot(ship.x-o.x,ship.y-o.y)<12){
      score+=10;
      ship.energy=Math.min(100,ship.energy+10);
      o.x=Math.random()*canvas.width;
      o.y=Math.random()*canvas.height;
    }
  });

  // HUD
  energyEl.textContent = `${ship.energy.toFixed(0)}%`;
  scoreEl.textContent = score;
  speedEl.textContent = Math.hypot(ship.vx,ship.vy).toFixed(2);
}

// ================= DRAW =================
function drawStars(){
  ctx.fillStyle="#9ca3af";
  stars.forEach(s=>{
    ctx.fillRect(s.x,s.y,s.size,s.size);
    s.y+=s.speed;
    if(s.y>canvas.height){
      s.y=0;
      s.x=Math.random()*canvas.width;
    }
  });
}

function drawShip(){
  ctx.save();
  ctx.translate(ship.x,ship.y);
  ctx.rotate(ship.angle);
  ctx.strokeStyle="#38bdf8";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(14,0);
  ctx.lineTo(-10,-8);
  ctx.lineTo(-6,0);
  ctx.lineTo(-10,8);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawOrbs(){
  orbs.forEach(o=>{
    ctx.fillStyle="#22d3ee";
    ctx.beginPath();
    ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
    ctx.fill();
  });
}

function drawParticles(){
  particles.forEach(p=>{
    ctx.globalAlpha=p.life/30;
    ctx.fillStyle="#38bdf8";
    ctx.fillRect(p.x,p.y,2,2);
    ctx.globalAlpha=1;
    p.x+=p.vx;
    p.y+=p.vy;
    p.life--;
  });
  for(let i=particles.length-1;i>=0;i--){
    if(particles[i].life<=0) particles.splice(i,1);
  }
}

// ================= LOOP =================
function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawStars();
  update();
  drawParticles();
  drawOrbs();
  drawShip();

  requestAnimationFrame(loop);
}

loop();
