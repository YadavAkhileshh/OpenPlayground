const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let player = { x: 50, y: 200, size: 20, speed: 5 };
let obstacles = [];
let score = 0;
let speed = 3;
let timeWarp = false;

let keys = {};

document.addEventListener("keydown", function(e){
    keys[e.code] = true;
    if(e.code === "Space"){
        timeWarp = !timeWarp;
    }
});

document.addEventListener("keyup", function(e){
    keys[e.code] = false;
});

function spawnObstacle(){
    obstacles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 20),
        size: 20
    });
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(keys["ArrowUp"] && player.y > 0){
        player.y -= player.speed;
    }
    if(keys["ArrowDown"] && player.y + player.size < canvas.height){
        player.y += player.speed;
    }

    ctx.fillStyle = timeWarp ? "#00ffff" : "#ffcc00";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    obstacles.forEach((obs, index) => {
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(obs.x, obs.y, obs.size, obs.size);

        obs.x -= timeWarp ? speed * 0.5 : speed;

        if(obs.x + obs.size < 0){
            obstacles.splice(index,1);
            score++;
            document.getElementById("score").innerText = "Score: " + score;
        }

        if(
            player.x < obs.x + obs.size &&
            player.x + player.size > obs.x &&
            player.y < obs.y + obs.size &&
            player.y + player.size > obs.y
        ){
            alert("Game Over! Final Score: " + score);
            document.location.reload();
        }
    });

    requestAnimationFrame(update);
}

setInterval(spawnObstacle, 1500);
update();
