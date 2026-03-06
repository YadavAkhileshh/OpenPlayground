const canvas = document.getElementById("graphCanvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth - 40
canvas.height = 500

let nodes = []
let edges = []

function addNode(){

const name = document.getElementById("nodeInput").value

if(!name) return

nodes.push({
name:name,
x:Math.random()*canvas.width,
y:Math.random()*canvas.height
})

drawGraph()

}

function connectNodes(){

const a = document.getElementById("connectA").value
const b = document.getElementById("connectB").value

edges.push({a,b})

drawGraph()

}

function drawGraph(){

ctx.clearRect(0,0,canvas.width,canvas.height)

edges.forEach(edge=>{

const nodeA = nodes.find(n=>n.name===edge.a)
const nodeB = nodes.find(n=>n.name===edge.b)

if(nodeA && nodeB){

ctx.beginPath()
ctx.moveTo(nodeA.x,nodeA.y)
ctx.lineTo(nodeB.x,nodeB.y)
ctx.strokeStyle="white"
ctx.stroke()

}

})

nodes.forEach(node=>{

ctx.beginPath()
ctx.arc(node.x,node.y,15,0,Math.PI*2)
ctx.fillStyle="cyan"
ctx.fill()

ctx.fillStyle="white"
ctx.fillText(node.name,node.x-10,node.y+30)

})

}