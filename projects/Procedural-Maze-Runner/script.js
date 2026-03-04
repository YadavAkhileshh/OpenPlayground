// ======================================================
// POLISHED PROCEDURAL MAZE RUNNER
// ======================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE = 32;
const COLS = Math.floor(canvas.width / TILE);
const ROWS = Math.floor(canvas.height / TILE);

const timerEl = document.getElementById("timer");
const powerEl = document.getElementById("powerCount");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let grid = [];
let player, enemy;
let powerUps = [];
let keys = {};
let timeLeft = 60;
let gameOver = false;
let lastTime = 0;

// ======================================================
// CELL CLASS
// ======================================================

class Cell{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.walls=[true,true,true,true];
        this.visited=false;
    }

    draw(){
        const x=this.x*TILE;
        const y=this.y*TILE;

        ctx.strokeStyle="#00f5ff";
        ctx.shadowColor="#00f5ff";
        ctx.shadowBlur=5;
        ctx.lineWidth=2;

        if(this.walls[0]) line(x,y,x+TILE,y);
        if(this.walls[1]) line(x+TILE,y,x+TILE,y+TILE);
        if(this.walls[2]) line(x+TILE,y+TILE,x,y+TILE);
        if(this.walls[3]) line(x,y+TILE,x,y);

        ctx.shadowBlur=0;
    }
}

function line(x1,y1,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

// ======================================================
// MAZE GENERATION (DFS)
// ======================================================

function index(x,y){
    if(x<0||y<0||x>=COLS||y>=ROWS) return -1;
    return x+y*COLS;
}

function generateMaze(){
    grid=[];
    for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
            grid.push(new Cell(x,y));
        }
    }

    let stack=[];
    let current=grid[0];
    current.visited=true;

    while(true){
        let neighbors=[];
        const dirs=[[0,-1],[1,0],[0,1],[-1,0]];

        dirs.forEach((d,i)=>{
            const nx=current.x+d[0];
            const ny=current.y+d[1];
            const n=grid[index(nx,ny)];
            if(n && !n.visited){
                neighbors.push({cell:n,dir:i});
            }
        });

        if(neighbors.length>0){
            const next=neighbors[Math.floor(Math.random()*neighbors.length)];
            stack.push(current);

            current.walls[next.dir]=false;
            next.cell.walls[(next.dir+2)%4]=false;

            next.cell.visited=true;
            current=next.cell;
        }else if(stack.length>0){
            current=stack.pop();
        }else break;
    }
}

// ======================================================
// PLAYER (Smooth Movement)
// ======================================================

class Player{
    constructor(){
        this.gridX=0;
        this.gridY=0;
        this.x=0;
        this.y=0;
        this.speed=6;
        this.powerCount=0;
    }

    update(delta){
        let moved=false;

        if(keys["ArrowUp"]) moved=this.tryMove(0,-1);
        if(keys["ArrowDown"]) moved=this.tryMove(0,1);
        if(keys["ArrowLeft"]) moved=this.tryMove(-1,0);
        if(keys["ArrowRight"]) moved=this.tryMove(1,0);

        // smooth interpolation
        this.x += (this.gridX*TILE - this.x)*0.2;
        this.y += (this.gridY*TILE - this.y)*0.2;
    }

    tryMove(dx,dy){
        const cell=grid[index(this.gridX,this.gridY)];
        if(!cell) return false;

        if(dx===1 && !cell.walls[1]) this.gridX++;
        if(dx===-1 && !cell.walls[3]) this.gridX--;
        if(dy===1 && !cell.walls[2]) this.gridY++;
        if(dy===-1 && !cell.walls[0]) this.gridY--;
        return true;
    }

    draw(){
        ctx.save();
        ctx.shadowColor="#00ffff";
        ctx.shadowBlur=20;

        let g=ctx.createRadialGradient(
            this.x+TILE/2,
            this.y+TILE/2,
            5,
            this.x+TILE/2,
            this.y+TILE/2,
            TILE/2
        );

        g.addColorStop(0,"#ffffff");
        g.addColorStop(1,"#00ffff");

        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.arc(this.x+TILE/2,this.y+TILE/2,TILE/3,0,Math.PI*2);
        ctx.fill();

        ctx.restore();
    }
}

// ======================================================
// ENEMY (A*)
// ======================================================

class Enemy{
    constructor(){
        this.gridX=COLS-1;
        this.gridY=ROWS-1;
        this.path=[];
        this.timer=0;
        this.x=this.gridX*TILE;
        this.y=this.gridY*TILE;
    }

    update(delta){
        this.timer+=delta;
        if(this.timer>600){
            this.path=findPath(this.gridX,this.gridY,player.gridX,player.gridY);
            this.timer=0;
        }

        if(this.path.length>1){
            const next=this.path[1];
            this.gridX=next.x;
            this.gridY=next.y;
        }

        this.x+=(this.gridX*TILE-this.x)*0.2;
        this.y+=(this.gridY*TILE-this.y)*0.2;
    }

    draw(){
        ctx.save();
        ctx.shadowColor="#ff006e";
        ctx.shadowBlur=20;
        ctx.fillStyle="#ff006e";
        ctx.beginPath();
        ctx.arc(this.x+TILE/2,this.y+TILE/2,TILE/3,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

// ======================================================
// A* PATHFINDING
// ======================================================

function findPath(sx,sy,ex,ey){
    let open=[{x:sx,y:sy,g:0,f:0,parent:null}];
    let closed=[];

    while(open.length){
        open.sort((a,b)=>a.f-b.f);
        let current=open.shift();
        closed.push(current);

        if(current.x===ex && current.y===ey){
            let path=[];
            while(current){
                path.push(current);
                current=current.parent;
            }
            return path.reverse();
        }

        let neighbors=getNeighbors(current.x,current.y);
        neighbors.forEach(n=>{
            if(closed.find(c=>c.x===n.x && c.y===n.y)) return;
            let g=current.g+1;
            let h=Math.abs(n.x-ex)+Math.abs(n.y-ey);
            let f=g+h;

            if(!open.find(o=>o.x===n.x && o.y===n.y)){
                open.push({x:n.x,y:n.y,g,f,parent:current});
            }
        });
    }
    return [];
}

function getNeighbors(x,y){
    const cell=grid[index(x,y)];
    let n=[];
    if(!cell.walls[0]) n.push({x,y:y-1});
    if(!cell.walls[1]) n.push({x:x+1,y});
    if(!cell.walls[2]) n.push({x,y:y+1});
    if(!cell.walls[3]) n.push({x:x-1,y});
    return n;
}

// ======================================================
// POWERUPS
// ======================================================

class PowerUp{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.collected=false;
    }

    draw(){
        if(this.collected) return;
        ctx.fillStyle="#ffff00";
        ctx.shadowColor="#ffff00";
        ctx.shadowBlur=15;
        ctx.beginPath();
        ctx.arc(this.x*TILE+TILE/2,this.y*TILE+TILE/2,TILE/4,0,Math.PI*2);
        ctx.fill();
        ctx.shadowBlur=0;
    }
}

// ======================================================
// FOG
// ======================================================

function drawFog(){
    ctx.fillStyle="rgba(0,0,0,0.65)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.globalCompositeOperation="destination-out";
    ctx.beginPath();
    ctx.arc(
        player.x+TILE/2,
        player.y+TILE/2,
        TILE*4,
        0,
        Math.PI*2
    );
    ctx.fill();
    ctx.globalCompositeOperation="source-over";
}

// ======================================================
// INIT & LOOP
// ======================================================

function init(){
    generateMaze();
    player=new Player();
    enemy=new Enemy();
    powerUps=[];
    timeLeft=60;
    gameOver=false;

    for(let i=0;i<8;i++){
        powerUps.push(new PowerUp(
            Math.floor(Math.random()*COLS),
            Math.floor(Math.random()*ROWS)
        ));
    }
}

window.addEventListener("keydown",e=>keys[e.key]=true);
window.addEventListener("keyup",e=>keys[e.key]=false);
restartBtn.addEventListener("click",init);

init();

function gameLoop(timestamp){
    if(gameOver) return;

    const delta=timestamp-lastTime;
    lastTime=timestamp;

    // background gradient
    let bg=ctx.createLinearGradient(0,0,0,canvas.height);
    bg.addColorStop(0,"#0a0f1f");
    bg.addColorStop(1,"#000");
    ctx.fillStyle=bg;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    grid.forEach(c=>c.draw());

    player.update(delta);
    player.draw();

    enemy.update(delta);
    enemy.draw();

    powerUps.forEach(p=>{
        p.draw();
        if(!p.collected && p.x===player.gridX && p.y===player.gridY){
            p.collected=true;
            player.powerCount++;
        }
    });

    drawFog();

    timeLeft-=delta/1000;
    timerEl.textContent=Math.max(0,Math.floor(timeLeft));
    powerEl.textContent=player.powerCount;

    if(timeLeft<=0){
        statusEl.textContent="Time Up!";
        gameOver=true;
    }

    if(enemy.gridX===player.gridX && enemy.gridY===player.gridY){
        statusEl.textContent="Caught!";
        gameOver=true;
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);