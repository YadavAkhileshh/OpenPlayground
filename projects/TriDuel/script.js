let choices = document.querySelectorAll(".choice");
let you = document.querySelector(".you-div");
let computer = document.querySelector(".computer-div");
let result = document.querySelector(".result");
// let winSound = new Audio(win.mp3);
// let loseSound = new Audio(lose.mp3);
// let drawSound = new Audio(draw.mp3);

function startShake(){
    you.style = "animation: shake 1.2s linear 3;"
    computer.style = "animation: shake 1s linear 3 ;"
}
function stopShake(){
    you.style = "animation: none;"
    computer.style = "animation: none;"
}

choices.forEach((choice) => {
    choice.addEventListener('click', () => {
        result.hide
        result.classList.remove("draw")
        result.classList.remove("win")
        result.classList.remove("lose")
        result.innerText = ""
        you.innerText = "👊"
        computer.innerText = "👊"
        startShake()
        let userChoice = choice.getAttribute("id")
        let options = ["stone", "paper", "scissor"]
        let compIndex = Math.floor(Math.random() * 3)
        let computerChoice = options[compIndex]
        setTimeout(() => {
            stopShake()
            playGame(userChoice, computerChoice)
            
        },3000)
    })
})

function playGame(userChoice, computerChoice){
    if(userChoice === "stone"){
        you.innerText = "👊"
    }
    else if(userChoice === "paper"){
        you.innerText = "🖐️"
    }
    else if(userChoice === "scissor"){
        you.innerText = "✌️"
    }
    if(computerChoice === "stone"){
        computer.innerText = "👊"
    }
    else if(computerChoice === "paper"){
        computer.innerText = "🖐️"
    }
    else if(computerChoice === "scissor"){
        computer.innerText = "✌️"
    }
    
    if(userChoice === computerChoice){
        result.innerText = "Draw";
        result.classList.add("draw")
        // drawSound.play()
    }
    else if(userChoice === "stone" && computerChoice === "scissor" || 
        userChoice === "paper" && computerChoice === "stone" || 
        userChoice === "scissor" && computerChoice === "paper"
    ){
        // winSound.play()
        result.innerText = "You Win";
        result.classList.add("win")
    }
    else{
        // loseSound.play()
        result.innerText = "You Lose";
        result.classList.add("lose") 
    }
}