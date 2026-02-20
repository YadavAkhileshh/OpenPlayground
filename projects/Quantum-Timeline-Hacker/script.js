// ======================================================
// QUANTUM TIMELINE HACKER
// ======================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const timelineEl = document.getElementById("timeline");
const energyEl = document.getElementById("energy");
const statusEl = document.getElementById("status");

let keys = {};
let lastTime = 0;

let timeline = 0; // 0=A, 1=B, 2=C
let energy = 100;
let gameOver = false;

// ======================================================
// PLAYER
// ======================================================

class Player {
    constructor(){
        this.x = 100;
        this.y = 100;
        this.size = 20;
        this.speed = 4;
    }

    update(){
        if(keys["ArrowUp"]) this.y -= this.speed;
        if(keys["ArrowDown"]) this.y += this.speed;
        if(keys["ArrowLeft"]) this.x -= this.speed;
        if(keys["ArrowRight"]) this.x += this.speed;
    }

    draw(){
        ctx.fillStyle="#00ffff";
        ctx.shadowColor="#00ffff";
        ctx.shadowBlur=15;
        ctx.fillRect(this.x,this.y,this.size,this.size);
        ctx.shadowBlur=0;
    }
}

const player = new Player();

// ======================================================
// OBJECT CLASS
// ======================================================

class WorldObject {
    constructor(x,y,size,timelines,type){
        this.x=x;
        this.y=y;
        this.size=size;
        this.timelines=timelines;
        this.type=type;
        this.active=true;
    }

    exists(){
        return this.timelines.includes(timeline);
    }

    draw(){
        if(!this.exists() || !this.active) return;

        if(this.type==="wall") ctx.fillStyle="#444";
        if(this.type==="terminal") ctx.fillStyle="#00ff88";
        if(this.type==="door") ctx.fillStyle="#ff0066";

        ctx.fillRect(this.x,this.y,this.size,this.size);
    }

    interact(){
        if(this.type==="terminal"){
            energy+=10;
            statusEl.textContent="Energy Boosted";
        }
        if(this.type==="door"){
            if(energy>=120){
                statusEl.textContent="CORE BREACHED";
                gameOver=true;
            } else {
                statusEl.textContent="Need More Energy";
            }
        }
    }
}

// ======================================================
// ENEMY AI
// ======================================================

class Drone {
    constructor(){
        this.x=400;
        this.y=300;
        this.size=20;
        this.speed=2;
    }

    update(){
        let dx=player.x-this.x;
        let dy=player.y-this.y;
        let dist=Math.hypot(dx,dy);

        if(dist<300){
            this.x+=dx/dist*this.speed;
            this.y+=dy/dist*this.speed;
        }

        if(dist<20){
            statusEl.textContent="Detected!";
            gameOver=true;
        }
    }

    draw(){
        ctx.fillStyle="#ff0000";
        ctx.shadowColor="#ff0000";
        ctx.shadowBlur=15;
        ctx.fillRect(this.x,this.y,this.size,this.size);
        ctx.shadowBlur=0;
    }
}

const drone = new Drone();

// ======================================================
// WORLD SETUP
// ======================================================

let objects=[
    new WorldObject(200,100,40,[0,1],"wall"),
    new WorldObject(200,140,40,[1],"wall"),
    new WorldObject(300,200,30,[2],"terminal"),
    new WorldObject(600,400,40,[0,2],"door")
];

// ======================================================
// TIMELINE SWITCH
// ======================================================

function switchTimeline(){
    if(energy<=0) return;

    timeline=(timeline+1)%3;
    energy-=5;

    timelineEl.textContent=["A","B","C"][timeline];
    glitchEffect();
}

function glitchEffect(){
    canvas.style.filter="invert(1)";
    setTimeout(()=>canvas.style.filter="none",150);
}

// ======================================================
// COLLISION
// ======================================================

function checkCollision(obj){
    return (
        player.x < obj.x+obj.size &&
        player.x+player.size > obj.x &&
        player.y < obj.y+obj.size &&
        player.y+player.size > obj.y
    );
}

// ======================================================
// GAME LOOP
// ======================================================

function gameLoop(timestamp){
    if(gameOver) return;

    const delta=timestamp-lastTime;
    lastTime=timestamp;

    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    player.update();
    player.draw();

    drone.update();
    drone.draw();

    objects.forEach(obj=>{
        obj.draw();
        if(obj.exists() && checkCollision(obj)){
            if(obj.type==="wall"){
                player.x-=keys["ArrowLeft"]?player.speed:0;
                player.x+=keys["ArrowRight"]?player.speed:0;
                player.y-=keys["ArrowUp"]?player.speed:0;
                player.y+=keys["ArrowDown"]?player.speed:0;
            }
            if(obj.type==="terminal"||obj.type==="door"){
                obj.interact();
            }
        }
    });

    energyEl.textContent=energy;

    requestAnimationFrame(gameLoop);
}

// ======================================================
// INPUT
// ======================================================

window.addEventListener("keydown",e=>{
    keys[e.key]=true;
    if(e.key==="t"||e.key==="T") switchTimeline();
});

window.addEventListener("keyup",e=>keys[e.key]=false);

// ======================================================

requestAnimationFrame(gameLoop);