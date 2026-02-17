const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const gameOverDiv = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

let player, enemies, score, speed, gameRunning;

function init(){
    player = {x:180,y:450,width:40,height:40};
    enemies = [];
    score = 0;
    speed = 2;
    gameRunning = true;
    scoreEl.textContent = score;
    gameOverDiv.classList.add("hidden");
}

function spawnEnemy(){
    const x = Math.random()*360;
    enemies.push({x:x,y:-40,width:40,height:40});
}

function update(){
    if(!gameRunning) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw player
    ctx.fillStyle = "#0ff";
    ctx.fillRect(player.x,player.y,player.width,player.height);

    // Move enemies
    ctx.fillStyle = "#ff00ff";
    enemies.forEach((enemy,index)=>{
        enemy.y += speed;
        ctx.fillRect(enemy.x,enemy.y,enemy.width,enemy.height);

        // Collision
        if(
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ){
            gameOver();
        }

        // Remove if off screen
        if(enemy.y > canvas.height){
            enemies.splice(index,1);
            score++;
            scoreEl.textContent = score;

            if(score % 5 === 0){
                speed += 0.5;
            }
        }
    });

    requestAnimationFrame(update);
}

function gameOver(){
    gameRunning = false;
    gameOverDiv.classList.remove("hidden");
}

document.addEventListener("keydown",(e)=>{
    if(!gameRunning) return;

    if(e.key === "ArrowLeft" && player.x > 0){
        player.x -= 20;
    }
    if(e.key === "ArrowRight" && player.x < canvas.width - player.width){
        player.x += 20;
    }
});

restartBtn.addEventListener("click",()=>{
    init();
    update();
});

setInterval(()=>{
    if(gameRunning) spawnEnemy();
},1000);

init();
update();
