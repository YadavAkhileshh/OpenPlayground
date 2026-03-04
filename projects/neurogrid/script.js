const grid=document.getElementById("grid")
const levelText=document.getElementById("level")
const timerText=document.getElementById("timer")
const startBtn=document.getElementById("startBtn")

let level=1
let size=3
let pattern=[]
let selected=[]
let time=0
let interval

startBtn.onclick=()=>startGame()

function startGame(){
selected=[]
pattern=[]
createGrid()
generatePattern()
showPattern()
}

function createGrid(){
grid.innerHTML=""
grid.style.gridTemplateColumns=`repeat(${size},60px)`
for(let i=0;i<size*size;i++){
let cell=document.createElement("div")
cell.className="cell"
cell.onclick=()=>selectCell(i)
grid.appendChild(cell)
}
}

function generatePattern(){
let count=level+2
while(pattern.length<count){
let r=Math.floor(Math.random()*size*size)
if(!pattern.includes(r))pattern.push(r)
}
}

function showPattern(){
let cells=document.querySelectorAll(".cell")
pattern.forEach(i=>cells[i].classList.add("active"))
setTimeout(()=>{
cells.forEach(c=>c.classList.remove("active"))
startTimer()
},2000)
}

function selectCell(i){
let cells=document.querySelectorAll(".cell")
if(selected.includes(i))return
selected.push(i)
cells[i].classList.add("selected")
if(selected.length===pattern.length){
checkResult()
}
}

function checkResult(){
clearInterval(interval)
let correct=pattern.every(i=>selected.includes(i))
if(correct){
level++
size=level<4?3:level<7?4:5
levelText.textContent="Level: "+level
startGame()
}else{
alert("Game Over")
resetGame()
}
}

function startTimer(){
time=5+level
timerText.textContent="Time: "+time
interval=setInterval(()=>{
time--
timerText.textContent="Time: "+time
if(time<=0){
clearInterval(interval)
alert("Time Up")
resetGame()
}
},1000)
}

function resetGame(){
level=1
size=3
levelText.textContent="Level: 1"
grid.innerHTML=""
}