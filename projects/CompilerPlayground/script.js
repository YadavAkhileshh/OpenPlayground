
function runCode(){

const code=document.getElementById("codeInput").value

const output=document.getElementById("consoleOutput")

output.textContent=""

try{

const originalLog=console.log

let logs=[]

console.log=function(...args){
logs.push(args.join(" "))
}

new Function(code)()

console.log=originalLog

output.textContent=logs.join("\n")

}catch(error){

output.textContent="Compilation Error:\n"+error.message

}

}

