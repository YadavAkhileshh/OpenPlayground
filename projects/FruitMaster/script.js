const game = document.getElementById("game");
const basket = document.getElementById("basket");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

let score = 0;
let lives = 5;
let speed = Number(localStorage.getItem("speed")) || 1;
let gameRunning = true;



/* ---------- LIVES UI ---------- */

function renderLives(){
    livesEl.innerHTML="";

    for(let i=0;i<lives;i++){
        const img=document.createElement("img");
        img.src="images/heart.png";
        img.classList.add("heart");
        livesEl.appendChild(img);
    }
}

renderLives();


/* ---------- Basket Movement (CLAMPED) ---------- */

document.addEventListener("mousemove", e=>{

    let x = e.clientX - 60;

    if(x < 0) x = 0;
    if(x > window.innerWidth-120) x = window.innerWidth-120;

    basket.style.left = x + "px";
});


/* ---------- Items ---------- */

const fruits = [
    {src:"images/apple.png",points:5},
    {src:"images/orange.png",points:5},
    {src:"images/watermelon.png",points:15}
];

const dragon = {
    src:"images/dragonfruit.png",
    points:50
};

const bomb = {
    src:"images/bomb.png",
    bomb:true
};


/* ---------- Spawn Function ---------- */

function spawn(itemType){

    if(!gameRunning) return;

    const item=document.createElement("img");
    item.src=itemType.src;
    item.classList.add("item");

    // Bomb bigger = more scary
    if(itemType.bomb){
        item.style.width="75px";
    }

    item.style.left=Math.random()*(window.innerWidth-70)+"px";
    item.style.top="-80px";

    game.appendChild(item);


    function fall(){

        if(!gameRunning) return;

        let top=item.offsetTop;
        item.style.top=top+speed+"px";

        const b=basket.getBoundingClientRect();
        const i=item.getBoundingClientRect();

        // COLLISION
        if(
            i.bottom>=b.top &&
            i.left<b.right &&
            i.right>b.left
        ){

            if(itemType.bomb){

                lives--;

                // HIT FLASH
                game.style.background="red";
                setTimeout(()=>game.style.background="",20);

                renderLives();

                if(lives<=0){
                    gameOver();
                }

            }else{

                score+=itemType.points;
                scoreEl.innerText="🍎 "+score;

                // score pop
                scoreEl.style.transform="scale(1.3)";
                setTimeout(()=>{
                    scoreEl.style.transform="scale(1)";
                },20);
            }

            item.remove();
            return;
        }

        // remove if missed
        if(top>window.innerHeight){
            item.remove();
            return;
        }

        requestAnimationFrame(fall);
    }

    fall();
}


/* ---------- GAME OVER ---------- */

function gameOver(){

    gameRunning=false;

    setTimeout(()=>{
        alert("Game Over! Score: "+score);
        window.location.href="menu.html";
    },200);
}


/* ---------- SMART SPAWN SYSTEM ---------- */
/*
Dragonfruit now appears randomly
within ~30 seconds instead of 2 minutes.
*/

setInterval(()=>{

    if(!gameRunning) return;

    let r=Math.random();

    if(r < 0.13){
        spawn(bomb);
    }
    else if(r < 0.18){ // ⭐ 5% chance
        spawn(dragon);
    }
    else{
        spawn(fruits[Math.floor(Math.random()*fruits.length)]);
    }

},650);


/* ---------- SPEED INCREASE ---------- */
/* Every 30 seconds */

setInterval(()=>{
    speed+=0.2;
},30000);
