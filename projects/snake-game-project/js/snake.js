const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreDiv = document.getElementById("score");

const box = 20;
const rows = 25;
const cols = 35;
canvas.width = cols * box;
canvas.height = rows * box;

let snake = [{x:10*box, y:10*box}];
let direction = "RIGHT";
let score = 0;
let food = spawnFood();
let bigFood = null;
let gameInterval;
let sparkles = [];

function spawnFood(){
    return {x: Math.floor(Math.random()*cols)*box, y: Math.floor(Math.random()*rows)*box};
}

setInterval(()=>{
    bigFood = spawnFood();
    setTimeout(()=>bigFood=null,6000);
},30000);

document.addEventListener("keydown", e=>{
    if(e.key==="ArrowUp" && direction!=="DOWN") direction="UP";
    if(e.key==="ArrowDown" && direction!=="UP") direction="DOWN";
    if(e.key==="ArrowLeft" && direction!=="RIGHT") direction="LEFT";
    if(e.key==="ArrowRight" && direction!=="LEFT") direction="RIGHT";
});

function collision(head, body){
    return body.some(part=>part.x===head.x && part.y===head.y);
}

function gameOver(){
    alert("Game Over! Score: "+score);
    location.reload();
}

function createSparkles(x,y){
    for(let i=0;i<10;i++){
        sparkles.push({x:x+box/2, y:y+box/2, dx:(Math.random()-0.5)*4, dy:(Math.random()-0.5)*4, life:20});
    }
}

function drawSparkles(){
    sparkles.forEach((s,i)=>{
        ctx.fillStyle = `rgba(255,255,0,${s.life/20})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI*2);
        ctx.fill();
        s.x += s.dx;
        s.y += s.dy;
        s.life--;
        if(s.life<=0) sparkles.splice(i,1);
    });
}

function drawSnake(){
    snake.forEach((part,i)=>{
        ctx.fillStyle = i===0 ? "#166534" : "#22c55e";
        ctx.fillRect(part.x,part.y,box,box);
        if(i===0){
            ctx.fillStyle="white";
            ctx.beginPath();
            ctx.arc(part.x+5,part.y+5,3,0,Math.PI*2);
            ctx.arc(part.x+15,part.y+5,3,0,Math.PI*2);
            ctx.fill();
        }
    });
}

function drawFood(){
    ctx.fillStyle="#ef4444";
    ctx.fillRect(food.x,food.y,box,box);
    if(bigFood){ ctx.fillStyle="#facc15"; ctx.fillRect(bigFood.x,bigFood.y,box,box);}
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawSnake();
    drawFood();
    drawSparkles();

    let head = {...snake[0]};

    if(direction==="LEFT") head.x -= box;
    if(direction==="RIGHT") head.x += box;
    if(direction==="UP") head.y -= box;
    if(direction==="DOWN") head.y += box;

    // Wall collision sparkle
    if(head.x<0 || head.x>=canvas.width || head.y<0 || head.y>=canvas.height){
        createSparkles(
            head.x<0?0: head.x>=canvas.width?canvas.width-box: head.x,
            head.y<0?0: head.y>=canvas.height?canvas.height-box: head.y
        );
        clearInterval(gameInterval);
        setTimeout(gameOver,300);
    }

    // Self collision
    if(collision(head,snake)) gameOver();

    // Eating food
    if(head.x===food.x && head.y===food.y){ score+=10; food=spawnFood();}
    else if(bigFood && head.x===bigFood.x && head.y===bigFood.y){ score+=50; bigFood=null; snake.push({}, {}, {});}
    else snake.pop();

    snake.unshift(head);
    scoreDiv.innerText="Score: "+score;
}

function startGame(){ gameInterval = setInterval(update,120); }
startGame();
