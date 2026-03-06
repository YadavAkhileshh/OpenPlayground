function runGame(){

const code = document.getElementById("code").value;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.clearRect(0,0,canvas.width,canvas.height);

try{

new Function(code)();

}

catch(error){

alert("Error in game code: " + error.message);

}

}