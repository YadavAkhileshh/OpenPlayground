const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

canvas.width = 800;
canvas.height = 500;

let animationId;

function initGame(){
    player = { x: 400, y: 250, size: 15, speed: 3 };
    keys = {};
    flashlight = true;
    battery = 100;
    fear = 0;
    shadows = [];
    restartBtn.style.display = "none";
    update();
}

let player, keys, flashlight, battery, fear, shadows;

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if(e.key.toLowerCase() === "f" && battery > 0){
        flashlight = !flashlight;
    }
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

function spawnShadow(){
    shadows.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        size: 25
    });
}

function update(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    if(keys["w"] && player.y > 10) player.y -= player.speed;
    if(keys["s"] && player.y < canvas.height - 10) player.y += player.speed;
    if(keys["a"] && player.x > 10) player.x -= player.speed;
    if(keys["d"] && player.x < canvas.width - 10) player.x += player.speed;

    ctx.fillStyle = "white";
    ctx.fillRect(player.x-7, player.y-7, player.size, player.size);

    if(flashlight && battery > 0){
        battery -= 0.03;
    } else {
        fear += 0.05;
    }

    shadows.forEach(sh => {
        sh.x += (player.x - sh.x) * 0.003;
        sh.y += (player.y - sh.y) * 0.003;

        ctx.fillStyle = "rgba(100,0,0,0.6)";
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, sh.size, 0, Math.PI*2);
        ctx.fill();

        let dx = player.x - sh.x;
        let dy = player.y - sh.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < sh.size){
            fear += 0.7;
        }
    });

    if(flashlight && battery > 0){
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(player.x, player.y, 120, 0, Math.PI*2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
    }

    statusText.innerText =
        "Fear: " + Math.min(100, Math.floor(fear)) +
        "% | Battery: " + Math.max(0, Math.floor(battery)) + "%";

    if(fear >= 100){
        cancelAnimationFrame(animationId);
        restartBtn.style.display = "inline-block";
        return;
    }

    animationId = requestAnimationFrame(update);
}

restartBtn.addEventListener("click", function(){
    initGame();
});

setInterval(spawnShadow, 3000);
initGame();
