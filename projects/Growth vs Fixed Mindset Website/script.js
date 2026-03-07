function showSection(id){

document.querySelectorAll(".section").forEach(sec=>{
sec.classList.remove("active")
})

document.getElementById(id).classList.add("active")

}


function answer(type){

let result = document.getElementById("quiz-result")

if(type==="growth"){
result.innerText="You have a Growth Mindset!"
}
else{
result.innerText="You may have a Fixed Mindset. Try embracing challenges!"
}

}


const quotes = [

"Success is the result of effort and learning.",
"Mistakes are proof that you are trying.",
"Growth mindset turns challenges into opportunities.",
"Learning never exhausts the mind.",
"Small progress each day leads to big results."

]

let i = 0

function showQuote(){

document.getElementById("quoteText").innerText = quotes[i]

}

function nextQuote(){

i++
if(i>=quotes.length) i=0
showQuote()

}

function prevQuote(){

i--
if(i<0) i=quotes.length-1
showQuote()

}

showQuote()

setInterval(nextQuote,4000)