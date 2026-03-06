registerPlugin({

name:"Calculator",

render(container){

container.innerHTML = `
<h2>Calculator</h2>

<input id="num1" placeholder="Number 1">
<input id="num2" placeholder="Number 2">

<button onclick="calculate()">Add</button>

<p id="result"></p>
`

}

})

function calculate(){

const a = Number(document.getElementById("num1").value)
const b = Number(document.getElementById("num2").value)

document.getElementById("result").innerText =
"Result: " + (a + b)

}