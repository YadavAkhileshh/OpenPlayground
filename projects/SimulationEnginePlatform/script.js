const canvas = document.getElementById("simCanvas")
const ctx = canvas.getContext("2d")

canvas.width = 600
canvas.height = 400

let animation

function startSimulation(type){

cancelAnimationFrame(animation)

if(type==="ball"){
bouncingBall()
}

if(type==="particle"){
particleMotion()
}

}

function bouncingBall(){

let x=100
let y=100
let vx=3
let vy=4

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

x+=vx
y+=vy

if(x>canvas.width || x<0) vx*=-1
if(y>canvas.height || y<0) vy*=-1

ctx.beginPath()
ctx.arc(x,y,20,0,Math.PI*2)
ctx.fillStyle="blue"
ctx.fill()

animation=requestAnimationFrame(draw)

}

draw()

}

function particleMotion(){

let x=300
let y=200

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

x+=Math.random()*10-5
y+=Math.random()*10-5

ctx.beginPath()
ctx.arc(x,y,5,0,Math.PI*2)
ctx.fillStyle="red"
ctx.fill()

animation=requestAnimationFrame(draw)

}

draw()

}

