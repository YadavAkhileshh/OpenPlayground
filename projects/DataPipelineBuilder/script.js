const workspace = document.getElementById("workspace")

let blocks = []

function addBlock(type){

const block = {
id:Date.now(),
type:type
}

blocks.push(block)

render()

}

function render(){

workspace.innerHTML = ""

blocks.forEach(block=>{

const div = document.createElement("div")

div.className="block"

div.innerText=block.type

workspace.appendChild(div)

})

}