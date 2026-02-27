const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.9;
canvas.height = 500;

let gravity = 0.3;
let elasticity = 0.9;
let friction = 0.999;

let balls = [];
let particles = [];
let paused = false;
let slowMotion = false;

const gravitySlider = document.getElementById("gravity");
const elasticitySlider = document.getElementById("elasticity");
const frictionSlider = document.getElementById("friction");
const pauseBtn = document.getElementById("pauseBtn");
const clearBtn = document.getElementById("clearBtn");
const burstBtn = document.getElementById("burstBtn");
const slowBtn = document.getElementById("slowBtn");

const ballCount = document.getElementById("ballCount");
const fpsDisplay = document.getElementById("fps");

gravitySlider.oninput = () => gravity = parseFloat(gravitySlider.value);
elasticitySlider.oninput = () => elasticity = parseFloat(elasticitySlider.value);
frictionSlider.oninput = () => friction = parseFloat(frictionSlider.value);

pauseBtn.onclick = () => paused = !paused;
clearBtn.onclick = () => balls = [];
slowBtn.onclick = () => slowMotion = !slowMotion;

burstBtn.onclick = () => {
  for (let i = 0; i < 10; i++) {
    balls.push(new Ball(canvas.width / 2, canvas.height / 2));
  }
};

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15 + Math.random() * 15;
    this.color = `hsl(${Math.random()*360},70%,60%)`;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.mass = this.radius;
    this.trail = [];
  }

  update() {
    this.vy += gravity;

    this.vx *= friction;
    this.vy *= friction;

    this.x += this.vx;
    this.y += this.vy;

    this.wallCollision();
    this.draw();
    this.drawTrail();
  }

  wallCollision() {
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx *= -elasticity;
      spawnParticles(this.x, this.y);
    }

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -elasticity;
      spawnParticles(this.x, this.y);
    }

    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy *= -elasticity;
      spawnParticles(this.x, this.y);
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -elasticity;
      spawnParticles(this.x, this.y);
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  drawTrail() {
    this.trail.push({x: this.x, y: this.y});
    if (this.trail.length > 10) this.trail.shift();

    for (let t of this.trail) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * 0.3, 0, Math.PI*2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.1;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

function spawnParticles(x,y){
  for(let i=0;i<5;i++){
    particles.push({
      x,y,
      vx:(Math.random()-0.5)*4,
      vy:(Math.random()-0.5)*4,
      life:30
    });
  }
}

function updateParticles(){
  particles.forEach((p,i)=>{
    p.x+=p.vx;
    p.y+=p.vy;
    p.life--;
    ctx.fillStyle="white";
    ctx.fillRect(p.x,p.y,2,2);
    if(p.life<=0) particles.splice(i,1);
  });
}

function resolveCollision(b1,b2){
  const dx=b2.x-b1.x;
  const dy=b2.y-b1.y;
  const distance=Math.sqrt(dx*dx+dy*dy);

  if(distance<b1.radius+b2.radius){
    const angle=Math.atan2(dy,dx);
    const sin=Math.sin(angle);
    const cos=Math.cos(angle);

    const v1=rotate(b1.vx,b1.vy,sin,cos,true);
    const v2=rotate(b2.vx,b2.vy,sin,cos,true);

    const vxTotal=v1.x-v2.x;
    v1.x=((b1.mass-b2.mass)*v1.x+2*b2.mass*v2.x)/(b1.mass+b2.mass);
    v2.x=vxTotal+v1.x;

    const f1=rotate(v1.x,v1.y,sin,cos,false);
    const f2=rotate(v2.x,v2.y,sin,cos,false);

    b1.vx=f1.x;
    b1.vy=f1.y;
    b2.vx=f2.x;
    b2.vy=f2.y;
  }
}

function rotate(vx,vy,sin,cos,reverse){
  return {
    x: reverse?(vx*cos+vy*sin):(vx*cos-vy*sin),
    y: reverse?(vy*cos-vx*sin):(vy*cos+vx*sin)
  };
}

canvas.addEventListener("mousedown",(e)=>{
  const rect=canvas.getBoundingClientRect();
  const x=e.clientX-rect.left;
  const y=e.clientY-rect.top;
  balls.push(new Ball(x,y));
});

let lastTime=0;

function animate(time){
  requestAnimationFrame(animate);

  if(paused) return;

  const delta=time-lastTime;
  lastTime=time;
  const fps=Math.round(1000/delta);
  fpsDisplay.textContent=fps;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(slowMotion) ctx.scale(0.5,0.5);

  for(let i=0;i<balls.length;i++){
    balls[i].update();
    for(let j=i+1;j<balls.length;j++){
      resolveCollision(balls[i],balls[j]);
    }
  }

  updateParticles();
  ballCount.textContent=balls.length;
}

animate();