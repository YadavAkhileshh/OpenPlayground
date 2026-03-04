const board=document.getElementById("board")
const scoreEl=document.getElementById("score")
const restartBtn=document.getElementById("restart")

const size=20
let snake=[{x:5,y:10}]
let shadow=[{x:14,y:10}]
let dir={x:1,y:0}
let food=randomFood()
let score=0
let running=true

for(let i=0;i<size*size;i++){
let d=document.createElement("div")
d.className="cell"
board.appendChild(d)
}

const cells=document.querySelectorAll(".cell")

function draw(){
cells.forEach(c=>c.className="cell")

snake.forEach(s=>{
cells[s.y*size+s.x].classList.add("snake")
})

shadow.forEach(s=>{
cells[s.y*size+s.x].classList.add("shadow")
})

cells[food.y*size+food.x].classList.add("food")
}

function move(){
if(!running)return

const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y}
const sdir={x:-dir.x,y:-dir.y}
const shead={x:shadow[0].x+sdir.x,y:shadow[0].y+sdir.y}

if(hit(head,snake)||hit(shead,shadow)){
gameOver()
return
}

snake.unshift(head)
shadow.unshift(shead)

if(head.x===food.x && head.y===food.y){
score++
scoreEl.innerText="Score: "+score
food=randomFood()
}else{
snake.pop()
shadow.pop()
}

draw()
}

function hit(h,arr){
if(h.x<0||h.x>=size||h.y<0||h.y>=size)return true
return arr.some(s=>s.x===h.x&&s.y===h.y)
}

function randomFood(){
return{
x:Math.floor(Math.random()*size),
y:Math.floor(Math.random()*size)
}
}

function gameOver(){
running=false
alert("Game Over")
}

document.addEventListener("keydown",e=>{
if(e.key==="ArrowUp")dir={x:0,y:-1}
if(e.key==="ArrowDown")dir={x:0,y:1}
if(e.key==="ArrowLeft")dir={x:-1,y:0}
if(e.key==="ArrowRight")dir={x:1,y:0}
})

restartBtn.onclick=()=>{
snake=[{x:5,y:10}]
shadow=[{x:14,y:10}]
dir={x:1,y:0}
food=randomFood()
score=0
scoreEl.innerText="Score: 0"
running=true
}

setInterval(move,120)
draw()